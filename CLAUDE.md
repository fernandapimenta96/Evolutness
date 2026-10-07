### TECNOLOGIAS
- HTML5
- CSS3
- JavaScript puro (Vanilla JS)
- Não utilizar frameworks ou bibliotecas externas.
- Criar os arquivos:
  - index.html
  - style.css
  - script.js

### OBJETIVO
Quero poder utilizar essa página sempre que eu fizer uma nova pesagem e medição corporal.

A página deve permitir cadastrar uma avaliação com:
- data da avaliação
- peso
- altura
- busto
- cintura
- abdômen
- quadril
- gordura corporal (%)
- gordura visceral
- idade corporal
- músculo esquelético (%)
- metabolismo basal (kcal)

### IMPORTANTE SOBRE OS CÁLCULOS
NÃO invente fórmulas para indicadores que dependem do algoritmo específico de uma balança de bioimpedância.

O IMC deve ser calculado automaticamente:
IMC = peso / (altura × altura)

Considerar IMC:
- abaixo de 18,5 → baixo peso
- 18,5 a 24,9 → normal
- 25,0 a 29,9 → sobrepeso
- 30,0 ou mais → obesidade

Para os demais indicadores:
1. Gordura corporal
2. Gordura visceral
3. Idade corporal
4. Músculo esquelético
5. Metabolismo basal

### CÁLCULOS ADICIONAIS
Além do IMC, calcular automaticamente:

1. Relação cintura/quadril (RCQ)
RCQ = cintura / quadril

2. Relação cintura/altura
Relação cintura/altura = cintura / altura em centímetros

Cálculos que devem aparecer somente quando o usuário informar a gordura corporal:

3. massa de gordura estimada em kg =
  peso × gordura corporal / 100

4. massa livre de gordura estimada em kg =
  peso - massa de gordura

Exibir os resultados com duas casas decimais.

### INTERFACE
Quero uma interface moderna, limpa e elegante.

Tema:
- aparência de aplicativo de acompanhamento de saúde/bem-estar
- fundo claro
- cartões brancos
- bordas arredondadas
- sombras suaves
- boa hierarquia visual
- tipografia moderna
- bastante espaço entre os elementos
- aparência profissional, mas não excessivamente clínica

A página deve funcionar perfeitamente em:
- computador
- tablet
- celular

### IDIOMA
Toda a interface deve estar em português do Brasil.

Usar:
- kg
- cm
- %
- kcal
- números formatados no padrão brasileiro quando apropriado.

### ESTRUTURA DA PÁGINA
Criar um cabeçalho com:
"Meu Acompanhamento Corporal"

Subtítulo:
"Registre suas medidas e acompanhe sua evolução ao longo do tempo."

Depois criar um formulário dividido em seções.

SEÇÃO 1 — Dados da avaliação
Campos:
- Data
- Peso (kg)
- Altura (m)

SEÇÃO 2 — Medidas corporais
Campos:
- Busto (cm)
- Cintura (cm)
- Abdômen (cm)
- Quadril (cm)

SEÇÃO 3 — Bioimpedância
Campos:
- Gordura corporal (%)
- Gordura visceral
- Idade corporal
- Músculo esquelético (%)
- Metabolismo basal (kcal)

Adicionar uma pequena observação:
"Informe os valores exatamente como apresentados pela sua balança ou exame de bioimpedância."

### BOTÃO
Criar um botão:
"Calcular avaliação"

Ao clicar, validar os campos e gerar o relatório abaixo do formulário.

### RELATÓRIO
Criar uma seção chamada: "Resultado da avaliação"

Mostrar os resultados em cards.
Card 1:
"IMC"
Mostrar:
- valor
- classificação

Card 2:
"Gordura corporal"
Mostrar:
- percentual
- classificação

Usar como referência para mulher de 20 a 39 anos:
- abaixo de 21% → baixo
- 21% a 32,9% → normal
- 33% a 38,9% → alto
- 39% ou mais → muito alto

Card 3:
"Gordura visceral"
Mostrar:
- valor
- classificação

Usar a escala do aparelho:
- até 9 → normal
- 10 a 14 → alto
- 15 ou mais → muito alto

Card 4:
"Músculo esquelético"
Mostrar:
- percentual
- classificação

Para mulher de 20 a 39 anos:
- abaixo de 24,3% → baixo
- 24,3% a 30,3% → normal
- 30,4% a 35,3% → alto
- 35,4% ou mais → muito alto

Card 5:
"Idade corporal"
Mostrar o valor em anos.

Adicionar uma observação pequena:
"É uma estimativa do aparelho de bioimpedância e não corresponde necessariamente à idade biológica."

Card 6:
"Metabolismo basal"
Mostrar o valor em kcal/dia.

Card 7:
"Massa de gordura"
Mostrar o valor estimado em kg.

Card 8:
"Massa livre de gordura"
Mostrar o valor estimado em kg.

Depois criar uma seção:

"Medidas corporais"
Mostrar:
- Busto
- Cintura
- Abdômen
- Quadril
- Relação cintura/quadril
- Relação cintura/altura

### HISTÓRICO
Quero poder salvar avaliações anteriores utilizando localStorage.

Criar um botão:
"Salvar avaliação"

Depois de salvar, mostrar uma tabela ou lista chamada: "Histórico de avaliações".

