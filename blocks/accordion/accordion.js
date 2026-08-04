import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Builds schema.org FAQPage JSON-LD from the accordion's question/answer pairs
 * and injects it into the document head. If a FAQ schema script already exists
 * on the page (e.g. a second FAQ accordion), the questions are merged into that
 * single FAQPage rather than emitting a duplicate.
 *
 * Note: this is "block-based" structured data generated client-side, so crawlers
 * that don't execute JS may not pick it up on the first pass — see
 * https://www.aem.live/docs/schema-structured-data. Only accordions authored with
 * the `faq` variant call this.
 *
 * @param {Element} block the decorated accordion block
 */
function upsertFaqSchema(block) {
  const questions = [...block.querySelectorAll('.accordion-item')]
    .map((item) => ({
      name: item.querySelector('.accordion-item-label')?.textContent.trim(),
      // Plain text keeps the answer safe and valid. Switch to `.innerHTML` if
      // formatted answers are needed (schema.org allows limited HTML).
      text: item.querySelector('.accordion-item-body')?.textContent.trim(),
    }))
    .filter(({ name, text }) => name && text);

  if (!questions.length) return;

  let script = document.head.querySelector('script[data-faq-schema]');
  let schema;
  if (script) {
    schema = JSON.parse(script.textContent);
  } else {
    schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [],
    };
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-faq-schema', '');
    document.head.appendChild(script);
  }

  const seen = new Set(schema.mainEntity.map((q) => q.name));
  questions.forEach(({ name, text }) => {
    if (seen.has(name)) return;
    seen.add(name);
    schema.mainEntity.push({
      '@type': 'Question',
      name,
      acceptedAnswer: { '@type': 'Answer', text },
    });
  });

  script.textContent = JSON.stringify(schema);
}

/**
 * loads and decorates the accordion block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    const [label, body] = row.children;
    if (!label || !body) return;

    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    summary.append(...label.childNodes);

    body.className = 'accordion-item-body';

    const details = document.createElement('details');
    details.className = 'accordion-item';
    moveInstrumentation(row, details);
    details.append(summary, body);
    row.replaceWith(details);
  });

  if (block.classList.contains('faq')) {
    upsertFaqSchema(block);
  }
}
