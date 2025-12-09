import requests
import json
import time
import difflib
import sys
from pathlib import Path

ORCID_ID = "0000-0001-6927-8527"
BASE = f"https://pub.orcid.org/v3.0/{ORCID_ID}"
HEADERS = {"Accept": "application/json"}

def get_json(url):
    resp = requests.get(url, headers=HEADERS)
    resp.raise_for_status()
    return resp.json()

def safe_get(obj, *keys):
    for key in keys:
        if not isinstance(obj, dict):
            return None
        obj = obj.get(key)
        if obj is None:
            return None
    return obj

def load_existing_json(path="./data/cleaned_works.json"):
    if Path(path).exists():
        with open(path, "r") as f:
            return json.load(f)
    return []

def show_diff(old, new):
    old_text = json.dumps(old, indent=2).splitlines()
    new_text = json.dumps(new, indent=2).splitlines()
    diff = difflib.unified_diff(old_text, new_text, fromfile='existing', tofile='fetched', lineterm='')
    print("\n".join(diff))

record = get_json(f"{BASE}/record")
works_groups = safe_get(record, "activities-summary", "works", "group") or []

putcodes = []
for group in works_groups:
    for summary in group.get("work-summary", []) or []:
        pc = summary.get("put-code")
        if pc is not None:
            putcodes.append(pc)

print(f"Found {len(putcodes)} put-codes in record (groups: {len(works_groups)})")

# --------------------- Fetch pubs using ORCID API ---------------------
cleaned = []
pause_between = 0.05

for i, putcode in enumerate(putcodes, start=1):
    try:
        detail = get_json(f"{BASE}/work/{putcode}")
    except Exception as e:
        print(f"Failed to fetch put-code {putcode}: {e}")
        continue

    work_type = detail.get("type", "").lower()

    title = safe_get(detail, "title", "title", "value")

    year  = safe_get(detail, "publication-date", "year", "value")
    month = safe_get(detail, "publication-date", "month", "value")
    day   = safe_get(detail, "publication-date", "day", "value")
    date_str = "-".join(str(x) for x in [year, month, day] if x)

    # --------------------- Safe link creation logic ---------------------
    doi = None
    url = None
    wosuid = None
    isbn = None
    urls = None

    for ext_id in safe_get(detail, "external-ids", "external-id") or []:
        ext_type = (ext_id.get("external-id-type") or "").lower()
        ext_val  = ext_id.get("external-id-value")

        if ext_type == "doi":
            doi = ext_val
        elif ext_type == "uri":
            url = ext_val
        elif ext_type == "wosuid":
            wosuid = ext_val
        elif ext_type == "isbn":
            isbn = ext_val

    urls = safe_get(detail, "url") or safe_get(detail, "urls", "url") or []

    if isinstance(urls, dict):
        urls = [urls]

    link = None
    if doi and doi.strip():
        link = f"https://doi.org/{doi}"
    elif wosuid and wosuid.strip():
        if wosuid.startswith("PPRN:"):
            link = f"https://www.webofscience.com/wos/woscc/full-record/{wosuid.replace('PPRN:','')}"
        else:
            link = f"https://www.webofscience.com/wos/woscc/full-record/{wosuid}"
    elif work_type in ["book", "book-chapter"] and isbn:
        link = f"https://www.worldcat.org/isbn/{isbn}"
    elif url and url.strip():
        link = url
    elif urls:
        for u in urls:
            val = u.get("value") or u.get("url")
            if val:
                link = val
                break

    authors = []
    for contrib in safe_get(detail, "contributors", "contributor") or []:
        name = safe_get(contrib, "credit-name", "value")
        if name:
            authors.append(name)

    if not authors:
        contribs = safe_get(detail, "contributors", "contributor") or []
        for c in contribs:
            role = safe_get(c, "contributor-attributes", "contributor-role")
            if role == "author":
                name = safe_get(c, "credit-name", "value")
                if name:
                    authors.append(name)

    if not authors:
        authors = ["Ruth Iris Bahar"]

    formatted_authors = ", ".join(authors)

    journal_title = safe_get(detail, "journal-title", "value")

    cleaned.append({
        "putcode": putcode,
        "title": title,
        "date": date_str,
        "authors": formatted_authors,
        "journal": journal_title,
        "doi": doi,
        "wosuid": wosuid,
        "link": link,
        "type": work_type
    })

    if pause_between:
        time.sleep(pause_between)

# --------------------- Compare with existing JSON and save ---------------------
existing = load_existing_json()

if existing == cleaned:
    print("JSON is up to date. No changes needed.")
    sys.exit(0)
else:
    print("Differences detected between existing JSON and fetched ORCID data:")
    show_diff(existing, cleaned)
    ans = input("Update JSON with these changes? [y/N]: ").strip().lower()
    if ans != 'y':
        print("Aborting. JSON not updated.")
        sys.exit(0)

with open("./data/cleaned_works.json", "w") as f:
    json.dump(cleaned, f, indent=2)

print(f"Saved {len(cleaned)} cleaned works to cleaned_works.json")
