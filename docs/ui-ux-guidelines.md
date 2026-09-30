# Diretrizes de UI/UX — PlanoClaro

Este documento define a direção visual do PlanoClaro. Ele substitui integralmente as diretrizes anteriores.

## 1. Fonte de verdade

A interface deve usar o **Exercism como referência visual principal**. A intenção é reproduzir sua linguagem de produto educacional: tipografia, escala, composição, navegação, botões, superfícies, ritmo e clareza didática.

Ordem de prioridade para decisões visuais:

1. capturas do Exercism fornecidas como referência;
2. regras deste documento;
3. componentes já implementados;
4. aparência padrão do Element Plus.

Se o código atual divergir da referência, o código deve mudar. Não misture esta direção com estilos anteriores do PlanoClaro.

Copiar a linguagem visual não significa reutilizar propriedade da marca. Não use o logotipo, o nome, as personagens, os ícones de linguagens ou as ilustrações do Exercism. O conteúdo, a marca e os elementos gráficos devem pertencer ao PlanoClaro.

## 2. O que permanece independente do visual

Estes são requisitos do produto e não devem ser modificados para aproximar a aparência da referência:

- aplicação gratuita e didática;
- entrada de `EXPLAIN (ANALYZE, FORMAT JSON)`;
- parser recursivo;
- seis heurísticas do MVP;
- separação entre evidência, interpretação e forma de validação;
- visualização do fluxo das linhas;
- seleção e inspeção de operadores;
- temas claro, escuro e sistema;
- acessibilidade por teclado;
- locale `pt-BR`.

O PlanoClaro não vende um serviço. A interface deve explicar uma tarefa técnica, não promover um produto.

## 3. Tradução da referência para o PlanoClaro

| Exercism | PlanoClaro |
|---|---|
| Marca tipográfica no cabeçalho | Marca tipográfica `PlanoClaro`, sem caixa decorativa |
| Cabeçalho com hierarquia horizontal | Marca à esquerda; ações reais e tema à direita |
| Hero educacional em duas colunas | Instruções objetivas à esquerda e editor JSON à direita |
| Ilustração principal | Editor ou visualização do plano; nunca ilustração genérica |
| Botão primário com contorno e profundidade | Ação `Analisar plano` |
| Blocos de trilhas e exercícios | Operadores, métricas e regras de investigação |
| Linguagem de aprendizagem | Explicações diretas sobre PostgreSQL |
| Fundo geométrico sutil | Padrão inspirado em nós e conexões do plano |

O resultado deve ser reconhecível como uma ferramenta diferente, construída com a mesma gramática visual.

## 4. Princípios

### 4.1 Grande e legível

A referência usa tipografia e controles em escala confortável. Não compacte a interface para mostrar mais conteúdo.

- corpo: 16–18 px;
- texto auxiliar: mínimo de 14 px;
- título principal: 38–48 px no desktop;
- título de seção: 26–36 px;
- título de componente: 18–22 px;
- botões: 15–17 px, peso 600 ou 700;
- metadados técnicos: mínimo de 12 px;
- controles: altura mínima de 44 px.

Nenhum texto necessário à tarefa pode usar 9, 10 ou 11 px.

### 4.2 Conteúdo largo

- cabeçalho, entrada e páginas informativas compartilham um contêiner externo de até 1360 px;
- o contêiner mantém 32 px de margem lateral no desktop, 20 px em notebooks e 16 px no celular;
- limites de leitura pertencem às colunas internas, não criam uma margem externa diferente em cada página;
- a tela de análise é a exceção: resumo, grafo e inspetor usam a largura total disponível;
- a entrada usa duas colunas de proporções próximas;
- componentes importantes ocupam espaço proporcional à sua função;
- não centralize uma coluna estreita em um monitor amplo.

### 4.3 Didático sem ser promocional

Cada texto deve cumprir pelo menos uma função:

- informar o formato de entrada;
- explicar uma métrica ou operador;
- indicar um risco real;
- apresentar uma evidência;
- orientar uma ação necessária;
- declarar um limite da análise.

Remova qualquer frase que continue fazendo sentido em quase todo produto de tecnologia.

Não use:

- “transforme dados em insights”;
- “descubra oportunidades”;
- “leve sua análise ao próximo nível”;
- “visualize, investigue e evolua”;
- slogans sobre eficiência, inteligência ou clareza;
- parágrafos institucionais sobre o PlanoClaro.