Cada registro deve mostrar:
- data
- peso
- IMC
- gordura corporal
- gordura visceral
- músculo esquelético
- cintura

Adicionar botão para excluir um registro e antes de excluir, pedir confirmação.

### EVOLUÇÃO
Se houver pelo menos duas avaliações salvas, criar uma seção: "Minha evolução"

Mostrar a evolução dos seguintes indicadores:
- Peso
- IMC
- Gordura corporal
- Gordura visceral
- Músculo esquelético
- Cintura

Pode utilizar gráficos simples feitos apenas com HTML/CSS/JavaScript, sem bibliotecas externas.

Se achar mais adequado, pode utilizar SVG puro para os gráficos.

Os gráficos devem mostrar a data no eixo horizontal e o valor no eixo vertical.

### IMPORTANTE:
Não mostrar gráfico se houver apenas uma avaliação.

### COMPARAÇÃO
Quando houver duas ou mais avaliações, mostrar também um pequeno resumo:
"Desde a primeira avaliação"

Exemplo:

Peso:
- inicial: 92 kg
- atual: 88 kg
- variação: -4 kg

Gordura corporal:
- inicial: 36,6%
- atual: 34,2%
- variação: -2,4 pontos percentuais

Cintura:
- inicial: 92 cm
- atual: 88 cm
- variação: -4 cm

Utilizar o registro mais antigo como referência e o mais recente como valor atual.

Não confundir diferença percentual com diferença em pontos percentuais.

### EXEMPLO DE DADOS INICIAIS
Para testar a aplicação, utilizar inicialmente estes dados:

Data: 06/10/2026
Peso: 92 kg
Altura: 1,80 m
Busto: 100 cm
Cintura: 92 cm
Abdômen: 91 cm
Quadril: 110 cm
Gordura corporal: 36,6%
Gordura visceral: 6
Idade corporal: 37
Músculo esquelético: 28,6%
Metabolismo basal: 1758 kcal

Com esses dados, o sistema deve calcular aproximadamente:

IMC: 28,4

RCQ:
92 / 110 = 0,84

Relação cintura/altura:
92 / 180 = 0,51

Massa de gordura:
92 × 36,6 / 100 ≈ 33,7 kg

Massa livre de gordura:
92 - 33,7 ≈ 58,3 kg

### IMPORTANTE SOBRE A INTERPRETAÇÃO

Não transformar os resultados em diagnóstico médico.

Adicionar ao final do relatório uma observação discreta:

"Este relatório é destinado ao acompanhamento pessoal e não substitui avaliação médica ou nutricional. Os resultados de bioimpedância podem variar conforme aparelho, hidratação, horário e condições da medição."

### EXPERIÊNCIA DO USUÁRIO
Quero que:
- os campos tenham labels claros;
- unidades apareçam nos campos;
- valores inválidos gerem mensagens de erro amigáveis;
- campos obrigatórios sejam claramente identificados;
- o formulário seja fácil de preencher no celular;
- o botão de cálculo tenha destaque;
- os resultados sejam visualmente fáceis de entender;
- não haja necessidade de servidor ou banco de dados;
- todos os dados sejam armazenados somente no navegador através de localStorage.

### VALIDAÇÃO
Validar:
- peso > 0
- altura > 0
- medidas > 0
- gordura corporal entre 1 e 70%
- gordura visceral >= 0
- idade corporal > 0
- músculo esquelético entre 1 e 70%
- metabolismo basal > 0

### FORMATAÇÃO
Usar:
- uma casa decimal para peso quando necessário;
- duas casas para IMC;
- uma casa decimal para percentual de gordura;
- uma casa decimal para músculo esquelético;
- duas casas para RCQ;
- duas casas para relação cintura/altura;
- números inteiros para gordura visceral, idade corporal e metabolismo basal.

### ACESSIBILIDADE
Utilizar:
- HTML semântico;
- labels associados corretamente aos inputs;
- contraste adequado;
- navegação por teclado;
- mensagens de erro compreensíveis;
- aria-label/aria-live quando fizer sentido.

### RESPONSIVIDADE
No desktop:
- formulário em duas colunas quando houver espaço;
- resultados em uma grade de cards.

No celular:
- tudo deve passar para uma coluna;
- botões devem ocupar uma largura confortável;
- tabela de histórico deve permitir rolagem horizontal ou utilizar cards.

### ENTREGA
Crie os três arquivos:

index.html
style.css
script.js

Não utilize backend.

Depois de criar os arquivos:
1. verifique se todos os caminhos estão corretos;
2. verifique se o JavaScript não possui erros;
3. teste os cálculos utilizando os dados de exemplo;
4. confirme que o localStorage funciona;
5. confirme que a página funciona sem internet;
6. explique brevemente como abrir a página no navegador.

Priorize código limpo, organizado, legível e fácil de modificar futuramente.
### ATUALIZAÇÃO (substitui "sem backend / só localStorage")
- Os dados agora ficam no Supabase (Postgres + Auth), acessado por `fetch` em `api.js`; configuração em `config.js`, esquema em `supabase.sql`.
- Páginas: `login.html` (+ `login.js`), `index.html`, `avaliacoes.html`. Continua sem frameworks ou bibliotecas.
- O `localStorage` guarda apenas a sessão, o tema e as avaliações antigas a importar. Veja `LEIAME.md`.
