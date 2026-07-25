import { moveInstrumentation } from '../../scripts/scripts.js';

function cellText(cell) {
  return cell ? cell.textContent.trim() : '';
}

function cellImage(cell) {
  const existing = cell?.querySelector('img');
  if (existing) return existing;
  const src = cellText(cell);
  if (!src) return null;
  const img = document.createElement('img');
  img.src = src;
  img.alt = '';
  return img;
}

function buildMain(row) {
  const [headingCell, descriptionCell, imageCell] = row.children;

  const heading = document.createElement('h3');
  heading.className = 'icon-list__heading';
  heading.textContent = cellText(headingCell);

  const subheading = document.createElement('h4');
  subheading.className = 'icon-list__subheading';
  subheading.textContent = cellText(descriptionCell);

  const content = document.createElement('div');
  content.className = 'icon-list__content';
  content.append(heading, subheading);

  const imageWrap = document.createElement('div');
  imageWrap.className = 'icon-list__image';
  const img = cellImage(imageCell);
  if (img) imageWrap.append(img);

  const li = document.createElement('li');
  li.className = 'icon-list__item';
  moveInstrumentation(row, li);
  li.append(content, imageWrap);

  return li;
}

function buildAccordionItem(row) {
  const [headingCell, descriptionCell, imageCell] = row.children;

  const title = document.createElement('p');
  title.className = 'icon-list__subheading icon';
  title.textContent = cellText(headingCell);

  const largeCol = document.createElement('div');
  largeCol.className = 'seven-four-col__large';
  while (descriptionCell?.firstElementChild) {
    largeCol.append(descriptionCell.firstElementChild);
  }

  const smallCol = document.createElement('div');
  smallCol.className = 'seven-four-col__small';
  const img = cellImage(imageCell);
  if (img) smallCol.append(img);

  const body = document.createElement('div');
  body.className = 'seven-four-col hide';
  body.append(largeCol, smallCol);

  const li = document.createElement('li');
  li.className = 'icon-list__accordion';
  moveInstrumentation(row, li);

  title.addEventListener('click', () => {
    const active = li.classList.toggle('is-active');
    body.classList.toggle('hide', !active);
  });

  li.append(title, body);
  return li;
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const [mainRow, ...itemRows] = block.children;
  if (!mainRow) return;

  const list = document.createElement('ul');
  list.className = 'icon-list';
  list.append(buildMain(mainRow));
  itemRows.forEach((row) => list.append(buildAccordionItem(row)));

  block.replaceChildren(list);
}
