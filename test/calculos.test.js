'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { calcularIndicadores, classificar, classificarImc, classificarPorIdade, calcularIdade, FAIXAS, SEM_REFERENCIA } = require('../script.js');

// Valores esperados calculados à mão (não derivados do código testado).
const quase = (obtido, esperado, tolerancia = 0.005) =>
  assert.ok(Math.abs(obtido - esperado) < tolerancia, `esperado ≈ ${esperado}, obtido ${obtido}`);

const base = { peso: 92, altura: 1.8, cintura: 92, quadril: 110 };

test('IMC = peso / altura²', () => {
  quase(calcularIndicadores(base).imc, 28.4); // 92 / 3,24
  quase(calcularIndicadores({ ...base, peso: 50, altura: 1.6 }).imc, 19.53); // 50 / 2,56
  quase(calcularIndicadores({ ...base, peso: 100, altura: 1 }).imc, 100);
});

test('RCQ = cintura / quadril', () => {
  quase(calcularIndicadores(base).rcq, 0.84); // 92 / 110
  quase(calcularIndicadores({ ...base, cintura: 80, quadril: 100 }).rcq, 0.8);
});

test('relação cintura/altura usa a altura em centímetros', () => {
  quase(calcularIndicadores(base).cinturaAltura, 0.51); // 92 / 180
  quase(calcularIndicadores({ ...base, cintura: 90, altura: 1.5 }).cinturaAltura, 0.6); // 90 / 150
});

test('massa de gordura e massa livre aparecem só com gordura corporal', () => {
  const sem = calcularIndicadores(base);
  assert.equal(sem.massaGordura, undefined);
  assert.equal(sem.massaLivre, undefined);

  const com = calcularIndicadores({ ...base, gordura: 36.6 });
  quase(com.massaGordura, 33.67); // 92 × 36,6 / 100
  quase(com.massaLivre, 58.33); // 92 − 33,672
  quase(com.massaGordura + com.massaLivre, 92, 1e-9);
});

test('massa de gordura com percentuais redondos', () => {
  const r = calcularIndicadores({ ...base, peso: 80, gordura: 25 });
  quase(r.massaGordura, 20, 1e-9);
  quase(r.massaLivre, 60, 1e-9);
});

// Cada item: [valor, rótulo esperado], conforme as faixas do CLAUDE.md.
const casosImc = [[18.49, 'Baixo peso'], [18.5, 'Normal'], [24.99, 'Normal'], [25, 'Sobrepeso'], [29.99, 'Sobrepeso'], [30, 'Obesidade'], [41, 'Obesidade']];
const casosVisceral = [[0, 'Normal'], [9, 'Normal'], [10, 'Alto'], [14, 'Alto'], [15, 'Muito alto'], [30, 'Muito alto']];

test('classificação de IMC nos limites das faixas', () => {
  for (const [valor, rotulo] of casosImc) assert.equal(classificar(FAIXAS.imc, valor).rotulo, rotulo, `imc ${valor}`);
});

test('classificação de gordura visceral nos limites das faixas', () => {
  for (const [valor, rotulo] of casosVisceral) assert.equal(classificar(FAIXAS.visceral, valor).rotulo, rotulo, `visceral ${valor}`);
});

// [valor, rótulo] em cada ponto de corte, por indicador e faixa etária.
const porIdade = {
  gordura: {
    30: [[5, 'Baixo'], [20.9, 'Baixo'], [21, 'Normal'], [32.9, 'Normal'], [33, 'Alto'], [38.9, 'Alto'], [39, 'Muito alto'], [70, 'Muito alto']],
    50: [[5, 'Baixo'], [22.9, 'Baixo'], [23, 'Normal'], [33.9, 'Normal'], [34, 'Alto'], [39.9, 'Alto'], [40, 'Muito alto'], [70, 'Muito alto']],
    70: [[5, 'Baixo'], [23.9, 'Baixo'], [24, 'Normal'], [35.9, 'Normal'], [36, 'Alto'], [41.9, 'Alto'], [42, 'Muito alto'], [70, 'Muito alto']],
  },
  musculo: {
    30: [[10, 'Baixo'], [24.2, 'Baixo'], [24.3, 'Normal'], [30.3, 'Normal'], [30.4, 'Alto'], [35.3, 'Alto'], [35.4, 'Muito alto'], [60, 'Muito alto']],
    50: [[10, 'Baixo'], [24, 'Baixo'], [24.1, 'Normal'], [30.1, 'Normal'], [30.2, 'Alto'], [35.1, 'Alto'], [35.2, 'Muito alto'], [60, 'Muito alto']],
    70: [[10, 'Baixo'], [23.8, 'Baixo'], [23.9, 'Normal'], [29.9, 'Normal'], [30, 'Alto'], [34.9, 'Alto'], [35, 'Muito alto'], [60, 'Muito alto']],
  },
};

