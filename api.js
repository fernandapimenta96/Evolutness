/* Acesso ao Supabase (login + banco de dados) com fetch puro, sem bibliotecas. */
(function () {
  'use strict';

  const cfg = window.EVOLUTNESS_CONFIG || {};
  const SESSAO_KEY = 'evolutness:sessao';
  const MARGEM_RENOVACAO_MS = 60 * 1000;

  class ErroApi extends Error {
    constructor(mensagem, status) {
      super(mensagem);
      this.status = status;
    }
  }

  const configurado = () => /^https:\/\/\S+$/.test(cfg.supabaseUrl || '') && Boolean(cfg.supabaseKey);

  /* ---------- Mensagens de erro em português ---------- */

  const MENSAGENS = [
    ['invalid login credentials', 'E-mail ou senha incorretos.'],
    ['email not confirmed', 'Confirme seu e-mail antes de entrar. Procure a mensagem de confirmação na sua caixa de entrada.'],
    ['already registered', 'Este e-mail já está cadastrado. Tente entrar.'],
    ['already been registered', 'Este e-mail já está cadastrado. Tente entrar.'],
    ['at least', 'A senha é muito curta. Use pelo menos 8 caracteres.'],
    ['weak', 'A senha é fraca. Use letras, números e mais caracteres.'],
    ['rate limit', 'Muitas tentativas. Aguarde alguns minutos e tente novamente.'],
    ['too many', 'Muitas tentativas. Aguarde alguns minutos e tente novamente.'],
    ['invalid email', 'Informe um e-mail válido.'],
    ['unable to validate email', 'Informe um e-mail válido.'],
    ['jwt', 'Sua sessão expirou. Entre novamente.'],
  ];

  function traduzirErro(dados) {
    const texto = String((dados && (dados.msg || dados.error_description || dados.message || dados.error)) || '').toLowerCase();
    const achada = MENSAGENS.find(([trecho]) => texto.includes(trecho));
    return achada ? achada[1] : 'Algo deu errado. Tente novamente em instantes.';
  }

  /* ---------- Requisições ---------- */

  async function requisitar(caminho, { metodo = 'GET', corpo, token, cabecalhos } = {}) {
    let resposta;
    try {
      resposta = await fetch(cfg.supabaseUrl + caminho, {
        method: metodo,
        headers: {
          apikey: cfg.supabaseKey,
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...cabecalhos,
        },
        body: corpo === undefined ? undefined : JSON.stringify(corpo),
      });
    } catch (e) {
      throw new ErroApi('Sem conexão com o servidor. Verifique sua internet e tente novamente.', 0);
    }
    const texto = await resposta.text();
    let dados = null;
    try { dados = texto ? JSON.parse(texto) : null; } catch (e) { /* resposta sem JSON */ }
    if (!resposta.ok) throw new ErroApi(traduzirErro(dados), resposta.status);
    return dados;
  }

  /* ---------- Sessão ---------- */

  function lerSessao() {
    try { return JSON.parse(localStorage.getItem(SESSAO_KEY)); } catch (e) { return null; }
  }

  function limparSessao() {
    try { localStorage.removeItem(SESSAO_KEY); } catch (e) { /* ignora */ }
  }

  function criarSessao(resp) {
    const sessao = {
      accessToken: resp.access_token,
      refreshToken: resp.refresh_token,
      expiraEm: resp.expires_at ? resp.expires_at * 1000 : Date.now() + resp.expires_in * 1000,
      userId: resp.user.id,
      email: resp.user.email,
    };
    try { localStorage.setItem(SESSAO_KEY, JSON.stringify(sessao)); } catch (e) { /* ignora */ }
    return sessao;
  }

  // Retorna a sessão válida (renovando se preciso) ou null se for preciso entrar de novo.
  async function obterSessao() {
    const sessao = lerSessao();
    if (!sessao || !sessao.accessToken) return null;
    if (sessao.expiraEm - Date.now() > MARGEM_RENOVACAO_MS) return sessao;
    try {
      const resp = await requisitar('/auth/v1/token?grant_type=refresh_token', {
        metodo: 'POST',
        corpo: { refresh_token: sessao.refreshToken },
      });
      return criarSessao(resp);
    } catch (e) {
      if (e.status === 0) throw e; // sem internet: mantém a sessão e avisa
      limparSessao();
      return null;
    }
  }

  async function entrar(email, senha) {
    const resp = await requisitar('/auth/v1/token?grant_type=password', { metodo: 'POST', corpo: { email, password: senha } });
    return criarSessao(resp);
  }

  // Retorna a sessão, ou null quando o projeto exige confirmação de e-mail.
  async function cadastrar(email, senha) {
    const resp = await requisitar('/auth/v1/signup', { metodo: 'POST', corpo: { email, password: senha } });
    return resp && resp.access_token ? criarSessao(resp) : null;
  }

  async function sair() {
    const sessao = lerSessao();
    limparSessao();
    if (sessao) {
      try { await requisitar('/auth/v1/logout', { metodo: 'POST', token: sessao.accessToken }); } catch (e) { /* já saiu localmente */ }
    }
  }

  /* ---------- Avaliações ---------- */

  const NUMERICOS = ['peso', 'altura', 'busto', 'cintura', 'abdomen', 'quadril', 'gordura', 'visceral', 'idadeCorporal', 'musculo', 'metabolismo'];
  const COLUNAS = { idadeCorporal: 'idade_corporal' };

  function paraLinha(a) {
    const linha = { data: a.data };
    NUMERICOS.forEach((c) => { linha[COLUNAS[c] || c] = a[c]; });
    if (Number.isFinite(a.criadoEm)) linha.criado_em = new Date(a.criadoEm).toISOString();
    return linha;
  }

  function deLinha(l) {
    const a = { id: l.id, data: l.data, criadoEm: Date.parse(l.criado_em) };
    NUMERICOS.forEach((c) => { a[c] = Number(l[COLUNAS[c] || c]); });
    return a;
  }

  async function comSessao(fn) {
    const sessao = await obterSessao();
    if (!sessao) throw new ErroApi('Sua sessão expirou. Entre novamente.', 401);
    return fn(sessao.accessToken);
  }

  const listar = () => comSessao(async (token) => {
    const linhas = await requisitar('/rest/v1/avaliacoes?select=*&order=data.asc,criado_em.asc', { token });
    return (linhas || []).map(deLinha);
  });

  // Aceita uma avaliação ou uma lista (importação).
  const inserir = (avaliacoes) => comSessao((token) => requisitar('/rest/v1/avaliacoes', {
    metodo: 'POST',
    token,
    corpo: Array.isArray(avaliacoes) ? avaliacoes.map(paraLinha) : paraLinha(avaliacoes),
    cabecalhos: { Prefer: 'return=minimal' },
  }));

  const excluir = (id) => comSessao((token) => requisitar(`/rest/v1/avaliacoes?id=eq.${encodeURIComponent(id)}`, {
    metodo: 'DELETE',
    token,
  }));

  window.EvolutnessApi = { configurado, obterSessao, entrar, cadastrar, sair, listar, inserir, excluir };
})();
