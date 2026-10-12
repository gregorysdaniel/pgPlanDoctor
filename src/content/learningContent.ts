import { computed } from 'vue'
import { locale } from '../i18n'

export interface LearningCallout {
  title: string
  text: string
  tone?: 'attention' | 'information'
}

export interface LearningReference {
  label: string
  url: string
  description?: string
}

export interface LearningSection {
  id: string
  title: string
  paragraphs: string[]
  bullets?: string[]
  code?: string
  callout?: LearningCallout
  source?: LearningReference
}

export interface LearningArticle {
  slug: string
  title: string
  summary: string
  sections: LearningSection[]
  references: LearningReference[]
}

const queryPathReference: LearningReference = {
  label: 'PostgreSQL 17 — The Path of a Query',
  url: 'https://www.postgresql.org/docs/17/query-path.html',
  description: 'Visão geral das etapas da consulta e dos papéis do parser, da reescrita, do planner e do executor.',
}

const usingExplainReference: LearningReference = {
  label: 'PostgreSQL 17 — Using EXPLAIN',
  url: 'https://www.postgresql.org/docs/17/using-explain.html',
  description: 'Exemplos para aprofundar a leitura da árvore, das estimativas e dos valores observados na execução.',
}

const explainCommandReference: LearningReference = {
  label: 'PostgreSQL 17 — comando EXPLAIN',
  url: 'https://www.postgresql.org/docs/17/sql-explain.html',
  description: 'Referência de sintaxe, opções como ANALYZE e FORMAT e cuidados ao executar o comando.',
}

const plannerStatisticsReference: LearningReference = {
  label: 'PostgreSQL 17 — Statistics Used by the Planner',
  url: 'https://www.postgresql.org/docs/17/planner-stats.html',
  description: 'Explicação das estatísticas usadas nas estimativas de linhas, incluindo a seção Single-Column Statistics.',
}

