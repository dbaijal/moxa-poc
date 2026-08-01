// Kaltura account wiring. Only the entry ID is authorable per-instance; these
// identify the Moxa Kaltura account/player config the entry lives in.
const KALTURA_PARTNER_ID = 3319173;
const KALTURA_SUBPARTNER_ID = 331917300;
const KALTURA_UICONF_ID = 51422852;

function cellText(cell) {
  return cell ? cell.textContent.trim() : '';
}

function buildThumbnailUrl(entryId) {
  return `https://cdnapisec.kaltura.com/p/${KALTURA_PARTNER_ID}/sp/${KALTURA_SUBPARTNER_ID}/thumbnail/entry_id/${entryId}/width/1200`;
}

// Kaltura's JS-driven embed (kWidget.embed / the mwEmbed loader) injects its
// own inline <script> tags at runtime, which this site's nonce-based CSP
// (script-src 'nonce-aem' 'strict-dynamic' ...) blocks. A plain <iframe>
// pointing at Kaltura's own iframe-embed URL avoids that entirely: the
// player runs inside its own cross-origin document, governed by Kaltura's
// CSP, not ours, so no inline script ever needs to execute on this page.
function buildKalturaIframeSrc(entryId) {
  const params = new URLSearchParams({
    iframeembed: 'true',
    playerId: 'kaltura_player',
    entry_id: entryId,
  });
  return `https://cdnapisec.kaltura.com/p/${KALTURA_PARTNER_ID}/sp/${KALTURA_SUBPARTNER_ID}/embedIframeJs/uiconf_id/${KALTURA_UICONF_ID}/partner_id/${KALTURA_PARTNER_ID}?${params.toString()}`;
}

function loadKalturaPlayer(mediaEl, entryId) {
  const iframe = document.createElement('iframe');
  iframe.className = 'video-article-player';
  iframe.src = buildKalturaIframeSrc(entryId);
  iframe.title = 'Video player';
  iframe.frameBorder = '0';
  iframe.allowFullscreen = true;
  iframe.setAttribute('allow', 'autoplay *; fullscreen *; encrypted-media *');
  mediaEl.replaceChildren(iframe);
}

function buildVideoMedia(entryId) {
  const media = document.createElement('div');
  media.className = 'video-article-media';

  const poster = document.createElement('button');
  poster.type = 'button';
  poster.className = 'video-article-poster';
  poster.setAttribute('aria-label', 'Play video');
  poster.style.backgroundImage = `url("${buildThumbnailUrl(entryId)}")`;

  const playIcon = document.createElement('span');
  playIcon.className = 'video-article-play-icon';
  poster.append(playIcon);

  poster.addEventListener('click', () => loadKalturaPlayer(media, entryId), { once: true });

  media.append(poster);
  return media;
}

function buildShareLink(iconName, label, url) {
  if (!url) return null;

  const link = document.createElement('a');
  link.className = 'video-article-share-link';
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.setAttribute('aria-label', label);

  const icon = document.createElement('img');
  icon.src = `/icons/${iconName}.svg`;
  icon.alt = '';
  icon.loading = 'lazy';

  link.append(icon);
  return link;
}

function buildSaveButton() {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'video-article-save';

  const icon = document.createElement('img');
  icon.src = '/icons/tag.svg';
  icon.alt = '';
  icon.loading = 'lazy';

  const text = document.createElement('span');
  text.textContent = 'Save';

  button.append(icon, text);
  button.addEventListener('click', () => button.classList.toggle('is-active'));
  return button;
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const [
    titleRow,
    descriptionRow,
    entryIdRow,
    dateRow,
    facebookRow,
    twitterRow,
    linkedinRow,
  ] = block.children;

  const entryId = cellText(entryIdRow);
  const media = buildVideoMedia(entryId);

  const dateEl = document.createElement('span');
  dateEl.className = 'video-article-date';
  dateEl.textContent = cellText(dateRow);

  const shareLinks = [
    buildShareLink('facebook', 'Share on Facebook', cellText(facebookRow)),
    buildShareLink('twitter', 'Share on Twitter', cellText(twitterRow)),
    buildShareLink('linkedin', 'Share on LinkedIn', cellText(linkedinRow)),
  ].filter(Boolean);

  const share = document.createElement('div');
  share.className = 'video-article-share';
  if (shareLinks.length) {
    const shareLabel = document.createElement('span');
    shareLabel.className = 'video-article-share-label';
    shareLabel.textContent = 'Share';
    share.append(shareLabel, ...shareLinks);
  }

  const meta = document.createElement('div');
  meta.className = 'video-article-meta';
  meta.append(dateEl, share, buildSaveButton());

  const contactBtn = document.createElement('a');
  contactBtn.className = 'video-article-contact';
  contactBtn.href = '/contact-us';
  contactBtn.textContent = 'Contact Us';

  const metaRow = document.createElement('div');
  metaRow.className = 'video-article-meta-row';
  metaRow.append(meta, contactBtn);

  const titleEl = document.createElement('h1');
  titleEl.className = 'video-article-title';
  titleEl.textContent = cellText(titleRow);

  const descriptionEl = document.createElement('div');
  descriptionEl.className = 'video-article-description';
  const descriptionCell = descriptionRow?.firstElementChild;
  while (descriptionCell?.firstElementChild) {
    descriptionEl.append(descriptionCell.firstElementChild);
  }

  const inner = document.createElement('div');
  inner.className = 'video-article-inner';
  inner.append(media, metaRow, titleEl, descriptionEl);

  block.replaceChildren(inner);
}
