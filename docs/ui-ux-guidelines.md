# Diretrizes de UI/UX — pgPlanDoctor

Este documento define a direção visual do pgPlanDoctor. Ele substitui integralmente as diretrizes anteriores.

## 1. Fonte de verdade

A interface deve seguir a linguagem já consolidada no cabeçalho do pgPlanDoctor: compacta, plana, técnica e com uso contido da cor primária. O Exercism permanece como referência secundária de clareza didática e organização, não como um modelo a ser reproduzido literalmente.

Ordem de prioridade para decisões visuais:

1. regras deste documento;
2. cabeçalho e tokens globais implementados;
3. capturas do Exercism fornecidas como referência secundária;
4. aparência padrão do Element Plus.

Se uma região divergir dessa linguagem, prefira corrigir escala, alinhamento, bordas e hierarquia antes de adicionar decoração.

Copiar a linguagem visual não significa reutilizar propriedade da marca. Não use o logotipo, o nome, as personagens, os ícones de linguagens ou as ilustrações do Exercism. O conteúdo, a marca e os elementos gráficos devem pertencer ao pgPlanDoctor.

## 2. O que permanece independente do visual

Estes são requisitos do produto e não devem ser modificados para aproximar a aparência da referência:

- aplicação gratuita e didática;
- entrada de `EXPLAIN (ANALYZE, FORMAT JSON)`;
- parser recursivo;
- heurísticas do MVP;
- separação entre evidência, interpretação e forma de validação;
- visualização do fluxo das linhas;
- seleção e inspeção de operadores;
- tema escuro suave e consistente;
- acessibilidade por teclado;
- locale `pt-BR`.

O pgPlanDoctor não vende um serviço. A interface deve explicar uma tarefa técnica, não promover um produto.

## 3. Tradução das referências para o pgPlanDoctor

| Exercism | pgPlanDoctor |
|---|---|
| Marca tipográfica no cabeçalho | Marca tipográfica `pgPlanDoctor`, sem caixa decorativa |
| Cabeçalho com hierarquia horizontal | Marca à esquerda; ações e idioma à direita |
| Área principal de exercício | Título objetivo, ajuda contextual e editor JSON em largura integral |
| Ilustração principal | Editor ou visualização do plano; nunca ilustração genérica |
| Ação primária inequívoca | Ação sólida e compacta `Analisar plano` |
| Blocos de trilhas e exercícios | Operadores, métricas e regras de investigação |
| Linguagem de aprendizagem | Explicações diretas sobre PostgreSQL |
| Fundo geométrico sutil | Padrão restrito à área navegável do grafo |

O resultado deve ser reconhecível como uma ferramenta diferente, construída com a mesma gramática visual.

## 4. Princípios

### 4.1 Compacto e legível

A densidade deve se aproximar do cabeçalho sem comprometer textos de leitura ou alvos de toque.

- corpo: 15 px;
- texto auxiliar: 12–14 px;
- título principal: 24–28 px, com peso 600;
- título de seção: 20 px;
- título de componente: 16–18 px;
- botões: 14 px, peso 600;
- metadados técnicos: 11–13 px;
- controles principais: 40 px no desktop; controles do cabeçalho podem usar 34 px;
- no celular, ações essenciais preservam alvo de toque de pelo menos 44 px.

Rótulos menores do SVG podem usar 8–11 px quando forem complementares e a informação completa estiver disponível no nó expandido.

### 4.2 Conteúdo largo

- cabeçalho, entrada e páginas informativas compartilham um contêiner externo de até 1360 px;
- o contêiner mantém 32 px de margem lateral no desktop, 20 px em notebooks e 16 px no celular;
- limites de leitura pertencem às colunas internas, não criam uma margem externa diferente em cada página;
- a tela de análise é a exceção: grafo e painel de pontos de atenção usam a largura total disponível;
- a entrada usa o editor em largura integral dentro do contêiner;
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
- parágrafos institucionais sobre o pgPlanDoctor.