Também não use rótulos soltos como `PostgreSQL · EXPLAIN ANALYZE` acima de um título. Um texto sem verbo ou explicação precisa deixar claro qual informação oferece ao aluno.

### 4.4 Profundidade controlada

O Exercism usa contornos definidos, sombras curtas em ações e sombras difusas em superfícies importantes. O PlanoClaro deve fazer o mesmo.

- botões primários podem usar sombra curta deslocada para baixo;
- o editor e painéis principais podem usar sombra difusa leve;
- cards secundários usam borda, não sombra;
- elementos clicáveis devem parecer clicáveis antes do hover;
- não use glassmorphism, brilho neon ou gradientes azul–roxo.

### 4.5 Cor tem função

- cor primária: ação, link e seleção;
- laranja: ponto de atenção;
- vermelho: erro real;
- verde: sucesso ou estado concluído;
- neutros: estrutura e hierarquia.

Não use uma escala verde–amarelo–vermelho para classificar o plano.

### 4.6 Primeiro viewport

Em telas desktop, a tarefa principal deve aparecer inteira sem rolagem vertical.

- na entrada, mantenha título, instrução, editor, ações e orientações operacionais no primeiro viewport;
- na análise, mantenha resumo, grafo, legenda e início do inspetor visíveis;
- adapte a altura das áreas de trabalho com `dvh`, `minmax()` e `clamp()`;
- somente conteúdo realmente adicional, um painel expandido ou uma mensagem de erro pode continuar abaixo da dobra;
- painéis extensos, como o inspetor, podem ter rolagem própria;
- em tablets, celulares ou janelas muito baixas, preserve o tamanho legível e aceite a rolagem da página.

Não reduza tipografia ou alvos de toque apenas para eliminar a rolagem.

## 5. Tipografia

A família principal é **Poppins**, com fallback para fonte geométrica do sistema. A família técnica é **JetBrains Mono**, com fallback monoespaçado.

```css
:root {
  --font-ui: "Poppins", "Avenir Next", "Segoe UI", sans-serif;
  --font-code: "JetBrains Mono", "SFMono-Regular", Consolas, monospace;
}
```

Use `Poppins` em marca, navegação, títulos, textos e botões. Use a fonte técnica somente em:

- JSON e SQL;
- valores de métricas;
- nomes de relações e índices;
- expressões de filtro;
- rótulos muito curtos do grafo.

Não use caixa alta monoespaçada como recurso decorativo recorrente.

## 6. Fundação visual

As cores podem diferir do Exercism, mas contraste, distribuição e hierarquia devem permanecer próximos.

### 6.1 Tema claro

```css
:root,
:root[data-theme="light"] {
  color-scheme: light;

  --page: #f7f8fc;
  --surface: #ffffff;
  --surface-subtle: #f1f3f9;
  --surface-raised: #ffffff;

  --ink: #171541;
  --ink-muted: #555b78;
  --ink-faint: #858ba3;

  --border: #d9ddec;
  --border-strong: #aeb6cf;
  --pattern: #e9ecf5;

  --primary: #5276bd;
  --primary-hover: #3f609f;
  --primary-soft: #edf2fb;
  --button-primary: #4969aa;
  --button-primary-hover: #3f5d98;
  --button-primary-active: #354f83;
  --button-primary-text: #ffffff;
  --highlight: #ffef70;

  --attention: #b85c18;
  --attention-soft: #fff3e5;
  --danger: #c93645;
  --success: #16835f;

  --shadow-button: 0 4px 0 rgba(23, 21, 65, 0.2);
  --shadow-raised: 0 14px 36px rgba(38, 40, 78, 0.12);
}
```

### 6.2 Tema escuro

O tema escuro adapta a mesma interface. Ele não cria outra direção visual nem usa cores mais saturadas para parecer gamificado. As superfícies são grafite e o azul fica reservado para ações, foco e informação selecionada.

