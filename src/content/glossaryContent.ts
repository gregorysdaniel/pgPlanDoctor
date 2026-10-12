import { computed } from 'vue'
import { locale } from '../i18n'

export type GlossaryCategory = 'planning' | 'execution' | 'operators' | 'metrics'

export interface GlossaryTerm {
  id: string
  term: string
  category: GlossaryCategory
  aliases?: string[]
  definition: string
  detail: string
}

export const glossaryCategoryOrder: GlossaryCategory[] = [
  'planning',
  'execution',
  'operators',
  'metrics',
]

const portugueseGlossaryTerms: GlossaryTerm[] = [
  {
    id: 'planner',
    term: 'Planner (otimizador)',
    category: 'planning',
    aliases: ['query planner', 'otimizador'],
    definition: 'Parte do PostgreSQL que avalia maneiras de executar uma consulta e escolhe um plano.',
    detail: 'A escolha usa estimativas de custo, quantidade de linhas e estatísticas. O plano escolhido é uma previsão feita antes da execução.',
  },
  {
    id: 'statistics',
    term: 'Estatísticas',
    category: 'planning',
    aliases: ['ANALYZE', 'planner statistics'],
    definition: 'Informações sobre a distribuição dos dados que ajudam o planner a estimar quantas linhas cada operação encontrará.',
    detail: 'O comando ANALYZE atualiza essas informações. Estatísticas desatualizadas ou insuficientes podem produzir estimativas distantes da execução real.',
  },
  {
    id: 'selectivity',
    term: 'Seletividade',
    category: 'planning',
    definition: 'Proporção das linhas que deve permanecer depois da aplicação de uma condição.',
    detail: 'Um filtro muito seletivo retorna uma parcela pequena da tabela; um filtro pouco seletivo mantém muitas linhas.',
  },
  {
    id: 'cardinality',
    term: 'Cardinalidade',
    category: 'planning',
    definition: 'Quantidade de linhas que uma operação estima ou efetivamente produz.',
    detail: 'Diferenças grandes de cardinalidade podem influenciar a escolha de scans, tipos de junção e ordem das operações.',
  },
  {
    id: 'cost',
    term: 'Custo',
    category: 'planning',
    aliases: ['startup cost', 'total cost'],
    definition: 'Estimativa interna usada pelo planner para comparar caminhos possíveis.',
    detail: 'Custo não representa milissegundos. Ele combina fatores configuráveis, como processamento de CPU e acesso a páginas de dados.',
  },
  {
    id: 'q-error',
    term: 'Q-error',
    category: 'planning',
    definition: 'Medida multiplicativa da diferença entre uma quantidade estimada e uma quantidade observada.',
    detail: 'Um q-error de 10 indica que uma quantidade ficou aproximadamente dez vezes acima ou abaixo da outra. Ele mede distância, não a causa do erro.',
  },
  {
    id: 'executor',
    term: 'Executor',
    category: 'execution',
    definition: 'Parte do PostgreSQL que percorre o plano escolhido e realiza suas operações.',
    detail: 'Quando EXPLAIN ANALYZE é usado, as linhas, os tempos e os loops observados são coletados durante essa execução.',
  },
  {
    id: 'execution-plan',
    term: 'Plano de execução',
    category: 'execution',
    aliases: ['query plan', 'explain plan'],
    definition: 'Estrutura hierárquica que descreve as operações escolhidas para produzir o resultado de uma consulta.',
    detail: 'As folhas normalmente acessam dados; os nós seguintes recebem e transformam essas linhas até chegar ao nó raiz.',
  },
  {
    id: 'node',
    term: 'Nó (operador)',
    category: 'execution',
    aliases: ['plan node', 'operator'],
    definition: 'Uma operação individual dentro da árvore do plano, como leitura, ordenação, junção ou agregação.',
    detail: 'Cada nó possui estimativas e, com ANALYZE, métricas observadas. Seus filhos fornecem as linhas que ele processa.',
  },
  {
    id: 'index',
    term: 'Índice',
    category: 'operators',
    definition: 'Estrutura auxiliar que pode localizar linhas sem percorrer toda a tabela.',
    detail: 'Índices ocupam espaço e adicionam trabalho às escritas. Sua utilidade depende das condições, da ordem das colunas e da distribuição dos dados.',
  },
  {
    id: 'seq-scan',
    term: 'Seq Scan',
    category: 'operators',
    aliases: ['sequential scan'],
    definition: 'Leitura sequencial das páginas de uma tabela.',
    detail: 'Pode ser adequada quando grande parte da tabela será lida ou quando não existe um índice útil. Não é um problema por si só.',
  },
  {
    id: 'index-scan',
    term: 'Index Scan',
    category: 'operators',
    definition: 'Operação que usa um índice para encontrar referências às linhas e depois consulta a tabela.',
    detail: 'Pode reduzir as linhas examinadas, mas acessos dispersos à tabela também possuem custo. O plano deve ser comparado no cenário real.',
  },
  {
    id: 'nested-loop',
    term: 'Nested Loop',
    category: 'operators',
    definition: 'Junção que procura correspondências no ramo interno para cada linha recebida do ramo externo.',
    detail: 'Funciona bem quando o lado externo é pequeno e a busca interna é eficiente. Muitos loops podem acumular trabalho relevante.',
  },
  {
    id: 'hash-join',
    term: 'Hash Join',
    category: 'operators',
    definition: 'Junção que cria uma tabela hash de um ramo e a consulta usando as linhas do outro.',
    detail: 'É comum em condições de igualdade. Memória disponível, volume de dados e estimativas influenciam seu comportamento.',
  },
  {
    id: 'merge-join',
    term: 'Merge Join',
    category: 'operators',
    definition: 'Junção que percorre dois conjuntos de linhas ordenados pelas chaves relacionadas.',
    detail: 'Pode aproveitar uma ordem já disponível ou exigir operações Sort antes da junção.',
  },
  {
    id: 'sort',
    term: 'Sort',
    category: 'operators',
    definition: 'Operação que organiza as linhas de acordo com uma ou mais chaves.',
    detail: 'A ordenação pode ocorrer em memória ou usar armazenamento temporário. Um índice compatível às vezes fornece a ordem necessária.',
  },
  {
    id: 'aggregate',
    term: 'Aggregate',
    category: 'operators',
    definition: 'Operação que agrupa ou resume linhas para calcular resultados agregados.',
    detail: 'COUNT, SUM e GROUP BY podem produzir diferentes estratégias de agregação conforme o plano.',
  },
  {
    id: 'estimated-actual-rows',
    term: 'Linhas estimadas e observadas',
    category: 'metrics',
    aliases: ['Plan Rows', 'Actual Rows'],
    definition: 'Plan Rows é a previsão do planner; Actual Rows é a média de linhas produzidas por execução do nó.',
    detail: 'Ao existir mais de um loop, considere também Actual Loops antes de comparar valores acumulados.',
  },
  {
    id: 'actual-total-time',
    term: 'Actual Total Time',
    category: 'metrics',
    definition: 'Tempo médio, em milissegundos, até o nó concluir uma execução.',
    detail: 'Com vários loops, multiplique o valor pelos loops para aproximar o tempo acumulado. Nós superiores normalmente incluem trabalho dos filhos.',
  },
  {
    id: 'loops',
    term: 'Loops',
    category: 'metrics',
    aliases: ['Actual Loops'],
    definition: 'Quantidade de vezes que um nó foi executado.',
    detail: 'Métricas reais de linhas e tempo são apresentadas como médias por execução; loops ajudam a estimar o trabalho total.',
  },
  {
    id: 'buffers',
    term: 'Buffers',
    category: 'metrics',
    aliases: ['shared hit', 'shared read', 'temp read', 'temp written'],
    definition: 'Contadores de blocos encontrados em memória, lidos, modificados ou usados em operações temporárias.',
    detail: 'Eles ajudam a distinguir trabalho de CPU de acesso a dados, mas devem ser interpretados junto com o ambiente e a repetição do teste.',
  },
  {
    id: 'rows-removed-by-filter',
    term: 'Rows Removed by Filter',
    category: 'metrics',
    definition: 'Média de linhas examinadas por execução que não passaram pelo filtro do nó.',
    detail: 'Um valor alto pode indicar leitura ampla para um resultado seletivo, mas deve ser avaliado com o tamanho da tabela, o tempo e os buffers.',
  },
]