Também não use rótulos soltos como `PostgreSQL · EXPLAIN ANALYZE` acima de um título. Um texto sem verbo ou explicação precisa deixar claro qual informação oferece ao aluno.

### 4.4 Profundidade controlada

A interface é plana por padrão. Profundidade deve vir principalmente de contraste entre superfícies e bordas.

- botões primários usam cor sólida, sem sombra obrigatória;
- editor, painéis e nós usam borda discreta em vez de elevação;
- sombras ficam reservadas a overlays, diálogos e situações em que a sobreposição precisa ser percebida;
- listas de conteúdo usam linhas e espaço, não uma sequência de cards;
- elementos clicáveis devem parecer clicáveis antes do hover;
- não use glassmorphism, brilho neon ou gradientes azul–roxo.

### 4.5 Cor tem função

- cor primária: ação principal, foco, link interativo e seleção;
- laranja: ponto de atenção;
- vermelho: erro real;
- verde: sucesso ou estado concluído;
- neutros: estrutura e hierarquia.

Fundos, bordas, ícones informativos, navegação inativa e controles secundários usam cinzas grafite neutros. A identidade do PostgreSQL vem da marca e do azul aplicado com intenção, não de uma dominante azul sobre toda a tela.

Não use uma escala verde–amarelo–vermelho para classificar o plano.

### 4.6 Primeiro viewport

Em telas desktop, a tarefa principal deve aparecer inteira sem rolagem vertical.

- na entrada, mantenha título, instrução, editor, ações e orientações operacionais no primeiro viewport;
- na análise, mantenha contexto, grafo, legenda e início dos pontos de atenção visíveis;
- adapte a altura das áreas de trabalho com `dvh`, `minmax()` e `clamp()`;
- somente conteúdo realmente adicional, um painel expandido ou uma mensagem de erro pode continuar abaixo da dobra;
- painéis extensos, como a lista de pontos de atenção, podem ter rolagem própria;
- em tablets, celulares ou janelas muito baixas, preserve o tamanho legível e aceite a rolagem da página.

Não reduza tipografia ou alvos de toque apenas para eliminar a rolagem.

## 5. Tipografia

A interface usa a fonte de sistema para manter títulos, controles e textos discretos e legíveis. **Poppins** fica restrita à marca. A família técnica é **JetBrains Mono**, com fallback monoespaçado.

```css
:root {
  --font-ui: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-brand: "Poppins", "Avenir Next", "Segoe UI", sans-serif;
  --font-code: "JetBrains Mono", "SFMono-Regular", Consolas, monospace;
}
```

Use a fonte de sistema em navegação, títulos, textos e botões; preserve `Poppins` na marca. Use a fonte técnica somente em:

- JSON e SQL;
- valores de métricas;
- nomes de relações e índices;
- expressões de filtro;
- rótulos muito curtos do grafo.

Não use caixa alta monoespaçada como recurso decorativo recorrente.

Preserve a capitalização dos operadores e os nomes de relações como aparecem no plano. Ícones informativos e marcadores de listas usam tons neutros; azul identifica ações, links e seleção. Descrições dos exemplos orientam o que observar, em vez de listar funcionalidades.

Pesos compartilhados, definidos em tokens globais:

- texto corrido: `--weight-body` (400);
- títulos de páginas, seções, componentes e itens de listas: `--weight-title` (600);
- botões e links de ação: `--weight-control` (600);
- ênfase no texto e marca: `--weight-emphasis` (700).

Defina o peso dos títulos explicitamente; não dependa do negrito padrão do navegador. `<strong>` usado como título de um item recebe o peso de título, enquanto ênfase no texto mantém 700.

## 6. Fundação visual

As cores podem diferir do Exercism, mas contraste, distribuição e hierarquia devem permanecer próximos.

### 6.1 Tema escuro suave