```css
:root[data-theme="dark"] {
  color-scheme: dark;

  --page: #121417;
  --surface: #191c21;
  --surface-subtle: #22262d;
  --surface-raised: #1d2026;
  --code-surface: #15181d;

  --ink: #f1f3f5;
  --ink-muted: #b3b9c3;
  --ink-faint: #858d99;

  --border: #30353d;
  --border-strong: #49515d;
  --pattern: #24282e;

  --primary: #7796d8;
  --primary-hover: #91abe2;
  --primary-soft: #253049;
  --button-primary: #506da6;
  --button-primary-hover: #5d7dbb;
  --button-primary-active: #466092;
  --button-primary-text: #ffffff;

  --attention: #e3a064;
  --attention-soft: #33261d;
  --danger: #ed7d86;
  --success: #62ba94;

  --shadow-button: 0 2px 0 rgba(0, 0, 0, 0.38);
  --shadow-raised: 0 12px 28px rgba(0, 0, 0, 0.24);
}
```

Regras:

- componentes usam tokens, nunca cores de tema codificadas localmente;
- azul de destaque e azul de botão pertencem à mesma família, mas o botão usa um tom mais profundo para manter contraste com texto branco;
- botões secundários permanecem neutros e recebem azul apenas no `hover` ou no foco;
- botões desabilitados usam superfície e texto neutros; não use um azul claro que possa ser confundido com uma ação disponível;
- não inverta a página com `filter`;
- evite preto e branco puros em superfícies grandes;
- o tema deve ser aplicado antes da primeira pintura;
- trocar o tema não altera o plano nem o nó selecionado.

### 6.3 Formas

- raio pequeno: 6 px;
- raio padrão: 8 px;
- raio de superfície grande: 12 px;
- bordas: 1 ou 2 px;
- botões primários: borda visível e sombra curta;
- pílulas apenas para estado, categoria ou contagem curta.

Não use arredondamento exagerado em todos os elementos.

## 7. Cabeçalho

O cabeçalho segue diretamente a composição do Exercism:

```text
┌────────────────────────────────────────────────────────────────────┐
│ marca                                             ações reais  tema │
└────────────────────────────────────────────────────────────────────┘
```

Regras:

- altura entre 72 e 80 px;
- conteúdo interno centralizado na largura máxima da página;
- marca tipográfica livre, sem quadrado ou card atrás dela;
- ações contextuais e tema à direita;
- seletor de tema compacto em menu;
- superfície sólida e borda inferior;
- não criar navegação quando existe apenas um fluxo de trabalho.

Não adicionar:

- slogan;
- subtítulo institucional;
- descrição do produto;
- barra de anúncio sem existir um anúncio real;
- itens diferentes que levam ao mesmo lugar;
- nome da própria tela como item de navegação.

## 8. Ícones

O PlanoClaro usa **Phosphor Icons** por meio de `@phosphor-icons/vue`. Essa é a única família de ícones da interface.

- importe cada componente pelo nome; não registre a biblioteca inteira globalmente;
- use `duotone` em conceitos didáticos, avisos e elementos de identidade;
- use `regular`, `bold` ou `fill` em controles e ações pequenas;
- mantenha ícones informativos entre 24 e 32 px e ícones de ação entre 16 e 20 px;
- deixe a cor ser herdada com `currentColor` e use os tokens semânticos existentes;
- associe ícones de ação a um rótulo textual; o ícone não substitui o nome da ação;
- escolha símbolos pelo significado, não para preencher espaços vazios;
- não misture Phosphor com emoji, glifos de texto ou SVGs copiados de outras bibliotecas;
- preserve SVG próprio somente quando ele representar dados do plano, como nós, conexões e legendas do grafo.

Ícones podem tornar explicações mais fáceis de percorrer, mas não devem converter cada linha em um card decorativo. A organização do conteúdo continua vindo de tipografia, espaço e bordas.

## 9. Tela de entrada

### 9.1 Composição

A entrada é um workspace operacional. O editor é a superfície principal e divide a página com o histórico e os exemplos por meio de abas:

```text
Analisar plano de execução
Instrução curta sobre a entrada                         Como obter o JSON

Novo plano         Consultas recentes         Exemplos
─────────────────────────────────────────────────────────────────────
┌ editor JSON ───────────────────────────────────────────────────────┐
│ Plano de execução                              Processado localmente│
│                                                                    │
│ JSON                                                               │
│                                                                    │
│ atalho                                             analisar         │
└────────────────────────────────────────────────────────────────────┘
Aviso de execução
```

- largura máxima de 1360 px, compartilhada com as demais páginas;
- editor ocupa toda a largura do workspace;
- título entre 30 e 36 px, alinhado ao editor;
- cabeçalho contém título, instrução e acesso à ajuda para gerar o JSON;
- as abas separam entrada, histórico local e exemplos sem misturar essas funções;
- editor e ações essenciais permanecem no primeiro viewport do desktop;
- fundo plano, sem padrão decorativo;
- título literal, sem slogan, hero, eyebrow ou marca-texto decorativo.

