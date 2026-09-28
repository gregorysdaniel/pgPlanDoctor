# Funcionamento da visualização

```text
planData.ts
      ↓
   PlanNode
      ↓
D3 calcula x/y
      ↓
Vue desenha o SVG
      ↓
Element Plus organiza a interface
```

Os dados do plano ficam em `planData.ts`. O D3 não interpreta a saída do PostgreSQL: ele recebe uma árvore e calcula as posições dos nós.

Quando um nó é clicado, `PlanTree.vue` envia o nó para `App.vue`. O Vue atualiza automaticamente o painel de detalhes. A saída textual de `EXPLAIN ANALYZE` permanece ao lado da árvore para permitir a comparação entre as duas representações.

A cor de cada nó é calculada a partir de `tempo × loops`. O menor valor se aproxima do verde e o maior valor se aproxima do vermelho. A normalização usa o maior tempo acumulado presente na árvore carregada.

As setas representam o fluxo dos dados, dos nós filhos para os nós pais. O texto sobre cada ligação informa quantas linhas o filho produziu considerando todos os loops. No plano atual, o `Seq Scan` entrega 87 linhas ao `Sort`, que entrega 10 ao `Limit`.

## Dicas

As regras ficam em `domain/heuristics.ts`. A regra atual identifica um `Seq Scan` que tenha descartado pelo menos 1.000 linhas e 80% do que foi lido. No plano atual, a tabela `orders` tem 5.000 linhas lidas e 4.913 descartadas pelo filtro `customer_id = 42`.

A dica não afirma que um índice resolverá o problema. Ela é dividida em evidência, interpretação, sugestão e forma de validação. Termos técnicos possuem uma explicação curta por hover e um link para a documentação oficial.

A entrada do PostgreSQL poderá ser adicionada depois sem alterar o fluxo de renderização:

```text
EXPLAIN JSON → parser → PlanNode → árvore
```

Um backend só será adicionado quando houver um requisito que não possa ser atendido diretamente no navegador.
