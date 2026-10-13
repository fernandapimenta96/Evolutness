// Aplica o tema salvo (ou o do sistema) antes de desenhar a página, evitando "piscar".
// Carregado de forma síncrona no <head> (sem defer) para que a CSP dispense scripts inline.
(function () {
  var tema = null;
  try { tema = localStorage.getItem('tema'); } catch (e) {}
  if (!tema && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) tema = 'dark';
  document.documentElement.setAttribute('data-theme', tema === 'dark' ? 'dark' : 'light');
})();
