# Meu Acompanhamento Corporal

Página em HTML/CSS/JavaScript puro. Login e banco de dados no **Supabase** (plano gratuito).

## 1. Configurar o banco (uma vez)

1. Crie uma conta em https://supabase.com e um projeto novo.
2. Em **SQL Editor**, cole o conteúdo de `supabase.sql` e clique em **Run**.
3. Em **Project Settings > API**, copie a *Project URL* e a chave *anon / publishable*.
4. Cole os dois valores em `config.js`. (Nunca use a chave `service_role`.)
5. Em **Authentication > Sign In / Providers > Email**, escolha se quer exigir confirmação de e-mail. Para testar rápido, desative "Confirm email".

## 2. Abrir no computador

O navegador bloqueia o login quando a página é aberta direto do arquivo. Use um servidor local simples:

    python3 -m http.server 8000

e acesse http://localhost:8000/login.html

## 3. Publicar de graça

Envie a pasta para **GitHub Pages**, **Cloudflare Pages** ou **Netlify** (são só arquivos estáticos).
Depois, em Supabase > **Authentication > URL Configuration**, informe o endereço publicado em *Site URL*
(necessário para os links de confirmação de e-mail).

## Observações

- Cada pessoa só enxerga as próprias avaliações (Row Level Security).
- A página agora precisa de internet. Só o tema escuro fica salvo no navegador.
- Avaliações antigas do `localStorage` podem ser importadas no primeiro acesso.
- Plano gratuito do Supabase pausa projetos inativos por cerca de 7 dias; basta reativar no painel.
