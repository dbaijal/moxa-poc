import { createOptimizedPicture } from '../../scripts/aem.js';

function cellText(cell) {
  return cell ? cell.textContent.trim() : '';
}

function cellHref(cell) {
  const anchor = cell?.querySelector('a');
  return anchor ? anchor.getAttribute('href') : cellText(cell);
}

function buildActionIcon(iconName) {
  const icon = document.createElement('img');
  icon.src = `/icons/${iconName}.svg`;
  icon.alt = '';
  icon.loading = 'lazy';
  return icon;
}

function buildDownloadAction(url) {
  const link = document.createElement('a');
  link.className = 'series-card-action';
  if (url) link.href = url;

  const text = document.createElement('span');
  text.textContent = 'Download datasheet';

  link.append(buildActionIcon('download-suit'), text);
  return link;
}

function buildPrintAction() {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'series-card-action';

  const text = document.createElement('span');
  text.textContent = 'Print this page';

  button.append(buildActionIcon('print'), text);
  button.addEventListener('click', () => window.print());
  return button;
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const [
    imageRow,
    productNameRow,
    seriesNameRow,
    descriptionRow,
    contentRow,
    datasheetRow,
  ] = block.children;

  const productName = cellText(productNameRow);
  const img = imageRow?.querySelector('img');

  const media = document.createElement('div');
  media.className = 'series-card-media';
  if (img) media.append(createOptimizedPicture(img.src, img.alt || productName));

  const productNameEl = document.createElement('p');
  productNameEl.className = 'series-card-product-name';
  productNameEl.textContent = productName;

  const seriesNameEl = document.createElement('p');
  seriesNameEl.className = 'series-card-series-name';
  seriesNameEl.textContent = cellText(seriesNameRow);

  const descriptionEl = document.createElement('p');
  descriptionEl.className = 'series-card-description';
  descriptionEl.textContent = cellText(descriptionRow);

  const body = document.createElement('div');
  body.className = 'series-card-body';
  body.append(productNameEl, seriesNameEl, descriptionEl);

  const header = document.createElement('div');
  header.className = 'series-card-header';
  header.append(media, body);

  const content = document.createElement('div');
  content.className = 'series-card-content';
  const contentCell = contentRow?.firstElementChild;
  while (contentCell?.firstElementChild) {
    content.append(contentCell.firstElementChild);
  }

  const card = document.createElement('div');
  card.className = 'series-card-inner';
  card.append(header, content);

  const actions = document.createElement('div');
  actions.className = 'series-card-actions';
  actions.append(buildDownloadAction(cellHref(datasheetRow)), buildPrintAction());

  const wrapper = document.createElement('div');
  wrapper.className = 'series-card-wrapper';
  wrapper.append(card, actions);

  block.replaceChildren(wrapper);
}
