function setCurrent(items, current) {
  items.forEach((li) => li.classList.remove('is-current'));
  current.classList.add('is-current');
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const list = document.createElement('ul');
  list.className = 'page-nav__list';

  const items = [];

  [...block.children].forEach((row) => {
    const [linkCell, textCell, typeCell] = row.children;

    const linkEl = linkCell ? linkCell.querySelector('a') : null;
    const href = linkEl ? linkEl.getAttribute('href') : (linkCell?.textContent.trim() || '#');
    const text = textCell ? textCell.textContent.trim() : (linkEl?.textContent.trim() || '');
    const isHighlight = (typeCell?.textContent.trim().toLowerCase() || '') === 'highlight';

    const li = document.createElement('li');
    li.className = isHighlight ? 'page-nav__item page-nav-cta-item' : 'page-nav__item';

    const a = document.createElement('a');
    a.className = isHighlight ? 'page-nav__link page-nav-cta-link' : 'page-nav__link';
    a.href = href;
    a.textContent = text;
    li.append(a);

    list.append(li);
    if (!isHighlight) items.push({ li, href });
  });

  if (items.length) items[0].li.classList.add('is-current');

  const wrapper = document.createElement('div');
  wrapper.className = 'wrapper';
  wrapper.append(list);

  block.replaceChildren(wrapper);
  block.classList.add('page-nav');

  items.forEach(({ li, href }) => {
    li.querySelector('a').addEventListener('click', () => setCurrent(items.map((i) => i.li), li));

    const target = href.startsWith('#') ? document.getElementById(href.slice(1)) : null;
    if (target && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setCurrent(items.map((i) => i.li), li);
        },
        { rootMargin: '-40% 0px -55% 0px' },
      );
      observer.observe(target);
    }
  });
}
