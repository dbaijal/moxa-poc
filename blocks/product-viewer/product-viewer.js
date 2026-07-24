function rowText(el) {
  return el ? el.textContent.trim().replace(/\s+/g, ' ') : '';
}

function cellUrl(el) {
  const img = el.querySelector('img');
  return img ? img.src : el.textContent.trim().replace(/\s+/g, ' ');
}

function filenameOf(url) {
  const name = url.split('/').pop();
  try {
    return decodeURIComponent(name);
  } catch {
    return name;
  }
}

function buildImagePanel(url, index, isActive) {
  const panel = document.createElement('div');
  panel.className = `showcase-block__detail--container${isActive ? ' is-active' : ''}`;
  panel.dataset.tab = `product-img-${index}`;

  const img = document.createElement('img');
  img.src = url;
  img.alt = `${filenameOf(url)} | Moxa`;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'simple-icon-btn simple-icon-btn--l simple-icon-btn--gray';
  btn.dataset.modalId = 'product';
  btn.dataset.imgIndex = String(index);
  const icon = document.createElement('i');
  icon.className = 'simple-icon-btn__icon icon-enlarge';
  btn.append(icon);

  panel.append(img, btn);
  return panel;
}

function buildThumb(url, index, isActive) {
  const li = document.createElement('li');
  li.className = `showcase-block__item${isActive ? ' is-active' : ''}`;
  li.dataset.tabId = `product-img-${index}`;

  const thumb = document.createElement('div');
  thumb.className = 'showcase-block__thb-img';
  thumb.style.backgroundImage = `url("${url}")`;
  li.append(thumb);
  return li;
}

function buildFeatureItem(text) {
  const li = document.createElement('li');
  li.className = 'i-list__item';

  const icon = document.createElement('i');
  icon.className = 'i-list__icon i-list__icon--green icon-check';

  const span = document.createElement('span');
  span.className = 'i-list__text';
  span.textContent = text;

  li.append(icon, span);
  return li;
}

function buildCertificationItem(url) {
  const li = document.createElement('li');
  li.className = 'certification';
  const img = document.createElement('img');
  img.src = url;
  img.alt = `${filenameOf(url)} | Moxa`;
  li.append(img);
  return li;
}

function buildFollowControls() {
  const followBtn = document.createElement('button');
  followBtn.type = 'button';
  followBtn.className = 'follow-btn border-btn border-btn--main js-follow-btn text-uppercase small-icon';
  followBtn.dataset.modalId = 'sign-in-form';

  const followBtnInner = document.createElement('span');
  const followIcon = document.createElement('i');
  followIcon.className = 'border-btn__icon icon-plus';
  const followText = document.createElement('span');
  followText.className = 'border-btn__text';
  followText.dataset.btnDefault = 'Follow updates';
  followText.dataset.btnSelect = 'Following';
  followText.textContent = 'Track product updates';
  followBtnInner.append(followIcon, followText);
  followBtn.append(followBtnInner);

  const infoBtn = document.createElement('button');
  infoBtn.type = 'button';
  infoBtn.className = 'info-btn';
  const infoBtnInner = document.createElement('span');
  const infoIcon = document.createElement('i');
  infoIcon.className = 'border-btn__icon icon-info';
  infoBtnInner.append(infoIcon);
  infoBtn.append(infoBtnInner);

  const saveNoteText = document.createElement('span');
  saveNoteText.append('You can view updates on tracked products in ');
  const saveNoteBold = document.createElement('span');
  saveNoteBold.className = 'fw-700';
  saveNoteBold.textContent = 'My Moxa.';
  saveNoteText.append(saveNoteBold);

  const saveNoteInner = document.createElement('span');
  saveNoteInner.className = 'save-note-block-inner';
  saveNoteInner.append(saveNoteText);

  const saveNote = document.createElement('span');
  saveNote.className = 'save-note-block';
  saveNote.append(saveNoteInner);

  const followContainer = document.createElement('div');
  followContainer.className = 'follow-btn-container bg-gray';
  followContainer.append(followBtn, infoBtn, saveNote);

  const followWrap = document.createElement('span');
  followWrap.append(followContainer);
  return followWrap;
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const [featuresRow, imagesRow, certHeadingRow, certImagesRow] = block.children;

  // product image gallery
  const imageUrls = [...(imagesRow?.firstElementChild?.children || [])]
    .map(cellUrl)
    .filter(Boolean);

  const detailContainer = document.createElement('div');
  const thumbList = document.createElement('ul');
  thumbList.className = 'showcase-block__list';

  imageUrls.forEach((url, i) => {
    const index = i + 1;
    const isActive = i === 0;
    detailContainer.append(buildImagePanel(url, index, isActive));
    thumbList.append(buildThumb(url, index, isActive));
  });

  const showcaseWrap = document.createElement('div');
  showcaseWrap.append(detailContainer, thumbList);

  const side = document.createElement('div');
  side.className = 'product-single-block__side';
  side.append(showcaseWrap);

  // features and advantages
  const featuresCell = featuresRow?.firstElementChild;
  const featuresHeadingEl = document.createElement('h3');
  featuresHeadingEl.className = 'bold-title-heading';
  featuresHeadingEl.textContent = rowText(featuresCell?.querySelector('p'));

  const featuresList = document.createElement('ul');
  [...(featuresCell?.querySelectorAll('li') || [])]
    .forEach((li) => featuresList.append(buildFeatureItem(rowText(li))));

  const featuresListWrap = document.createElement('div');
  featuresListWrap.append(featuresList);

  const featuresBlock = document.createElement('div');
  featuresBlock.className = 'inline-title-block';
  featuresBlock.append(featuresHeadingEl, featuresListWrap);

  // certification
  const certHeadingEl = document.createElement('h3');
  certHeadingEl.className = 'bold-title-heading';
  certHeadingEl.textContent = rowText(certHeadingRow);

  const certList = document.createElement('ul');
  certList.className = 'certifications-block';
  [...(certImagesRow?.firstElementChild?.children || [])]
    .map(cellUrl)
    .filter(Boolean)
    .forEach((url) => certList.append(buildCertificationItem(url)));

  const quoteBtn = document.createElement('button');
  quoteBtn.type = 'button';
  quoteBtn.className = 'fill-btn fill-btn--l fill-btn--orange';
  quoteBtn.textContent = 'Request a quote';

  const buttonsRow = document.createElement('div');
  buttonsRow.className = 'inline-title-block__buttons inline-title-block__buttons-flex';
  buttonsRow.append(quoteBtn, buildFollowControls());

  const certBlock = document.createElement('div');
  certBlock.className = 'inline-title-block';
  certBlock.append(certHeadingEl, certList, buttonsRow);

  const main = document.createElement('div');
  main.className = 'product-single-block__main';
  main.append(featuresBlock, certBlock);

  const productSingleBlock = document.createElement('div');
  productSingleBlock.className = 'product-single-block';
  productSingleBlock.append(side, main);

  const container = document.createElement('div');
  container.className = 'container';
  container.append(productSingleBlock);

  block.replaceChildren(container);
}