const portugueseLearningArticles: LearningArticle[] = [
  {
    slug: 'da-consulta-ao-plano',
    title: 'Da consulta ao plano',
    summary: 'Uma visão inicial das etapas de uma consulta e da relação entre planejamento e execução.',
    sections: [
      {
        id: 'visao-geral',
        title: 'Visão geral',
        paragraphs: [
          'Antes de devolver um resultado, o PostgreSQL interpreta a consulta, prepara um plano e executa as operações descritas nesse plano. O planejamento e a execução têm responsabilidades diferentes nesse caminho.',
          'Depois que a consulta é analisada e reescrita, o planner estima os custos dos caminhos disponíveis e escolhe um plano. O executor percorre esse plano para buscar e processar as linhas.',
        ],
        source: queryPathReference,
      },
      {
        id: 'termos-principais',
        title: 'Termos para reconhecer',
        paragraphs: [
          'As descrições abaixo oferecem um primeiro contato com os termos usados para explicar cada etapa:',
        ],
        bullets: [
          '<strong>Parser:</strong> verifica a sintaxe e cria uma representação da consulta.',
          '<strong>Sistema de reescrita:</strong> aplica regras antes do planejamento.',
          '<strong>Planner ou otimizador:</strong> prepara o plano que será entregue ao executor.',
          '<strong>Executor:</strong> percorre o plano e realiza suas operações.',
        ],
        source: queryPathReference,
      },
      {
        id: 'caminhos-possiveis',
        title: 'Um resultado pode ter caminhos diferentes',
        paragraphs: [
          'Quando existe um índice, o planner pode considerar uma leitura sequencial ou uma leitura por índice. A escolha depende dos custos estimados para os caminhos disponíveis; a existência do índice, por si só, não determina seu uso.',
          'O <code>EXPLAIN</code> mostra o plano escolhido. Observar o operador que acessa os dados em um exemplo pode ajudar a entender como as linhas chegam às operações seguintes.',
        ],
        source: queryPathReference,
      },
      {
        id: 'perguntas-iniciais',
        title: 'Perguntas que podem ajudar',
        paragraphs: [
          'Algumas perguntas podem apoiar a leitura de um plano e indicar pontos que merecem mais atenção:',
        ],
        bullets: [
          'Qual é a responsabilidade do planner e qual é a do executor?',
          'Quais operadores acessam os dados no plano observado?',
          'Por que o caminho escolhido pode mudar mesmo quando a consulta busca o mesmo resultado?',
        ],
      },
    ],
    references: [queryPathReference, usingExplainReference],
  },
  {
    slug: 'como-gerar-e-percorrer-um-plano',
    title: 'Como gerar e percorrer um plano',
    summary: 'Uma introdução ao EXPLAIN, à saída JSON e às relações entre os nós de um plano.',
    sections: [
      {
        id: 'explain-e-analyze',
        title: 'EXPLAIN e EXPLAIN ANALYZE',
        paragraphs: [
          'O <code>EXPLAIN</code> mostra o plano criado pelo planner e seus valores estimados. Com a opção <code>ANALYZE</code>, a consulta também é executada e a saída inclui medidas como linhas, tempos e loops observados.',
          'Comparar as duas saídas de uma mesma consulta de leitura, em um ambiente de estudo, pode tornar mais clara a distinção entre previsão e execução.',
        ],
        callout: {
          title: 'ANALYZE executa o comando',
          text: 'Consulte as orientações oficiais antes de usá-lo com comandos que alteram dados. Prefira um ambiente seguro para estudo.',
          tone: 'attention',
        },
        source: explainCommandReference,
      },
      {
        id: 'formato-json',
        title: 'Saída em JSON',
        paragraphs: [
          'A opção <code>FORMAT JSON</code> produz uma saída que pode ser processada por ferramentas. O campo <code>Node Type</code> identifica o operador e a lista <code>Plans</code>, quando presente, reúne seus nós filhos.',
          'O modelo abaixo combina esse formato com <code>ANALYZE</code>; <code>SELECT ...</code> representa a consulta de leitura a ser analisada. A saída pode ser aberta na ferramenta, e os exemplos disponíveis também permitem explorar a relação entre o JSON e a árvore sem gerar um plano próprio.',
        ],
        code: 'EXPLAIN (ANALYZE, FORMAT JSON)\nSELECT ...;',
        source: explainCommandReference,
      },
      {
        id: 'arvore',
        title: 'A estrutura é uma árvore',
        paragraphs: [
          'Um plano é formado por nós ligados em uma árvore. Os nós que acessam os dados fornecem linhas para outras operações, como ordenações, junções ou agregações.',
          'No esquema abaixo, o <code>Seq Scan</code> fornece linhas ao <code>Sort</code>, e o <code>Limit</code> recebe a saída ordenada. Acompanhar essas relações pode ajudar a entender o papel de cada operação.',
        ],
        code: 'Limit\n└─ Sort\n   └─ Seq Scan',
        bullets: [
          'Quais nós acessam os dados e quais transformam as linhas recebidas?',
          'Qual operação recebe a saída de cada nó?',
          'Que relação existe entre os nós filhos no JSON e as conexões da árvore?',
        ],
        source: usingExplainReference,
      },
    ],
    references: [explainCommandReference, usingExplainReference],
  },
  {
    slug: 'metricas-essenciais',
    title: 'Métricas essenciais',
    summary: 'Conceitos e pontos de atenção para interpretar estimativas, linhas, loops e tempos.',
    sections: [
      {
        id: 'campos-principais',
        title: 'Campos para reconhecer',
        paragraphs: [
          'Um plano com <code>ANALYZE</code> reúne estimativas do planner e medidas da execução. Comparar <code>Plan Rows</code> e <code>Actual Rows</code> do mesmo nó ajuda a observar a proximidade entre a previsão e o que ocorreu.',
          'Essa comparação depende do contexto. A estimativa considera o consumo completo do nó, enquanto um <code>LIMIT</code> acima dele pode interrompê-lo antes do fim. Entre os campos básicos estão:',
        ],
        bullets: [
          '<code>Plan Rows</code>: estimativa de linhas produzidas pelo nó.',
          '<code>Actual Rows</code>: média de linhas produzidas por execução do nó.',
          '<code>Actual Loops</code>: quantidade de execuções do nó.',
          '<code>Actual Total Time</code>: tempo médio por execução do nó, em milissegundos.',
        ],
        source: usingExplainReference,
      },
      {
        id: 'loops',
        title: 'Quando um nó possui vários loops',
        paragraphs: [
          'Um nó pode ser executado mais de uma vez. Nesses casos, as linhas e os tempos reais são apresentados como médias por execução. A multiplicação por <code>Actual Loops</code> permite estimar os valores acumulados, com as limitações de precisão da saída.',
          'Por exemplo, 2 linhas por execução em 10 loops correspondem a aproximadamente 20 linhas acumuladas.',
        ],
        code: 'linhas por execução × loops ≈ linhas acumuladas\ntempo por execução × loops ≈ tempo acumulado',
        callout: {
          title: 'Compare valores na mesma escala',
          text: 'Um valor por execução não deve ser comparado diretamente com outro valor já acumulado.',
          tone: 'information',
        },
        source: usingExplainReference,
      },
      {
        id: 'custo-e-tempo',
        title: 'Custo e tempo são medidas diferentes',
        paragraphs: [
          'Os custos são estimativas nas unidades usadas pelo planner; os tempos reais são medidas em milissegundos. Por isso, <code>Total Cost</code> e <code>Actual Total Time</code> não representam a mesma grandeza.',
          'O tempo de um nó inclui o trabalho dos filhos, e somar os tempos pode contar esse trabalho mais de uma vez. Na ferramenta, o tempo relativo à raiz também usa tempos que incluem os filhos: ele ajuda a localizar pontos de atenção, mas não representa o tempo exclusivo do operador.',
        ],
        source: usingExplainReference,
      },
      {
        id: 'perguntas',
        title: 'Perguntas que podem ajudar',
        paragraphs: [
          'Estas perguntas oferecem pontos de partida para interpretar as medidas, considerando a escala dos valores e o contexto do plano:',
        ],
        bullets: [
          'A estimativa ficou próxima das linhas reais por execução? Há um LIMIT que possa afetar essa leitura?',
          'O valor observado é por execução ou já está acumulado?',
          'Há linhas removidas por filtro, indicadas por Rows Removed by Filter?',
          'O tempo inclui o trabalho de outros nós?',
        ],
      },
    ],
    references: [usingExplainReference, plannerStatisticsReference],
  },
  {
    slug: 'heuristicas-nao-sao-diagnosticos',
    title: 'Heurísticas não são diagnósticos',
    summary: 'Como os sinais do plano podem apoiar uma investigação, considerando o contexto e as limitações da análise.',
    sections: [
      {
        id: 'papel-da-heuristica',
        title: 'O papel de uma heurística',
        paragraphs: [
          'Uma heurística destaca uma combinação de valores que pode merecer atenção. Esse sinal ajuda a levantar perguntas, mas a causa e a utilidade de uma possível alteração dependem da consulta, dos dados e do ambiente.',
          'Os sinais abaixo são exemplos de pontos para investigação. As indicações da ferramenta podem ajudar a localizá-los e a levantar explicações possíveis.',
        ],
        bullets: [
          'Diferença entre linhas estimadas e observadas.',
          'Muitas linhas examinadas para produzir poucas linhas.',
          'Um nó executado repetidas vezes.',
        ],
        source: usingExplainReference,
      },
      {
        id: 'evidencia-e-hipotese',
        title: 'Evidência e hipótese',
        paragraphs: [
          'Uma diferença entre linhas estimadas e reais é uma observação do plano. Uma possível relação com as estatísticas é uma hipótese, que ainda depende de outras informações para ser avaliada.',
          'Separar essas duas ideias pode ajudar a evitar conclusões apressadas. Uma forma de organizar a investigação é relacionar a evidência a uma explicação possível e a uma comparação que permita avaliar essa explicação:',
        ],
        code: 'Evidência observada → hipótese → verificação',
        bullets: [
          'Evidência: valores ou relações observados no plano.',
          'Hipótese: uma explicação possível para o sinal encontrado.',
          'Verificação: uma comparação controlada que possa sustentar ou enfraquecer a hipótese.',
        ],
      },
      {
        id: 'antes-de-concluir',
        title: 'Antes de concluir',
        paragraphs: [
          'O contexto da consulta importa na avaliação de um sinal. Mesmo estatísticas atualizadas produzem aproximações, e uma diferença isolada não explica todo o comportamento observado.',
          'As perguntas abaixo podem apoiar uma investigação e a avaliação de sugestões da ferramenta:',
        ],
        bullets: [
          'Que evidência sustenta a hipótese e que resultado faria você reconsiderá-la?',
          'Os dados e parâmetros são comparáveis? A consulta continua produzindo o mesmo resultado?',
          'O que a documentação da versão utilizada informa sobre esse comportamento?',
          'Que outros custos uma possível alteração pode introduzir?',
        ],
        source: plannerStatisticsReference,
      },
    ],
    references: [usingExplainReference, plannerStatisticsReference],
  },
]

