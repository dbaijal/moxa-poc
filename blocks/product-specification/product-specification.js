import { moveInstrumentation } from '../../scripts/scripts.js';

function cellText(cell) {
  return cell ? cell.textContent.trim() : '';
}

function buildAction(iconName, label, onClick) {
  const item = document.createElement('button');
  item.type = 'button';
  item.className = 'product-specification-action';

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

function buildItem(row, isFirst) {
  const [titleCell, contentCell] = row.children;

  const title = document.createElement('p');
  title.className = 'product-specification-title';
  title.textContent = cellText(titleCell);

  const body = document.createElement('div');
  body.className = 'product-specification-body hide';
  while (contentCell?.firstElementChild) {
    body.append(contentCell.firstElementChild);
  }

  const li = document.createElement('li');
  li.className = 'product-specification-item';
  moveInstrumentation(row, li);

  if (isFirst) {
    li.classList.add('is-active');
    body.classList.remove('hide');
  }

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
  const list = document.createElement('ul');
  list.className = 'product-specification-list';
  [...block.children].forEach((row, i) => list.append(buildItem(row, i === 0)));

  const hideAll = buildAction('collapse', 'Hide all', () => {
    list.querySelectorAll('.product-specification-item').forEach((li) => {
      li.classList.remove('is-active');
      li.querySelector('.product-specification-body')?.classList.add('hide');
    });
  });

  const download = buildAction('document', 'Download product information sheet');

  const actions = document.createElement('div');
  actions.className = 'product-specification-actions';
  actions.append(hideAll, download);

  const inner = document.createElement('div');
  inner.className = 'product-specification-inner';
  inner.append(list, actions);

  block.replaceChildren(inner);
}
