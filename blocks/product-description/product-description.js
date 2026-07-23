/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const tabButtons = block.querySelectorAll('.tab-section__tab > .tab-section__btn');
  const tabPanels = block.querySelectorAll('.tab-section__main');

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabButtons.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      const { tabId } = btn.dataset;
      tabPanels.forEach((panel) => {
        panel.classList.toggle('is-active', panel.dataset.tab === tabId);
      });
    });
  });
}
