import { moveInstrumentation } from '../../scripts/scripts.js';

const HEADING_RE = /^H[1-6]$/;

// The "items" model field is an xwalk container field with multi:true, which
// AEM renders as a flat run of elements (one heading/paragraph/picture per
// field) with an <hr> separating each repeated group. Group children back
// into logical rows by splitting on those <hr> boundaries, then pick each
// row's heading/paragraph/image generically (rather than relying on a fixed
// row/cell shape) since a container field's exact markup isn't something we
// can fabricate a reliable local test fixture for.
function groupByHr(children) {
  const groups = [[]];
  children.forEach((el) => {
    if (el.tagName === 'HR') {
      groups.push([]);
    } else {
      groups[groups.length - 1].push(el);
    }
  });
  return groups.filter((group) => group.length > 0);
}

function pickImage(group) {
  return group.reduce((found, el) => {
    if (found) return found;
    if (el.tagName === 'IMG') return el;
    return el.querySelector?.('img') || null;
  }, null);
}

function pickHeading(group) {
  return group.find((el) => HEADING_RE.test(el.tagName));
}

function extractGroup(group) {
  const heading = pickHeading(group);
  const description = group.filter((el) => el !== heading && el.tagName !== 'PICTURE' && el.tagName !== 'IMG');
  return {
    heading: heading?.textContent.trim() || '',
    description,
    image: pickImage(group),
  };
}

function buildMain(group) {
  const { heading, description, image } = extractGroup(group);

  const headingEl = document.createElement('h3');
  headingEl.className = 'icon-list__heading';
  headingEl.textContent = heading;

  const subheadingEl = document.createElement('h4');
  subheadingEl.className = 'icon-list__subheading';
  subheadingEl.textContent = description.map((el) => el.textContent.trim()).join(' ');

  const content = document.createElement('div');
  content.className = 'icon-list__content';
  content.append(headingEl, subheadingEl);

  const imageWrap = document.createElement('div');
  imageWrap.className = 'icon-list__image';
  if (image) imageWrap.append(image);

  const top = document.createElement('div');
  top.append(content, imageWrap);
  return top;
}

function buildAccordionItem(group, isActive) {
  const { heading, description, image } = extractGroup(group);

  const title = document.createElement('p');
  title.className = 'icon-list__subheading icon';
  title.textContent = heading;

  const largeCol = document.createElement('div');
  largeCol.className = 'seven-four-col__large';
  description.forEach((el) => largeCol.append(el));

  const smallCol = document.createElement('div');
  smallCol.className = 'seven-four-col__small';
  if (image) smallCol.append(image);

  const body = document.createElement('div');
  body.className = 'seven-four-col hide';
  body.append(largeCol, smallCol);

  const accordion = document.createElement('div');
  accordion.className = 'icon-list__accordion';

  if (isActive) {
    accordion.classList.add('is-active');
    body.classList.remove('hide');
  }

  title.addEventListener('click', () => {
    const active = accordion.classList.toggle('is-active');
    body.classList.toggle('hide', !active);
  });

  accordion.append(title, body);
  return accordion;
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const groups = groupByHr([...block.children]);
  const [mainGroup, ...itemGroups] = groups;
  if (!mainGroup) return;

  const top = buildMain(mainGroup);
  moveInstrumentation(block, top);

  const accordionWrap = document.createElement('div');
  itemGroups.forEach((group, i) => accordionWrap.append(buildAccordionItem(group, i === 0)));

  const li = document.createElement('li');
  li.className = 'icon-list__item';
  li.append(top, accordionWrap);

  const list = document.createElement('ul');
  list.className = 'icon-list';
  list.append(li);

  block.replaceChildren(list);
}
