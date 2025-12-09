/* JS for rendering publications from JSON file that contains ORCID pubs */
const samplePublications = [
  {
    putcode: "1",
    title: " ",
    date: "2025",
    authors: "Something went wrong...",
    journal: null,
    doi: null,
    wosuid: null,
    link: null,
    type: "journal-article"
  }
];

const pageSize = 10;
let pubListEl, pubPaginationEl, pubFilterbarEl;
let publicationsData = [];
let currentFilter = 'all';
let currentPage = 1;

/* ---------- Utilities ---------- */
function humanReadableType(typeStr) {
  if (!typeStr) return 'Other';
  return typeStr.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const parts = String(dateStr).split('-');
  if (parts.length === 3) {
    const d = new Date(dateStr);
    if (!isNaN(d)) return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } else if (parts.length === 2) {
    const d = new Date(parts[0], parseInt(parts[1],10)-1);
    if (!isNaN(d)) return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
  } else {
    return parts[0];
  }
  return dateStr;
}

/* ---------- Clean data from ORCID ---------- */
function normalizeWork(w) {

  // Title: handle nesting
  let title = '';
  if (typeof w.title === 'string') title = w.title;
  else if (w.title && typeof w.title === 'object') {
    title = w.title.title || w.title.value || w.title.localised || '';
    if (!title && w.title.title && typeof w.title.title === 'object') {
      title = w.title.title.value || '';
    }
  } else if (w.displayTitle) {
    title = w.displayTitle;
  }

  // Authors: handle different data types
  let authors = '';
  if (typeof w.authors === 'string') authors = w.authors;
  else if (Array.isArray(w.authors)) {
    authors = w.authors.join(', ');
  } else if (w.authorString) {
    authors = w.authorString;
  } else if (w.creators && Array.isArray(w.creators)) {
    authors = w.creators.map(c => (typeof c === 'string' ? c : (c.name || [c.givenName, c.familyName].filter(Boolean).join(' ')))).join(', ');
  } else if (w['contributors'] && Array.isArray(w.contributors)) {
    authors = w.contributors.map(c => c.name || c['creditName'] || '').filter(Boolean).join(', ');
  }

  // Date: try different ORCID fields
  let date = w.date || w.publication_date || w.year || w.displayDate || '';
  if (!date && w.pubYear) date = String(w.pubYear);
  // Handle edge cases
  if ((w.date === undefined || w.date === '') && w.publication_date && typeof w.publication_date === 'object') {
    const pd = w.publication_date;
    if (pd.year && pd.month && pd.day) date = `${pd.year}-${String(pd.month).padStart(2,'0')}-${String(pd.day).padStart(2,'0')}`;
    else if (pd.year && pd.month) date = `${pd.year}-${String(pd.month).padStart(2,'0')}`;
    else if (pd.year) date = String(pd.year);
  }

  // Journal / container title
  let journal = w.journal || w.publication_name || w.containerTitle || w['journalTitle'] || '';

  // DOI handling
  let doi = w.doi || (w.externalIds && w.externalIds.doi) || (w['doi'] && typeof w.doi === 'object' ? w.doi.value : '') || '';

  // Link: use ORCID link/url, else build from doi
  let link = w.link || w.url || w.externalLink || w.resource || '';
  if (!link && doi) link = doi.startsWith('10.') ? `https://doi.org/${doi}` : `https://doi.org/${doi}`;
  // Handle potential data wrapping cases
  if (!link && Array.isArray(w.urls) && w.urls.length) link = w.urls[0].value || w.urls[0].url || '';
  if (!link && typeof w.urls === 'object' && w.urls.value) link = w.urls.value;

  let type = (w.type || w.publication_type || w.workType || w['work-type'] || 'other').toString().toLowerCase();
  if (type !== 'journal-article' && type !== 'conference-paper') {
    type = 'other';
  }

  return {
    putcode: w.putcode ?? w.id ?? w.work_id ?? w['@id'] ?? '',
    title: title || '',
    date: date || '',
    authors: authors || '',
    journal: journal || '',
    doi: doi || '',
    wosuid: w.wosuid ?? '',
    link: link || '',
    type: type
  };
}

