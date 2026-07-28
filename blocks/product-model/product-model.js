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

function buildEnquiryButton() {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'product-model-enquiry-btn';
  button.textContent = 'ADD TO ENQUIRY';
  return button;
}

function appendEnquiryRow(table) {
  const tbody = table.querySelector('tbody') || table;
  const columnCount = tbody.querySelector('tr')?.children.length ?? 0;
  if (!columnCount) return;

  const row = document.createElement('tr');
  row.className = 'product-model-enquiry-row';
  for (let i = 0; i < columnCount; i += 1) {
    const cell = document.createElement('td');
    if (i > 0) {
      cell.className = 'product-model-enquiry-cell';
      cell.append(buildEnquiryButton());
    }
    row.append(cell);
  }
  tbody.append(row);
}

function buildImageToggle(imageRows) {
  imageRows.forEach((row) => row.classList.add('hide'));

  const label = document.createElement('label');
  label.className = 'product-model-toggle';

  const text = document.createElement('span');
  text.textContent = 'Show image';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.addEventListener('change', () => {
    imageRows.forEach((row) => row.classList.toggle('hide', !checkbox.checked));
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
  const tables = contentRow ? [...contentRow.querySelectorAll('table')] : [];
  tables.forEach(appendEnquiryRow);

  const heading = document.createElement('h3');
  heading.className = 'product-model-heading';
  const baseTitle = cellText(headingRow) || 'Available models';
  const count = tables.reduce((total, table) => total + countModelColumns(table), 0);
  heading.textContent = count ? `${baseTitle} (${count})` : baseTitle;

  const header = document.createElement('div');
  header.className = 'product-model-header';
  header.append(heading);

  const imageRows = tables.flatMap(
    (table) => [...table.querySelectorAll('tbody tr')].filter((row) => row.querySelector('img')),
  );
  if (imageRows.length) header.append(buildImageToggle(imageRows));

  const tableWrap = document.createElement('div');
  tableWrap.className = 'product-model-table-wrap';
  tableWrap.append(...tables);

  const inner = document.createElement('div');
  inner.className = 'product-model-inner';
  inner.append(header, tableWrap);

  block.replaceChildren(inner);
}
