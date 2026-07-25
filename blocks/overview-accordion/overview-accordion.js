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

function buildAccordionItem(row, isActive) {
  const [titleCell, contentCell, imageCell] = row.children;

  const title = document.createElement('p');
  title.className = 'icon-list__subheading icon';
  title.textContent = cellText(titleCell);

  const largeCol = document.createElement('div');
  largeCol.className = 'seven-four-col__large';
  while (contentCell?.firstElementChild) {
    largeCol.append(contentCell.firstElementChild);
  }

  const smallCol = document.createElement('div');
  smallCol.className = 'seven-four-col__small';
  const img = cellImage(imageCell);
  if (img) smallCol.append(img);

  const body = document.createElement('div');
  body.className = 'seven-four-col hide';
  body.append(largeCol, smallCol);

  const accordion = document.createElement('div');
  accordion.className = 'icon-list__accordion';
  moveInstrumentation(row, accordion);

  if (isActive) {
    accordion.classList.add('is-active');
    body.classList.remove('hide');
  }

  title.addEventListener('click', () => {
    const active = accordion.classList.toggle('is-active');
    body.classList.toggle('hide', !active);
  });

  accordion.append(title, body);
  return accordion;
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const [mainTitleRow, mainDescriptionRow, mainImageRow, ...itemRows] = block.children;

  const heading = document.createElement('h3');
  heading.className = 'icon-list__heading';
  heading.textContent = cellText(mainTitleRow);

  const subheading = document.createElement('h4');
  subheading.className = 'icon-list__subheading';
  subheading.textContent = cellText(mainDescriptionRow);

  const content = document.createElement('div');
  content.className = 'icon-list__content';
  content.append(heading, subheading);

  const imageWrap = document.createElement('div');
  imageWrap.className = 'icon-list__image';
  const mainImg = cellImage(mainImageRow?.firstElementChild);
  if (mainImg) imageWrap.append(mainImg);

  const top = document.createElement('div');
  top.append(content, imageWrap);

  const accordionWrap = document.createElement('div');
  itemRows.forEach((row, i) => accordionWrap.append(buildAccordionItem(row, i === 0)));

  const li = document.createElement('li');
  li.className = 'icon-list__item';
  li.append(top, accordionWrap);

  const list = document.createElement('ul');
  list.className = 'icon-list';
  list.append(li);

  block.replaceChildren(list);
}
