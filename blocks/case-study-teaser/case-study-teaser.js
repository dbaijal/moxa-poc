function cellText(cell) {
  return cell ? cell.textContent.trim() : '';
}

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

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const [titleRow, descriptionRow, imageRow, learnMoreRow] = block.children;

  const heading = document.createElement('h2');
  heading.textContent = cellText(titleRow);

  const content = document.createElement('div');
  content.className = 'case-study-teaser-content';
  content.append(heading);

  const descriptionCell = descriptionRow?.firstElementChild;
  while (descriptionCell?.firstElementChild) {
    content.append(descriptionCell.firstElementChild);
  }

  const btn = document.createElement('a');
  btn.className = 'case-study-teaser-btn';
  btn.href = '#';
  btn.textContent = cellText(learnMoreRow) || 'Learn More';
  content.append(btn);

  const imageWrap = document.createElement('div');
  imageWrap.className = 'case-study-teaser-image';
  const img = cellImage(imageRow?.firstElementChild);
  if (img) imageWrap.append(img);

  const inner = document.createElement('div');
  inner.className = 'case-study-teaser-inner';
  inner.append(imageWrap, content);

  block.replaceChildren(inner);
}
