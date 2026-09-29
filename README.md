# PlanoClaro

Aplicação frontend didática para carregar e visualizar um plano de execução do PostgreSQL.

## Objetivo

Receber uma saída de `EXPLAIN (ANALYZE, FORMAT JSON)` e renderizar seu fluxo no navegador. A experiência separa entrada e análise, permite selecionar operadores, apresenta sinais produzidos pelas seis heurísticas do MVP e oferece uma introdução à interpretação de planos.

Ainda não fazem parte desta etapa:

- conexão direta com PostgreSQL;
- backend;
- persistência.

## Tecnologias

| Tecnologia | Uso no projeto |
|---|---|
| Vue 3 | Componentes e estado da interface |
| Vue Router | Rotas, histórico de navegação e URLs diretas |
| TypeScript | Modelo, parser e validação |
| D3 Hierarchy | Posicionamento dos nós e ligações |
| Element Plus | Botões, diálogos, menus, collapses e popovers |
| Phosphor Icons | Ícones da interface e das explicações didáticas |
| Poppins e JetBrains Mono | Tipografia da interface e dos dados técnicos |
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
├── components/ProjectInfo.vue   # projeto, validações e feedback
├── components/ThemeSwitcher.vue # temas claro, escuro e sistema
├── components/PlanInput.vue     # entrada do EXPLAIN JSON
├── components/PlanAnalysis.vue  # resumo, grafo e inspetor
├── components/PlanTree.vue      # layout D3 e SVG horizontal
├── composables/usePlanSession.ts # estado temporário do plano entre as rotas
├── composables/useTheme.ts      # preferência e persistência do tema
├── content/learningContent.ts   # textos e referências da área Aprender
├── data/explainAnalyzeExample.json
├── data/planData.ts
├── domain/heuristics.ts         # seis regras do MVP
├── domain/plan.ts               # tipos TypeScript
├── domain/planParser.ts         # conversão recursiva do JSON
└── styles.css                   # tokens e aparência dos dois temas
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
3. O fluxo segue horizontalmente das folhas ao resultado.
4. Selecionar um nó atualiza o inspetor.
5. Pontos de atenção aparecem no nó correspondente.
6. Temas claro, escuro e sistema preservam o plano selecionado.
7. O TypeScript rejeita dados incompatíveis com `PlanNode`.
8. As ligações mostram a direção do fluxo e as linhas produzidas.
9. As heurísticas exibem evidência, interpretação, próximo passo e validação.
10. A página do projeto apresenta como as seis heurísticas foram avaliadas.
11. A área Aprender apresenta os quatro conteúdos e pode ser acessada pelo contexto do analisador.
12. Voltar, avançar e abrir diretamente uma URL preservam a página esperada.
13. O build funciona sem backend.
