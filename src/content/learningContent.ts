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
  description: 'Visão geral oficial das etapas entre o recebimento da consulta e a execução do plano.',
}

const usingExplainReference: LearningReference = {
  label: 'PostgreSQL 17 — Using EXPLAIN',
  url: 'https://www.postgresql.org/docs/17/using-explain.html',
  description: 'Introdução oficial à estrutura dos planos, aos campos principais e ao EXPLAIN ANALYZE.',
}

const explainCommandReference: LearningReference = {
  label: 'PostgreSQL 17 — comando EXPLAIN',
  url: 'https://www.postgresql.org/docs/17/sql-explain.html',
  description: 'Sintaxe, opções disponíveis e cuidados ao executar o comando.',
}

const plannerStatisticsReference: LearningReference = {
  label: 'PostgreSQL 17 — Statistics Used by the Planner',
  url: 'https://www.postgresql.org/docs/17/planner-stats.html',
  description: 'Explicação oficial sobre as estatísticas usadas para estimar a quantidade de linhas.',
}

const portugueseLearningArticles: LearningArticle[] = [
  {
    slug: 'da-consulta-ao-plano',
    title: 'Da consulta ao plano',
    summary: 'Reconheça as etapas básicas percorridas por uma consulta no PostgreSQL.',
    sections: [
      {
        id: 'visao-geral',
        title: 'Visão geral',
        paragraphs: [
          'Antes de devolver um resultado, o PostgreSQL interpreta a consulta, prepara um plano e executa as operações descritas nesse plano.',
          'Depois que a consulta é analisada e reescrita, o planner considera caminhos que podem produzir o mesmo resultado. Ele estima o custo desses caminhos e entrega um plano ao executor, que percorre a árvore para buscar e processar as linhas.',
        ],
        source: queryPathReference,
      },
      {
        id: 'termos-principais',
        title: 'Termos para reconhecer',
        paragraphs: [
          'Ao estudar o caminho de uma consulta, estes termos aparecem com frequência:',
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
          'Quando existe um índice, por exemplo, o planner pode considerar uma leitura sequencial ou uma leitura pelo índice. A escolha depende das estimativas disponíveis para aquela consulta.',
          'O plano exibido pelo <code>EXPLAIN</code> é o caminho escolhido, não uma lista de todas as alternativas consideradas.',
        ],
        source: queryPathReference,
      },
      {
        id: 'perguntas-iniciais',
        title: 'Perguntas para orientar o estudo',
        paragraphs: [
          'Ao abrir um plano pela primeira vez, não é necessário entender todos os campos. Comece com perguntas simples:',
        ],
        bullets: [
          'Quais operadores aparecem na árvore?',
          'Quais nós produzem linhas para os nós seguintes?',
          'Quais valores são estimativas e quais foram observados na execução?',
        ],
      },
    ],
    references: [queryPathReference, usingExplainReference],
  },
  {
    slug: 'como-gerar-e-percorrer-um-plano',
    title: 'Como gerar e percorrer um plano',
    summary: 'Conheça o comando EXPLAIN e a estrutura básica de uma árvore de execução.',
    sections: [
      {
        id: 'explain-e-analyze',
        title: 'EXPLAIN e EXPLAIN ANALYZE',
        paragraphs: [
          '<code>EXPLAIN</code> mostra o plano criado pelo planner e os valores estimados para seus nós. A consulta não é executada apenas para produzir esse plano.',
          'A opção <code>ANALYZE</code> muda esse comportamento: o comando é executado e o resultado passa a incluir medidas como linhas e tempos observados.',
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
          'O PostgreSQL oferece formatos legíveis por programas, entre eles JSON. O comando abaixo combina a execução da consulta com esse formato de saída.',
          'A hierarquia do JSON preserva a relação entre os nós do plano e facilita o processamento por outras ferramentas.',
        ],
        code: 'EXPLAIN (ANALYZE, FORMAT JSON)\nSELECT ...;',
        source: explainCommandReference,
      },
      {
        id: 'arvore',
        title: 'A estrutura é uma árvore',
        paragraphs: [
          'Um plano é formado por nós. Os nós inferiores normalmente fornecem linhas para operações que aparecem acima deles, como junções, agregações ou ordenações.',
          'No exemplo abaixo, o <code>Seq Scan</code> produz linhas para o <code>Sort</code>; depois, o <code>Limit</code> recebe a saída ordenada.',
        ],
        code: 'Limit\n└─ Sort\n   └─ Seq Scan',
        bullets: [
          'Identifique primeiro os nós que acessam os dados.',
          'Observe qual nó recebe a saída de cada operação.',
          'Consulte a documentação do operador quando seu papel ainda não estiver claro.',
        ],
        source: usingExplainReference,
      },
    ],
    references: [explainCommandReference, usingExplainReference],
  },
  {
    slug: 'metricas-essenciais',
    title: 'Métricas essenciais',
    summary: 'Reconheça os campos básicos antes de aprofundar a análise de um plano.',
    sections: [
      {
        id: 'campos-principais',
        title: 'Campos para reconhecer',
        paragraphs: [
          'A documentação do EXPLAIN apresenta estimativas do planner e, quando <code>ANALYZE</code> é usado, valores observados na execução.',
          'A comparação entre essas duas perspectivas ajuda a verificar se o planner trabalhou com uma previsão próxima do que aconteceu.',
        ],
        bullets: [
          '<code>Plan Rows</code>: estimativa de linhas produzidas pelo nó.',
          '<code>Actual Rows</code>: linhas observadas durante a execução.',
          '<code>Actual Loops</code>: quantidade de execuções do nó.',
          '<code>Actual Total Time</code>: tempo informado para o nó.',
        ],
        source: usingExplainReference,
      },
      {
        id: 'loops',
        title: 'Quando um nó possui vários loops',
        paragraphs: [
          'Um nó pode ser executado mais de uma vez. Nesses casos, a documentação informa que os valores reais de linhas e tempo são apresentados como médias por execução.',
          'Para estimar o total associado ao nó, é necessário considerar também o valor de <code>Actual Loops</code>.',
        ],
        code: 'linhas por execução × loops = linhas acumuladas',
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
          'Os valores de <code>cost</code> são estimativas expressas nas unidades usadas pelo planner. Os valores de <code>actual time</code> são medidas da execução em milissegundos.',
          'Também é importante observar a posição do nó: valores de nós superiores podem refletir o trabalho realizado pelos nós filhos.',
        ],
        source: usingExplainReference,
      },
      {
        id: 'perguntas',
        title: 'Perguntas para orientar o estudo',
        paragraphs: [
          'Use estas perguntas como ponto de partida e consulte a documentação para interpretar os valores encontrados:',
        ],
        bullets: [
          'A quantidade estimada ficou próxima da quantidade observada?',
          'O nó foi executado mais de uma vez?',
          'Há linhas removidas por algum filtro?',
          'O valor observado pertence somente ao nó ou também inclui seus filhos?',
        ],
      },
    ],
    references: [usingExplainReference, plannerStatisticsReference],
  },
  {
    slug: 'heuristicas-nao-sao-diagnosticos',
    title: 'Heurísticas não são diagnósticos',
    summary: 'Use um sinal do plano como ponto de partida para uma investigação.',
    sections: [
      {
        id: 'papel-da-heuristica',
        title: 'O papel de uma heurística',
        paragraphs: [
          'Uma heurística chama atenção para uma combinação de valores no plano. Ela ajuda a formular uma pergunta, mas não determina sozinha a causa nem a melhor alteração.',
          'A própria documentação do PostgreSQL observa que números e estratégias podem variar conforme os dados, as estatísticas, a plataforma e a versão utilizada.',
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
        title: 'Separe evidência e hipótese',
        paragraphs: [
          'Registre primeiro o que está presente no plano. Depois formule uma hipótese que possa ser comparada em um ambiente controlado.',
        ],
        code: 'Evidência observada → hipótese → verificação',
        bullets: [
          'Evidência: valor ou relação encontrada no plano.',
          'Hipótese: explicação possível para aquele sinal.',
          'Verificação: comparação realizada antes e depois de uma alteração controlada.',
        ],
      },
      {
        id: 'antes-de-concluir',
        title: 'Antes de concluir',
        paragraphs: [
          'Quando um sinal envolver estimativas, formas de acesso ou operadores específicos, consulte a seção correspondente na documentação antes de formular uma conclusão.',
          'As estimativas dependem das estatísticas disponíveis. Mesmo atualizadas, elas continuam sendo aproximações usadas pelo planner para tomar decisões antes da execução.',
        ],
        bullets: [
          'A consulta continua produzindo o mesmo resultado?',
          'Os dados e parâmetros da comparação foram mantidos?',
          'A documentação da versão utilizada foi consultada?',
          'Outros custos da alteração também foram considerados?',
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
  description: 'Official overview of the stages between receiving a query and executing its plan.',
}

const usingExplainReferenceEn: LearningReference = {
  label: 'PostgreSQL 17 — Using EXPLAIN',
  url: 'https://www.postgresql.org/docs/17/using-explain.html',
  description: 'Official introduction to plan structure, key fields, and EXPLAIN ANALYZE.',
}

const explainCommandReferenceEn: LearningReference = {
  label: 'PostgreSQL 17 — EXPLAIN command',
  url: 'https://www.postgresql.org/docs/17/sql-explain.html',
  description: 'Syntax, available options, and precautions when running the command.',
}

const plannerStatisticsReferenceEn: LearningReference = {
  label: 'PostgreSQL 17 — Statistics Used by the Planner',
  url: 'https://www.postgresql.org/docs/17/planner-stats.html',
  description: 'Official explanation of the statistics used to estimate row counts.',
}

const englishLearningArticles: LearningArticle[] = [
  {
    slug: 'da-consulta-ao-plano',
    title: 'From query to plan',
    summary: 'Recognize the basic stages a query goes through in PostgreSQL.',
    sections: [
      {
        id: 'visao-geral',
        title: 'Overview',
        paragraphs: [
          'Before returning a result, PostgreSQL interprets the query, prepares a plan, and runs the operations described by that plan.',
          'After the query is parsed and rewritten, the planner considers paths that can produce the same result. It estimates their cost and hands a plan to the executor, which walks the tree to retrieve and process rows.',
        ],
        source: queryPathReferenceEn,
      },
      {
        id: 'termos-principais',
        title: 'Terms to recognize',
        paragraphs: ['These terms appear frequently when studying the path of a query:'],
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
          'When an index exists, for example, the planner may consider a sequential scan or an index scan. The choice depends on the estimates available for that query.',
          'The plan shown by <code>EXPLAIN</code> is the selected path, not a list of every alternative considered.',
        ],
        source: queryPathReferenceEn,
      },
      {
        id: 'perguntas-iniciais',
        title: 'Questions to guide your study',
        paragraphs: ['You do not need to understand every field when opening a plan for the first time. Start with simple questions:'],
        bullets: [
          'Which operators appear in the tree?',
          'Which nodes produce rows for the next nodes?',
          'Which values are estimates and which were observed?',
        ],
      },
    ],
    references: [queryPathReferenceEn, usingExplainReferenceEn],
  },
  {
    slug: 'como-gerar-e-percorrer-um-plano',
    title: 'How to generate and read a plan',
    summary: 'Learn the EXPLAIN command and the basic structure of an execution tree.',
    sections: [
      {
        id: 'explain-e-analyze',
        title: 'EXPLAIN and EXPLAIN ANALYZE',
        paragraphs: [
          '<code>EXPLAIN</code> shows the plan created by the planner and the estimated values for its nodes. The query is not run merely to produce this plan.',
          'The <code>ANALYZE</code> option changes this behavior: the command is run and the output includes measurements such as observed rows and times.',
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
          'PostgreSQL provides machine-readable formats, including JSON. The command below combines query execution with this output format.',
          'The JSON hierarchy preserves the relationship between plan nodes and makes programmatic processing easier.',
        ],
        code: 'EXPLAIN (ANALYZE, FORMAT JSON)\nSELECT ...;',
        source: explainCommandReferenceEn,
      },
      {
        id: 'arvore',
        title: 'The structure is a tree',
        paragraphs: [
          'A plan is made of nodes. Lower nodes usually provide rows to operations above them, such as joins, aggregates, or sorts.',
          'In the example below, the <code>Seq Scan</code> produces rows for the <code>Sort</code>; the <code>Limit</code> then receives the sorted output.',
        ],
        code: 'Limit\n└─ Sort\n   └─ Seq Scan',
        bullets: [
          'First identify the nodes that access data.',
          'Observe which node receives each operation’s output.',
          'Consult the operator documentation when its role is still unclear.',
        ],
        source: usingExplainReferenceEn,
      },
    ],
    references: [explainCommandReferenceEn, usingExplainReferenceEn],
  },
  {
    slug: 'metricas-essenciais',
    title: 'Essential metrics',
    summary: 'Recognize the basic fields before going deeper into plan analysis.',
    sections: [
      {
        id: 'campos-principais',
        title: 'Fields to recognize',
        paragraphs: [
          'EXPLAIN documentation presents planner estimates and, when <code>ANALYZE</code> is used, values observed during execution.',
          'Comparing these perspectives helps determine whether the planner worked with a forecast close to what actually happened.',
        ],
        bullets: [
          '<code>Plan Rows</code>: estimated rows produced by the node.',
          '<code>Actual Rows</code>: rows observed during execution.',
          '<code>Actual Loops</code>: number of node executions.',
          '<code>Actual Total Time</code>: time reported for the node.',
        ],
        source: usingExplainReferenceEn,
      },
      {
        id: 'loops',
        title: 'When a node has several loops',
        paragraphs: [
          'A node may run more than once. In these cases, the documentation states that actual row and time values are shown as averages per execution.',
          'To estimate the total associated with the node, you must also consider <code>Actual Loops</code>.',
        ],
        code: 'rows per execution × loops = accumulated rows',
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
          '<code>cost</code> values are estimates expressed in planner units. <code>actual time</code> values are execution measurements in milliseconds.',
          'Node position also matters: values on higher nodes may reflect work performed by their children.',
        ],
        source: usingExplainReferenceEn,
      },
      {
        id: 'perguntas',
        title: 'Questions to guide your study',
        paragraphs: ['Use these questions as a starting point and consult the documentation to interpret the values you find:'],
        bullets: [
          'Was the estimate close to the observed row count?',
          'Did the node run more than once?',
          'Were rows removed by a filter?',
          'Does the observed value belong only to this node or also include its children?',
        ],
      },
    ],
    references: [usingExplainReferenceEn, plannerStatisticsReferenceEn],
  },
  {
    slug: 'heuristicas-nao-sao-diagnosticos',
    title: 'Heuristics are not diagnoses',
    summary: 'Use a plan signal as the starting point for an investigation.',
    sections: [
      {
        id: 'papel-da-heuristica',
        title: 'The role of a heuristic',
        paragraphs: [
          'A heuristic draws attention to a combination of values in the plan. It helps formulate a question but does not determine the cause or the best change by itself.',
          'PostgreSQL documentation notes that numbers and strategies may vary with data, statistics, platform, and version.',
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
        title: 'Separate evidence from hypothesis',
        paragraphs: ['First record what is present in the plan. Then formulate a hypothesis that can be compared in a controlled environment.'],
        code: 'Observed evidence → hypothesis → verification',
        bullets: [
          'Evidence: a value or relationship found in the plan.',
          'Hypothesis: a possible explanation for that signal.',
          'Verification: a comparison made before and after a controlled change.',
        ],
      },
      {
        id: 'antes-de-concluir',
        title: 'Before reaching a conclusion',
        paragraphs: [
          'When a signal involves estimates, access methods, or specific operators, consult the matching documentation section before drawing a conclusion.',
          'Estimates depend on available statistics. Even when current, they remain approximations used by the planner before execution.',
        ],
        bullets: [
          'Does the query still produce the same result?',
          'Were the data and comparison parameters kept unchanged?',
          'Was the documentation for the version in use consulted?',
          'Were other costs of the change also considered?',
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
