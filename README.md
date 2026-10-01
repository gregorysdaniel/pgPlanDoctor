# pgPlanDoctor

Aplicação frontend didática para carregar e visualizar um plano de execução do PostgreSQL.

## Objetivo

Receber uma saída de `EXPLAIN (ANALYZE, FORMAT JSON)` e renderizar seu fluxo no navegador. A experiência separa entrada e análise, permite selecionar operadores, apresenta sinais produzidos pelas heurísticas avaliadas e oferece conteúdos introdutórios e um glossário para apoiar a interpretação de planos.

Ainda não fazem parte desta etapa:

- conexão direta com PostgreSQL;
- backend ou sincronização entre dispositivos.

Os dez planos analisados mais recentemente são mantidos no `localStorage` do navegador. A interface e os conteúdos didáticos estão disponíveis em português e inglês.

## Tecnologias

| Tecnologia | Uso no projeto |
|---|---|
| Vue 3 | Componentes e estado da interface |
| Vue Router | Rotas, histórico de navegação e URLs diretas |
| TypeScript | Modelo, parser e validação |
| Intl API | Formatação regional de números e datas |
| D3 Hierarchy | Posicionamento dos nós e ligações |
| Element Plus | Botões, diálogos, menus, collapses e popovers |
| Phosphor Icons | Ícones da interface e das explicações didáticas |
| Fonte de sistema, Poppins e JetBrains Mono | Interface, marca e dados técnicos, respectivamente |
| Vite | Ambiente de desenvolvimento e build |

## Arquivos principais

```text
src/
├── App.vue                       # estrutura compartilhada e plano original
├── router/index.ts               # rotas, guardas, rolagem e títulos
├── views/PlanInputView.vue       # conversão da entrada e abertura da análise
├── views/PlanAnalysisView.vue    # página da análise carregada
├── views/LearningArticleView.vue # resolução do conteúdo pela URL
├── components/AppHeader.vue     # marca e navegação
├── components/LearningIndex.vue # índice dos conteúdos didáticos
├── components/LearningArticle.vue # página reutilizável de artigo
├── components/Glossary.vue       # busca e categorias do glossário
├── components/ProjectInfo.vue   # projeto, validações e feedback
├── components/LanguageSwitcher.vue # idiomas português e inglês
├── components/PlanInput.vue     # entrada do EXPLAIN JSON
├── components/PlanAnalysis.vue  # contexto, grafo e pontos de atenção
├── components/PlanTree.vue      # árvore SVG horizontal, expansão e zoom
├── composables/useRecentPlans.ts # histórico local dos planos analisados
├── composables/usePlanSession.ts # estado temporário do plano entre as rotas
├── content/learningContent.ts   # textos e referências da área Aprender
├── content/glossaryContent.ts   # termos do glossário em português e inglês
├── data/explainAnalyzeExample.json # filtro seletivo, ordenação e limite
├── data/rowEstimateExample.json # estimativa de linhas divergente
├── data/repeatedWorkExample.json # trabalho interno repetido
├── data/planData.ts             # catálogo dos exemplos disponíveis
├── domain/heuristics.ts         # regras heurísticas do MVP
├── domain/plan.ts               # tipos TypeScript
├── domain/planParser.ts         # conversão recursiva do JSON
├── i18n/index.ts                # estado do idioma e mensagens da interface
└── styles.css                   # tokens e aparência do tema escuro suave
```

Consulte também a [arquitetura](docs/architecture.md) e as [diretrizes de UI/UX](docs/ui-ux-guidelines.md).

## Executar

Requisito: Node.js 22.12 ou superior. Recomenda-se Node.js 24 LTS.

```bash
npm install
npm run dev
```

Copie `.env.example` para `.env` e configure os endereços públicos do formulário e do benchmark:

```text
VITE_FEEDBACK_FORM_URL=https://docs.google.com/forms/d/e/.../viewform
VITE_BENCHMARK_GITHUB_URL=https://github.com/usuario/repositorio/tree/main/benchmark
```

Para validar o build:

```bash
npm run build
```

## Critérios de validação

1. A entrada e a análise aparecem como momentos separados.
2. O JSON de `EXPLAIN ANALYZE` pode ser colado e analisado.
3. O fluxo segue da esquerda para a direita, das folhas ao resultado.
4. Selecionar um nó o destaca e, quando aplicável, abre o ponto de atenção correspondente.
5. Pontos de atenção aparecem no nó correspondente.
6. O tema escuro suave mantém contraste e legibilidade em todas as páginas.
7. O TypeScript rejeita dados incompatíveis com `PlanNode`.
8. As ligações mostram a direção do fluxo sem repetir métricas já exibidas nos nós.
9. As heurísticas exibem evidência, interpretação, próximo passo e validação.
10. A página do projeto apresenta como as heurísticas foram avaliadas.
11. A área Aprender apresenta os quatro conteúdos e pode ser acessada pelo contexto do analisador.
12. Voltar, avançar e abrir diretamente uma URL preservam a página esperada.
13. O build funciona sem backend.
14. Planos analisados recentemente podem ser reabertos após recarregar a aplicação.
15. Cada cenário do menu `Carregar exemplo` preenche o editor e pode ser analisado normalmente.
16. Cada nó apresenta um resumo compacto e pode ser expandido no próprio grafo.
17. O grafo permite zoom, pan, enquadramento completo, ajuste para leitura e retorno a 100%.
18. Alterar o zoom preserva o mesmo conteúdo nos nós, sem trocar ou ocultar textos em escalas menores.
19. Um nó virtual e não interativo identifica o resultado final sem alterar o plano analisado.
20. A barra e a porcentagem de tempo usam uma escala sequencial neutro–azul; laranja continua reservado às heurísticas.
21. Execução, resultado, estrutura e quantidade de pontos de atenção aparecem como contexto discreto junto à legenda inferior.
22. O painel de pontos de atenção fica à esquerda, separa lista e detalhe e pode ser recolhido para ampliar o grafo.
23. Cada resumo mostra uma métrica observável; selecionar um ponto de atenção abre seu detalhe e centraliza o nó relacionado.
24. Português e inglês atualizam interface, análise, heurísticas, conteúdos e formatos regionais sem recarregar a página.
25. O idioma escolhido persiste no navegador e atualiza `lang`, título e descrição do documento.
26. O glossário permite buscar termos em português e inglês e pode ser aberto pelo contexto das heurísticas.