/* ---------- Rendering ---------- */

function renderFilterBar(data) {
  const counts = data.reduce((acc, item) => {
    const t = item.type || 'other';
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  const types = Object.keys(counts).sort();
  const total = data.length;

  pubFilterbarEl.innerHTML = '';

  const allPill = document.createElement('button');
  allPill.className = 'pub-filter-pill' + (currentFilter === 'all' ? ' active' : '');
  allPill.setAttribute('data-type', 'all');
  allPill.textContent = `All (${total})`;
  allPill.addEventListener('click', () => { currentFilter = 'all'; currentPage = 1; update(); });
  pubFilterbarEl.appendChild(allPill);

  types.forEach(t => {
    const pill = document.createElement('button');
    pill.className = 'pub-filter-pill' + (currentFilter === t ? ' active' : '');
    pill.setAttribute('data-type', t);
    pill.textContent = `${humanReadableType(t)} (${counts[t]})`;
    pill.addEventListener('click', () => { currentFilter = t; currentPage = 1; update(); });
    pubFilterbarEl.appendChild(pill);
  });
}

function getFilteredData() {
  if (currentFilter === 'all') return publicationsData.slice();
  return publicationsData.filter(p => (p.type || 'other') === currentFilter);
}

function renderPublicationItem(pub) {
  const item = document.createElement('article');
  item.className = 'pub-item';
  item.setAttribute('data-putcode', pub.putcode || '');

  // Authors
  const authors = document.createElement('div');
  authors.className = 'pub-meta';
  authors.textContent = pub.authors || '';
  item.appendChild(authors);

  // Title
  const title = document.createElement('div');
  title.className = 'pub-title';
  title.textContent = `“${pub.title || 'Untitled'}”`;
  item.appendChild(title);

  // Journal and date side by side
  const journalRow = document.createElement('div');
  journalRow.className = 'pub-meta';
  if (pub.journal) {
    const jSpan = document.createElement('span');
    jSpan.className = 'pub-journal';
    jSpan.textContent = pub.journal;
    journalRow.appendChild(jSpan);
    journalRow.appendChild(document.createTextNode(' • '));
  }
  const dateSpan = document.createElement('span');
  dateSpan.className = 'pub-date';
  dateSpan.textContent = formatDate(pub.date);
  journalRow.appendChild(dateSpan);
  item.appendChild(journalRow);

  // Full text button
  const actions = document.createElement('div');
  actions.className = 'pub-actions';

  const fullBtn = document.createElement('a');
  fullBtn.className = 'pub-button';
  fullBtn.href = pub.link || '#';
  fullBtn.target = '_blank';
  fullBtn.rel = 'noopener noreferrer';
  fullBtn.textContent = 'Full text';
  actions.appendChild(fullBtn);

  item.appendChild(actions);

  return item;
}

function renderList(page = 1) {
  const filtered = getFilteredData();
  const total = filtered.length;
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  if (page < 1) page = 1;
  if (page > lastPage) page = lastPage;
  currentPage = page;

  const start = (page - 1) * pageSize;
  const slice = filtered.slice(start, start + pageSize);

  pubListEl.innerHTML = '';
  if (slice.length === 0) {
    pubListEl.innerHTML = '<div class="pub-item">No publications found for this filter.</div>';
  } else {
    slice.forEach(pub => pubListEl.appendChild(renderPublicationItem(pub)));
  }

  renderPagination(total, page, lastPage);
}

function makePageButton(label, pageIndex, isActive=false, disabled=false) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'page-pill' + (isActive ? ' active' : '');
  if (disabled) btn.setAttribute('aria-disabled', 'true');
  btn.textContent = label;
  if (!disabled) btn.addEventListener('click', () => { currentPage = pageIndex; renderList(pageIndex); });
  return btn;
}

/* ---------- Pagination ---------- */

function renderPagination(totalItems, current, last) {
  pubPaginationEl.innerHTML = '';

  if (last <= 1) return;

  const createPageButton = (label, pageIndex, isActive = false, disabled = false) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'page-pill' + (isActive ? ' active' : '');
    if (disabled) btn.setAttribute('aria-disabled', 'true');
    btn.textContent = label;
    if (!disabled) btn.addEventListener('click', () => {
      currentPage = pageIndex;
      renderList(pageIndex);
    });
    return btn;
  };

  const prev = createPageButton('‹ Prev', Math.max(1, current - 1), false, current === 1);
  pubPaginationEl.appendChild(prev);

  const pageNumbers = [];

  /* ---------- Smart pagination (like StackOverflow) ---------- */

  /* First 4 pages */
  if (current <= 4) {
    for (let p = 1; p <= Math.min(5, last); p++) pageNumbers.push(p);
    if (last > 5) pageNumbers.push('...');
    if (last > 5) pageNumbers.push(last);
  }
  /* Last 4 pages */
  else if (current >= last - 3) {
    pageNumbers.push(1);
    if (last > 5) pageNumbers.push('...');
    for (let p = Math.max(2, last - 4); p <= last; p++) pageNumbers.push(p);
  }
  /* Middle pages, sliding */
  else {
    pageNumbers.push(1);
    if (current - 2 > 2) pageNumbers.push('...');
    for (let p = current - 2; p <= current + 2; p++) pageNumbers.push(p);
    if (current + 2 < last - 1) pageNumbers.push('...');
    pageNumbers.push(last);
  }

  pageNumbers.forEach(p => {
    if (p === '...') {
      const dots = document.createElement('span');
      dots.textContent = '...';
      dots.className = 'page-pill';
      dots.setAttribute('aria-hidden', 'true');
      pubPaginationEl.appendChild(dots);
    } else {
      pubPaginationEl.appendChild(createPageButton(String(p), p, p === current));
    }
  });

  const next = createPageButton('Next ›', Math.min(last, current + 1), false, current === last);
  pubPaginationEl.appendChild(next);
}

