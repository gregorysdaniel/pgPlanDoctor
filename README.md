# Árvore de plano de execução

Aplicação frontend para carregar e visualizar uma árvore de plano de execução do PostgreSQL.

## Objetivo

Receber uma saída de `EXPLAIN (ANALYZE, FORMAT JSON)` e renderizar a árvore correspondente no navegador. A interface permite selecionar os nós, mostra o fluxo de linhas entre eles, colore-os conforme o tempo acumulado e apresenta dicas produzidas por heurísticas.

Ainda não fazem parte desta etapa:

- conjunto completo de heurísticas;
- conexão com PostgreSQL;
- backend;
- persistência.

## Tecnologias

| Tecnologia | Uso no projeto |
|---|---|
| Vue 3 | Componentes e atualização do nó selecionado |
| TypeScript | Definição e validação do modelo `PlanNode` |
| D3 Hierarchy | Cálculo das posições dos nós e ligações |
| Element Plus | Cards, etiqueta e tabela de detalhes |
| Vite | Ambiente de desenvolvimento e build |

## Arquivos principais

```text
src/
├── App.vue                    # tela principal
├── components/PlanTree.vue   # cálculo D3 e SVG da árvore
├── data/explainAnalyzeExample.json # plano JSON usado como exemplo
├── data/planData.ts          # exemplo convertido pelo parser
├── domain/heuristics.ts      # regras que produzem dicas
├── domain/plan.ts            # tipos TypeScript
├── domain/planParser.ts      # validação e conversão do EXPLAIN JSON
└── styles.css                # aparência da interface
```

Comece a leitura por `App.vue`. Depois veja `PlanTree.vue` e `planData.ts`.

Antes de alterar a apresentação, consulte as [diretrizes de UI/UX](docs/ui-ux-guidelines.md).

## Executar

Requisito: Node.js 22.12 ou superior. Recomenda-se Node.js 24 LTS.

```bash
npm install
npm run dev
```

Para validar o build:

```bash
npm run build
```

## Critérios de validação

1. A árvore aparece corretamente.
2. O JSON de `EXPLAIN ANALYZE` pode ser colado e carregado acima da árvore.
3. Clicar em um nó atualiza o painel de detalhes.
4. Os componentes do Element Plus funcionam.
5. A escala de verde a vermelho evidencia os nós com maior tempo acumulado.
6. O D3 posiciona uma árvore com diferentes níveis.
7. O TypeScript rejeita dados incompatíveis com `PlanNode`.
8. As ligações indicam a direção do fluxo e a quantidade de linhas produzidas.
9. As heurísticas exibem evidência, interpretação, sugestão, validação e documentação.
10. O build funciona sem backend.

## Próximas etapas

Após validar a entrada de planos reais, poderão ser avaliadas novas heurísticas e a necessidade de backend.
