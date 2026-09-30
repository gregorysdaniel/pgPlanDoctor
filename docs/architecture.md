# Arquitetura da aplicação

```text
EXPLAIN JSON → parser → PlanNode → heurísticas
                              ↓
                       tela de análise
                              ↓
                 D3 calcula a posição dos nós
```

O Vue Router controla qual página está visível, o histórico de navegação, a posição da rolagem e o título da aba. `App.vue` mantém somente a estrutura compartilhada: cabeçalho, área da rota atual e diálogo do plano original.

```text
App.vue
├── AppHeader.vue
│   └── ThemeSwitcher.vue
└── RouterView
    ├── PlanInputView.vue
    │   └── PlanInput.vue
    ├── PlanAnalysisView.vue
    │   └── PlanAnalysis.vue
    │       └── PlanTree.vue
    ├── LearningIndex.vue
    ├── LearningArticleView.vue
    │   └── LearningArticle.vue
    └── ProjectInfo.vue
```

As rotas ficam em `router/index.ts`:

- `#/`: entrada do plano;
- `#/analise`: visualização e interpretação do plano carregado;
- `#/aprender`: índice dos conteúdos;
- `#/aprender/:slug`: conteúdo selecionado;
- `#/sobre`: informações do projeto e feedback.

O histórico por hash permite abrir e atualizar essas URLs sem exigir que o servidor seja configurado para responder a todas as rotas. Os componentes usam `RouterLink` ou a API do Vue Router e não manipulam `location`, `history` ou o hash diretamente.

## Estado da sessão

`composables/usePlanSession.ts` mantém o JSON informado, o plano convertido e a mensagem de erro enquanto a aplicação está aberta. Isso permite navegar entre entrada e análise sem colocar esses dados na URL e sem atribuir ao `App.vue` a responsabilidade pelo parser.

`PlanInputView.vue` converte o JSON e abre a rota de análise somente depois de obter um `PlanNode` válido. A rota `#/analise` também possui uma guarda: quando nenhum plano foi carregado na sessão, o acesso direto volta para a entrada.

O tema fica em `composables/useTheme.ts`. A preferência aceita `light`, `dark` e `system`, é persistida no navegador e não pertence ao estado do plano.

`composables/useRecentPlans.ts` mantém no `localStorage` os dez planos analisados mais recentemente. O JSON original e os metadados usados na lista ficam somente no navegador. Analisar novamente o mesmo JSON atualiza sua data e sua posição, sem criar uma duplicata.

`data/planData.ts` cataloga os exemplos e mantém seus JSONs separados por cenário. Ao carregar um deles, a entrada percorre o mesmo parser usado para um plano fornecido pelo usuário. O D3 não interpreta a saída do PostgreSQL: ele recebe uma árvore pronta e calcula somente as posições dos nós.

## Fluxo do plano

`PlanTree.vue` usa o D3 para distribuir verticalmente os nós e inverte a profundidade na coordenada horizontal. Assim, folhas aparecem à esquerda e o resultado fica à direita.

As setas representam o fluxo dos filhos para os pais. O rótulo de cada ligação informa as linhas produzidas pelo filho considerando seus loops.

Os nós usam superfície neutra. A barra inferior compara o tempo acumulado (`tempo × loops`) com o maior tempo presente no plano. `PlanAnalysis.vue` entrega separadamente os identificadores dos nós marcados pelas heurísticas, mantendo as regras fora do SVG.

Quando um nó é selecionado, `PlanTree.vue` o envia para `PlanAnalysis.vue`. O Vue atualiza o inspetor sem recalcular o parser. O plano original pode ser consultado em um diálogo sem perder a análise.

## Heurísticas

As seis regras do MVP ficam em `domain/heuristics.ts` e percorrem a árvore recursivamente. Cada resultado mantém uma referência ao nó que produziu o sinal.

Uma regra não afirma que determinada alteração resolverá o problema. O conteúdo é dividido em evidência, interpretação, próximo passo e forma de validação. Termos técnicos possuem explicação curta e link para a documentação oficial.

## Conteúdos

`content/learningContent.ts` concentra o texto e as referências dos materiais introdutórios. `LearningIndex.vue` apresenta o índice, enquanto `LearningArticle.vue` é a estrutura reutilizada por cada conteúdo. O `slug` da URL identifica o artigo; valores inexistentes voltam ao índice.

## Informações e feedback

`ProjectInfo.vue` documenta o propósito do PlanoClaro e a validação das heurísticas. Os scripts, planos e medições continuam na documentação própria do benchmark.

O feedback é coletado em um Google Forms externo configurado por `VITE_FEEDBACK_FORM_URL`. A aplicação não recebe nem armazena as respostas. A documentação completa do benchmark é acessada por `VITE_BENCHMARK_GITHUB_URL`.

## Limites atuais

- não existe conexão direta com PostgreSQL;
- não existe backend ou sincronização do histórico entre navegadores e dispositivos;
- a análise carregada existe somente durante a sessão; apenas os dez planos recentes ficam no armazenamento local;
- os links do Google Forms e do benchmark são configurações obrigatórias do ambiente;
- o grafo usa rolagem quando excede a área; pan e zoom ainda podem ser adicionados;
- apenas o formato JSON possui parser.

Um backend só será adicionado quando houver um requisito que não possa ser atendido diretamente no navegador.
