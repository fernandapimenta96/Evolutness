/* Tela de login, cadastro e recuperação de senha. */
(function () {
  'use strict';

  const Api = window.EvolutnessApi;
  const $ = (id) => document.getElementById(id);
  const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const TAMANHO_MIN_SENHA = 8;

  // Cada modo define textos e quais campos aparecem.
  const MODOS = {
    entrar: {
      titulo: 'Entrar', botao: 'Entrar', rotuloSenha: 'Senha', autocomplete: 'current-password',
      email: true, senha: true, confirmar: false, esqueci: true, troca: ['Ainda não tem conta?', 'Criar conta', 'cadastro'],
    },
    cadastro: {
      titulo: 'Criar conta', botao: 'Criar conta', rotuloSenha: 'Senha', autocomplete: 'new-password',
      email: true, senha: true, confirmar: true, esqueci: false, troca: ['Já tem conta?', 'Entrar', 'entrar'],
    },
    recuperar: {
      titulo: 'Recuperar senha', botao: 'Enviar link de recuperação', rotuloSenha: 'Senha', autocomplete: 'current-password',
      email: true, senha: false, confirmar: false, esqueci: false, troca: ['Lembrou a senha?', 'Entrar', 'entrar'],
    },
    redefinir: {
      titulo: 'Criar nova senha', botao: 'Salvar nova senha', rotuloSenha: 'Nova senha', autocomplete: 'new-password',
      email: false, senha: true, confirmar: true, esqueci: false, troca: null,
    },
  };

  let modo = 'entrar';
  let tokenRecuperacao = null; // token temporário vindo do link do e-mail (só em memória)

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

  function definirModo(novo) {
    modo = novo;
    const m = MODOS[modo];
    limparMensagens();
    $('titulo-auth').textContent = m.titulo;
    $('btn-enviar').textContent = m.botao;
    $('rotulo-senha').textContent = m.rotuloSenha;
    $('campo-email').hidden = !m.email;
    $('campo-senha').hidden = !m.senha;
    $('campo-confirmar').hidden = !m.confirmar;
    $('dica-senha').hidden = !m.confirmar;
    $('area-esqueci').hidden = !m.esqueci;
    $('area-troca').hidden = !m.troca;
    if (m.troca) {
      $('texto-troca').textContent = m.troca[0];
      $('btn-troca').textContent = m.troca[1];
    }
    $('senha').setAttribute('autocomplete', m.autocomplete);
    $('senha').value = '';
    $('confirmar').value = '';
  }

  function validar(email, senha, confirmacao) {
    const m = MODOS[modo];
    let primeiroComErro = null;
    const erro = (id, msg) => { definirErro(id, msg); primeiroComErro = primeiroComErro || id; };
    if (m.email) {
      if (!email) erro('email', 'Informe seu e-mail.');
      else if (!EMAIL_VALIDO.test(email)) erro('email', 'Informe um e-mail válido, por exemplo voce@exemplo.com.');
    }
    if (m.senha) {
      if (!senha) erro('senha', modo === 'redefinir' ? 'Informe a nova senha.' : 'Informe sua senha.');
      else if (m.confirmar && senha.length < TAMANHO_MIN_SENHA) erro('senha', `A senha deve ter pelo menos ${TAMANHO_MIN_SENHA} caracteres.`);
    }
    if (m.confirmar && senha && confirmacao !== senha) erro('confirmar', 'As senhas não são iguais.');
    return primeiroComErro;
  }

  async function executar(email, senha) {
    if (modo === 'recuperar') {
      await Api.recuperarSenha(email);
      mostrarAviso('aviso-ok', 'Se este e-mail estiver cadastrado, enviamos um link para criar uma nova senha. Verifique também a caixa de spam.');
    } else if (modo === 'redefinir') {
      await Api.redefinirSenha(tokenRecuperacao, senha);
      tokenRecuperacao = null;
      definirModo('entrar');
      mostrarAviso('aviso-ok', 'Senha alterada! Agora é só entrar com a nova senha.');
    } else {
      const sessao = modo === 'cadastro' ? await Api.cadastrar(email, senha) : await Api.entrar(email, senha);
      if (sessao) {
        window.location.replace('index.html');
      } else {
        definirModo('entrar');
        mostrarAviso('aviso-ok', 'Conta criada! Enviamos uma mensagem de confirmação para o seu e-mail. Confirme e depois entre.');
      }
    }
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
      await executar(email, senha);
    } catch (e) {
      mostrarAviso('aviso-form', e.message);
    } finally {
      botao.disabled = false;
    }
  }

  // Ao voltar de um link do e-mail (confirmação ou recuperação), o Supabase anexa os dados ao "#".
  // Retorna { recuperacao, aviso: [idDoAviso, texto] } ou null se não há nada no endereço.
  function lerLinkDoEmail() {
    const hash = window.location.hash;
    if (!hash) return null;
    const params = new URLSearchParams(hash.slice(1));
    let resultado;
    if (params.get('error_description')) {
      resultado = { aviso: ['aviso-form', 'O link é inválido ou expirou. Se for de recuperação de senha, solicite um novo link; se for de confirmação, tente entrar.'] };
    } else if (params.get('type') === 'recovery' && params.get('access_token')) {
      tokenRecuperacao = params.get('access_token');
      resultado = { recuperacao: true };
    } else if (/type=signup|access_token=/.test(hash)) {
      localStorage.removeItem('evolutness:sessao');
      resultado = { aviso: ['aviso-ok', 'E-mail confirmado! Agora é só entrar.'] };
    } else {
      return null;
    }
    history.replaceState(null, '', window.location.pathname);
    return resultado;
  }

  async function iniciar() {
    const link = lerLinkDoEmail() || {};
    if (!Api.configurado()) {
      $('aviso-config').hidden = false;
      $('btn-enviar').disabled = true;
      return;
    }
    if (link.recuperacao) {
      // Mesmo com sessão antiga salva, a pessoa veio para criar uma nova senha.
      definirModo('redefinir');
    } else {
      try {
        if (await Api.obterSessao()) { window.location.replace('index.html'); return; }
      } catch (e) { /* sem internet: mostra o formulário mesmo assim */ }
      definirModo('entrar');
    }
    if (link.aviso) mostrarAviso(link.aviso[0], link.aviso[1]);
    $('form-login').addEventListener('submit', aoEnviar);
    $('btn-troca').addEventListener('click', () => definirModo(MODOS[modo].troca[2]));
    $('btn-esqueci').addEventListener('click', () => {
      const email = $('email').value;
      definirModo('recuperar');
      $('email').value = email;
    });
    $('form-login').addEventListener('input', (e) => {
      if (e.target.id && $('erro-' + e.target.id)) definirErro(e.target.id);
    });
  }

  iniciar();
})();
