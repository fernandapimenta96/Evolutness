# Meu Acompanhamento Corporal

Registro de pesagens e medidas corporais com cálculo de IMC, relações cintura/quadril e cintura/altura, massa de gordura, histórico e gráficos de evolução.
HTML, CSS e JavaScript puros, sem frameworks. Login e dados no **Supabase** (plano gratuito).

## Arquivos

| Arquivo | Função |
|---|---|
| `login.html` / `login.js` | Entrar, criar conta e recuperar senha |
| `index.html` / `script.js` | Nova avaliação e relatório |
| `avaliacoes.html` | Histórico, evolução e comparação |
| `api.js` | Acesso ao Supabase (`fetch`) |
| `config.js` | URL e chave pública do projeto Supabase (versionado de propósito, veja abaixo) |
| `config.example.js` | Modelo do `config.js`, com valores de exemplo |
| `supabase.sql` | Tabelas `avaliacoes` e `perfis` (nome, sexo e data de nascimento) e regras de segurança |
| `style.css` | Estilos (inclui tema escuro) |
| `tema-inicial.js` | Aplica o tema salvo antes de desenhar a página |
| `test/` | Testes automatizados dos cálculos e da validação (`node:test`) |
| `package.json` / `package-lock.json` | Scripts de teste e lint (só ferramentas de desenvolvimento) |
| `eslint.config.js` | Configuração do ESLint |
| `.github/workflows/ci.yml` | Verificação automática (lint e testes) no GitHub Actions |
| `assets/` | Imagens e ícones (favicon, ícone do iOS e a imagem original `icone.png`) |

## Configuração (uma vez)

1. Crie um projeto em https://supabase.com.
2. Em **SQL Editor**, execute o conteúdo de `supabase.sql`. Se você já tinha executado a versão anterior (só com `avaliacoes`), execute apenas a *Parte 2* (tabela `perfis`), no final do arquivo.
3. Copie `config.example.js` para `config.js` (se ainda não existir) e preencha com a *Project URL* e a chave *anon / publishable* de **Project Settings > API**. Nunca use a chave `service_role`.
4. Em **Authentication > URL Configuration > Redirect URLs**, adicione o endereço de `login.html` (ex.: `http://localhost:8000/login.html` e o do site publicado). Sem isso o link de recuperação de senha não volta para a página.
5. Em **Authentication > Sign In / Providers > Email**, defina se exige confirmação de e-mail (desative para testar rápido).

## Executar

O login não funciona abrindo o arquivo direto no navegador. Use um servidor local:

    python3 -m http.server 8000

e acesse http://localhost:8000/login.html. É necessário ter internet.

## Testes e qualidade

O site continua sem build nem dependências em produção. O `package.json` serve apenas para testes e lint.

Requisitos: Node.js `^20.19`, `^22.13` ou `24+` (exigência do ESLint 10) e npm.

    npm ci           # instala as ferramentas de desenvolvimento (uma vez)
    npm test         # testes automatizados (node:test)
    npm run lint     # ESLint
    npm run check    # lint + testes

Os testes carregam o `script.js` direto no Node e cobrem IMC, relação cintura/quadril, cintura/altura, massa de gordura e massa livre, as faixas de classificação nos limites (incluindo as faixas etárias e o cálculo da idade) e a validação do formulário. Não cobrem a tela (renderização, gráficos), `api.js`, `login.js` nem o Supabase. O IMC é classificado já arredondado a 2 casas, como é exibido (ex.: 64 kg e 1,60 m dá 25,00 e conta como sobrepeso).

O GitHub Actions roda `npm ci`, `npm run lint` e `npm test` em todo push para `main` e em pull requests para `main`.

## Publicar

Basta hospedar a pasta como site estático (GitHub Pages, Cloudflare Pages, Netlify). Depois informe o endereço em Supabase > **Authentication > URL Configuration > Site URL**.

## Observações

- **Perfil:** o card “Seu perfil” pede nome, sexo e data de nascimento. Os cálculos abrangem apenas mulheres de 20 a 79 anos: sexo masculino ou idade fora dessa faixa gera mensagem de erro, o perfil não é salvo e “Calcular avaliação” fica bloqueado até haver um perfil válido.
- **Faixa etária:** a classificação de gordura corporal e de músculo esquelético usa referências para mulheres de 20–39, 40–59 e 60–79 anos. A idade vem da data de nascimento do perfil (card “Seu perfil” em `index.html`) e é calculada na data de cada avaliação. Sem data de nascimento, ou fora de 20 a 79 anos, o cartão mostra “Sem referência”.
- Cada pessoa vê apenas as próprias avaliações (Row Level Security).
- O `localStorage` guarda somente a sessão, o tema e avaliações antigas para importar no primeiro acesso.
- O `config.js` **não está no `.gitignore` e continua versionado**: o site estático precisa dele publicado. Ele só contém a URL e a chave pública (*anon / publishable*), protegidas pelo Row Level Security. Nunca coloque nele segredos como a `service_role`.
- **Segurança:** cada página define uma Content Security Policy por `<meta>` (sem scripts ou estilos inline; só a própria origem e o Supabase). Se trocar a URL em `config.js`, atualize o `connect-src` nas três páginas. O `<meta>` não aceita `frame-ancestors`: se a hospedagem permitir cabeçalhos HTTP (Netlify `_headers`, Cloudflare Pages), adicione também `Content-Security-Policy: frame-ancestors 'none'` e `X-Content-Type-Options: nosniff`.
- Projetos inativos do plano gratuito são pausados após cerca de 7 dias; reative no painel do Supabase.
- Este relatório é para acompanhamento pessoal e não substitui avaliação médica ou nutricional.
