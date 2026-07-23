import { createOptimizedPicture, decorateIcons } from '../../scripts/aem.js';

function rowText(row) {
  return row ? row.textContent.trim() : '';
}

function buildShareItem(iconName, url) {
  const li = document.createElement('li');
  li.className = 'media-list-item';
  if (!url) return li;

  const a = document.createElement('a');
  a.className = 'media-list-link';
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener';

  const icon = document.createElement('span');
  icon.className = `icon icon-${iconName} media-list-icon`;
  a.append(icon);
  li.append(a);
  return li;
}

export default function decorate(block) {
  const [
    titleRow,
    authorImageRow,
    authorNameRow,
    dateRow,
    saveLabelRow,
    shareLabelRow,
    facebookRow,
    xRow,
    linkedinRow,
  ] = block.children;

  const title = rowText(titleRow);
  const authorImg = authorImageRow?.querySelector('img');
  const authorName = rowText(authorNameRow);
  const date = rowText(dateRow);
  const saveLabel = rowText(saveLabelRow) || 'Save';
  const shareLabel = rowText(shareLabelRow) || 'Share';
  const facebookUrl = rowText(facebookRow);
  const xUrl = rowText(xRow);
  const linkedinUrl = rowText(linkedinRow);

  const sideVertical = document.createElement('div');
  sideVertical.className = 'module-block-side-vertical';

  const sideHeading = document.createElement('div');
  sideHeading.className = 'module-block-side-vertical-heading';
  sideHeading.textContent = shareLabel;

  const mediaList = document.createElement('ul');
  mediaList.className = 'media-list';
  mediaList.append(
    buildShareItem('facebook', facebookUrl),
    buildShareItem('twitter', xUrl),
    buildShareItem('linkedin', linkedinUrl),
  );
  sideVertical.append(sideHeading, mediaList);

  const titleEl = document.createElement('h2');
  titleEl.className = 'module-block-title';
  titleEl.textContent = title;

  const authorImgContainer = document.createElement('div');
  authorImgContainer.className = 'module-block-author-img-container';
  if (authorImg) {
    const picture = createOptimizedPicture(authorImg.src, authorName, false, [{ width: '96' }]);
    picture.querySelector('img').className = 'module-block-author-img';
    authorImgContainer.append(picture);
  }

  const infoDetail = document.createElement('div');
  infoDetail.className = 'module-block-info-detail';
  const nameEl = document.createElement('span');
  nameEl.className = 'module-block-author-name';
  nameEl.textContent = authorName;
  const dotEl = document.createElement('span');
  dotEl.className = 'module-block-date';
  dotEl.textContent = '•';

  console.log(`[date]`, date);
  
  
  const dateEl = document.createElement('span');
  dateEl.className = 'module-block-date';
  dateEl.textContent = date;
  infoDetail.append(nameEl, dotEl, dateEl);

  const saveBtn = document.createElement('div');
  saveBtn.className = 'module-block-save-btn';
  const saveButton = document.createElement('button');
  saveButton.type = 'button';
  saveButton.className = 'simple-icon-btn';
  const saveText = document.createElement('span');
  saveText.className = 'simple-icon-btn-text';
  saveText.textContent = saveLabel;
  const saveIcon = document.createElement('span');
  saveIcon.className = 'simple-icon-btn-icon icon icon-tag';
  saveButton.append(saveText, saveIcon);
  saveBtn.append(saveButton);

  const headingInfo = document.createElement('div');
  headingInfo.className = 'module-block-heading-info';
  headingInfo.append(authorImgContainer, infoDetail, saveBtn);

  const moduleBlock = document.createElement('div');
  moduleBlock.className = 'module-block';
  moduleBlock.append(sideVertical, titleEl, headingInfo);

  const container = document.createElement('div');
  container.className = 'module-container';
  container.append(moduleBlock);

  block.replaceChildren(container);
  decorateIcons(block);
}
