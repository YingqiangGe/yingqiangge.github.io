import { plotlyDarkLayout, plotlyLightLayout } from './theme.js';

let plotlyReady;
function loadPlotly() {
  if (window.Plotly) return Promise.resolve(window.Plotly);
  if (!plotlyReady) {
    plotlyReady = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = new URL('./plotly.min.js', import.meta.url).href;
      script.onload = () => window.Plotly
        ? resolve(window.Plotly)
        : reject(new Error('Plotly did not initialize'));
      script.onerror = () => reject(new Error('Plotly download failed'));
      document.head.appendChild(script);
    });
  }
  return plotlyReady;
}

export async function renderPlots() {
  const elements = document.querySelectorAll('pre > code.language-plotly');
  if (!elements.length) return;
  const Plotly = await loadPlotly();
  const charts = [];
  const layoutFor = data => {
    const theme = document.documentElement.getAttribute('data-theme') === 'dark'
      ? plotlyDarkLayout : plotlyLightLayout;
    return { ...data.layout, template: { ...theme, ...data.layout?.template } };
  };
  for (const element of elements) {
    const chart = document.createElement('div');
    try {
      const data = JSON.parse(element.textContent);
      element.parentElement.after(chart);
      await Plotly.react(chart, data.data, layoutFor(data), { responsive: true });
      // Keep the source visible if loading or rendering fails.
      element.parentElement.classList.add('hidden');
      charts.push({ chart, data });
    } catch (error) {
      chart.remove();
      console.error('Unable to render chart:', error);
    }
  }
  if (charts.length) {
    new MutationObserver(() => {
      charts.forEach(({ chart, data }) => {
        Plotly.relayout(chart, { template: layoutFor(data).template })
          .catch(error => console.error('Unable to update chart theme:', error));
      });
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }
}
