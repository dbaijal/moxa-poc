// POC only: DAM references are served un-optimized from the publish instance,
// since /content/dam does not resolve on the EDS delivery domain.
const PUBLISH_HOST = 'https://publish-p170892-e1840404.adobeaemcloud.com';
const ARTICLES_INDEX = '/articles-index.json';
const MAX_CARDS = 3;

function resolveImage(image) {
  if (!image) return '';
  return image.startsWith('/content/dam') ? `${PUBLISH_HOST}${image}` : image;
}

function parseTags(value) {
  return (value || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

function buildCardBody(item) {
  const frag = document.createDocumentFragment();

  const info = document.createElement('div');
  info.className = 'img-card-info';
  const infoDetail = document.createElement('div');
  infoDetail.className = 'img-card-info-detail';
  const date = document.createElement('span');
  date.className = 'img-card-date';
  date.textContent = item.articleDate;
  infoDetail.append(date);
  info.append(infoDetail);

  const heading = document.createElement('h3');
  heading.className = 'img-card-heading';
  heading.textContent = item.title;

  const paragraph = document.createElement('p');
  paragraph.className = 'img-card-paragraph';
  paragraph.textContent = item.description;

  frag.append(info, heading, paragraph);
  return frag;
}

function buildCard(item) {
  const path = item.path || '#';

  const imageUrl = resolveImage(item.image);

  const imgWrap = document.createElement('div');
  imgWrap.className = 'img-card-img-wrap';
  const img = document.createElement('div');
  img.className = 'img-card-img';
  img.style.backgroundImage = `url("${imageUrl}")`;
  imgWrap.append(img);

  const container = document.createElement('div');
  container.className = 'img-card-container';
  container.append(buildCardBody(item));

  const mainLink = document.createElement('a');
  mainLink.className = 'img-card-link';
  mainLink.href = path;
  mainLink.append(imgWrap, container);

  const main = document.createElement('div');
  main.className = 'img-card-main';
  main.append(mainLink);

  const overlayTint = document.createElement('div');
  overlayTint.className = 'img-card-overlay';
  const overlayBg = document.createElement('div');
  overlayBg.className = 'img-card-overlay-background';
  overlayBg.style.backgroundImage = `url("${imageUrl}")`;
  overlayBg.append(overlayTint);

  const overlayContent = document.createElement('div');
  overlayContent.className = 'img-card-overlay-content';
  overlayContent.append(buildCardBody(item));

  const overlayLink = document.createElement('a');
  overlayLink.className = 'img-card-link';
  overlayLink.href = path;
  overlayLink.append(overlayBg, overlayContent);

  const overlay = document.createElement('div');
  overlay.className = 'img-card-overlay-container';
  overlay.append(overlayLink);

  const wrapper = document.createElement('div');
  wrapper.className = 'img-card-wrapper';
  wrapper.append(main, overlay);

  const card = document.createElement('div');
  card.className = 'img-card';
  card.append(wrapper);
  return card;
}

function readSelectedTags(tagsRow) {
  if (!tagsRow) return [];
  const items = [...tagsRow.querySelectorAll('li')];
  if (items.length) {
    return items.map((li) => li.textContent.trim()).filter(Boolean);
  }
  return parseTags(tagsRow.textContent);
}

export default async function decorate(block) {
  const [titleRow, tagsRow] = block.children;
  const title = titleRow ? titleRow.textContent.trim() : 'More Articles';
  const selectedTags = readSelectedTags(tagsRow);

  const heading = document.createElement('h2');
  heading.className = 'main-section-heading';
  heading.textContent = title;

  const cards = document.createElement('div');
  cards.className = 'img-cards';

  const container = document.createElement('div');
  container.className = 'container';
  container.append(heading, cards);

  block.replaceChildren(container);

  const resp = await fetch(ARTICLES_INDEX);
  if (!resp.ok) return;
  const { data } = await resp.json();

  const currentPath = window.location.pathname.replace(/\.html$/, '');
  const items = data
    .filter((item) => item.path !== currentPath)
    .filter((item) => {
      if (!selectedTags.length) return true;
      const itemTags = parseTags(item.articleTags);
      return selectedTags.some((tag) => itemTags.includes(tag));
    })
    .sort((a, b) => new Date(b.articleDate) - new Date(a.articleDate))
    .slice(0, MAX_CARDS);

  items.forEach((item) => cards.append(buildCard(item)));
}
