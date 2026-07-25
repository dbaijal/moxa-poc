function cellText(cell) {
  return cell ? cell.textContent.trim() : '';
}

function cellHref(cell) {
  const anchor = cell?.querySelector('a');
  return anchor ? anchor.getAttribute('href') : cellText(cell);
}

function isCurrentLink(href) {
  try {
    const url = new URL(href, window.location.href);
    return !!url.hash && url.hash === window.location.hash;
  } catch {
    return false;
  }
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const list = document.createElement('ul');
  list.className = 'page-nav__list';

  [...block.children].forEach((row) => {
    const [linkCell, textCell, styleCell] = row.children;
    const href = cellHref(linkCell);
    const text = cellText(textCell) || cellText(linkCell);
    const style = cellText(styleCell);

    const anchor = document.createElement('a');
    anchor.className = 'page-nav__link';
    if (style === 'highlight') anchor.classList.add('page-nav__link--highlight');
    if (href) anchor.href = href;
    anchor.textContent = text;

    const li = document.createElement('li');
    li.className = 'page-nav__item';
    if (href && isCurrentLink(href)) li.classList.add('is-current');
    li.append(anchor);

    list.append(li);
  });

  const wrapper = document.createElement('div');
  wrapper.className = 'wrapper';
  wrapper.append(list);

  block.classList.add('page-nav');
  block.replaceChildren(wrapper);
}
