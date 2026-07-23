function buildCardBody(item) {
  const frag = document.createDocumentFragment();

  const info = document.createElement('div');
  info.className = 'img-card-info';
  const infoDetail = document.createElement('div');
  infoDetail.className = 'img-card-info-detail';
  const date = document.createElement('span');
  date.className = 'img-card-date';
  date.textContent = item.date;
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

  const imgWrap = document.createElement('div');
  imgWrap.className = 'img-card-img-wrap';
  const img = document.createElement('div');
  img.className = 'img-card-img';
  img.style.backgroundImage = `url("${item.image}")`;
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
  overlayBg.style.backgroundImage = `url("${item.image}")`;
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

export default async function decorate(block) {
  const titleRow = block.children[0];
  const title = titleRow ? titleRow.textContent.trim() : 'More Articles';

  const heading = document.createElement('h2');
  heading.className = 'main-section-heading';
  heading.textContent = title;

  const cards = document.createElement('div');
  cards.className = 'img-cards';

  const container = document.createElement('div');
  container.className = 'container';
  container.append(heading, cards);

  block.replaceChildren(container);

  const resp = await fetch(`${window.hlx.codeBasePath}/blocks/related-articles/mock-data.json`);
  if (!resp.ok) return;
  const { data } = await resp.json();
  data.forEach((item) => cards.append(buildCard(item)));
}
