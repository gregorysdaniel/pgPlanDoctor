# Arquitetura da aplicação

```text
EXPLAIN JSON → parser → PlanNode → heurísticas
                              ↓
                       tela de análise
                              ↓
                 D3 calcula a posição dos nós
```

`App.vue` coordena três páginas da experiência: entrada, análise e informações do projeto. Ele mantém o texto original, solicita a conversão ao parser e entrega somente um `PlanNode` válido para a visualização.

```text
App.vue
├── AppHeader.vue
│   └── ThemeSwitcher.vue
├── PlanInput.vue
├── PlanAnalysis.vue
│   └── PlanTree.vue
└── ProjectInfo.vue
```

O tema fica em `composables/useTheme.ts`. A preferência aceita `light`, `dark` e `system`, é persistida no navegador e não pertence ao estado do plano.

O exemplo de `planData.ts` percorre o mesmo parser usado pela entrada. O D3 não interpreta a saída do PostgreSQL: ele recebe uma árvore pronta e calcula somente as posições dos nós.

## Fluxo do plano

`PlanTree.vue` usa o D3 para distribuir verticalmente os nós e inverte a profundidade na coordenada horizontal. Assim, folhas aparecem à esquerda e o resultado fica à direita.

As setas representam o fluxo dos filhos para os pais. O rótulo de cada ligação informa as linhas produzidas pelo filho considerando seus loops.

Os nós usam superfície neutra. A barra inferior compara o tempo acumulado (`tempo × loops`) com o maior tempo presente no plano. `PlanAnalysis.vue` entrega separadamente os identificadores dos nós marcados pelas heurísticas, mantendo as regras fora do SVG.

Quando um nó é selecionado, `PlanTree.vue` o envia para `PlanAnalysis.vue`. O Vue atualiza o inspetor sem recalcular o parser. O plano original pode ser consultado em um diálogo sem perder a análise.

## Heurísticas

As seis regras do MVP ficam em `domain/heuristics.ts` e percorrem a árvore recursivamente. Cada resultado mantém uma referência ao nó que produziu o sinal.

Uma regra não afirma que determinada alteração resolverá o problema. O conteúdo é dividido em evidência, interpretação, próximo passo e forma de validação. Termos técnicos possuem explicação curta e link para a documentação oficial.

## Informações e feedback

`ProjectInfo.vue` documenta o propósito do PlanoClaro e resume qual comparação antes/depois foi realizada para cada heurística. Os scripts, planos e medições continuam na documentação própria do benchmark.

O feedback é coletado em um Google Forms externo configurado por `VITE_FEEDBACK_FORM_URL`. A aplicação não recebe nem armazena as respostas. A documentação completa do benchmark é acessada por `VITE_BENCHMARK_GITHUB_URL`.

## Limites atuais

- não existe conexão direta com PostgreSQL;
- não existe backend ou persistência;
- os links do Google Forms e do benchmark são configurações obrigatórias do ambiente;
- o grafo usa rolagem quando excede a área; pan e zoom ainda podem ser adicionados;
- apenas o formato JSON possui parser.

Um backend só será adicionado quando houver um requisito que não possa ser atendido diretamente no navegador.
