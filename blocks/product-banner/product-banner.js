function rowText(row) {
  return row ? row.textContent.trim() : '';
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const [headingRow, subheadingRow] = block.children;

  const heading = rowText(headingRow);
  const subheading = rowText(subheadingRow);

  const headingEl = document.createElement('h2');
  headingEl.className = 'hero-banner__heading';
  headingEl.textContent = heading;

  const subheadingEl = document.createElement('h3');
  subheadingEl.className = 'hero-banner__subheading';
  subheadingEl.textContent = subheading;

  const container = document.createElement('div');
  container.className = 'container';
  container.append(headingEl, subheadingEl);

  const heroBanner = document.createElement('div');
  heroBanner.className = 'hero-banner hero-banner--s hero-banner--main';
  heroBanner.append(container);

  block.replaceChildren(heroBanner);
}