### 9.2 Conteúdo permitido

O cabeçalho e o editor podem informar:

- o comando e formato aceitos;
- risco de executar `EXPLAIN ANALYZE`;
- que o processamento é local, enquanto isso for verdadeiro;
- link para a explicação completa sobre como gerar o plano.

Não inclua lista de funcionalidades, métricas do resultado ou roteiro “cole, visualize, investigue”. Essas informações pertencem às páginas Sobre, Aprender e à própria análise.

### 9.3 Editor

- aparência de editor claro no tema claro e escuro no tema escuro;
- fonte técnica entre 14 e 16 px;
- numeração de linhas;
- quebra de linha preservada;
- barra inferior com atalho e ações;
- ajuda para obter o JSON visível no cabeçalho da página;
- `Analisar plano` como ação primária;
- carregamento de exemplos dentro da aba `Exemplos`, não no rodapé do editor;
- erro específico junto ao editor;
- apenas `JSON` deve aparecer enquanto o parser textual não existir.

O editor é uma superfície do produto, não um terminal cenográfico. Não force fundo escuro no tema claro.

Não exiba estados derivados apenas da presença de texto, como `JSON pronto para análise` ou `Aguardando o plano`. Use mensagens de estado somente quando houver processamento, validação, sucesso ou erro reais.

## 10. Tela de análise

A tela de análise reaproveita a linguagem do Exercism em um ambiente de ferramenta:

```text
┌ cabeçalho ──────────────────────────────────────────────────────────┐
├ resumo da execução ─────────────────────────────────────────────────┤
├ grafo ───────────────────────────────────────┬ inspetor do nó ─────┤
│                                              │                      │
│ operadores e ligações                        │ métricas              │
│                                              │ ponto de atenção      │
└──────────────────────────────────────────────┴──────────────────────┘
```

### 10.1 Resumo

- altura entre 60 e 76 px;
- pares claros de rótulo e valor;
- tempo, linhas, sinais e relações;
- fonte técnica somente nos valores;
- divisórias simples;
- não usar uma coleção de pílulas coloridas.

### 10.2 Grafo

- fluxo horizontal da esquerda para a direita: folhas no início e resultado no fim;
- superfície clara e ampla;
- padrão geométrico sutil;
- nós compactos com expansão local para métricas adicionais;
- largura próxima de 272 px para preservar a leitura dos valores;
- título do operador entre 16 e 18 px;
- relação e métricas entre 13 e 15 px;
- barra inferior para tempo relativo;
- marcador laranja para ponto de atenção;
- borda primária para seleção;
- pan, zoom, retorno a 100% e ajuste à tela;
- reenquadramento após expandir ou recolher um nó.

Não usar mapa de calor. Cor forte em todo o nó prejudica leitura e aproxima a interface de um monitor de infraestrutura.

### 10.3 Inspetor

- largura entre 400 e 480 px;
- superfície contínua, não pilha de cards;
- operação e relação no topo;
- métricas principais em duas colunas;
- evidência, interpretação e validação em blocos separados;
- propriedades avançadas recolhidas;
- rolagem própria quando o conteúdo ultrapassar a altura disponível;
- corpo entre 14 e 16 px.

## 11. Página de informações

A página de informações existe para documentar o projeto, não para promovê-lo.

- explique o propósito da ferramenta em termos concretos;
- resuma a comparação antes/depois usada para avaliar cada heurística;
- encaminhe scripts, planos, medições e protocolo detalhado para a documentação do benchmark;
- deixe explícito que um cenário controlado não garante benefício em toda consulta;
- use uma estrutura documental simples, sem hero comercial, CTA interno ou coleção de cards;
- direcione o feedback para um Google Forms externo claramente identificado.
- ofereça um link direto para o repositório do benchmark no GitHub.
- apresente o convite ao feedback como uma frase curta na introdução;
- use um link textual, sem título próprio, card ou chamada promocional.
- mantenha introdução, convite e seções na mesma escala de texto corrido;
- separe o conjunto introdutório das demais seções com a borda padrão.

A página é secundária e pouco acessada. Texto corrido, seções e uma tabela resumida são suficientes.

