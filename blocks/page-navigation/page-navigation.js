import { moveInstrumentation } from '../../scripts/scripts.js';

function cellText(cell) {
  return cell ? cell.textContent.trim() : '';
}

function cellHref(cell) {
  const anchor = cell?.querySelector('a');
  return anchor ? anchor.getAttribute('href') : cellText(cell);
}

function pdpSectionFor(href) {
  const hash = href?.split('#')[1];
  if (!hash) return null;
  return document.querySelector(`.pdp-container.${CSS.escape(`${hash}-container`)}`);
}

/**
 * aem.js reveals each section (display: null) the moment its own blocks finish
 * loading, which can happen after this block has already hidden it. Wait until
 * every pdp-container section has reached that point before applying the
 * initial visibility, so the reveal doesn't clobber it.
 * @param {Element[]} sections pdp-container sections to wait for
 */
function whenSectionsLoaded(sections) {
  const pending = sections.filter((section) => section.dataset.sectionStatus !== 'loaded');
  if (!pending.length) return Promise.resolve();
  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      if (pending.every((section) => section.dataset.sectionStatus === 'loaded')) {
        observer.disconnect();
        resolve();
      }
    });
    pending.forEach((section) => observer.observe(
      section,
      { attributes: true, attributeFilter: ['data-section-status'] },
    ));
  });
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const list = document.createElement('ul');
  list.className = 'page-nav__list';

  const sections = [...document.querySelectorAll('.pdp-container')];
  sections.forEach((section) => {
    section.style.display = 'none';
  });

  const items = [];

  const showSection = (target) => {
    sections.forEach((section) => {
      section.style.display = section === target ? '' : 'none';
    });
  };

  const activate = (target) => {
    items.forEach(({ li, section }) => li.classList.toggle('is-current', section === target));
    showSection(target);
  };

  [...block.children].forEach((row) => {
    const [linkCell, textCell, styleCell] = row.children;
    const href = cellHref(linkCell);
    const text = cellText(textCell) || cellText(linkCell);
    const style = cellText(styleCell);
    const section = pdpSectionFor(href);

    const anchor = document.createElement('a');
    anchor.className = 'page-nav__link';
    if (style === 'highlight') anchor.classList.add('page-nav__link--highlight');
    if (href) anchor.href = href;
    anchor.textContent = text;
    anchor.addEventListener('click', (event) => {
      if (!section) return;
      event.preventDefault();
      activate(section);
    });

    const li = document.createElement('li');
    li.className = 'page-nav__item';
    moveInstrumentation(row, li);
    li.append(anchor);

    items.push({ li, section });
    list.append(li);
  });

  if (items.length) {
    const [first] = items;
    first.li.classList.add('is-current');
    whenSectionsLoaded(sections).then(() => showSection(first.section));
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'wrapper';
  wrapper.append(list);

  block.classList.add('page-nav');
  block.replaceChildren(wrapper);
}
