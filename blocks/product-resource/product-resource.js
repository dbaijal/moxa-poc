import { moveInstrumentation } from '../../scripts/scripts.js';

const VISIBLE_ROW_LIMIT = 4;

function cellText(cell) {
  return cell ? cell.textContent.trim() : '';
}

function listItems(cell) {
  return [...(cell?.querySelectorAll('li') || [])]
    .map((li) => li.textContent.trim())
    .filter(Boolean);
}

function buildFilter(cell) {
  const options = listItems(cell);
  if (!options.length) return null;

  const wrap = document.createElement('div');
  wrap.className = 'product-resource-filter';

  const label = document.createElement('span');
  label.className = 'product-resource-filter-label';
  label.textContent = 'filter';

  const select = document.createElement('select');
  select.className = 'product-resource-filter-select';
  options.forEach((opt) => {
    const option = document.createElement('option');
    option.value = opt;
    option.textContent = opt;
    select.append(option);
  });

  wrap.append(label, select);
  return wrap;
}

function buildTags(cell) {
  const options = listItems(cell);
  if (!options.length) return null;

  const wrap = document.createElement('div');
  wrap.className = 'product-resource-tags';

  options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'product-resource-tag';
    if (i === 0) btn.classList.add('is-active');
    btn.textContent = opt;
    btn.addEventListener('click', () => {
      wrap.querySelectorAll('.product-resource-tag').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
    });
    wrap.append(btn);
  });

  return wrap;
}

function buildTable(cell) {
  const table = cell?.querySelector('table');
  if (!table) return null;

  const rows = [...table.querySelectorAll('tbody tr')];
  const wrap = document.createElement('div');
  wrap.className = 'product-resource-table-wrap';
  wrap.append(table);

  if (rows.length <= VISIBLE_ROW_LIMIT) {
    return { tableWrap: wrap, showAllBtn: null };
  }

  rows.slice(VISIBLE_ROW_LIMIT).forEach((row) => row.classList.add('hide'));

  const showAllBtn = document.createElement('button');
  showAllBtn.type = 'button';
  showAllBtn.className = 'product-resource-show-all';
  showAllBtn.textContent = 'Show all';
  showAllBtn.addEventListener('click', () => {
    const willExpand = rows[VISIBLE_ROW_LIMIT]?.classList.contains('hide');
    rows.slice(VISIBLE_ROW_LIMIT).forEach((row) => row.classList.toggle('hide', !willExpand));
    showAllBtn.textContent = willExpand ? 'Show less' : 'Show all';
  });

  return { tableWrap: wrap, showAllBtn };
}

function buildItem(row) {
  const [titleCell, filtersCell, tagsCell, contentCell] = row.children;

  const heading = document.createElement('h4');
  heading.className = 'product-resource-heading';
  heading.textContent = cellText(titleCell);

  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'product-resource-content';

  const controls = document.createElement('div');
  controls.className = 'product-resource-controls';
  const filter = buildFilter(filtersCell);
  if (filter) controls.append(filter);
  const tags = buildTags(tagsCell);
  if (tags) controls.append(tags);

  const { tableWrap, showAllBtn } = buildTable(contentCell) || {};

  const item = document.createElement('div');
  item.className = 'product-resource-item';
  moveInstrumentation(row, item);
  item.append(heading);
  item.append(contentWrapper);
  if (controls.children.length) contentWrapper.append(controls);
  if (tableWrap) contentWrapper.append(tableWrap);
  if (showAllBtn) contentWrapper.append(showAllBtn);

  return item;
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const items = [...block.children].map((row) => buildItem(row));
  block.replaceChildren(...items);
}
