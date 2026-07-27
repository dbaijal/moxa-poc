function cellText(cell) {
  return cell ? cell.textContent.trim() : '';
}

function buildAction(iconName, label, onClick) {
  const item = document.createElement('button');
  item.type = 'button';
  item.className = 'product-overview-action';

  const icon = document.createElement('img');
  icon.src = `/icons/${iconName}.svg`;
  icon.alt = '';
  icon.loading = 'lazy';

  const text = document.createElement('span');
  text.textContent = label;

  item.append(icon, text);
  if (onClick) item.addEventListener('click', onClick);
  return item;
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const [tabTitleRow, contentRow, downloadRow, printRow, saveRow] = block.children;

  const contentWrap = document.createElement('div');
  contentWrap.className = 'product-overview-content';
  const contentCell = contentRow?.firstElementChild;
  while (contentCell?.firstElementChild) {
    contentWrap.append(contentCell.firstElementChild);
  }

  const actions = document.createElement('div');
  actions.className = 'product-overview-actions';
  actions.append(
    buildAction('document', cellText(downloadRow) || 'Download product information sheet'),
    buildAction('print', cellText(printRow) || 'Print this page', () => window.print()),
    buildAction('tag', cellText(saveRow) || 'Save to My Moxa'),
  );

  const inner = document.createElement('div');
  inner.className = 'product-overview-inner';
  inner.append(contentWrap, actions);

  block.dataset.tabTitle = cellText(tabTitleRow);
  block.replaceChildren(inner);
}