```css
:root {
  color-scheme: dark;

  --page: #17191d;
  --surface: #1c1f24;
  --surface-subtle: #25282e;
  --surface-raised: #202329;
  --code-surface: #121418;

  --ink: #eceef1;
  --ink-muted: #a5abb3;
  --ink-faint: #747c87;

  --border: #343941;
  --border-strong: #484e58;
  --pattern: #272a2f;

  --primary: #7594c4;
  --primary-hover: #91aad0;
  --primary-soft: #242c39;
  --button-primary: #4d6f9f;
  --button-primary-hover: #587bad;
  --button-primary-active: #425f88;
  --button-primary-text: #ffffff;

  --time-low: #77818e;
  --time-medium: #6f89ad;
  --time-high: #7898ca;
  --time-dominant: #a2b9dd;

  --attention: #d49a5b;
  --attention-soft: #382b20;
  --danger: #f08088;
  --danger-soft: #3c242a;
  --success: #69c39c;
  --success-soft: #20382f;

  --shadow-button: none;
  --shadow-raised: 0 8px 20px rgba(5, 8, 14, 0.22);
}
```

Regras:

- componentes usam tokens, nunca cores da paleta codificadas localmente;
- azul de destaque e azul de botão pertencem à mesma família, mas o botão usa um tom mais profundo para manter contraste com texto branco;
- botões secundários permanecem neutros também no `hover`; o contorno de foco continua azul por acessibilidade;
- ícones sem ação e a navegação ativa usam os tons de texto, não a cor primária;
- botões desabilitados usam superfície e texto neutros; não use um azul claro que possa ser confundido com uma ação disponível;
- não inverta a página com `filter`;
- evite preto e branco puros em superfícies grandes;
- mantenha contraste WCAG AA entre texto, superfícies e ações.

### 6.2 Formas

- raio pequeno: 6 px;
- raio padrão: 8 px;
- superfícies funcionais: raio de até 8 px;
- listas documentais: sem raio ou caixa externa;
- bordas: preferencialmente 1 px;
- botões primários: borda discreta e sem sombra por padrão;
- pílulas apenas para estado, categoria ou contagem curta.

Não use arredondamento exagerado em todos os elementos.

## 7. Cabeçalho

O cabeçalho segue diretamente a composição do Exercism:

```text
┌────────────────────────────────────────────────────────────────────┐
│ marca                                           ações  idioma │
└────────────────────────────────────────────────────────────────────┘
```

Regras:

- altura de 56 px no desktop e aproximadamente 104 px no celular com duas linhas e alvos de toque de 44 px;
- conteúdo interno centralizado na largura máxima da página;
- marca tipográfica livre, sem quadrado ou card atrás dela;
- ações contextuais e idioma à direita;
- seletor de idioma compacto com `PT` e `EN`;
- navegação com ícones pequenos ao lado dos rótulos textuais;
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

O pgPlanDoctor usa **Phosphor Icons** por meio de `@phosphor-icons/vue`. Essa é a única família de ícones da interface.

- importe cada componente pelo nome; não registre a biblioteca inteira globalmente;
- use `duotone` em conceitos didáticos, avisos e elementos de identidade;
- use `bold` em controles e ações pequenas; `regular` pode ser usado em campos de busca e `fill` em ações de execução;
- mantenha ícones informativos entre 24 e 32 px e ícones de ação entre 16 e 20 px;
- deixe a cor ser herdada com `currentColor` e use os tokens semânticos existentes;
- associe ícones de ação a um rótulo textual; o ícone não substitui o nome da ação;
- escolha símbolos pelo significado, não para preencher espaços vazios;
- não misture Phosphor com emoji, glifos de texto ou SVGs copiados de outras bibliotecas;
- preserve SVG próprio somente quando ele representar dados do plano, como nós, conexões e legendas do grafo.

Ícones de metadados compactos podem usar `duotone` em 16 px, como o indicador de processamento local. Em erros do Element Plus, forneça o ícone Phosphor pelo slot disponível. Botões compactos de menu, como idioma e exemplos, compartilham borda, superfície, raio de 8 px e estados de interação; no celular, o alvo mínimo é 44 px.

Ícones podem tornar explicações mais fáceis de percorrer, mas não devem converter cada linha em um card decorativo. A organização do conteúdo continua vindo de tipografia, espaço e bordas.

