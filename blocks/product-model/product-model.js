function cellText(cell) {
  return cell ? cell.textContent.trim() : '';
}

function countModelColumns(table) {
  const headerRow = table.querySelector('thead tr') || table.querySelector('tr');
  if (!headerRow) return 0;
  const cells = [...headerRow.children];
  if (!cells.length) return 0;
  const firstIsEmpty = !cells[0].textContent.trim();
  return firstIsEmpty ? cells.length - 1 : cells.length;
}

function buildImageToggle(imageRow) {
  imageRow.classList.add('hide');

  const label = document.createElement('label');
  label.className = 'product-model-toggle';

  const text = document.createElement('span');
  text.textContent = 'Show image';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.addEventListener('change', () => {
    imageRow.classList.toggle('hide', !checkbox.checked);
  });

  label.append(text, checkbox);
  return label;
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const [headingRow, contentRow] = block.children;
  const table = contentRow?.firstElementChild?.querySelector('table');

  const heading = document.createElement('h3');
  heading.className = 'product-model-heading';
  const baseTitle = cellText(headingRow) || 'Available models';
  const count = table ? countModelColumns(table) : 0;
  heading.textContent = count ? `${baseTitle} (${count})` : baseTitle;

  const header = document.createElement('div');
  header.className = 'product-model-header';
  header.append(heading);

  const imageRow = table
    ? [...table.querySelectorAll('tbody tr')].find((row) => row.querySelector('img'))
    : null;
  if (imageRow) header.append(buildImageToggle(imageRow));

  const tableWrap = document.createElement('div');
  tableWrap.className = 'product-model-table-wrap';
  if (table) tableWrap.append(table);

  const inner = document.createElement('div');
  inner.className = 'product-model-inner';
  inner.append(header, tableWrap);

  block.replaceChildren(inner);
}