### 11.1 Área de aprendizagem

A área `Aprender` ensina a interpretar planos de execução; ela não é um curso geral de banco de dados.

- organize os conteúdos em uma sequência didática única, sem numeração, categorias visuais ou indicação de progresso;
- o índice apresenta título, resumo e ícone de cada conteúdo;
- artigos usam uma coluna de leitura confortável e um sumário lateral no desktop;
- cada artigo começa com uma introdução curta e termina com `Conteúdos recomendados`;
- cada seção técnica usa apenas um marcador numérico discreto, ligado à referência completa no final do artigo;
- título, descrição e link de uma referência aparecem uma única vez;
- exemplos técnicos usam a fonte de código e explicam somente os campos necessários;
- avisos servem para riscos reais, como a execução causada por `EXPLAIN ANALYZE`;
- forneça navegação anterior e próxima;
- conecte editor, métricas e heurísticas diretamente aos conteúdos relacionados;
- não adicione gamificação, progresso fictício, certificado ou linguagem promocional.

O conteúdo deve funcionar sem depender da ferramenta. Não escreva instruções sobre onde clicar, como navegar pela interface ou como o PlanoClaro apresenta determinada informação.

A área funciona como curadoria introdutória, não como referência autoral. Use a documentação do PostgreSQL 17 como fonte técnica principal. Antes do link, apresente uma síntese em português e, quando útil, um exemplo pequeno; depois encaminhe o aprofundamento para a fonte oficial.

O texto separa evidência, interpretação e hipótese. Uma alteração possível nunca deve ser apresentada como resultado garantido.

## 12. Componentes

### 12.1 Botões

- primário: cor sólida, texto claro, borda escura sutil e sombra curta;
- secundário: superfície branca, borda primária e texto primário;
- terciário: texto ou ícone sem card ao redor;
- altura mínima de 44 px;
- rótulo descreve a ação: `Analisar plano`, `Ver JSON`, `Novo plano`.

### 12.2 Cards e painéis

- usar card somente quando o conteúdo for uma unidade independente;
- borda nítida e raio de 8–12 px;
- sombra apenas em superfície prioritária;
- não envolver cada parágrafo ou métrica em um card.

### 12.3 Links

- sublinhado visível ou indicação inequívoca;
- cor primária;
- texto informa o destino;
- documentação externa abre em nova aba.

### 12.4 Element Plus

O Element Plus fornece comportamento, não identidade visual.

Use quando trouxer valor real:

- `ElButton`;
- `ElDialog`;
- `ElCollapse`;
- `ElDropdown`;
- `ElPopover`;
- `ElAlert` para erros reais.

Evite usar automaticamente:

- `ElCard` para toda seção;
- `ElTag` para qualquer valor curto;
- `ElAlert` para dicas e heurísticas;
- estilos padrão sem mapear os tokens dos dois temas.

## 13. Linguagem

Termos do PostgreSQL permanecem em inglês e recebem explicação em português quando necessário.

Prefira:

- `Plano em JSON`;
- `Linhas examinadas`;
- `Linhas produzidas`;
- `Tempo acumulado`;
- `Ponto de atenção`;
- `O que o plano mostrou`;
- `Como ler`;
- `Como confirmar`;
- `Limite desta regra`.

Evite:

- `insight`;
- `diagnóstico da IA`;
- `otimize agora`;
- `problema detectado` quando a regra apenas sugere investigação;
- adjetivos promocionais como “poderoso”, “inteligente” ou “inovador”.

## 14. Formatação dos dados

Use locale `pt-BR`:

- `14.952` linhas;
- `98,3%`;
- `1,18 ms`;
- `1,82 s`.

Considere `loops` em valores acumulados e deixe claro quando um valor é por execução.

## 15. Tema

O seletor permite `Sistema`, `Claro` e `Escuro`.

- `Sistema` acompanha `prefers-color-scheme`;
- escolha manual é persistida;
- o controle mostra a preferência atual;
- ícone possui nome acessível;
- diálogos, popovers, editor e SVG respeitam o tema;
- nenhuma informação depende apenas de cor.

## 16. Responsividade

### Desktop amplo

- contêiner externo de até 1360 px, alinhado entre cabeçalho e páginas;
- entrada em duas colunas;
- grafo e inspetor lado a lado;
- componentes não diminuem porque existe mais espaço.

### Notebook e tablet

