import { createOptimizedPicture } from '../../scripts/aem.js';

function rowText(row) {
  return row ? row.textContent.trim() : '';
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const [headingRow, subheadingRow, descriptionRow, imageRow] = block.children;

  const heading = rowText(headingRow);
  const subheading = rowText(subheadingRow);
  const descriptionCell = descriptionRow?.firstElementChild;
  const img = imageRow?.querySelector('img');

  const headingEl = document.createElement('h2');
  headingEl.className = 'hero-banner__heading';
  headingEl.textContent = heading;

  const subheadingEl = document.createElement('h3');
  subheadingEl.className = 'hero-banner__subheading';
  subheadingEl.textContent = subheading;

  const container = document.createElement('div');
  container.className = 'container';
  container.append(headingEl, subheadingEl);

  if (descriptionCell?.textContent.trim()) {
    const descriptionEl = document.createElement('div');
    descriptionEl.className = 'hero-banner__description';
    while (descriptionCell.firstElementChild) {
      descriptionEl.append(descriptionCell.firstElementChild);
    }
    container.append(descriptionEl);
  }

  const heroBanner = document.createElement('div');
  heroBanner.className = 'hero-banner hero-banner--s hero-banner--main';
  heroBanner.append(container);

  if (img) {
    heroBanner.classList.add('hero-banner--has-image');
    const imageEl = document.createElement('div');
    imageEl.className = 'hero-banner__image';
    imageEl.append(createOptimizedPicture(img.src, img.alt || heading));
    heroBanner.append(imageEl);
  }

  block.replaceChildren(heroBanner);
}
