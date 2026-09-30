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
│   └── LanguageSwitcher.vue
└── RouterView
    ├── PlanInputView.vue
    │   └── PlanInput.vue
    ├── PlanAnalysisView.vue
    │   └── PlanAnalysis.vue
    │       └── PlanTree.vue
    ├── LearningIndex.vue
    ├── Glossary.vue
    ├── LearningArticleView.vue
    │   └── LearningArticle.vue
    └── ProjectInfo.vue
```

As rotas ficam em `router/index.ts`:

- `#/`: entrada do plano;
- `#/analise`: visualização e interpretação do plano carregado;
- `#/aprender`: índice dos conteúdos;
- `#/aprender/glossario`: glossário pesquisável;
- `#/aprender/:slug`: conteúdo selecionado;
- `#/sobre`: informações do projeto e feedback.

O histórico por hash permite abrir e atualizar essas URLs sem exigir que o servidor seja configurado para responder a todas as rotas. Os componentes usam `RouterLink` ou a API do Vue Router e não manipulam `location`, `history` ou o hash diretamente.

## Estado da sessão

`composables/usePlanSession.ts` mantém o JSON informado, o plano convertido e a mensagem de erro enquanto a aplicação está aberta. Isso permite navegar entre entrada e análise sem colocar esses dados na URL e sem atribuir ao `App.vue` a responsabilidade pelo parser.

`PlanInputView.vue` converte o JSON e abre a rota de análise somente depois de obter um `PlanNode` válido. A rota `#/analise` também possui uma guarda: quando nenhum plano foi carregado na sessão, o acesso direto volta para a entrada.

O tema escuro suave é definido diretamente pelos tokens globais em `styles.css`. Não existe preferência de tema nem estado associado ao plano.

O idioma fica em `i18n/index.ts`. A aplicação aceita `pt-BR` e `en`, usa a preferência persistida ou o idioma do navegador e atualiza o atributo `lang`, os metadados e os formatos de número e data. As URLs e os slugs permanecem estáveis nos dois idiomas.

As regras e o parser produzem os mesmos dados independentemente do idioma. Textos de erro, descrições de operadores e explicações das heurísticas são resolvidos pelas mensagens de localização durante a apresentação; por isso, trocar o idioma atualiza uma análise já aberta sem processar novamente o JSON.

`composables/useRecentPlans.ts` mantém no `localStorage` os dez planos analisados mais recentemente. O JSON original e os metadados usados na lista ficam somente no navegador. Analisar novamente o mesmo JSON atualiza sua data e sua posição, sem criar uma duplicata.

`data/planData.ts` cataloga os exemplos e mantém seus JSONs separados por cenário. Ao carregar um deles, a entrada percorre o mesmo parser usado para um plano fornecido pelo usuário. O D3 não interpreta a saída do PostgreSQL: ele recebe uma árvore pronta e calcula somente as posições dos nós.

## Fluxo do plano

`PlanTree.vue` usa o D3 para distribuir os nós em níveis horizontais. As folhas ficam à esquerda e o nó raiz, que representa o resultado final, fica à direita.

As setas representam o fluxo dos filhos para os pais. O rótulo de cada ligação informa as linhas produzidas pelo filho considerando seus loops.

Os nós começam compactos, com operador, relação, linhas e tempo inclusivo. A expansão acontece no próprio nó e revela estimativas, valores observados, loops, descartes ou custo e a condição principal. A barra inferior compara o tempo acumulado (`tempo × loops`) com o tempo do plano raiz. `PlanAnalysis.vue` entrega separadamente os identificadores dos nós marcados pelas heurísticas, mantendo as regras fora do SVG.

O SVG mantém uma transformação de viewport independente do layout. Roda do mouse e botões controlam o zoom, o arraste do fundo move a árvore e o ajuste à tela recalcula escala e translação. Ao expandir um nó, a árvore é reenquadrada para que os detalhes permaneçam visíveis.

Quando um nó é selecionado, `PlanTree.vue` o envia para `PlanAnalysis.vue`. O Vue atualiza o inspetor sem recalcular o parser. O plano original pode ser consultado em um diálogo sem perder a análise.

## Heurísticas

As seis regras do MVP ficam em `domain/heuristics.ts` e percorrem a árvore recursivamente. Cada resultado mantém uma referência ao nó que produziu o sinal.

Uma regra não afirma que determinada alteração resolverá o problema. O conteúdo é dividido em evidência, interpretação, próximo passo e forma de validação. Termos técnicos possuem explicação curta e link para a documentação oficial.

## Conteúdos

`content/learningContent.ts` concentra as versões em português e inglês dos materiais introdutórios e suas referências. `LearningIndex.vue` apresenta o índice, enquanto `LearningArticle.vue` é a estrutura reutilizada por cada conteúdo. O mesmo `slug` identifica o artigo nos dois idiomas; valores inexistentes voltam ao índice.

`content/glossaryContent.ts` mantém os identificadores estáveis, categorias, termos, aliases e definições bilíngues do glossário. `Glossary.vue` resolve a busca localmente e organiza os termos por categoria. Heurísticas podem apontar para um identificador do glossário sem duplicar sua definição.

## Informações e feedback

`ProjectInfo.vue` documenta o propósito do pgPlanDoctor e a validação das heurísticas. Os scripts, planos e medições continuam na documentação própria do benchmark.

O feedback é coletado em um Google Forms externo configurado por `VITE_FEEDBACK_FORM_URL`. A aplicação não recebe nem armazena as respostas. A documentação completa do benchmark é acessada por `VITE_BENCHMARK_GITHUB_URL`.

## Limites atuais

- não existe conexão direta com PostgreSQL;
- não existe backend ou sincronização do histórico entre navegadores e dispositivos;
- a análise carregada existe somente durante a sessão; apenas os dez planos recentes ficam no armazenamento local;
- os links do Google Forms e do benchmark são configurações obrigatórias do ambiente;
- planos muito grandes ainda podem exigir bastante navegação mesmo com pan, zoom e ajuste à tela;
- apenas o formato JSON possui parser.

Um backend só será adicionado quando houver um requisito que não possa ser atendido diretamente no navegador.
