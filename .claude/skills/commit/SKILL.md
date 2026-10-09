---
name: commit
description: >
  ALWAYS invoke this skill before running any git commit, regardless of
  how the user phrased the request. Triggers on: "commit", "commita",
  "faz o commit", "salva no git", "finaliza", "save changes", or any
  implicit commit intent. Do NOT run git commit directly — ALWAYS use
  this skill first. Analyzes staged and unstaged changes, generates a
  conventional commit message, and executes the commit automatically.
---

# Conventional Commit

## Objetivo

Analisar as alterações recentes no código, construir uma mensagem de commit seguindo a especificação [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) e executar o commit automaticamente. Se o ambiente não tiver git disponível, retornar a mensagem pronta para uso manual.

> **Idioma:** Toda comunicação, descrição de ações, confirmações e mensagens ao usuário devem ser em **Português do Brasil**. As mensagens de commit seguem o padrão Conventional Commits em inglês (imperativo), mas tudo que for dito ao usuário deve ser em PT-BR.

---

## Workflow

### Passo 1 — Verificar ambiente git

Informe ao usuário: _"Verificando o ambiente git..."_

```xml
<check>
  <cmd>git status</cmd>
  <goal>Confirmar se o diretório é um repositório git válido</goal>
  <on-failure>Pular para a seção "Sem Git Disponível" e retornar apenas a mensagem</on-failure>
</check>
```

### Passo 2 — Inspecionar alterações

Informe ao usuário: _"Analisando as alterações do projeto..."_

```xml
<inspection>
  <step order="1">
    <cmd>git diff --cached --stat</cmd>
    <goal>Ver arquivos já staged e volume de mudanças</goal>
  </step>
  <step order="2">
    <cmd>git diff --cached</cmd>
    <goal>Ler o conteúdo completo das mudanças staged</goal>
  </step>
  <step order="3">
    <cmd>git diff --stat</cmd>
    <goal>Ver arquivos modificados não staged</goal>
  </step>
  <step order="4">
    <cmd>git log --oneline -5</cmd>
    <goal>Entender o padrão de commits recentes do projeto</goal>
  </step>
</inspection>
```

> Se não houver nada staged, informe: _"Nenhuma alteração staged encontrada. Deseja que eu rode `git add -A` para incluir todas as mudanças?"_ — aguarde confirmação antes de prosseguir.

### Passo 3 — Analisar o contexto

Informe ao usuário: _"Identificando o contexto das mudanças..."_

```xml
<analysis>
  <what-changed>Quais arquivos foram modificados e qual o impacto</what-changed>
  <why>Qual problema foi resolvido ou funcionalidade adicionada</why>
  <scope>Qual módulo, feature ou área do sistema foi afetado</scope>
  <breaking>Existe alguma quebra de compatibilidade?</breaking>
</analysis>
```

### Passo 4 — Construir a mensagem de commit

Informe ao usuário: _"Gerando mensagem de commit convencional..."_

Use a estrutura abaixo para montar a mensagem:

```xml
<commit-message>
  <type>feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert</type>
  <scope>módulo ou área afetada (opcional, mas recomendado)</scope>
  <breaking>! após o type se for breaking change (ex: feat!)</breaking>
  <description>Resumo imperativo curto em inglês, máximo 72 caracteres</description>
  <body>
    Explicação detalhada do que foi feito e por quê.
    Use quando a mudança precisar de contexto adicional.
    (opcional)
  </body>
  <footer>
    BREAKING CHANGE: descrição do que quebrou
    Closes #123
    (opcional)
  </footer>
</commit-message>
```

### Tipos permitidos

| Tipo | Quando usar |
|---|---|
| `feat` | Nova funcionalidade para o usuário |
| `fix` | Correção de bug |
| `docs` | Apenas documentação |
| `style` | Formatação, espaços, ponto e vírgula — sem mudança de lógica |
| `refactor` | Refatoração sem nova feature nem bug fix |
| `perf` | Melhoria de performance |
| `test` | Adição ou correção de testes |
| `build` | Mudanças no sistema de build ou dependências |
| `ci` | Mudanças em arquivos de CI/CD |
| `chore` | Tarefas de manutenção que não afetam código de produção |
| `revert` | Reverte um commit anterior |

### Exemplos de referência

```xml
<examples>
  <example>feat(auth): add JWT refresh token support</example>
  <example>fix(api): handle null response on user endpoint</example>
  <example>docs: update README with environment variables</example>
  <example>refactor(db): extract query builder to separate module</example>
  <example>perf(cache): replace in-memory store with Redis</example>
  <example>chore: update dependencies to latest versions</example>
  <example>feat!: remove deprecated v1 endpoints (BREAKING CHANGE: clients must migrate to v2)</example>
  <example>fix(ui): correct alignment on mobile viewport

  The button was overflowing on screens smaller than 375px.
  Added responsive breakpoint at 360px.

  Closes #42</example>
</examples>
```

### Passo 5 — Validar antes de executar

```xml
<validation>
  <rule field="type">Obrigatório. Deve ser um dos tipos listados acima.</rule>
  <rule field="scope">Opcional. Use snake_case ou kebab-case. Ex: auth, api, user-profile.</rule>
  <rule field="description">
    Obrigatório. Use modo imperativo em inglês: "add", "fix", "remove" — não "added", "fixed".
    Máximo 72 caracteres. Não termine com ponto.
  </rule>
  <rule field="body">Opcional. Separe do subject com uma linha em branco.</rule>
  <rule field="footer">
    Use para BREAKING CHANGE ou referências de issues.
    Separe do body com uma linha em branco.
  </rule>
</validation>
```

### Passo 6 — Executar o commit

Informe ao usuário: _"Realizando o commit..."_

Se o ambiente tiver git disponível e houver arquivos staged:

```xml
<execution>
  <simple>
    <cmd>git commit -m "type(scope): description"</cmd>
    <when>Sem body nem footer</when>
  </simple>
  <multiline>
    <cmd>git commit -m "type(scope): description" -m "body detalhado aqui" -m "BREAKING CHANGE: detalhes"</cmd>
    <when>Com body e/ou footer</when>
  </multiline>
  <note>
    Execute sem pedir confirmação.
    Após o commit, exiba em PT-BR: "✅ Commit realizado com sucesso!"
    seguido do hash gerado com git log --oneline -1.
  </note>
</execution>
```

---

## Sem Git Disponível

Se `git` não estiver instalado ou o diretório não for um repositório git, retorne:

```
✅ Mensagem de commit gerada:

  type(scope): description

  [body se aplicável]

  [footer se aplicável]

📋 Copie e use no seu terminal:
  git commit -m "type(scope): description"
```

---

## Argumentos opcionais

Se o usuário passar contexto extra via `$ARGUMENTS`, use como informação adicional para construir a mensagem. Exemplos:

- `/commit adicionei login com Google` → usa como contexto do que foi feito
- `/commit fix no carrinho` → direciona o tipo e scope
- `/commit` sem argumentos → analisa as mudanças sozinho