# IrisBaharWebsite
Personal website of my research and teaching

[View here](https://irisbahar.github.io/IrisBaharWebsite/)

## Updating site content

All updatable content lives in `data/*.json`. After editing, commit and push, GitHub Pages will redeploy automatically.

### Adding a LinkedIn post

The Activity section on the home page embeds LinkedIn posts via their **share URN**. Note: the ID in the address bar when viewing a post (the `activity-` ID) is *different* from the share URN — the embed will not work if you use the wrong one. You must get the URN from LinkedIn's Share or Embed dialog.

1. Open the post on LinkedIn.
2. Click the post's **Share** menu (the three-dot menu or the share button) and choose **Embed this post**. LinkedIn will open a dialog containing iframe HTML that looks like:
   ```html
   <iframe src="https://www.linkedin.com/embed/feed/update/urn:li:share:7443143820176973826" ...>
   ```
3. Copy the 19-digit number that follows `urn:li:share:` (here, `7443143820176973826`).
4. Add it to the **top** of the array in `data/linkedin-posts.json` (newest first):
   ```json
   [
     "7443143820176973826",
     "7394154284872953857",
     ...
   ]
   ```

To remove a post, delete its line from the array.

### Adding or updating a student

Students live in `data/students.json` under two arrays: `students` (current) and `pastStudents` (alumni).

**Current students** - add an object to the `students` array:

```json
{
  "name": "Jane Doe",
  "graduation": "Spring 2030",
  "program": "PhD Student in Computer Science",
  "about": "One or two sentence research description.",
  "image": "./assets/students/JaneDoe.jpg"
}
```

Place the headshot in `assets/students/` and reference it via the `image` field. JPG/JPEG/PNG all work. If `image` is omitted, the card falls back to `assets/students/Default.jpg`.

**Past students** - add an object to the `pastStudents` array. Only `name` and `date` are required:

```json
{
  "name": "Jane Doe",
  "date": "May 2025",
  "co_advised_with": "Maurice Herlihy",
  "currently_working_at": "Google"
}
```

`co_advised_with` and `currently_working_at` are optional - omit them when not applicable.

**Moving a student from current to past** - cut the entry from `students`, add a `date` field with their graduation month/year, drop the `program`/`about`/`image`/`graduation` fields (past-student cards don't display them), and paste into `pastStudents`.

### Updating publications

Publications are pulled from ORCID into `data/cleaned_works.json`. To refresh:

```sh
python3 scripts/search.py
```

The script fetches the latest works for the configured ORCID ID, shows a diff against the current JSON, and prompts before overwriting.

## TODO
- [ ] Improve responsiveness in mobile view (WIP)