for (const [indicador, faixas] of Object.entries(porIdade)) {
  for (const [idade, casos] of Object.entries(faixas)) {
    test(`classificação de ${indicador} aos ${idade} anos nos limites das faixas`, () => {
      for (const [valor, rotulo] of casos) {
        assert.equal(classificarPorIdade(indicador, valor, Number(idade)).rotulo, rotulo, `${indicador} ${valor}`);
      }
    });
  }
}

test('a faixa etária muda a classificação do mesmo valor', () => {
  // 33,5% de gordura: alto aos 30, normal aos 50 e aos 70.
  assert.equal(classificarPorIdade('gordura', 33.5, 30).rotulo, 'Alto');
  assert.equal(classificarPorIdade('gordura', 33.5, 50).rotulo, 'Normal');
  assert.equal(classificarPorIdade('gordura', 33.5, 70).rotulo, 'Normal');
});

test('limites das faixas etárias: 20, 39, 40, 59, 60 e 79 anos têm referência', () => {
  assert.equal(classificarPorIdade('gordura', 25, 20).rotulo, 'Normal');
  assert.equal(classificarPorIdade('gordura', 33.5, 39).rotulo, 'Alto'); // faixa 20-39
  assert.equal(classificarPorIdade('gordura', 33.5, 40).rotulo, 'Normal'); // faixa 40-59
  assert.equal(classificarPorIdade('gordura', 35.5, 59).rotulo, 'Alto'); // faixa 40-59
  assert.equal(classificarPorIdade('gordura', 35.5, 60).rotulo, 'Normal'); // faixa 60-79
  assert.equal(classificarPorIdade('gordura', 41, 79).rotulo, 'Alto');
});

test('sem idade ou fora de 20 a 79 anos não há referência (nada é inventado)', () => {
  for (const idade of [null, undefined, NaN, 19, 80, 120, 30.5]) {
    assert.equal(classificarPorIdade('gordura', 30, idade), SEM_REFERENCIA, `idade ${idade}`);
    assert.equal(classificarPorIdade('musculo', 28, idade), SEM_REFERENCIA, `idade ${idade}`);
  }
});

test('calcularIdade conta anos completos na data da avaliação', () => {
  assert.equal(calcularIdade('1986-10-06', '2026-10-06'), 40); // aniversário no mesmo dia
  assert.equal(calcularIdade('1986-10-06', '2026-10-05'), 39); // um dia antes
  assert.equal(calcularIdade('1986-10-06', '2026-10-07'), 40);
  assert.equal(calcularIdade('1986-12-31', '2026-01-01'), 39); // mês anterior ao aniversário
  assert.equal(calcularIdade('1986-01-01', '2026-12-31'), 40);
  assert.equal(calcularIdade('2000-02-29', '2026-02-28'), 25); // nascida em ano bissexto
  assert.equal(calcularIdade('2000-02-29', '2026-03-01'), 26);
  assert.equal(calcularIdade('2026-10-06', '2026-10-06'), 0);
});

test('a idade usa a data da avaliação, então avaliações antigas mudam de faixa', () => {
  assert.equal(calcularIdade('1986-10-06', '2026-10-05'), 39); // faixa 20-39
  assert.equal(calcularIdade('1986-10-06', '2026-10-06'), 40); // faixa 40-59
});

test('calcularIdade devolve null sem data de nascimento ou com datas inválidas', () => {
  assert.equal(calcularIdade(null, '2026-10-06'), null);
  assert.equal(calcularIdade('', '2026-10-06'), null);
  assert.equal(calcularIdade('1986-02-30', '2026-10-06'), null);
  assert.equal(calcularIdade('1986-10-06', 'abc'), null);
});

test('exemplo do projeto: IMC 28,4 é sobrepeso e gordura 36,6% é alta', () => {
  assert.equal(classificar(FAIXAS.imc, calcularIndicadores(base).imc).rotulo, 'Sobrepeso');
  assert.equal(classificarPorIdade('gordura', 36.6, 37).rotulo, 'Alto');
  assert.equal(classificarPorIdade('musculo', 28.6, 37).rotulo, 'Normal');
  assert.equal(classificar(FAIXAS.visceral, 6).rotulo, 'Normal');
});

// 64 / 1,6² dá 24,999999999999996 em ponto flutuante, mas o IMC exibido é 25,00 (sobrepeso).
test('classificarImc usa o IMC arredondado a 2 casas, como exibido', () => {
  const imc = calcularIndicadores({ ...base, peso: 64, altura: 1.6 }).imc;
  assert.equal(classificarImc(imc), classificarImc(25));
  assert.equal(classificarImc(imc).rotulo, 'Sobrepeso');
  assert.equal(classificarImc(24.994).rotulo, 'Normal'); // exibido como 24,99
  assert.equal(classificarImc(24.996).rotulo, 'Sobrepeso'); // exibido como 25,00
  assert.equal(classificarImc(18.494).rotulo, 'Baixo peso'); // exibido como 18,49
  assert.equal(classificarImc(18.496).rotulo, 'Normal'); // exibido como 18,50
});
