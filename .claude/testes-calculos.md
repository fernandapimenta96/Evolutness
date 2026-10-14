**Requisitos**
- Identifique os cálculos e as validações realmente existentes no código.
- Avalie se as funções de cálculo podem ser isoladas da manipulação do DOM para facilitar os testes, preservando o funcionamento atual da aplicação.
- Implemente testes automatizados usando o executor nativo node:test, se for compatível com a estrutura existente.
- Cubra os cálculos com casos de valores válidos, entradas inválidas e situações-limite relevantes. Use resultados esperados independentes da implementação testada.
- Crie ou atualize o package.json, com scripts para executar os testes, o lint e uma verificação conjunta.
- Configure o ESLint para a versão de JavaScript e o tipo de módulos efetivamente utilizados pelo projeto, evitando alterações desnecessárias na arquitetura.
- Crie um workflow do GitHub Actions para executar lint e testes em pushes para main e em pull requests direcionados a main.
- Garanta que as dependências e o package-lock.json estejam consistentes para permitir a execução reproduzível com npm ci.
- Atualize o README com os requisitos e os comandos necessários para executar as verificações localmente.
- Não introduza frameworks ou dependências desnecessárias, não remova funcionalidades existentes e não altere as fórmulas sem justificativa.

**Critérios de conclusão**
- Os testes passam localmente.
- O lint passa sem erros.
- O workflow está configurado corretamente.
- Os comandos estão documentados.
- A interface e os cálculos atuais continuam funcionando.

Ao final, apresente um resumo dos arquivos criados ou modificados, dos testes implementados e de quaisquer limitações que ainda existam. Não declare uma verificação como aprovada sem executá-la e confirmar seu resultado.