const englishGlossaryTerms: GlossaryTerm[] = [
  {
    id: 'planner',
    term: 'Planner (optimizer)',
    category: 'planning',
    aliases: ['query planner', 'optimizer'],
    definition: 'The PostgreSQL component that evaluates ways to run a query and chooses a plan.',
    detail: 'Its choice uses cost estimates, row counts, and statistics. The selected plan is a forecast made before execution.',
  },
  {
    id: 'statistics',
    term: 'Statistics',
    category: 'planning',
    aliases: ['ANALYZE', 'planner statistics'],
    definition: 'Information about data distribution that helps the planner estimate how many rows each operation will find.',
    detail: 'The ANALYZE command updates this information. Outdated or insufficient statistics can produce estimates that differ substantially from observed row counts.',
  },
  {
    id: 'selectivity',
    term: 'Selectivity',
    category: 'planning',
    definition: 'The proportion of rows expected to remain after a condition is applied.',
    detail: 'A highly selective filter returns a small portion of the table; a low-selectivity filter keeps many rows.',
  },
  {
    id: 'cardinality',
    term: 'Cardinality',
    category: 'planning',
    definition: 'The number of rows an operation is estimated to produce or actually produces.',
    detail: 'Large differences between estimated and actual row counts can influence scan choices, join types, and operation order.',
  },
  {
    id: 'cost',
    term: 'Cost',
    category: 'planning',
    aliases: ['startup cost', 'total cost'],
    definition: 'An internal estimate used by the planner to compare possible paths.',
    detail: 'Cost is not measured in milliseconds. It combines configurable factors such as CPU processing and access to data pages.',
  },
  {
    id: 'q-error',
    term: 'Q-error',
    category: 'planning',
    definition: 'A multiplicative measure of the difference between an estimated and an observed quantity.',
    detail: 'A q-error of 10 indicates roughly a tenfold discrepancy between the estimated and observed quantities. It measures the size of the discrepancy, not its cause.',
  },
  {
    id: 'executor',
    term: 'Executor',
    category: 'execution',
    definition: 'The PostgreSQL component that walks through the chosen plan and performs its operations.',
    detail: 'When EXPLAIN ANALYZE is used, observed rows, times, and loops are collected during this execution.',
  },
  {
    id: 'execution-plan',
    term: 'Execution plan',
    category: 'execution',
    aliases: ['query plan', 'explain plan'],
    definition: 'A hierarchical structure describing the operations selected to produce a query result.',
    detail: 'Leaves usually access data; subsequent nodes receive and transform those rows until they reach the root node.',
  },
  {
    id: 'node',
    term: 'Node (operator)',
    category: 'execution',
    aliases: ['plan node', 'operator'],
    definition: 'An individual operation in the plan tree, such as a scan, sort, join, or aggregation.',
    detail: 'Each node has estimates and, with ANALYZE, observed metrics. Its children provide the rows it processes.',
  },
  {
    id: 'index',
    term: 'Index',
    category: 'operators',
    definition: 'An auxiliary structure that can locate rows without scanning the entire table.',
    detail: 'Indexes use storage and add write overhead. Their usefulness depends on conditions, column order, and data distribution.',
  },
  {
    id: 'seq-scan',
    term: 'Seq Scan',
    category: 'operators',
    aliases: ['sequential scan'],
    definition: 'A sequential read of a table’s pages.',
    detail: 'It may be appropriate when much of the table will be read or when no useful index exists. It is not a problem by itself.',
  },
  {
    id: 'index-scan',
    term: 'Index Scan',
    category: 'operators',
    definition: 'An operation that uses an index to find row references and then visits the table.',
    detail: 'It can reduce the number of rows examined, but accessing rows scattered across the table also has a cost. Plans should be compared in the actual workload context.',
  },
  {
    id: 'nested-loop',
    term: 'Nested Loop',
    category: 'operators',
    definition: 'A join that searches the inner branch for matches for every row received from the outer branch.',
    detail: 'It works well when the outer side is small and the inner lookup is efficient. Many loops can accumulate significant work.',
  },
  {
    id: 'hash-join',
    term: 'Hash Join',
    category: 'operators',
    definition: 'A join that builds a hash table from one branch and probes it with rows from the other.',
    detail: 'It is common for equality conditions. Available memory, data volume, and estimates influence its behavior.',
  },
  {
    id: 'merge-join',
    term: 'Merge Join',
    category: 'operators',
    definition: 'A join that walks through two sets of rows sorted by the join keys.',
    detail: 'It can reuse an existing order or require Sort operations before the join.',
  },
  {
    id: 'sort',
    term: 'Sort',
    category: 'operators',
    definition: 'An operation that orders rows using one or more keys.',
    detail: 'Sorting may happen in memory or use temporary storage. A compatible index can sometimes provide the required order.',
  },
  {
    id: 'aggregate',
    term: 'Aggregate',
    category: 'operators',
    definition: 'An operation that groups or summarizes rows to calculate aggregate results.',
    detail: 'COUNT, SUM, and GROUP BY can produce different aggregation strategies depending on the plan.',
  },
  {
    id: 'estimated-actual-rows',
    term: 'Estimated and actual rows',
    category: 'metrics',
    aliases: ['Plan Rows', 'Actual Rows'],
    definition: 'Plan Rows is the planner’s row estimate; Actual Rows is the average number of rows produced per node execution.',
    detail: 'When there is more than one loop, also consider Actual Loops before comparing accumulated values.',
  },
  {
    id: 'actual-total-time',
    term: 'Actual Total Time',
    category: 'metrics',
    definition: 'The average time, in milliseconds, for the node to complete one execution.',
    detail: 'With multiple loops, multiply it by the loop count to approximate accumulated time. Parent nodes usually include work from their children.',
  },
  {
    id: 'loops',
    term: 'Loops',
    category: 'metrics',
    aliases: ['Actual Loops'],
    definition: 'The number of times a node was executed.',
    detail: 'Actual row and time metrics are shown as averages per execution; loops help estimate total work.',
  },
  {
    id: 'buffers',
    term: 'Buffers',
    category: 'metrics',
    aliases: ['shared hit', 'shared read', 'temp read', 'temp written'],
    definition: 'Counts of blocks found in memory, read, modified, or used by temporary operations.',
    detail: 'They help distinguish CPU work from data access, but should be interpreted in the context of the environment and repeated measurements.',
  },
  {
    id: 'rows-removed-by-filter',
    term: 'Rows Removed by Filter',
    category: 'metrics',
    definition: 'The average number of rows examined per execution that did not pass the node’s filter.',
    detail: 'A high value can indicate a broad scan for a selective result, but should be evaluated alongside table size, time, and buffers.',
  },
]

export const glossaryTerms = computed(() =>
  locale.value === 'en' ? englishGlossaryTerms : portugueseGlossaryTerms,
)

export function findGlossaryTerm(id: string): GlossaryTerm | null {
  return glossaryTerms.value.find((term) => term.id === id) ?? null
}
