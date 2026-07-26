import { decorateIcons } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function cellImage(cell) {
  const existing = cell?.querySelector('img');
  if (existing) return existing;
  const src = cell ? cell.textContent.trim() : '';
  if (!src) return null;
  const img = document.createElement('img');
  img.src = src;
  img.alt = '';
  return img;
}

// Authors write each feature as "<icon-shortcode> **Title** description", e.g.
// ":gear: **Quick installation** Tool-free setup...". EDS auto-converts the
// shortcode into a <span class="icon icon-gear"> before decorate() runs, so
// pull that span and the bold title out of the <li>, leaving the remaining
// text as the description.
function buildFeature(li) {
  const icon = li.querySelector('.icon');
  const strong = li.querySelector('strong, b');
  const titleText = strong ? strong.textContent.trim() : '';
  if (strong) strong.remove();
  const descText = li.textContent.trim();

  const featureLi = document.createElement('li');
  featureLi.className = 'product-cards-feature';
  if (icon) featureLi.append(icon);

  const body = document.createElement('div');
  body.className = 'product-cards-feature-body';

  const titleP = document.createElement('p');
  titleP.className = 'product-cards-feature-title';
  titleP.textContent = titleText;

  const descP = document.createElement('p');
  descP.className = 'product-cards-feature-desc';
  descP.textContent = descText;

  body.append(titleP, descP);
  featureLi.append(body);
  return featureLi;
}

function buildCard(row) {
  const [titleCell, imageCell, featuresCell] = row.children;

  const imageWrap = document.createElement('div');
  imageWrap.className = 'product-cards-image';
  const img = cellImage(imageCell);
  if (img) imageWrap.append(img);

  const titleWrap = document.createElement('div');
  titleWrap.className = 'product-cards-title';
  while (titleCell?.firstElementChild) {
    titleWrap.append(titleCell.firstElementChild);
  }

  const header = document.createElement('div');
  header.className = 'product-cards-header';
  header.append(imageWrap, titleWrap);

  const btn = document.createElement('a');
  btn.className = 'product-cards-btn';
  btn.href = '#';
  btn.textContent = 'Learn More';

  const featuresList = document.createElement('ul');
  featuresList.className = 'product-cards-features';
  [...(featuresCell?.querySelectorAll('li') || [])]
    .forEach((li) => featuresList.append(buildFeature(li)));

  const li = document.createElement('li');
  li.className = 'product-cards-item';
  moveInstrumentation(row, li);
  li.append(header, btn, featuresList);

  return li;
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const list = document.createElement('ul');
  list.className = 'product-cards-list';
  [...block.children].forEach((row) => list.append(buildCard(row)));

  block.replaceChildren(list);
  decorateIcons(block);
}
