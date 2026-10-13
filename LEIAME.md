# Meu Acompanhamento Corporal

Registro de pesagens e medidas corporais com cálculo de IMC, relações cintura/quadril e cintura/altura, massa de gordura, histórico e gráficos de evolução.
HTML, CSS e JavaScript puros, sem frameworks. Login e dados no **Supabase** (plano gratuito).

## Arquivos

| Arquivo | Função |
|---|---|
| `login.html` / `login.js` | Entrar e criar conta |
| `index.html` / `script.js` | Nova avaliação e relatório |
| `avaliacoes.html` | Histórico, evolução e comparação |
| `api.js` | Acesso ao Supabase (`fetch`) |
| `config.js` | URL e chave pública do projeto Supabase (versionado de propósito, veja abaixo) |
| `config.example.js` | Modelo do `config.js`, com valores de exemplo |
| `supabase.sql` | Tabela `avaliacoes` e regras de segurança |
| `style.css` | Estilos (inclui tema escuro) |

## Configuração (uma vez)

1. Crie um projeto em https://supabase.com.
2. Em **SQL Editor**, execute o conteúdo de `supabase.sql`.
3. Copie `config.example.js` para `config.js` (se ainda não existir) e preencha com a *Project URL* e a chave *anon / publishable* de **Project Settings > API**. Nunca use a chave `service_role`.
4. Em **Authentication > Sign In / Providers > Email**, defina se exige confirmação de e-mail (desative para testar rápido).

## Executar

O login não funciona abrindo o arquivo direto no navegador. Use um servidor local:

    python3 -m http.server 8000

e acesse http://localhost:8000/login.html. É necessário ter internet.

## Publicar

Basta hospedar a pasta como site estático (GitHub Pages, Cloudflare Pages, Netlify). Depois informe o endereço em Supabase > **Authentication > URL Configuration > Site URL**.

## Observações

- Cada pessoa vê apenas as próprias avaliações (Row Level Security).
- O `localStorage` guarda somente a sessão, o tema e avaliações antigas para importar no primeiro acesso.
- O `config.js` **não está no `.gitignore` e continua versionado**: o site estático precisa dele publicado. Ele só contém a URL e a chave pública (*anon / publishable*), protegidas pelo Row Level Security. Nunca coloque nele segredos como a `service_role`.
- **Segurança:** cada página define uma Content Security Policy por `<meta>` (sem scripts ou estilos inline; só a própria origem e o Supabase). Se trocar a URL em `config.js`, atualize o `connect-src` nas três páginas. O `<meta>` não aceita `frame-ancestors`: se a hospedagem permitir cabeçalhos HTTP (Netlify `_headers`, Cloudflare Pages), adicione também `Content-Security-Policy: frame-ancestors 'none'` e `X-Content-Type-Options: nosniff`.
- Projetos inativos do plano gratuito são pausados após cerca de 7 dias; reative no painel do Supabase.
- Este relatório é para acompanhamento pessoal e não substitui avaliação médica ou nutricional.