## 9. Tela de entrada

### 9.1 Composição

A entrada é um workspace operacional. O editor é a superfície principal e divide a página com o histórico e os exemplos por meio de abas:

```text
Analisar plano de execução
Instrução curta sobre a entrada                         Como obter o JSON

Novo plano         Planos recentes
─────────────────────────────────────────────────────────────────────
┌ editor JSON ───────────────────────────────────────────────────────┐
│ EXPLAIN JSON       Processado no navegador   Carregar exemplo ▾    │
│                                                                    │
│ JSON                                                               │
│                                                                    │
│ atalho                                             analisar         │
└────────────────────────────────────────────────────────────────────┘
Aviso de execução
```

- largura máxima de 1360 px, compartilhada com as demais páginas;
- editor ocupa toda a largura do workspace;
- título entre 24 e 28 px, alinhado ao editor;
- cabeçalho contém título, instrução e acesso à ajuda para gerar o JSON;
- as abas separam somente a entrada e o histórico local;
- exemplos são atalhos que preenchem o editor e ficam em um menu na toolbar, não em uma aba própria;
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

- aparência de editor integrada ao tema escuro suave;
- fonte técnica entre 14 e 16 px;
- numeração de linhas;
- quebra de linha preservada;
- barra inferior com atalho e ações;
- ajuda para obter o JSON visível no cabeçalho da página;
- `Analisar plano` como ação primária;
- carregamento de exemplos pelo menu `Carregar exemplo` na toolbar do editor;
- erro específico junto ao editor;
- apenas `JSON` deve aparecer enquanto o parser textual não existir.

O editor é uma superfície do produto, não um terminal cenográfico. Diferencie-o das demais superfícies sem usar preto puro.

Não exiba estados derivados apenas da presença de texto, como `JSON pronto para análise` ou `Aguardando o plano`. Use mensagens de estado somente quando houver processamento, validação, sucesso ou erro reais.

## 10. Tela de análise

A tela de análise reaproveita a linguagem do Exercism em um ambiente de ferramenta:

```text
┌ cabeçalho ──────────────────────────────────────────────────────────┐
├ pontos de atenção ──┬ grafo ───────────────────────────────────────┤
│ lista resumida       │                                              │
│ ou detalhe           │ operadores e ligações                        │
│ selecionado          │                                              │
│                      ├ contexto e legenda ──────────────────────────┤
└──────────────────────┴──────────────────────────────────────────────┘
```

### 10.1 Contexto

- o cabeçalho local usa uma única linha com título e direção; instruções óbvias sobre o fluxo não ocupam uma segunda linha permanente;
- execução, resultado, estrutura e quantidade de sinais aparecem em uma linha compacta junto à legenda inferior do grafo;
- os valores complementam a visualização sem competir com ela;
- fonte técnica somente nos valores e sem pílulas coloridas ou faixa exclusiva.

### 10.2 Grafo

- fluxo horizontal da esquerda para a direita: folhas no início e resultado no fim;
- superfície grafite neutra e ampla, distinta do cabeçalho global;
- padrão geométrico sutil;
- nós compactos com expansão local para métricas adicionais;
- clique, Enter ou Espaço no card compacto o expandem; o cabeçalho expandido oferece um botão explícito para recolher, preservando seleção de texto e interação com as abas;
- largura próxima de 232 px no estado compacto;
- título do operador em torno de 14 px, com peso 600;
- relação e métricas entre 11 e 12 px, sempre com os valores completos disponíveis no estado expandido;
- barra inferior e porcentagem com escala sequencial cinza–azul para o tempo relativo;
- a intensidade do tempo comunica participação, não gravidade; vermelho e laranja não pertencem a essa escala;
- nó terminal menor e não interativo depois do operador raiz, identificando o resultado sem alterar o plano analisado;
- marcador laranja para ponto de atenção;
- borda primária para seleção;
- conexões sem repetir, por padrão, a quantidade de linhas que já aparece no nó de origem;
- pan, zoom, retorno a 100%, enquadramento completo e ajuste para leitura;
- o zoom é apenas geométrico: não trocar, ampliar seletivamente ou ocultar textos com base na escala;
- a visualização inicia em escala legível; quando o plano excede a área, navega-se por pan;
- expandir ou recolher preserva a posição visual do nó acionado e não reenquadra toda a árvore.