function update() {
  renderFilterBar(publicationsData);
  renderList(currentPage);
}

/* ---------- Load data from cleaned_works.json ---------- */
function loadPublicationsFromFile(path = './data/cleaned_works.json') {
  return fetch(path)
    .then(resp => {
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      return resp.json();
    })
    .then(raw => {
      let arr = [];
      if (Array.isArray(raw)) arr = raw;

      // Normalize, sort by newest first
      publicationsData = arr.map(normalizeWork);
      publicationsData.sort((a,b) => {
        const da = a.date ? new Date(a.date) : null;
        const db = b.date ? new Date(b.date) : null;
        if (da && db && !isNaN(da) && !isNaN(db)) return db - da;
        return (b.date || '').localeCompare(a.date || '');
      });

      update();
    })
    .catch(err => {
      console.warn('Could not load cleaned_works.json — falling back to sample', err);
      publicationsData = samplePublications.map(normalizeWork);
      update();
    });
}

/* ---------- Initialize on DOM ready ---------- */
document.addEventListener('DOMContentLoaded', () => {
  pubListEl = document.getElementById('pub-list');
  pubPaginationEl = document.getElementById('pub-pagination');
  pubFilterbarEl = document.getElementById('pub-filterbar');

  if (!pubListEl || !pubPaginationEl || !pubFilterbarEl) {
    console.error('Publication elements not found in DOM. Ensure #pub-list, #pub-pagination and #pub-filterbar exist.');
    return;
  }

  // Try to load from cleaned_works.json, else fallback
  loadPublicationsFromFile('./data/cleaned_works.json')
    .catch(() => {
      publicationsData = (window.publicationsDataGlobal && Array.isArray(window.publicationsDataGlobal))
        ? window.publicationsDataGlobal.map(normalizeWork)
        : samplePublications.map(normalizeWork);
      update();
    });
});
