<script setup lang="ts">
interface HeuristicValidation {
  id: string
  heuristic: string
  comparison: string
}

const feedbackFormUrl = import.meta.env.VITE_FEEDBACK_FORM_URL
const benchmarkGithubUrl = import.meta.env.VITE_BENCHMARK_GITHUB_URL

const heuristicValidations: HeuristicValidation[] = [
  {
    id: 'R01',
    heuristic: 'Estimativa de linhas divergente',
    comparison: 'Estimativa sem considerar a relação entre colunas → estatísticas que representam essa relação',
  },
  {
    id: 'R02',
    heuristic: 'Leitura ampla para filtro seletivo',
    comparison: 'Leitura completa da tabela → busca direcionada por um índice',
  },
  {
    id: 'R03',
    heuristic: 'Índice com filtro residual',
    comparison: 'Índice atende somente parte do filtro → índice atende as condições combinadas',
  },
  {
    id: 'R04',
    heuristic: 'Função aplicada no filtro',
    comparison: 'Índice no valor original → índice compatível com a expressão usada no filtro',
  },
  {
    id: 'R05',
    heuristic: 'Ordenação ampla antes de LIMIT',
    comparison: 'Ordenação após uma leitura ampla → índice entrega as linhas na ordem solicitada',
  },
  {
    id: 'R06',
    heuristic: 'Trabalho interno repetido',
    comparison: 'Leitura ampla repetida no ramo interno → índice reduz o trabalho de cada repetição',
  },
]
</script>

<template>
  <main class="project-info">
    <article class="project-info__document">
      <header class="project-info__header">
        <h1>Sobre o pgPlanDoctor</h1>
        <p>
          O pgPlanDoctor é uma ferramenta didática para apoiar estudantes e desenvolvedores
          iniciantes na interpretação de planos de execução do PostgreSQL. A saída de
          <code>EXPLAIN (ANALYZE, FORMAT JSON)</code> é organizada como uma árvore interativa,
          permitindo acompanhar o caminho dos dados e consultar as métricas de cada operador.
        </p>
        <p class="project-info__feedback-prompt">
          Encontrou algo confuso, uma informação incorreta ou uma dificuldade de uso?
          <a :href="feedbackFormUrl" target="_blank" rel="noopener noreferrer">
            Envie um feedback.
          </a>
        </p>
      </header>

      <section>
        <h2>Como a análise funciona</h2>
        <p>
          O JSON é processado localmente no navegador e não é enviado a um servidor. A visualização
          relaciona os operadores e apresenta linhas estimadas, linhas produzidas, descartes,
          repetições e tempo acumulado.
        </p>
        <p>
          Um ponto de atenção indica onde vale investigar. Ele não comprova sozinho a causa de um
          problema nem garante que a alteração sugerida será melhor.
        </p>
      </section>

      <section>
        <h2>Validação das heurísticas</h2>
        <p>
          Cada uma das seis heurísticas foi avaliada em um benchmark próprio. A mesma consulta foi
          executada antes e depois de uma alteração controlada, mantendo o conjunto de dados e os
          parâmetros da comparação.
        </p>

        <div class="validation-table" tabindex="0" aria-label="Comparações do benchmark">
          <table>
            <thead>
              <tr>
                <th>Regra</th>
                <th>Heurística</th>
                <th>Comparação realizada</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in heuristicValidations" :key="item.id">
                <td><code>{{ item.id }}</code></td>
                <td>{{ item.heuristic }}</td>
                <td>{{ item.comparison }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="project-info__note">
          O protocolo completo, os scripts, as medições e os planos coletados permanecem na
          documentação do benchmark.
        </p>
        <a
          class="project-info__external-link"
          :href="benchmarkGithubUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          Ver benchmark no GitHub
        </a>
      </section>

      <section>
        <h2>Limites</h2>
        <p>
          Os experimentos verificam o comportamento das regras em cenários controlados. Bancos com
          outros volumes, distribuições, índices e cargas de trabalho podem produzir resultados
          diferentes. Por isso, qualquer alteração deve ser comparada no ambiente em que será usada.
        </p>
      </section>

    </article>
  </main>
</template>