Nós expandidos seguem uma estrutura documental de 420 px, com borda discreta e raio de 4 px. O cabeçalho mantém o nome completo do operador, relação, índice e tipo de junção quando informados, seguido de uma explicação curta. A aba Geral usa uma tabela com colunas Métrica, Observado e Estimado, unidades próximas dos valores e um link contextual para o artigo Métricas essenciais em outra aba. Explicações extensas sobre interpretação ficam na área Aprender. Valores por execução, totais calculados e custos do planejamento são grupos distintos.

Condições, Buffers e Saída aparecem como abas somente quando existem dados. As condições e colunas não são truncadas; conteúdo extenso usa rolagem dentro do nó. Buffers são contadores de blocos, sem multiplicação por loops. Operadores com zero loops são identificados como não executados. A largura de cada nível e a separação vertical se adaptam aos nós expandidos para evitar sobreposição. As abas suportam setas, Home e End, e o zoom mantém o mesmo conteúdo.

Não usar mapa de calor. Cor forte em todo o nó prejudica leitura e aproxima a interface de um monitor de infraestrutura.

### 10.3 Pontos de atenção

- painel à esquerda, por acompanhar o início natural da leitura, com largura entre 400 e 460 px no desktop;
- quando recolhido, o controle para reabrir o painel permanece à esquerda, antes do título do grafo;
- a lista e o detalhe são estados separados: escolher um ponto de atenção substitui a lista pelo documento e oferece retorno explícito;
- abrir ou recolher o painel preserva a posição atual da câmera da árvore;
- título e quantidade de pontos de atenção compartilham uma única barra, sem repetir “Pontos de atenção encontrados” como subtítulo permanente;
- botão de recolher sem moldura permanente; cor de fundo aparece somente na interação;
- lista contínua, alinhada às bordas do painel, sem transformar cada ponto de atenção em um card flutuante;
- cada ponto de atenção apresenta título, métrica observável, operador e uma evidência curta antes de abrir o detalhe;
- laranja fica restrito ao contador, ao marcador da seleção e ao ponto de atenção no grafo; o detalhe usa texto neutro;
- selecionar um ponto de atenção centraliza o nó correspondente;
- o grafo mostra a quantidade de pontos de atenção de cada nó, inclusive no cabeçalho expandido;
- quando o nó selecionado possui vários achados, uma lista com títulos e métricas permite alternar entre eles acima do detalhe;
- alternar entre achados do mesmo nó preserva a câmera; interagir com as abas ou recolher o nó preserva o achado escolhido;
- selecionar outro nó com achados reabre o painel recolhido; nós sem achados mantêm a lista geral;
- evidência, interpretação, próximo passo e validação aparecem somente para o ponto selecionado;
- não repetir no painel métricas que já estão disponíveis no nó compacto ou expandido;
- rolagem própria quando o conteúdo ultrapassar a altura disponível;
- corpo entre 13 e 14 px para preservar uma largura e um ritmo de leitura confortáveis.

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

O conteúdo deve funcionar sem depender da ferramenta. Não escreva instruções sobre onde clicar, como navegar pela interface ou como o pgPlanDoctor apresenta determinada informação.

A área funciona como curadoria introdutória, não como referência autoral. Use a documentação do PostgreSQL 17 como fonte técnica principal. Antes do link, apresente uma síntese em português e, quando útil, um exemplo pequeno; depois encaminhe o aprofundamento para a fonte oficial.

O texto separa evidência, interpretação e hipótese. Uma alteração possível nunca deve ser apresentada como resultado garantido.

## 12. Componentes

### 12.1 Botões

