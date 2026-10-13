/* Modelo de configuração do Supabase.
 * Copie este arquivo para "config.js" e preencha com os dados de Project Settings > API.
 * A chave "anon/publishable" é pública por natureza: quem protege os dados é o
 * Row Level Security do banco (veja supabase.sql). NUNCA use aqui a chave "service_role".
 * Se mudar a URL, atualize também o "connect-src" da meta Content-Security-Policy
 * em index.html, avaliacoes.html e login.html. */
window.EVOLUTNESS_CONFIG = {
  supabaseUrl: 'https://SEU-PROJETO.supabase.co',
  supabaseKey: 'SUA_CHAVE_ANON_OU_PUBLISHABLE',
};
