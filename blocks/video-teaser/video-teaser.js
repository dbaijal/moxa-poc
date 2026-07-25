function rowText(row) {
  return row ? row.textContent.trim() : '';
}

function extractYoutubeId(url) {
  if (!url) return '';
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.*&v=))([\w-]{11})/,
  );
  return match ? match[1] : '';
}

function buildEmbed(youtubeUrl) {
  const videoId = extractYoutubeId(youtubeUrl);

  const embed = document.createElement('div');
  embed.className = 'video-teaser__embed';

  if (videoId) {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${videoId}`;
    iframe.title = 'YouTube video player';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    embed.append(iframe);
  }

  return embed;
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const [titleRow, descriptionRow, youtubeUrlRow] = block.children;

  const heading = document.createElement('h2');
  heading.className = 'text-content__heading text-center';
  heading.textContent = rowText(titleRow);

  const descriptionCell = descriptionRow?.firstElementChild;
  const textItem = document.createElement('div');
  textItem.className = 'two-col-card__item';
  while (descriptionCell?.firstElementChild) {
    textItem.append(descriptionCell.firstElementChild);
  }

  const videoItem = document.createElement('div');
  videoItem.className = 'two-col-card__item';
  videoItem.append(buildEmbed(rowText(youtubeUrlRow)));

  const twoColCard = document.createElement('div');
  twoColCard.className = 'two-col-card';
  twoColCard.append(textItem, videoItem);

  const textContent = document.createElement('div');
  textContent.className = 'text-content';
  textContent.append(heading, twoColCard);

  block.classList.add('section');
  block.replaceChildren(textContent);
}
