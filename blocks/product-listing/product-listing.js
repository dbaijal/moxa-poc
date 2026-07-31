const API_BASE = 'https://moxaservicepoc-e8eqb0fjd4gud0fm.a02.azurefd.net';
const API_KEY = 'moxaXadobe_#p#o#c';
const DEFAULT_SERIES_ID = 'S000000521';

// Toggle data source: true calls the real API, false loads the bundled mock-data.json.
const USE_REAL_API = false;

function cellText(cell) {
  return cell ? cell.textContent.trim() : '';
}

function formatFilterLabel(value) {
  return value.includes('>>') ? value.split('>>').pop() : value;
}

function parseItemList(itemList) {
  try {
    return JSON.parse(itemList);
  } catch {
    return null;
  }
}

async function fetchFromApi(seriesId) {
  const resp = await fetch(`${API_BASE}/last/${seriesId}`, {
    method: 'GET',
    headers: { 'X-API-KEY': API_KEY },
  });
  if (!resp.ok) throw new Error(`Request failed with status ${resp.status}`);
  return resp.json();
}

async function fetchFromMock() {
  const url = new URL('./mock-data.json', import.meta.url);
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Request failed with status ${resp.status}`);
  return resp.json();
}

async function fetchSeries(seriesId) {
  const json = USE_REAL_API ? await fetchFromApi(seriesId) : await fetchFromMock();
  if (!json.success) throw new Error(json.message || 'Request was not successful');
  return json.data;
}

/**
 * Walks every model's specs, keeps only the hidden (cvisible === 'N') entries
 * that carry the normalized single/multi values meant for filtering, and
 * groups them by category, then by ckey. Each ckey entry tracks which values
 * belong to which model (by array index, since modelId is not guaranteed
 * unique in this API's response) so filter controls can test a model later.
 * @param {Array} models response.data.models
 * @returns {Map} category name -> Map(ckey -> entry)
 */
function collectFilters(models) {
  const categories = new Map();

  models.forEach((model, index) => {
    (model.specs || []).forEach((spec) => {
      const parsed = parseItemList(spec.itemList);
      if (!parsed || parsed.cvisible !== 'N' || !parsed.ckey || !Array.isArray(parsed.cvalue)) return;

      if (!categories.has(spec.category)) categories.set(spec.category, new Map());
      const ckeys = categories.get(spec.category);
      if (!ckeys.has(parsed.ckey)) {
        ckeys.set(parsed.ckey, {
          category: spec.category,
          ckey: parsed.ckey,
          cformat: parsed.cformat,
          values: new Set(),
          perModel: new Map(),
        });
      }

      const entry = ckeys.get(parsed.ckey);
      const modelValues = entry.perModel.get(index) || new Set();
      parsed.cvalue.forEach((value) => {
        entry.values.add(value);
        modelValues.add(value);
      });
      entry.perModel.set(index, modelValues);
    });
  });

  return categories;
}

function buildModelCard(model) {
  const card = document.createElement('article');
  card.className = 'product-listing-card';

  const title = document.createElement('h3');
  title.className = 'product-listing-card-title';
  title.textContent = model.modelName || '';

  const description = document.createElement('p');
  description.className = 'product-listing-card-description';
  description.textContent = model.description || '';

  card.append(title, description);
  return card;
}

function buildRangeFilter(entry, onChange) {
  const numericValues = [...entry.values].map(Number).filter((n) => !Number.isNaN(n));
  const min = numericValues.length ? Math.min(...numericValues) : 0;
  const max = numericValues.length ? Math.max(...numericValues) : 0;

  const wrapper = document.createElement('div');
  wrapper.className = 'product-listing-filter-field product-listing-range';

  const labelRow = document.createElement('div');
  labelRow.className = 'product-listing-range-label-row';
  const label = document.createElement('span');
  label.textContent = entry.ckey;
  const valueLabel = document.createElement('span');
  valueLabel.className = 'product-listing-range-value';
  labelRow.append(label, valueLabel);

  const track = document.createElement('div');
  track.className = 'product-listing-range-track';

  const minInput = document.createElement('input');
  minInput.type = 'range';
  minInput.min = String(min);
  minInput.max = String(max);
  minInput.value = String(min);
  minInput.className = 'product-listing-range-input';

  const maxInput = document.createElement('input');
  maxInput.type = 'range';
  maxInput.min = String(min);
  maxInput.max = String(max);
  maxInput.value = String(max);
  maxInput.className = 'product-listing-range-input';

  const refresh = () => {
    valueLabel.textContent = `${minInput.value} - ${maxInput.value}`;
  };

  minInput.addEventListener('input', () => {
    if (Number(minInput.value) > Number(maxInput.value)) minInput.value = maxInput.value;
    refresh();
    onChange();
  });
  maxInput.addEventListener('input', () => {
    if (Number(maxInput.value) < Number(minInput.value)) maxInput.value = minInput.value;
    refresh();
    onChange();
  });

  track.append(minInput, maxInput);

  const scaleRow = document.createElement('div');
  scaleRow.className = 'product-listing-range-scale-row';
  const minScale = document.createElement('span');
  minScale.textContent = String(min);
  const maxScale = document.createElement('span');
  maxScale.textContent = String(max);
  scaleRow.append(minScale, maxScale);

  refresh();
  wrapper.append(labelRow, track, scaleRow);

  const reset = () => {
    minInput.value = String(min);
    maxInput.value = String(max);
    refresh();
  };

  const matches = (index) => {
    const lo = Number(minInput.value);
    const hi = Number(maxInput.value);
    if (lo <= min && hi >= max) return true;
    const modelValues = entry.perModel.get(index);
    if (!modelValues) return false;
    return [...modelValues].some((value) => {
      const num = Number(value);
      return !Number.isNaN(num) && num >= lo && num <= hi;
    });
  };

  return { el: wrapper, reset, matches };
}

function buildSelectFilter(entry, onChange) {
  const wrapper = document.createElement('div');
  wrapper.className = 'product-listing-filter-field';

  const select = document.createElement('select');
  select.className = 'product-listing-select';
  select.setAttribute('aria-label', entry.ckey);

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = `-- ${entry.ckey} --`;
  select.append(placeholder);

  [...entry.values].sort().forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = formatFilterLabel(value);
    select.append(option);
  });

  select.addEventListener('change', onChange);
  wrapper.append(select);

  const reset = () => { select.value = ''; };
  const matches = (index) => {
    if (!select.value) return true;
    const modelValues = entry.perModel.get(index);
    return !!modelValues && modelValues.has(select.value);
  };

  return { el: wrapper, reset, matches };
}

function buildCheckboxFilter(entry, onChange) {
  const wrapper = document.createElement('div');
  wrapper.className = 'product-listing-filter-field product-listing-checkbox-group';

  const label = document.createElement('p');
  label.className = 'product-listing-filter-label';
  label.textContent = entry.ckey;
  wrapper.append(label);

  const checkboxes = [...entry.values].sort().map((value) => {
    const item = document.createElement('label');
    item.className = 'product-listing-checkbox-item';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.value = value;
    input.addEventListener('change', onChange);

    const text = document.createElement('span');
    text.textContent = formatFilterLabel(value);

    item.append(input, text);
    wrapper.append(item);
    return input;
  });

  const reset = () => checkboxes.forEach((checkbox) => { checkbox.checked = false; });
  const matches = (index) => {
    const checked = checkboxes
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.value);
    if (!checked.length) return true;
    const modelValues = entry.perModel.get(index);
    if (!modelValues) return false;
    return checked.some((value) => modelValues.has(value));
  };

  return { el: wrapper, reset, matches };
}

function buildFilterControl(entry, onChange) {
  if (entry.ckey === 'Total No. of Ports') return buildRangeFilter(entry, onChange);
  if (entry.cformat === 'M') return buildCheckboxFilter(entry, onChange);
  return buildSelectFilter(entry, onChange);
}

function buildAccordionSection(category, controls) {
  const section = document.createElement('div');
  section.className = 'product-listing-filter-section';

  const header = document.createElement('button');
  header.type = 'button';
  header.className = 'product-listing-filter-header is-open';
  header.textContent = category;

  const body = document.createElement('div');
  body.className = 'product-listing-filter-body';
  controls.forEach((control) => body.append(control.el));

  header.addEventListener('click', () => {
    const isOpen = header.classList.toggle('is-open');
    body.classList.toggle('is-collapsed', !isOpen);
  });

  section.append(header, body);
  return section;
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const [headingRow, seriesIdRow] = block.children;
  const headingText = cellText(headingRow) || 'Available Models';
  const seriesId = cellText(seriesIdRow) || DEFAULT_SERIES_ID;

  const status = document.createElement('p');
  status.className = 'product-listing-status';
  status.textContent = 'Loading models…';

  const inner = document.createElement('div');
  inner.className = 'product-listing-inner';
  inner.append(status);
  block.replaceChildren(inner);

  let data;
  try {
    data = await fetchSeries(seriesId);
  } catch {
    status.textContent = 'Unable to load product models right now. Please try again later.';
    status.classList.add('is-error');
    return;
  }

  const models = data?.models || [];
  if (!models.length) {
    status.textContent = 'No models found for this series.';
    return;
  }

  const heading = document.createElement('h2');
  heading.className = 'product-listing-heading';

  const cardsWrap = document.createElement('div');
  cardsWrap.className = 'product-listing-cards';
  const cards = models.map((model) => {
    const card = buildModelCard(model);
    cardsWrap.append(card);
    return card;
  });

  const filterControls = [];
  const applyFilters = () => {
    let visible = 0;
    models.forEach((model, index) => {
      const isMatch = filterControls.every((control) => control.matches(index));
      cards[index].classList.toggle('is-hidden', !isMatch);
      if (isMatch) visible += 1;
    });
    heading.textContent = `${headingText} (${visible})`;
  };

  const filtersWrap = document.createElement('div');
  filtersWrap.className = 'product-listing-filters';
  const categories = collectFilters(models);
  categories.forEach((ckeys, categoryName) => {
    const controls = [...ckeys.values()].map((entry) => buildFilterControl(entry, applyFilters));
    controls.forEach((control) => filterControls.push(control));
    filtersWrap.append(buildAccordionSection(categoryName, controls));
  });

  const resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.className = 'product-listing-reset';
  resetBtn.textContent = 'Reset';
  resetBtn.addEventListener('click', () => {
    filterControls.forEach((control) => control.reset());
    applyFilters();
  });

  const sidebarTitle = document.createElement('p');
  sidebarTitle.className = 'product-listing-sidebar-title';
  sidebarTitle.textContent = 'Search By';

  const sidebarHeader = document.createElement('div');
  sidebarHeader.className = 'product-listing-sidebar-header';
  sidebarHeader.append(sidebarTitle, resetBtn);

  const sidebar = document.createElement('aside');
  sidebar.className = 'product-listing-sidebar';
  sidebar.append(sidebarHeader, filtersWrap);

  const main = document.createElement('div');
  main.className = 'product-listing-main';
  main.append(heading, cardsWrap);

  inner.replaceChildren(sidebar, main);
  applyFilters();
}
