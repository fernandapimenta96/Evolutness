**Etapa 1 — Auditoria**
- Inspecione todos os arquivos HTML e JavaScript relevantes.
- Localize todas as ocorrências de `innerHTML`, `outerHTML`, `insertAdjacentHTML` e outros pontos de inserção dinâmica de conteúdo.
- Para cada ocorrência, explique se existe risco de XSS, considerando a origem e o tratamento dos dados utilizados.
- Não classifique todo uso de `innerHTML` como vulnerável automaticamente.
- Identifique scripts e estilos inline, bibliotecas externas e recursos que precisariam ser autorizados pela CSP.

**Etapa 2 — Plano de correção**
- Proponha alterações mínimas e seguras, preservando o funcionamento e o layout atual do Evolutness.
- Prefira `textContent` e APIs de criação de elementos DOM quando apropriado.
- Se houver necessidade real de renderizar HTML não confiável, avalie uma estratégia de sanitização confiável.
- Proponha uma CSP restritiva e compatível com os recursos efetivamente utilizados.
- Considere a diferença entre configuração por cabeçalho HTTP e por meta tag HTML.

**Etapa 3 — Validação**
- Informe como testar as correções contra XSS e como verificar violações de CSP.
- Identifique possíveis incompatibilidades antes de remover scripts ou estilos inline.
- Não desative proteções de segurança para fazer a aplicação funcionar.
- Não altere arquivos nem faça commits antes de apresentar o diagnóstico e o plano de implementação.

Apresente os resultados separados em: vulnerabilidades confirmadas, riscos potenciais, melhorias recomendadas e plano de testes.