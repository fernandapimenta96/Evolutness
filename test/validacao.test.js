'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { lerNumero, validarFormulario, validarNascimento, validarPerfil, EXEMPLO } = require('../script.js');

const validar = (alteracoes = {}) => validarFormulario((id) => ({ ...EXEMPLO, ...alteracoes })[id]);
const erro = (campo, valor) => validar({ [campo]: valor }).erros[campo];

test('lerNumero aceita vírgula, ponto e espaços nas pontas', () => {
  assert.equal(lerNumero('12,5'), 12.5);
  assert.equal(lerNumero('12.5'), 12.5);
  assert.equal(lerNumero('  1758 '), 1758);
  assert.equal(lerNumero('0'), 0);
});

test('lerNumero rejeita entradas que não são número simples', () => {
  for (const texto of ['', '   ', 'abc', '-1', '1e3', '1,2,3', '12,', ',5', '1 000', '0x10']) {
    assert.ok(Number.isNaN(lerNumero(texto)), `"${texto}" deveria ser inválido`);
  }
});

test('dados de exemplo são válidos e convertidos para número', () => {
  const { dados, erros } = validar();
  assert.deepEqual(erros, {});
  assert.equal(dados.data, '2026-10-06');
  assert.equal(dados.peso, 92);
  assert.equal(dados.altura, 1.8);
  assert.equal(dados.gordura, 36.6);
  assert.equal(dados.metabolismo, 1758);
});

test('campo vazio gera pedido de preenchimento', () => {
  for (const campo of Object.keys(EXEMPLO)) {
    assert.match(erro(campo, ''), /^Preencha o campo /, campo);
    assert.match(erro(campo, '   '), /^Preencha o campo /, campo);
  }
});

test('texto não numérico gera mensagem amigável', () => {
  assert.match(erro('peso', 'abc'), /digite apenas números/);
  assert.match(erro('cintura', '-5'), /digite apenas números/);
});

test('peso, altura, medidas, idade corporal e metabolismo devem ser maiores que zero', () => {
  for (const campo of ['peso', 'altura', 'busto', 'cintura', 'abdomen', 'quadril', 'idadeCorporal', 'metabolismo']) {
    assert.match(erro(campo, '0'), /deve ser maior que zero/, campo);
  }
  assert.equal(erro('peso', '0,1'), undefined);
});

test('altura em centímetros é recusada com a dica em metros', () => {
  assert.match(erro('altura', '180'), /em metros/);
  assert.equal(erro('altura', '3'), undefined);
  assert.match(erro('altura', '3,01'), /em metros/);
});

test('peso acima de 500 kg é considerado erro de digitação', () => {
  assert.equal(erro('peso', '500'), undefined);
  assert.match(erro('peso', '500,1'), /parece alto demais/);
});

for (const campo of ['gordura', 'musculo']) {
  test(`${campo} deve estar entre 1% e 70%`, () => {
    assert.match(erro(campo, '0,9'), /entre 1% e 70%/);
    assert.match(erro(campo, '0'), /entre 1% e 70%/);
    assert.equal(erro(campo, '1'), undefined);
    assert.equal(erro(campo, '70'), undefined);
    assert.match(erro(campo, '70,1'), /entre 1% e 70%/);
  });
}

test('gordura visceral aceita zero', () => {
  assert.equal(erro('visceral', '0'), undefined);
  assert.equal(erro('visceral', '15'), undefined);
  assert.match(erro('visceral', '-1'), /digite apenas números/);
});

test('data válida passa e data ausente ou mal formada falha', () => {
  assert.equal(erro('data', '2024-02-29'), undefined); // ano bissexto
  assert.equal(erro('data', '2026-12-31'), undefined);
  for (const texto of ['06/10/2026', '2026-1-5', 'ontem', '2026-13-01', '2026-00-10']) {
    assert.equal(erro('data', texto), 'Informe uma data válida.', texto);
  }
});

test('data inexistente no calendário é recusada', () => {
  for (const texto of ['2026-02-30', '2026-02-29', '2026-04-31', '2026-06-31']) {
    assert.equal(erro('data', texto), 'Informe uma data válida.', texto);
  }
});

test('vários erros são relatados juntos, só nos campos errados', () => {
  const { erros, dados } = validar({ peso: '', gordura: '80' });
  assert.deepEqual(Object.keys(erros).sort(), ['gordura', 'peso']);
  assert.equal(dados.altura, 1.8);
});

test('data de nascimento: válida, vazia, inexistente, anterior a 1900 e futura', () => {
  const hoje = '2026-10-14';
  assert.deepEqual(validarNascimento('1986-10-06', hoje), { valor: '1986-10-06' });
  assert.deepEqual(validarNascimento(' 2026-10-14 ', hoje), { valor: '2026-10-14' }); // hoje vale
  assert.equal(validarNascimento('', hoje).erro, 'Informe sua data de nascimento.');
  assert.equal(validarNascimento('   ', hoje).erro, 'Informe sua data de nascimento.');
  for (const texto of ['06/10/1986', '1986-02-30', '1986-13-01', 'abc', '1899-12-31']) {
    assert.equal(validarNascimento(texto, hoje).erro, 'Informe uma data de nascimento válida.', texto);
  }
  assert.equal(validarNascimento('2026-10-15', hoje).erro, 'A data de nascimento não pode ser no futuro.');
  assert.deepEqual(validarNascimento('1900-01-01', hoje), { valor: '1900-01-01' });
});

test('validarPerfil aceita mulher de 20 a 79 anos', () => {
  const hoje = '2026-10-26';
  for (const nascimento of ['2006-10-26', '1947-10-27', '1986-10-06']) {
    const r = validarPerfil({ nome: '  Ana   Souza ', sexo: 'feminino', nascimento }, hoje);
    assert.deepEqual(r.erros, {}, nascimento);
    assert.equal(r.valor.nome, 'Ana Souza');
  }
});

test('validarPerfil recusa idade menor que 20 ou maior que 79 anos', () => {
  const hoje = '2026-10-26';
  const base = { nome: 'Ana', sexo: 'feminino' };
  assert.match(validarPerfil({ ...base, nascimento: '2006-10-27' }, hoje).erros.nascimento, /apenas mulheres de 20 a 79 anos.*19 anos/);
  assert.match(validarPerfil({ ...base, nascimento: '1946-10-26' }, hoje).erros.nascimento, /80 anos/);
});

test('validarPerfil recusa sexo masculino ou vazio e nome vazio', () => {
  const r = validarPerfil({ nome: ' ', sexo: 'masculino', nascimento: '1986-10-06' }, '2026-10-26');
  assert.equal(r.erros.nome, 'Informe seu nome.');
  assert.match(r.erros.sexo, /apenas mulheres/);
  assert.equal(validarPerfil({ nome: 'Ana', sexo: '', nascimento: '1986-10-06' }, '2026-10-26').erros.sexo, 'Selecione o sexo.');
});
