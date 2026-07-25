import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const [titleRow, descriptionRow, imageRow] = block.children;

  const title = titleRow ? titleRow.textContent.trim() : '';
  const description = descriptionRow ? descriptionRow.textContent.trim() : '';
  const img = imageRow ? imageRow.querySelector('img') : null;

  const titleEl = document.createElement('h1');
  titleEl.textContent = title;

  const descriptionEl = document.createElement('p');
  descriptionEl.textContent = description;

  const content = document.createElement('div');
  content.append(titleEl, descriptionEl);

  const children = [];
  if (img) {
    children.push(createOptimizedPicture(img.src, img.alt || title, true));
  }
  children.push(content);

  block.replaceChildren(...children);
}