- primário: cor sólida, texto claro e borda discreta, sem sombra por padrão;
- secundário: superfície neutra, borda neutra e azul somente no `hover` ou foco;
- terciário: texto ou ícone sem card ao redor;
- altura padrão de 40 px no desktop e 34 px no cabeçalho;
- no celular, preserve alvo de toque de pelo menos 44 px para ações essenciais;
- rótulo descreve a ação: `Analisar plano`, `Ver JSON`, `Novo plano`.

### 12.2 Cards e painéis

- usar card somente quando o conteúdo for uma unidade independente;
- borda de 1 px e raio de até 8 px em superfícies funcionais;
- listas, índices, paginação e texto informativo preferem estrutura plana com espaço e separadores;
- sombra apenas em overlays ou quando for necessário comunicar sobreposição;
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
- `ElAlert` para pontos de atenção e heurísticas;
- estilos padrão sem mapear os tokens visuais do projeto.

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

O pgPlanDoctor usa um único tema escuro suave.

- não existe seletor nem preferência persistida;
- superfícies evitam preto puro e textos evitam branco puro;
- diálogos, popovers, editor e SVG usam os mesmos tokens;
- nenhuma informação depende apenas de cor.

## 16. Responsividade

### Desktop amplo

- contêiner externo de até 1360 px, alinhado entre cabeçalho e páginas;
- entrada e páginas informativas alinhadas ao mesmo contêiner do cabeçalho;
- grafo e ferramentas lado a lado;
- componentes não diminuem porque existe mais espaço.

### Notebook e tablet

- abaixo de aproximadamente 1024 px, áreas lado a lado podem empilhar;
- pontos de atenção podem ir abaixo do grafo ou permanecer recolhidos;
- tamanhos de fonte são preservados;
- grafo usa rolagem e zoom antes de reduzir os nós.

### Celular

- margens de 16 px;
- navegação do cabeçalho em segunda linha;
- ações podem ocupar a largura total;
- análise alterna entre fluxo e detalhes;
- alvos de toque de pelo menos 44 × 44 px.

## 17. Acessibilidade

- WCAG AA no tema adotado;
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
│   ├── PlanInput.vue
│   ├── PlanAnalysis.vue
│   ├── PlanTree.vue
│   ├── PlanNodeDetails.vue
│   ├── LearningIndex.vue
│   ├── LearningArticle.vue
│   ├── Glossary.vue
│   └── ProjectInfo.vue
├── content/
│   ├── learningContent.ts
│   └── glossaryContent.ts
├── composables/
│   ├── useRecentPlans.ts
│   └── usePlanSession.ts
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
- SVG usa variáveis CSS sempre que possível.

## 19. Processo de implementação

Para cada região:

1. compare a região com o cabeçalho e com os tokens globais;
2. registre estrutura, escala, alinhamento, borda e densidade;
3. adapte o conteúdo real do pgPlanDoctor;
4. implemente evitando decoração que não comunique função;
5. compare lado a lado na mesma resolução;
6. valide contraste e responsividade.

Não faça ajustes incrementais em uma região cuja estrutura ainda pertence à direção antiga. Substitua a composição inteira.

## 20. Critérios de aceite

Uma alteração visual só está concluída quando:

- [ ] a estrutura segue a linguagem compacta e plana estabelecida no cabeçalho;
- [ ] a página não parece dashboard administrativo ou interface de IA;
- [ ] não há texto promocional ou de preenchimento;
- [ ] cada frase informa algo necessário à tarefa;
- [ ] a largura do desktop é bem aproveitada;
- [ ] tipografia e controles são confortáveis a 100% de zoom;
- [ ] ações primária, secundária e terciária são distinguíveis;
- [ ] o tema escuro suave preserva hierarquia e contraste;
- [ ] o fluxo do plano permanece legível;
- [ ] evidência, interpretação e validação continuam separadas;
- [ ] parser, heurísticas e apresentação permanecem desacoplados.

Valide pelo menos em:

- 1920 × 1080;
- 1440 × 900;
- 1024 × 768;
- 390 × 844;
- tema escuro suave;
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
