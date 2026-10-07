/* Meu Acompanhamento Corporal — JavaScript puro, sem dependências. */
(function () {
  'use strict';

  /* =====================================================
   * 1. CONFIGURAÇÃO (fácil de editar)
   * ===================================================== */

  // Chave onde as versões antigas guardavam as avaliações (usada só para importar).
  const STORAGE_KEY = 'evolutness:avaliacoes';

  // Cada faixa: { ate: limite superior (exclusivo), rotulo, tom }. A última usa Infinity.
  // Tons: ok | warn | bad | low (ver .badge-* no CSS)
  const FAIXAS = {
    imc: [
      { ate: 18.5, rotulo: 'Baixo peso', tom: 'low' },
      { ate: 25, rotulo: 'Normal', tom: 'ok' },
      { ate: 30, rotulo: 'Sobrepeso', tom: 'warn' },
      { ate: Infinity, rotulo: 'Obesidade', tom: 'bad' },
    ],
    // Referência: mulher de 20 a 39 anos
    gordura: [
      { ate: 21, rotulo: 'Baixo', tom: 'low' },
      { ate: 33, rotulo: 'Normal', tom: 'ok' },
      { ate: 39, rotulo: 'Alto', tom: 'warn' },
      { ate: Infinity, rotulo: 'Muito alto', tom: 'bad' },
    ],
    // Escala do aparelho (valores inteiros): até 9 normal, 10–14 alto, 15+ muito alto
    visceral: [
      { ate: 10, rotulo: 'Normal', tom: 'ok' },
      { ate: 15, rotulo: 'Alto', tom: 'warn' },
      { ate: Infinity, rotulo: 'Muito alto', tom: 'bad' },
    ],
    // Referência: mulher de 20 a 39 anos
    musculo: [
      { ate: 24.3, rotulo: 'Baixo', tom: 'low' },
      { ate: 30.4, rotulo: 'Normal', tom: 'ok' },
      { ate: 35.4, rotulo: 'Alto', tom: 'ok' },
      { ate: Infinity, rotulo: 'Muito alto', tom: 'ok' },
    ],
  };

  // Campos do formulário e regras de validação.
  // tipo: 'data' | 'numero'; min/max: limites; minExclusivo: true => valor > min.
  const CAMPOS = [
    { id: 'data', rotulo: 'Data', tipo: 'data' },
    { id: 'peso', rotulo: 'Peso', tipo: 'numero', min: 0, minExclusivo: true, max: 500 },
    { id: 'altura', rotulo: 'Altura', tipo: 'numero', min: 0, minExclusivo: true, max: 3, dica: 'Informe a altura em metros, por exemplo 1,80.' },
    { id: 'busto', rotulo: 'Busto', tipo: 'numero', min: 0, minExclusivo: true },
    { id: 'cintura', rotulo: 'Cintura', tipo: 'numero', min: 0, minExclusivo: true },
    { id: 'abdomen', rotulo: 'Abdômen', tipo: 'numero', min: 0, minExclusivo: true },
    { id: 'quadril', rotulo: 'Quadril', tipo: 'numero', min: 0, minExclusivo: true },
    { id: 'gordura', rotulo: 'Gordura corporal', tipo: 'numero', min: 1, max: 70, sufixoErro: ' deve estar entre 1% e 70%.' },
    { id: 'visceral', rotulo: 'Gordura visceral', tipo: 'numero', min: 0 },
    { id: 'idadeCorporal', rotulo: 'Idade corporal', tipo: 'numero', min: 0, minExclusivo: true },
    { id: 'musculo', rotulo: 'Músculo esquelético', tipo: 'numero', min: 1, max: 70, sufixoErro: ' deve estar entre 1% e 70%.' },
    { id: 'metabolismo', rotulo: 'Metabolismo basal', tipo: 'numero', min: 0, minExclusivo: true },
  ];

  // Dados de exemplo apenas para testes (o formulário abre em branco).
  const EXEMPLO = {
    data: '2026-10-06', peso: '92', altura: '1,80', busto: '100', cintura: '92',
    abdomen: '91', quadril: '110', gordura: '36,6', visceral: '6',
    idadeCorporal: '37', musculo: '28,6', metabolismo: '1758',
  };

  // Indicadores exibidos em evolução e comparação.
  const INDICADORES = [
    { chave: 'peso', titulo: 'Peso', unidade: 'kg', casas: 1, variacao: 'kg' },
    { chave: 'imc', titulo: 'IMC', unidade: '', casas: 2, variacao: '' },
    { chave: 'gordura', titulo: 'Gordura corporal', unidade: '%', casas: 1, variacao: 'pontos percentuais' },
    { chave: 'visceral', titulo: 'Gordura visceral', unidade: '', casas: 0, variacao: '' },
    { chave: 'musculo', titulo: 'Músculo esquelético', unidade: '%', casas: 1, variacao: 'pontos percentuais' },
    { chave: 'cintura', titulo: 'Cintura', unidade: 'cm', casas: 1, variacao: 'cm' },
  ];

  /* =====================================================
   * 2. FORMATAÇÃO (padrão brasileiro)
   * ===================================================== */

  function formatarNumero(valor, casas, casasMin) {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: casasMin === undefined ? casas : casasMin,
      maximumFractionDigits: casas,
    }).format(valor);
  }

  // Peso e medidas: uma casa decimal somente quando necessário.
  const fmtPeso = (v) => formatarNumero(v, 1, 0);
  const fmt2 = (v) => formatarNumero(v, 2);
  const fmt1 = (v) => formatarNumero(v, 1);
  const fmt0 = (v) => formatarNumero(v, 0);

  function formatarData(iso) {
    const [ano, mes, dia] = iso.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  function formatarDataCurta(iso) {
    const [ano, mes, dia] = iso.split('-');
    return `${dia}/${mes}/${ano.slice(2)}`;
  }

  function formatarVariacao(valor, casas, casasMin) {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: casasMin === undefined ? casas : casasMin,
      maximumFractionDigits: casas,
      signDisplay: 'exceptZero',
    }).format(valor);
  }

  /* =====================================================
   * 3. VALIDAÇÃO
   * ===================================================== */

  // Aceita vírgula ou ponto como separador decimal. Retorna NaN se inválido.
  function lerNumero(texto) {
    const t = String(texto).trim();
    if (!/^\d+([.,]\d+)?$/.test(t)) return NaN;
    return Number(t.replace(',', '.'));
  }

  function validarCampo(campo, texto) {
    const valor = String(texto).trim();
    if (!valor) return { erro: `Preencha o campo ${campo.rotulo.toLowerCase()}.` };

    if (campo.tipo === 'data') {
      return /^\d{4}-\d{2}-\d{2}$/.test(valor) && !isNaN(new Date(valor))
        ? { valor }
        : { erro: 'Informe uma data válida.' };
    }

    const numero = lerNumero(valor);
    if (isNaN(numero)) return { erro: `${campo.rotulo}: digite apenas números (ex.: 12,5).` };

    if (campo.sufixoErro && (numero < campo.min || numero > campo.max)) {
      return { erro: campo.rotulo + campo.sufixoErro };
    }
    if (campo.minExclusivo ? numero <= campo.min : numero < campo.min) {
      return { erro: `${campo.rotulo} deve ser maior que ${campo.min}.`.replace('maior que 0', 'maior que zero') };
    }
    if (campo.max !== undefined && numero > campo.max) {
      return { erro: campo.dica || `${campo.rotulo} parece alto demais. Confira o valor digitado.` };
    }
    return { valor: numero };
  }

  // Retorna { dados, erros }. `leitura(id)` devolve o texto do campo.
  function validarFormulario(leitura) {
    const dados = {};
    const erros = {};
    CAMPOS.forEach((campo) => {
      const r = validarCampo(campo, leitura(campo.id));
      if (r.erro) erros[campo.id] = r.erro;
      else dados[campo.id] = r.valor;
    });
    return { dados, erros };
  }

  /* =====================================================
   * 4. CÁLCULOS
   * ===================================================== */

  function classificar(faixas, valor) {
    return faixas.find((f) => valor < f.ate);
  }

  // Não há fórmulas próprias para gordura, visceral, idade corporal, músculo
  // e metabolismo: esses valores vêm da balança e são apenas classificados.
  function calcularIndicadores(d) {
    const imc = d.peso / (d.altura * d.altura);
    const resultado = {
      imc,
      rcq: d.cintura / d.quadril,
      cinturaAltura: d.cintura / (d.altura * 100),
    };
    if (d.gordura) {
      resultado.massaGordura = (d.peso * d.gordura) / 100;
      resultado.massaLivre = d.peso - resultado.massaGordura;
    }
    return resultado;
  }

  /* =====================================================
   * 5. ARMAZENAMENTO (banco de dados via api.js)
   * ===================================================== */

  const Api = typeof window !== 'undefined' ? window.EvolutnessApi : null;

  // Ordena por data da avaliação e, na mesma data, pela ordem em que foram salvas.
  const porDataEOrdem = (a, b) => a.data.localeCompare(b.data) || a.criadoEm - b.criadoEm;

  // Última lista carregada (usada, por exemplo, para citar a data na confirmação de exclusão).
  let avaliacoes = [];

  async function carregarAvaliacoes() {
    avaliacoes = (await Api.listar()).sort(porDataEOrdem);
    return avaliacoes;
  }

  // Avaliações que ficaram no localStorage de versões anteriores (antes do banco de dados).
  function carregarLegado() {
    try {
      const lista = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (!Array.isArray(lista)) return [];
      return lista
        .filter((a) => a && typeof a.data === 'string' && CAMPOS.every((c) => c.id === 'data' || Number.isFinite(a[c.id])))
        .map((a, i) => ({ ...a, criadoEm: Number.isFinite(a.criadoEm) ? a.criadoEm : i }))
        .sort(porDataEOrdem);
    } catch (e) {
      return [];
    }
  }

  // Valor de um indicador (inclui IMC, que é calculado).
  function valorIndicador(avaliacao, chave) {
    return chave === 'imc' ? calcularIndicadores(avaliacao).imc : avaliacao[chave];
  }

  /* =====================================================
   * 6. RENDERIZAÇÃO
   * ===================================================== */

  const $ = (id) => document.getElementById(id);

  function cartao(titulo, valorHtml, classificacao, nota) {
    const badge = classificacao
      ? `<span class="badge badge-${classificacao.tom}">${classificacao.rotulo}</span>`
      : '';
    const obs = nota ? `<p class="result-note">${nota}</p>` : '';
    return `<article class="card result-card"><h3>${titulo}</h3><p class="result-value">${valorHtml}</p>${badge}${obs}</article>`;
  }

  const comUnidade = (texto, unidade) => (unidade ? `${texto} <small>${unidade}</small>` : texto);

  function renderizarResultado(d) {
    const ind = calcularIndicadores(d);
    const cards = [
      cartao('IMC', fmt2(ind.imc), classificar(FAIXAS.imc, ind.imc)),
      cartao('Gordura corporal', comUnidade(fmt1(d.gordura), '%'), classificar(FAIXAS.gordura, d.gordura)),
      cartao('Gordura visceral', fmt0(d.visceral), classificar(FAIXAS.visceral, Math.round(d.visceral))),
      cartao('Músculo esquelético', comUnidade(fmt1(d.musculo), '%'), classificar(FAIXAS.musculo, d.musculo)),
      cartao('Idade corporal', comUnidade(fmt0(d.idadeCorporal), 'anos'), null,
        'É uma estimativa do aparelho de bioimpedância e não corresponde necessariamente à idade biológica.'),
      cartao('Metabolismo basal', comUnidade(fmt0(d.metabolismo), 'kcal/dia'), null),
    ];
    if (ind.massaGordura !== undefined) {
      cards.push(cartao('Massa de gordura', comUnidade(fmt2(ind.massaGordura), 'kg'), null, 'Valor estimado.'));
      cards.push(cartao('Massa livre de gordura', comUnidade(fmt2(ind.massaLivre), 'kg'), null, 'Valor estimado.'));
    }
    $('cards-resultado').innerHTML = cards.join('');

    const medidas = [
      ['Busto', `${fmtPeso(d.busto)} cm`],
      ['Cintura', `${fmtPeso(d.cintura)} cm`],
      ['Abdômen', `${fmtPeso(d.abdomen)} cm`],
      ['Quadril', `${fmtPeso(d.quadril)} cm`],
      ['Relação cintura/quadril', fmt2(ind.rcq)],
      ['Relação cintura/altura', fmt2(ind.cinturaAltura)],
    ];
    $('lista-medidas').innerHTML = medidas
      .map(([nome, valor]) => `<div><dt>${nome}</dt><dd>${valor}</dd></div>`)
      .join('');

    $('resultado-data').textContent = `Avaliação de ${formatarData(d.data)}`;
    $('resultado').hidden = false;
  }

  function renderizarHistorico(lista) {
    $('historico').hidden = lista.length === 0;
    $('corpo-historico').innerHTML = [...lista]
      .reverse()
      .map((a) => {
        const imc = calcularIndicadores(a).imc;
        return `<tr>
          <td>${formatarData(a.data)}</td>
          <td>${fmtPeso(a.peso)} kg</td>
          <td>${fmt2(imc)}</td>
          <td>${fmt1(a.gordura)}%</td>
          <td>${fmt0(a.visceral)}</td>
          <td>${fmt1(a.musculo)}%</td>
          <td>${fmtPeso(a.cintura)} cm</td>
          <td><button type="button" class="btn btn-danger" data-excluir="${a.id}" aria-label="Excluir avaliação de ${formatarData(a.data)}">Excluir</button></td>
        </tr>`;
      })
      .join('');
  }

  /* ---------- Comparação ---------- */

  function renderizarComparacao(lista) {
    const primeira = lista[0];
    const atual = lista[lista.length - 1];
    $('lista-comparacao').innerHTML = INDICADORES.map((ind) => {
      const ini = valorIndicador(primeira, ind.chave);
      const fim = valorIndicador(atual, ind.chave);
      const casasMin = ind.casas === 1 ? 0 : ind.casas;
      const f = (v) => formatarNumero(v, ind.casas, casasMin);
      const un = ind.unidade ? (ind.unidade === '%' ? '%' : ` ${ind.unidade}`) : '';
      const sufixoVar = ind.variacao ? ` ${ind.variacao}` : '';
      return `<div class="comparison-item"><h4>${ind.titulo}</h4><ul>
        <li><span>Inicial</span><span>${f(ini)}${un}</span></li>
        <li><span>Atual</span><span>${f(fim)}${un}</span></li>
        <li><span>Variação</span><span class="delta">${formatarVariacao(fim - ini, ind.casas, casasMin)}${sufixoVar}</span></li>
      </ul></div>`;
    }).join('');
  }

  /* ---------- Gráficos em SVG puro ---------- */

  function criarGrafico(ind, lista) {
    const L = 52, R = 24, T = 24, B = 36, W = 480, H = 260;
    const valores = lista.map((a) => valorIndicador(a, ind.chave));
    let min = Math.min(...valores);
    let max = Math.max(...valores);
    if (min === max) { min -= 1; max += 1; }
    const folga = (max - min) * 0.15;
    min -= folga;
    max += folga;

    const x = (i) => L + (i * (W - L - R)) / (lista.length - 1);
    const y = (v) => T + ((max - v) * (H - T - B)) / (max - min);
    const casasEixo = ind.casas === 0 ? (max - min < 4 ? 1 : 0) : ind.casas;
    const casasMin = ind.casas === 1 ? 0 : ind.casas;
    const unidade = ind.unidade === '%' ? '%' : '';

    // Linhas de grade e valores do eixo vertical
    let grade = '';
    for (let i = 0; i <= 3; i++) {
      const v = min + ((max - min) * i) / 3;
      grade += `<line class="chart-grid" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/>`
        + `<text class="chart-label" x="${L - 8}" y="${y(v) + 4}" text-anchor="end">${formatarNumero(v, casasEixo)}</text>`;
    }

    // Datas no eixo horizontal (evita sobreposição com muitos pontos)
    const passo = Math.ceil(lista.length / 6);
    let datas = '';
    lista.forEach((a, i) => {
      if (i % passo === 0 || i === lista.length - 1) {
        datas += `<text class="chart-label" x="${x(i)}" y="${H - 12}" text-anchor="middle">${formatarDataCurta(a.data)}</text>`;
      }
    });

    const pontos = valores.map((v, i) => `${x(i)},${y(v)}`).join(' ');
    const marcas = valores.map((v, i) => {
      const rotulo = lista.length <= 8
        ? `<text class="chart-value" x="${x(i)}" y="${y(v) - 10}" text-anchor="middle">${formatarNumero(v, ind.casas, casasMin)}${unidade}</text>`
        : '';
      return `<circle class="chart-dot" cx="${x(i)}" cy="${y(v)}" r="4"><title>${formatarData(lista[i].data)}: ${formatarNumero(v, ind.casas, casasMin)}${ind.unidade ? ' ' + ind.unidade : ''}</title></circle>${rotulo}`;
    }).join('');

    const resumo = `Gráfico de ${ind.titulo}: de ${formatarNumero(valores[0], ind.casas, casasMin)} em ${formatarData(lista[0].data)} para ${formatarNumero(valores[valores.length - 1], ind.casas, casasMin)} em ${formatarData(lista[lista.length - 1].data)}.`;
    const tituloUn = ind.unidade ? ` (${ind.unidade})` : '';

    return `<article class="card chart-card"><h3>${ind.titulo}${tituloUn}</h3>
      <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${resumo}">
        ${grade}
        <line class="chart-axis" x1="${L}" x2="${L}" y1="${T}" y2="${H - B}"/>
        <line class="chart-axis" x1="${L}" x2="${W - R}" y1="${H - B}" y2="${H - B}"/>
        <polyline class="chart-line" points="${pontos}"/>
        ${marcas}${datas}
      </svg></article>`;
  }

  function renderizarEvolucao(lista) {
    // Sem gráfico nem comparação com menos de duas avaliações.
    const mostrar = lista.length >= 2;
    $('evolucao').hidden = !mostrar;
    if (!mostrar) {
      $('graficos').innerHTML = '';
      $('lista-comparacao').innerHTML = '';
      return;
    }
    renderizarComparacao(lista);
    $('graficos').innerHTML = INDICADORES.map((ind) => criarGrafico(ind, lista)).join('');
  }

  async function atualizarListas() {
    try {
      const lista = await carregarAvaliacoes();
      renderizarHistorico(lista);
      renderizarEvolucao(lista);
    } catch (e) {
      tratarErro(e);
    }
  }

  /* =====================================================
   * 7. INTERAÇÃO
   * ===================================================== */

  let ultimaAvaliacao = null;

  function mostrarAviso(mensagem) {
    const aviso = $('aviso');
    aviso.textContent = mensagem || '';
    aviso.hidden = !mensagem;
  }

  function irParaLogin() {
    window.location.replace('login.html');
  }

  // Sessão expirada volta ao login; os demais erros aparecem no topo da página.
  function tratarErro(e) {
    if (e && e.status === 401) {
      Api.sair().then(irParaLogin);
      return;
    }
    mostrarAviso(e && e.message ? e.message : 'Algo deu errado. Tente novamente.');
  }

  function mostrarErros(erros) {
    CAMPOS.forEach((campo) => {
      const input = $(campo.id);
      const msg = erros[campo.id] || '';
      $('erro-' + campo.id).textContent = msg;
      if (msg) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
    });
  }

  function aoCalcular(evento) {
    evento.preventDefault();
    $('status-salvar').textContent = '';
    const { dados, erros } = validarFormulario((id) => $(id).value);
    mostrarErros(erros);

    const idsComErro = CAMPOS.map((c) => c.id).filter((id) => erros[id]);
    if (idsComErro.length) {
      ultimaAvaliacao = null;
      $('resultado').hidden = true;
      $(idsComErro[0]).focus();
      return;
    }

    ultimaAvaliacao = dados;
    renderizarResultado(dados);
    $('resultado').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function aoSalvar() {
    if (!ultimaAvaliacao) return;
    const botao = $('btn-salvar');
    botao.disabled = true;
    mostrarAviso('');
    $('status-salvar').textContent = 'Salvando…';
    try {
      await Api.inserir(ultimaAvaliacao);
      $('status-salvar').textContent = 'Avaliação salva no histórico!';
      await atualizarListas();
    } catch (e) {
      $('status-salvar').textContent = '';
      tratarErro(e);
    } finally {
      botao.disabled = false;
    }
  }

  // Pede confirmação e exclui a avaliação do botão clicado. Retorna true se excluiu.
  async function confirmarExclusao(evento) {
    const botao = evento.target.closest('[data-excluir]');
    if (!botao) return false;
    const id = botao.dataset.excluir;
    const alvo = avaliacoes.find((a) => a.id === id);
    const quando = alvo ? ` de ${formatarData(alvo.data)}` : '';
    if (!window.confirm(`Deseja realmente excluir a avaliação${quando}?`)) return false;
    mostrarAviso('');
    try {
      await Api.excluir(id);
      return true;
    } catch (e) {
      tratarErro(e);
      return false;
    }
  }

  async function aoClicarHistorico(evento) {
    if (await confirmarExclusao(evento)) atualizarListas();
  }

  /* ---------- Importação do localStorage antigo ---------- */

  function iniciarMigracao(sessao) {
    const legado = carregarLegado();
    const chaveDispensa = `evolutness:migracao-dispensada:${sessao.userId}`;
    let dispensada = false;
    try { dispensada = localStorage.getItem(chaveDispensa) === '1'; } catch (e) { /* ignora */ }
    if (!legado.length || dispensada) return;

    $('migracao-texto').textContent = legado.length === 1
      ? 'Encontramos 1 avaliação salva neste navegador. Deseja enviá-la para a sua conta?'
      : `Encontramos ${legado.length} avaliações salvas neste navegador. Deseja enviá-las para a sua conta?`;
    $('migracao').hidden = false;

    $('btn-importar').addEventListener('click', async () => {
      const botoes = [$('btn-importar'), $('btn-dispensar')];
      botoes.forEach((b) => { b.disabled = true; });
      $('migracao-status').textContent = 'Importando…';
      try {
        await Api.inserir(legado);
        try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignora */ }
        $('migracao').hidden = true;
        await atualizarListas();
      } catch (e) {
        $('migracao-status').textContent = '';
        botoes.forEach((b) => { b.disabled = false; });
        tratarErro(e);
      }
    });

    $('btn-dispensar').addEventListener('click', () => {
      try { localStorage.setItem(chaveDispensa, '1'); } catch (e) { /* ignora */ }
      $('migracao').hidden = true;
    });
  }

  function iniciarFormulario(sessao) {
    $('form-avaliacao').addEventListener('submit', aoCalcular);
    $('btn-salvar').addEventListener('click', aoSalvar);
    $('corpo-historico').addEventListener('click', aoClicarHistorico);
    // Limpa o erro de um campo assim que a pessoa volta a digitar.
    $('form-avaliacao').addEventListener('input', (e) => {
      if (e.target.id && $('erro-' + e.target.id)) {
        $('erro-' + e.target.id).textContent = '';
        e.target.removeAttribute('aria-invalid');
      }
    });
    iniciarMigracao(sessao);
    atualizarListas();
  }

  /* ---------- Página "Todas as avaliações" ---------- */

  function cartaoAvaliacao(a) {
    const ind = calcularIndicadores(a);
    const imc = classificar(FAIXAS.imc, ind.imc);
    const gordura = classificar(FAIXAS.gordura, a.gordura);
    const visceral = classificar(FAIXAS.visceral, Math.round(a.visceral));
    const musculo = classificar(FAIXAS.musculo, a.musculo);
    const itens = [
      ['Peso', `${fmtPeso(a.peso)} kg`],
      ['Altura', `${fmt2(a.altura)} m`],
      ['IMC', `${fmt2(ind.imc)} · ${imc.rotulo}`],
      ['Busto', `${fmtPeso(a.busto)} cm`],
      ['Cintura', `${fmtPeso(a.cintura)} cm`],
      ['Abdômen', `${fmtPeso(a.abdomen)} cm`],
      ['Quadril', `${fmtPeso(a.quadril)} cm`],
      ['Relação cintura/quadril', fmt2(ind.rcq)],
      ['Relação cintura/altura', fmt2(ind.cinturaAltura)],
      ['Gordura corporal', `${fmt1(a.gordura)}% · ${gordura.rotulo}`],
      ['Gordura visceral', `${fmt0(a.visceral)} · ${visceral.rotulo}`],
      ['Músculo esquelético', `${fmt1(a.musculo)}% · ${musculo.rotulo}`],
      ['Idade corporal', `${fmt0(a.idadeCorporal)} anos`],
      ['Metabolismo basal', `${fmt0(a.metabolismo)} kcal/dia`],
      ['Massa de gordura', `${fmt2(ind.massaGordura)} kg`],
      ['Massa livre de gordura', `${fmt2(ind.massaLivre)} kg`],
    ];
    const lista = itens.map(([nome, valor]) => `<div><dt>${nome}</dt><dd>${valor}</dd></div>`).join('');
    return `<article class="card saved-card">
      <header class="saved-head">
        <h3>${formatarData(a.data)}</h3>
        <button type="button" class="btn btn-danger" data-excluir="${a.id}" aria-label="Excluir avaliação de ${formatarData(a.data)}">Excluir</button>
      </header>
      <dl class="measures measures-compact">${lista}</dl>
    </article>`;
  }

  async function renderizarTodas() {
    let lista;
    try {
      lista = (await carregarAvaliacoes()).slice().reverse(); // mais recentes primeiro
    } catch (e) {
      tratarErro(e);
      return;
    }
    $('vazio').hidden = lista.length > 0;
    $('contagem').textContent = lista.length
      ? `${lista.length} ${lista.length === 1 ? 'avaliação salva' : 'avaliações salvas'}`
      : '';
    $('lista-avaliacoes').innerHTML = lista.map(cartaoAvaliacao).join('');
  }

  function iniciarTodas() {
    $('lista-avaliacoes').addEventListener('click', async (e) => {
      if (await confirmarExclusao(e)) renderizarTodas();
    });
    renderizarTodas();
  }

  /* ---------- Tema claro/escuro ---------- */

  function iniciarTema() {
    const botao = $('btn-tema');
    if (!botao) return;
    const raiz = document.documentElement;
    const atualizar = () => {
      const escuro = raiz.getAttribute('data-theme') === 'dark';
      botao.textContent = escuro ? 'Tema claro' : 'Tema escuro';
      botao.setAttribute('aria-pressed', String(escuro));
    };
    botao.addEventListener('click', () => {
      const novo = raiz.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      raiz.setAttribute('data-theme', novo);
      try { localStorage.setItem('tema', novo); } catch (e) { /* sem armazenamento: vale só nesta sessão */ }
      atualizar();
    });
    atualizar();
  }

  // Páginas protegidas: exigem login e mostram o usuário e o botão "Sair".
  async function iniciarSessao() {
    if (!Api.configurado()) return irParaLogin();
    let sessao;
    try {
      sessao = await Api.obterSessao();
    } catch (e) {
      mostrarAviso(e.message);
      return null;
    }
    if (!sessao) return irParaLogin();
    $('usuario-email').textContent = sessao.email;
    $('btn-sair').addEventListener('click', () => Api.sair().then(irParaLogin));
    return sessao;
  }

  async function iniciar() {
    iniciarTema();
    const protegida = $('form-avaliacao') || $('lista-avaliacoes');
    if (!protegida) return;
    const sessao = await iniciarSessao();
    if (!sessao) return;
    if ($('form-avaliacao')) iniciarFormulario(sessao);
    if ($('lista-avaliacoes')) iniciarTodas();
  }

  if (typeof document !== 'undefined') {
    iniciar();
  }

  // Exposição para testes em Node (não afeta o navegador).
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { calcularIndicadores, classificar, FAIXAS, validarFormulario, EXEMPLO, lerNumero };
  }
})();