const queryPathReferenceEn: LearningReference = {
  label: 'PostgreSQL 17 — The Path of a Query',
  url: 'https://www.postgresql.org/docs/17/query-path.html',
  description: 'Overview of query stages and the roles of the parser, rewrite system, planner, and executor.',
}

const usingExplainReferenceEn: LearningReference = {
  label: 'PostgreSQL 17 — Using EXPLAIN',
  url: 'https://www.postgresql.org/docs/17/using-explain.html',
  description: 'Examples for exploring plan trees, estimates, and values observed during execution.',
}

const explainCommandReferenceEn: LearningReference = {
  label: 'PostgreSQL 17 — EXPLAIN command',
  url: 'https://www.postgresql.org/docs/17/sql-explain.html',
  description: 'Reference for syntax, options such as ANALYZE and FORMAT, and execution precautions.',
}

const plannerStatisticsReferenceEn: LearningReference = {
  label: 'PostgreSQL 17 — Statistics Used by the Planner',
  url: 'https://www.postgresql.org/docs/17/planner-stats.html',
  description: 'Explanation of statistics used in row estimates, including Single-Column Statistics.',
}

const englishLearningArticles: LearningArticle[] = [
  {
    slug: 'da-consulta-ao-plano',
    title: 'From query to plan',
    summary: 'An initial overview of query stages and the relationship between planning and execution.',
    sections: [
      {
        id: 'visao-geral',
        title: 'Overview',
        paragraphs: [
          'Before returning a result, PostgreSQL interprets the query, prepares a plan, and executes the operations described in that plan. Planning and execution have different responsibilities along this path.',
          'After the query is parsed and rewritten, the planner estimates the costs of available paths and chooses a plan. The executor walks that plan to retrieve and process rows.',
        ],
        source: queryPathReferenceEn,
      },
      {
        id: 'termos-principais',
        title: 'Terms to recognize',
        paragraphs: ['The descriptions below offer an initial introduction to the terms used to explain each stage:'],
        bullets: [
          '<strong>Parser:</strong> checks the syntax and builds a representation of the query.',
          '<strong>Rewrite system:</strong> applies rules before planning.',
          '<strong>Planner or optimizer:</strong> prepares the plan delivered to the executor.',
          '<strong>Executor:</strong> walks the plan and performs its operations.',
        ],
        source: queryPathReferenceEn,
      },
      {
        id: 'caminhos-possiveis',
        title: 'One result can have different paths',
        paragraphs: [
          'When an index exists, the planner may consider a sequential scan or an index scan. Its choice depends on the estimated costs of the available paths; the presence of an index alone does not determine its use.',
          '<code>EXPLAIN</code> shows the chosen plan. Observing the data access operator in an example can help explain how rows reach subsequent operations.',
        ],
        source: queryPathReferenceEn,
      },
      {
        id: 'perguntas-iniciais',
        title: 'Questions that may help',
        paragraphs: ['Some questions can support plan reading and suggest points that deserve closer attention:'],
        bullets: [
          'What is the planner responsible for, and what is the executor responsible for?',
          'Which operators access data in the observed plan?',
          'Why might the chosen path change even when the query seeks the same result?',
        ],
      },
    ],
    references: [queryPathReferenceEn, usingExplainReferenceEn],
  },
  {
    slug: 'como-gerar-e-percorrer-um-plano',
    title: 'How to generate and read a plan',
    summary: 'An introduction to EXPLAIN, JSON output, and relationships between plan nodes.',
    sections: [
      {
        id: 'explain-e-analyze',
        title: 'EXPLAIN and EXPLAIN ANALYZE',
        paragraphs: [
          '<code>EXPLAIN</code> shows the plan created by the planner and its estimated values. With the <code>ANALYZE</code> option, the query is also executed and the output includes observed measurements such as rows, times, and loops.',
          'Comparing both outputs for the same read query in a study environment can clarify the distinction between prediction and execution.',
        ],
        callout: {
          title: 'ANALYZE runs the command',
          text: 'Check the official guidance before using it with commands that change data. Prefer a safe study environment.',
          tone: 'attention',
        },
        source: explainCommandReferenceEn,
      },
      {
        id: 'formato-json',
        title: 'JSON output',
        paragraphs: [
          'The <code>FORMAT JSON</code> option produces output that tools can process. The <code>Node Type</code> field identifies the operator, and the <code>Plans</code> list, when present, contains its child nodes.',
          'The template below combines this format with <code>ANALYZE</code>; <code>SELECT ...</code> represents the read query to be analyzed. The output can be opened in the tool, and the available examples also let you explore the relationship between JSON and the tree without generating your own plan.',
        ],
        code: 'EXPLAIN (ANALYZE, FORMAT JSON)\nSELECT ...;',
        source: explainCommandReferenceEn,
      },
      {
        id: 'arvore',
        title: 'The structure is a tree',
        paragraphs: [
          'A plan consists of nodes connected in a tree. Nodes that access data supply rows to other operations, such as sorts, joins, or aggregates.',
          'In the diagram below, <code>Seq Scan</code> supplies rows to <code>Sort</code>, and <code>Limit</code> receives the sorted output. Following these relationships can help explain the role of each operation.',
        ],
        code: 'Limit\n└─ Sort\n   └─ Seq Scan',
        bullets: [
          'Which nodes access data, and which transform the rows they receive?',
          'Which operation receives the output of each node?',
          'How do child nodes in JSON relate to the connections in the tree?',
        ],
        source: usingExplainReferenceEn,
      },
    ],
    references: [explainCommandReferenceEn, usingExplainReferenceEn],
  },
  {
    slug: 'metricas-essenciais',
    title: 'Essential metrics',
    summary: 'Concepts and points to consider when interpreting estimates, rows, loops, and times.',
    sections: [
      {
        id: 'campos-principais',
        title: 'Fields to recognize',
        paragraphs: [
          'A plan with <code>ANALYZE</code> combines planner estimates with execution measurements. Comparing <code>Plan Rows</code> and <code>Actual Rows</code> for the same node helps show how close the prediction was to what happened.',
          'This comparison depends on context. The estimate assumes complete consumption of the node, whereas a <code>LIMIT</code> above it may stop consumption early. Basic fields include:',
        ],
        bullets: [
          '<code>Plan Rows</code>: estimated rows produced by the node.',
          '<code>Actual Rows</code>: average rows produced per node execution.',
          '<code>Actual Loops</code>: number of node executions.',
          '<code>Actual Total Time</code>: average time per node execution, in milliseconds.',
        ],
        source: usingExplainReferenceEn,
      },
      {
        id: 'loops',
        title: 'When a node has several loops',
        paragraphs: [
          'A node may execute more than once. In that case, actual rows and times are reported as averages per execution. Multiplying by <code>Actual Loops</code> gives an estimate of accumulated values, subject to the precision of the output.',
          'For example, 2 rows per execution over 10 loops correspond to approximately 20 accumulated rows.',
        ],
        code: 'rows per execution × loops ≈ accumulated rows\ntime per execution × loops ≈ accumulated time',
        callout: {
          title: 'Compare values on the same scale',
          text: 'A per-execution value should not be compared directly with an already accumulated value.',
          tone: 'information',
        },
        source: usingExplainReferenceEn,
      },
      {
        id: 'custo-e-tempo',
        title: 'Cost and time are different measures',
        paragraphs: [
          'Costs are estimates in the units used by the planner; actual times are measurements in milliseconds. Therefore, <code>Total Cost</code> and <code>Actual Total Time</code> represent different quantities.',
          'A node’s time includes work performed by its children, and adding times can count that work more than once. In the tool, time relative to the root also uses times that include children: it helps locate points of interest, but does not represent the operator’s exclusive time.',
        ],
        source: usingExplainReferenceEn,
      },
      {
        id: 'perguntas',
        title: 'Questions that may help',
        paragraphs: ['These questions offer starting points for interpreting measurements, considering the scale of the values and the context of the plan:'],
        bullets: [
          'Was the estimate close to actual rows per execution? Could a LIMIT affect this interpretation?',
          'Is the observed value per execution or already accumulated?',
          'Are there rows removed by a filter, indicated by Rows Removed by Filter?',
          'Does the time include work performed by other nodes?',
        ],
      },
    ],
    references: [usingExplainReferenceEn, plannerStatisticsReferenceEn],
  },
  {
    slug: 'heuristicas-nao-sao-diagnosticos',
    title: 'Heuristics are not diagnoses',
    summary: 'How plan signals can support an investigation, considering context and the limits of the analysis.',
    sections: [
      {
        id: 'papel-da-heuristica',
        title: 'The role of a heuristic',
        paragraphs: [
          'A heuristic highlights a combination of values that may deserve attention. That signal helps raise questions, but its cause and the usefulness of a possible change depend on the query, data, and environment.',
          'The signals below are examples of points to investigate. The tool’s indications can help locate them and raise possible explanations.',
        ],
        bullets: [
          'A difference between estimated and observed rows.',
          'Many rows examined to produce only a few rows.',
          'A node executed repeatedly.',
        ],
        source: usingExplainReferenceEn,
      },
      {
        id: 'evidencia-e-hipotese',
        title: 'Evidence and hypothesis',
        paragraphs: [
          'A difference between estimated and actual rows is an observation from the plan. A possible relationship with statistics is a hypothesis that still depends on other information for evaluation.',
          'Separating these ideas can help avoid premature conclusions. One way to organize an investigation is to relate the evidence to a possible explanation and a comparison that could evaluate it:',
        ],
        code: 'Observed evidence → hypothesis → verification',
        bullets: [
          'Evidence: values or relationships observed in the plan.',
          'Hypothesis: a possible explanation for the signal found.',
          'Verification: a controlled comparison that could support or weaken the hypothesis.',
        ],
      },
      {
        id: 'antes-de-concluir',
        title: 'Before reaching a conclusion',
        paragraphs: [
          'The query context matters when evaluating a signal. Even current statistics produce approximations, and an isolated difference does not explain all the observed behavior.',
          'The questions below can support an investigation and the evaluation of the tool’s suggestions:',
        ],
        bullets: [
          'What evidence supports the hypothesis, and which result would make you reconsider it?',
          'Are the data and parameters comparable? Does the query still produce the same result?',
          'What does the documentation for the version in use say about this behavior?',
          'Which other costs could a possible change introduce?',
        ],
        source: plannerStatisticsReferenceEn,
      },
    ],
    references: [usingExplainReferenceEn, plannerStatisticsReferenceEn],
  },
]

export const learningArticles = computed(() =>
  locale.value === 'en' ? englishLearningArticles : portugueseLearningArticles,
)

export function findLearningArticle(slug: string | null): LearningArticle | null {
  if (!slug) return null
  return learningArticles.value.find((article) => article.slug === slug) ?? null
}

export function getAdjacentLearningArticles(article: LearningArticle): {
  previous: LearningArticle | null
  next: LearningArticle | null
} {
  const index = learningArticles.value.findIndex((candidate) => candidate.slug === article.slug)

  return {
    previous: learningArticles.value[index - 1] ?? null,
    next: learningArticles.value[index + 1] ?? null,
  }
}
