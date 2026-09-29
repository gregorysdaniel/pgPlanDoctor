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

export const learningArticles: LearningArticle[] = [
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

export function findLearningArticle(slug: string | null): LearningArticle | null {
  if (!slug) return null
  return learningArticles.find((article) => article.slug === slug) ?? null
}

export function getAdjacentLearningArticles(article: LearningArticle): {
  previous: LearningArticle | null
  next: LearningArticle | null
} {
  const index = learningArticles.findIndex((candidate) => candidate.slug === article.slug)

  return {
    previous: learningArticles[index - 1] ?? null,
    next: learningArticles[index + 1] ?? null,
  }
}