- abaixo de aproximadamente 1024 px, entrada pode empilhar;
- inspetor pode ir abaixo do grafo ou virar drawer;
- tamanhos de fonte são preservados;
- grafo usa rolagem e zoom antes de reduzir os nós.

### Celular

- margens de 16 px;
- navegação do cabeçalho em segunda linha;
- ações podem ocupar a largura total;
- análise alterna entre fluxo e detalhes;
- alvos de toque de pelo menos 44 × 44 px.

## 17. Acessibilidade

- WCAG AA nos dois temas;
- foco visível;
- ordem de foco coerente;
- nós selecionáveis por teclado;
- erros anunciados com `aria-live`;
- ícones isolados com nome acessível; ícones ao lado de texto podem ser decorativos;
- respeito a `prefers-reduced-motion`;
- zoom do navegador em 200% sem perda de ações essenciais.

## 18. Organização no repositório

```text
src/
├── router/
│   └── index.ts
├── views/
│   ├── PlanInputView.vue
│   ├── PlanAnalysisView.vue
│   └── LearningArticleView.vue
├── components/
│   ├── AppHeader.vue
│   ├── ThemeSwitcher.vue
│   ├── PlanInput.vue
│   ├── PlanAnalysis.vue
│   ├── PlanTree.vue
│   ├── LearningIndex.vue
│   ├── LearningArticle.vue
│   └── ProjectInfo.vue
├── content/
│   └── learningContent.ts
├── composables/
│   ├── useRecentPlans.ts
│   ├── usePlanSession.ts
│   └── useTheme.ts
├── domain/
│   ├── plan.ts
│   ├── planParser.ts
│   └── heuristics.ts
└── styles.css
```

Regras:

- componentes não contêm regras de heurística;
- o Vue Router controla as páginas; componentes não manipulam `location`, `history` ou hashes diretamente;
- estado transitório do plano fica em `usePlanSession.ts`, não em componentes globais;
- histórico de planos fica em `useRecentPlans.ts` e permanece local ao navegador;
- parser não conhece a interface;
- `PlanTree.vue` recebe dados prontos;
- cores ficam em tokens globais;
- estado do tema não se mistura ao estado do plano;
- SVG usa variáveis CSS sempre que possível.

## 19. Processo de implementação

Para cada região:

1. observe a região equivalente na captura do Exercism;
2. registre estrutura, escala, alinhamento, borda e profundidade;
3. adapte o conteúdo real do PlanoClaro;
4. implemente sem recuperar estilos anteriores;
5. compare lado a lado na mesma resolução;
6. valide claro, escuro e responsividade.

Não faça ajustes incrementais em uma região cuja estrutura ainda pertence à direção antiga. Substitua a composição inteira.

## 20. Critérios de aceite

Uma alteração visual só está concluída quando:

- [ ] a estrutura lembra claramente a referência sem usar seus ativos de marca;
- [ ] a página não parece dashboard administrativo ou interface de IA;
- [ ] não há texto promocional ou de preenchimento;
- [ ] cada frase informa algo necessário à tarefa;
- [ ] a largura do desktop é bem aproveitada;
- [ ] tipografia e controles são confortáveis a 100% de zoom;
- [ ] ações primária, secundária e terciária são distinguíveis;
- [ ] temas claro e escuro preservam hierarquia e contraste;
- [ ] o fluxo do plano permanece legível;
- [ ] evidência, interpretação e validação continuam separadas;
- [ ] parser, heurísticas e apresentação permanecem desacoplados.

Valide pelo menos em:

- 1920 × 1080;
- 1440 × 900;
- 1024 × 768;
- 390 × 844;
- temas claro e escuro;
- plano linear e plano ramificado.

## 21. Proibições

- reutilizar metáforas visuais da direção anterior;
- aparência de terminal como identidade geral;
- grade técnica pontilhada dominando toda a página;
- caixa escura atrás da marca;
- rótulos monoespaçados em caixa alta espalhados pela interface;
- cards arredondados para toda informação;
- mapa de calor verde–vermelho;
- brilhos, glassmorphism e gradientes de IA;
- faíscas, cérebro, robô ou símbolos de inteligência artificial;
- slogans e promessas de produto;
- ilustrações genéricas de pessoas trabalhando;
- itens de navegação sem função;
- propriedades avançadas expostas de uma vez;
- métricas inventadas;
- suporte visual a formato textual antes do parser correspondente.
