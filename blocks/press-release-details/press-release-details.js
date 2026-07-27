import { createOptimizedPicture } from '../../scripts/aem.js';
import { getSiteDomain, moveInstrumentation } from '../../scripts/scripts.js';

const BACK_LINK_PATH = '/corporate/media/press-releases';

const SHARE_CHANNELS = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: '/corporate/icons/whatspp-white.svg',
    buildUrl: ({ shareUrl, title }) => `https://wa.me/?text=${encodeURIComponent(`${title} ${shareUrl}`.trim())}`,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: '/corporate/icons/linkedin-white.svg',
    buildUrl: ({ shareUrl }) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
  },
  {
    id: 'instagram',
    label: 'Instagram',
    icon: '/corporate/icons/instagram-white.svg',
    buildUrl: () => `https://www.instagram.com/`, // Instagram doesn't support direct sharing via URL, handled separately in the code
  },
  {
    id: 'facebook',
    label: 'Facebook',
    icon: '/corporate/icons/facebook-white.svg',
    buildUrl: ({ shareUrl }) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
  },
  {
    id: 'x',
    label: 'X',
    icon: '/corporate/icons/x-white.svg',
    buildUrl: ({ shareUrl, title }) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`,
  },
];

function toAbsoluteUrl(path) {
  if (!path) {
    return '';
  }

  try {
    return new URL(path, getSiteDomain()).toString();
  } catch (error) {
    return path;
  }
}

function buildIconImage(src, alt = '') {
  const image = document.createElement('img');
  image.src = src;
  image.alt = alt;
  image.width = 24;
  image.height = 24;
  image.loading = 'lazy';
  return image;
}

function buildUtilityBar(downloadPdfUrl, statusMessage) {
  const utilityBar = document.createElement('div');
  utilityBar.className = 'press-release-details__utility';

  const shareWrap = document.createElement('div');
  shareWrap.className = 'press-release-details__share';

  const label = document.createElement('p');
  label.className = 'press-release-details__share-label';
  label.textContent = 'Share';

  const shareList = document.createElement('ul');
  shareList.className = 'press-release-details__share-list';

  const shareUrl = toAbsoluteUrl(window.location.href);
  const shareTitle = document.title || '';

  SHARE_CHANNELS.forEach(channel => {
    const item = document.createElement('li');
    item.className = 'press-release-details__share-item';

    if (channel.id === 'ig') {
      const button = document.createElement('button');
      button.className = 'press-release-details__share-button';
      button.type = 'button';
      button.setAttribute('aria-label', 'Copy link for Instagram sharing');
      button.append(buildIconImage(channel.icon, ''));
      button.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(shareUrl);
          statusMessage.textContent = 'Link copied for Instagram sharing.';
        } catch (error) {
          statusMessage.textContent = shareUrl;
        }
      });
      item.append(button);
    } else {
      const link = document.createElement('a');
      link.className = 'press-release-details__share-button';
      link.href = channel.buildUrl({ shareUrl, title: shareTitle });
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', `Share on ${channel.label}`);
      link.append(buildIconImage(channel.icon, ''));
      item.append(link);
    }

    shareList.append(item);
  });

  shareWrap.append(label, shareList);

  function buildDownloadButton() {
    if (!downloadPdfUrl) {
      return '';
    }

    const downloadButton = document.createElement('a');
    downloadButton.className = 'press-release-details__download corp-cta corp-cta--primary corp-cta--md';
    downloadButton.href = toAbsoluteUrl(downloadPdfUrl);
    downloadButton.setAttribute('aria-label', `Download PDF${shareTitle ? ` for ${shareTitle}` : ''}`);
    const downloadButonLabel = document.createElement('span');
    downloadButonLabel.classList.add('press-release-details__download-label');
    downloadButonLabel.textContent = 'Download PDF';

    downloadButton.append(downloadButonLabel, buildIconImage('/corporate/icons/download-white.svg', ''));
    downloadButton.addEventListener('click', async event => {
      event.preventDefault();

      const pdfUrl = toAbsoluteUrl(downloadPdfUrl);
      if (!pdfUrl) {
        return;
      }

      const viewerUrl = `${window.location.origin}/pdf-viewer?pdf=${encodeURIComponent(pdfUrl)}`;
      window.open(viewerUrl, '_blank', 'noopener,noreferrer');
    });

    return downloadButton;
  }
  const downloadButton = buildDownloadButton();

  utilityBar.append(shareWrap, downloadButton);
  return utilityBar;
}

function buildNavCard(type, release) {
  const wrap = document.createElement('div');
  wrap.className = `press-release-details__nav-item press-release-details__nav-item--${type}`;

  if (!release) {
    wrap.classList.add('is-empty');
    wrap.setAttribute('aria-hidden', 'true');
    return wrap;
  }

  const card = document.createElement('a');
  card.className = 'press-release-details__nav-link';
  card.href = release.path || '#';
  card.setAttribute('aria-label', `${type === 'previous' ? 'Previous' : 'Next'} press release: ${release.title}`);

  const arrow = document.createElement('span');
  arrow.className = `press-release-details__nav-arrow press-release-details__nav-arrow--${type}`;
  arrow.append(buildIconImage(type === 'previous' ? '/corporate/icons/chevron-left-blue.svg' : '/corporate/icons/chevron-right-blue.svg', ''));

  const copy = document.createElement('div');
  copy.className = 'press-release-details__nav-copy';

  const label = document.createElement('p');
  label.className = 'press-release-details__nav-label';
  label.textContent = type === 'previous' ? 'Previous' : 'Next';

  const title = document.createElement('p');
  title.className = 'press-release-details__nav-title';
  title.textContent = release.title || '';

  copy.append(label, title);

  if (type === 'previous') {
    card.append(arrow, copy);
  } else {
    card.append(copy, arrow);
  }

  wrap.append(card);
  return wrap;
}

function buildBackNavigation(prevTitleElem, prevLinkElem, nextTitleElem, nextLinkElem) {
  const footer = document.createElement('div');
  footer.className = 'press-release-details__footer';

  const footerWrapper = document.createElement('div');
  footerWrapper.className = 'press-release-details__footer-wrapper';

  const backLinkWrapper = document.createElement('div');
  backLinkWrapper.className = 'press-release-details__back-link-wrapper';

  const backLink = document.createElement('a');
  backLink.className = 'press-release-details__back-link';
  backLink.href = BACK_LINK_PATH;
  backLink.append(buildIconImage('/corporate/icons/caret-left-blue.svg', ''), 'Back to Press Releases');

  backLinkWrapper.append(backLink);

  const navGrid = document.createElement('div');
  navGrid.className = 'press-release-details__nav-grid';

  const prevTitle = prevTitleElem?.textContent?.trim() || '';
  const prevHref = prevLinkElem?.querySelector('a')?.getAttribute('href') || '';
  const nextTitle = nextTitleElem?.textContent?.trim() || '';
  const nextHref = nextLinkElem?.querySelector('a')?.getAttribute('href') || '';

  navGrid.append(
    buildNavCard('previous', prevTitle ? { path: prevHref, title: prevTitle } : null),
    buildNavCard('next', nextTitle ? { path: nextHref, title: nextTitle } : null)
  );

  footerWrapper.append(backLinkWrapper, navGrid);
  footer.append(footerWrapper);
  return footer;
}

function buildTableFromMarkers(html) {
  if (!html || typeof html !== 'string') return null;
  const container = document.createElement('div');
  container.innerHTML = html;
  const children = Array.from(container.children);

  const outputParts = [];
  let currentColumns = [];
  let currentRows = [];
  let inTableBlock = false;

  const finalizeTableIfAny = () => {
    if (!inTableBlock || !currentColumns.length || !currentRows.length) {
      inTableBlock = false;
      currentColumns = [];
      currentRows = [];
      return;
    }
    const colCount = currentColumns.length;
    const normalizedRows = currentRows.map(r => {
      const copy = r.slice(0, colCount);
      while (copy.length < colCount) copy.push('');
      return copy;
    });
    const thead = `<thead><tr>${currentColumns.map(c => `<th>${c}</th>`).join('')}</tr></thead>`;
    const tbody = `<tbody>${normalizedRows.map(r => `<tr>${r.map(c => `<td>${c && c.trim() ? c : '&nbsp;'}</td>`).join('')}</tr>`).join('')}</tbody>`;
    outputParts.push(`<div class="press-release-table"><table>${thead}${tbody}</table></div>`);
    inTableBlock = false;
    currentColumns = [];
    currentRows = [];
  };

  for (let i = 0; i < children.length; i += 1) {
    const el = children[i];
    const tag = el.tagName?.toLowerCase();
    const markerText = (tag === 'p' ? el.textContent : '')?.trim().toLowerCase();
    const isHeadingMarker = tag === 'p' && /^#\s*head(ing|er)?s?$/.test(markerText);
    const isRowMarker = tag === 'p' && /^#\s*rows?$/.test(markerText);

    if (isHeadingMarker) {
      finalizeTableIfAny();
      const next = children[i + 1];
      if (next && next.tagName?.toLowerCase() === 'ul') {
        const lis = Array.from(next.querySelectorAll('li'));
        currentColumns = lis.map(li => li.textContent?.trim() || '');
        currentRows = [];
        inTableBlock = true;
        i += 1;
        // eslint-disable-next-line no-continue
        continue;
      }
      inTableBlock = false;
      currentColumns = [];
      currentRows = [];
      outputParts.push(el.outerHTML);
    } else if (isRowMarker) {
      const next = children[i + 1];
      if (inTableBlock && next && next.tagName?.toLowerCase() === 'ul') {
        const lis = Array.from(next.querySelectorAll('li'));
        currentRows.push(lis.map(li => li.textContent?.trim() || ''));
        i += 1;
        // eslint-disable-next-line no-continue
        continue;
      }
      outputParts.push(el.outerHTML);
    } else {
      if (inTableBlock) finalizeTableIfAny();
      outputParts.push(el.outerHTML);
    }
  }
  if (inTableBlock) finalizeTableIfAny();

  const hadTable = outputParts.some(part => part.includes('press-release-table'));
  if (!hadTable) return null;
  return outputParts.join('');
}

function transformPressReleaseTableBlock(elem) {
  const blockNameText = elem.children[0]?.querySelector('p')?.textContent?.trim();
  if (blockNameText !== 'press-release-table') return;

  const contentDiv = elem.children[1];
  if (!contentDiv) return;

  const tableHTML = buildTableFromMarkers(contentDiv.innerHTML?.trim() || '');
  if (!tableHTML) return;

  elem.innerHTML = tableHTML;
}

function buildFallbackImage(release) {
  if (!release?.image) {
    return null;
  }

  const media = document.createElement('div');
  media.className = 'press-release-details__group press-release-details__group--media';
  media.append(createOptimizedPicture(release.image, release.title || '', true, [{ media: '(min-width: 768px)', width: '1200' }, { width: '750' }]));
  return media;
}

const addWebpageSchema = () => {
  const webpageSchemaJSON = {
    '@context': 'https://schema.org/',
    '@type': 'Webpage',
    name: document.head.querySelector('meta[property="og:title"]').content.trim(),
    url: window.location.href.trim(),
    publisher: {
      '@type': 'Organization',
      name: 'ARENA Experience',
      url: window.location.origin,
    },
  };
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(webpageSchemaJSON);
  script.async = true;
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
};

const addNewsArticleSchema = () => {
  const newsArticleSchemaJSON = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: document.head.querySelector('meta[property="og:title"]')?.content.trim() ?? '',
    description: document.head.querySelector('meta[property="og:description"]')?.content.trim() ?? '',
    datePublished: document.querySelector('meta[name="published-time"]')?.content.trim() ?? '',
    dateModified: document.querySelector('meta[name="modified-time"]')?.content.trim() ?? '',
    author: {
      '@type': 'Organization',
      name: 'Maruti Suzuki India Limited',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Maruti Suzuki India Limited',
      logo: {
        '@type': 'ImageObject',
        url: document.head.querySelector('meta[property="og:image"]')?.content.trim() ?? '',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': window.location.href.trim(),
    },
    articleSection: 'Press Releases',
  };
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(newsArticleSchemaJSON);
  script.async = true;
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
};

export default function decorate(block) {
  const [downloadPdfElem, prevReleaseTitleElem, prevReleaseLinkElem, nextReleaseTitleElem, nextReleaseLinkElem, ...contentElements] = [...block.children];

  addNewsArticleSchema();
  addWebpageSchema();

  const wrapper = document.createElement('div');
  wrapper.className = 'press-release-details__inner g-container';

  const content = document.createElement('div');
  content.className = 'press-release-details__content';

  const article = document.createElement('div');
  article.className = 'press-release-details__article';
  contentElements.forEach(elem => {
    transformPressReleaseTableBlock(elem);
    article.append(elem);
  });

  const downloadPdfUrl = downloadPdfElem?.querySelector('a')?.getAttribute('href');

  const utilityBar = buildUtilityBar(downloadPdfUrl);
  const footer = buildBackNavigation(prevReleaseTitleElem, prevReleaseLinkElem, nextReleaseTitleElem, nextReleaseLinkElem);

  // remove the back link from the content elements to avoid duplication
  block.querySelector('.button-container a[title*="back" i]')?.parentElement?.remove();

  // remove h1
  block.querySelector('h1')?.remove();

  content.append(utilityBar, article, footer);
  wrapper.append(content);

  moveInstrumentation(block, wrapper);
  block.replaceChildren(wrapper);
  block.addEventListener('click', async e => {
    if (!e.target.closest('a, button')) return;
    const { getEventDetails } = await import('../../utility/analytics.js');
    getEventDetails(e, block);
  });

  const decorateImageWithInContent = () => {
    block.querySelectorAll('[data-icon-name]').forEach(iconEl => {
      const fileName = iconEl.dataset.iconName.trim();
      if (fileName) {
        const imgEl = block.querySelector(`img[src*="/as/${fileName}"]`);
        const mediaEl = imgEl?.parentElement || imgEl || null;
        if (mediaEl) {
          const parentIconEl = iconEl.parentElement;
          parentIconEl.classList.add('f-right');
          parentIconEl.innerHTML = mediaEl.outerHTML;
          mediaEl.classList.add('inline-purpose');
        }
      }
      
    });
  }
  const decorateRteTables = () => {
    block.querySelectorAll('div:not(.press-release-table) table').forEach(table => {
      const tableParentEl = table.closest('div').parentElement;
      if (tableParentEl.innerHTML.includes('<p>press-release-table</p>')) {
        tableParentEl.innerHTML = tableParentEl.innerHTML.replace('<p>press-release-table</p>', '');
        tableParentEl.classList.add('press-release-table');
      }
    })
  }
  const decorateDelimiters = () => {
    block.querySelectorAll('.icon-disclaimer, .icon-center, .icon-right, .icon-font14, .icon-font12').forEach(el => {
      el.textContent = '';
    });
  }
  decorateDelimiters();
  decorateRteTables();
  decorateImageWithInContent();
}
