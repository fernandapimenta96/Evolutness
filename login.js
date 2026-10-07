/* Tela de login e cadastro. */
(function () {
  'use strict';

  const Api = window.EvolutnessApi;
  const $ = (id) => document.getElementById(id);
  const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const TAMANHO_MIN_SENHA = 8;

  let modoCadastro = false;

  function definirErro(id, mensagem) {
    $('erro-' + id).textContent = mensagem || '';
    if (mensagem) $(id).setAttribute('aria-invalid', 'true');
    else $(id).removeAttribute('aria-invalid');
  }

  function mostrarAviso(id, mensagem) {
    $(id).textContent = mensagem || '';
    $(id).hidden = !mensagem;
  }

  function limparMensagens() {
    ['email', 'senha', 'confirmar'].forEach((id) => definirErro(id));
    mostrarAviso('aviso-form');
    mostrarAviso('aviso-ok');
  }

  function alternarModo() {
    modoCadastro = !modoCadastro;
    limparMensagens();
    $('titulo-auth').textContent = modoCadastro ? 'Criar conta' : 'Entrar';
    $('btn-enviar').textContent = modoCadastro ? 'Criar conta' : 'Entrar';
    $('texto-troca').textContent = modoCadastro ? 'Já tem conta?' : 'Ainda não tem conta?';
    $('btn-troca').textContent = modoCadastro ? 'Entrar' : 'Criar conta';
    $('campo-confirmar').hidden = !modoCadastro;
    $('dica-senha').hidden = !modoCadastro;
    $('senha').setAttribute('autocomplete', modoCadastro ? 'new-password' : 'current-password');
  }

  function validar(email, senha, confirmacao) {
    let primeiroComErro = null;
    const erro = (id, msg) => { definirErro(id, msg); primeiroComErro = primeiroComErro || id; };
    if (!email) erro('email', 'Informe seu e-mail.');
    else if (!EMAIL_VALIDO.test(email)) erro('email', 'Informe um e-mail válido, por exemplo voce@exemplo.com.');
    if (!senha) erro('senha', 'Informe sua senha.');
    else if (modoCadastro && senha.length < TAMANHO_MIN_SENHA) erro('senha', `A senha deve ter pelo menos ${TAMANHO_MIN_SENHA} caracteres.`);
    if (modoCadastro && senha && confirmacao !== senha) erro('confirmar', 'As senhas não são iguais.');
    return primeiroComErro;
  }

  async function aoEnviar(evento) {
    evento.preventDefault();
    limparMensagens();
    const email = $('email').value.trim();
    const senha = $('senha').value;
    const invalido = validar(email, senha, $('confirmar').value);
    if (invalido) { $(invalido).focus(); return; }

    const botao = $('btn-enviar');
    botao.disabled = true;
    try {
      const sessao = modoCadastro ? await Api.cadastrar(email, senha) : await Api.entrar(email, senha);
      if (sessao) {
        window.location.replace('index.html');
      } else {
        alternarModo();
        mostrarAviso('aviso-ok', 'Conta criada! Enviamos uma mensagem de confirmação para o seu e-mail. Confirme e depois entre.');
      }
    } catch (e) {
      mostrarAviso('aviso-form', e.message);
    } finally {
      botao.disabled = false;
    }
  }

  // Ao voltar do link de confirmação, o Supabase anexa os dados ao "#" do endereço.
  function avisarEmailConfirmado() {
    const hash = window.location.hash;
    if (/error_description=/.test(hash)) {
      mostrarAviso('aviso-form', 'O link de confirmação é inválido ou expirou. Crie a conta novamente ou entre se já a confirmou.');
    } else if (/type=signup|access_token=/.test(hash)) {
      localStorage.removeItem('evolutness:sessao');
      mostrarAviso('aviso-ok', 'E-mail confirmado! Agora é só entrar.');
    } else {
      return;
    }
    history.replaceState(null, '', window.location.pathname);
  }

  async function iniciar() {
    avisarEmailConfirmado();
    if (!Api.configurado()) {
      $('aviso-config').hidden = false;
      $('btn-enviar').disabled = true;
      return;
    }
    try {
      if (await Api.obterSessao()) { window.location.replace('index.html'); return; }
    } catch (e) { /* sem internet: mostra o formulário mesmo assim */ }
    $('form-login').addEventListener('submit', aoEnviar);
    $('btn-troca').addEventListener('click', alternarModo);
    $('form-login').addEventListener('input', (e) => {
      if (e.target.id && $('erro-' + e.target.id)) definirErro(e.target.id);
    });
  }

  iniciar();
})();
