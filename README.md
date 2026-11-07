# pgPlanDoctor

O pgPlanDoctor é uma ferramenta web gratuita para visualizar e interpretar planos de execução do PostgreSQL. O projeto é voltado a estudantes e desenvolvedores iniciantes que querem entender como uma consulta é executada e investigar possíveis problemas de desempenho.

**[Acessar o pgPlanDoctor](https://gregorysdaniel.github.io/pgPlanDoctor/)**

## Sobre o projeto

Um plano de execução mostra as operações escolhidas pelo PostgreSQL para executar uma consulta, como leituras de tabelas, uso de índices, ordenações e junções. Interpretar essas operações e suas métricas pode ser difícil para quem está começando.

A proposta do pgPlanDoctor é reunir o plano em uma árvore interativa, explicações dos termos e dicas ligadas às informações observadas. Assim, é possível acompanhar o fluxo dos dados, comparar estimativas com resultados reais e consultar o que vale investigar em cada ponto de atenção.

## Recursos disponíveis

- **Árvore interativa:** expanda as operações, consulte seus detalhes e use os controles de zoom e arraste para percorrer o plano.
- **Métricas por operação:** compare linhas estimadas e observadas, tempos, número de execuções e, quando disponíveis, condições e buffers.
- **Seis heurísticas:** encontre pontos de atenção relacionados a estimativas de linhas, filtragem, índices, ordenação e trabalho repetido em junções.
- **Explicações e dicas:** consulte a informação observada, sua interpretação, uma sugestão e a orientação para conferir o resultado.
- **Exemplos e histórico:** experimente os planos disponíveis e reabra as dez últimas análises salvas no navegador.
- **Materiais de apoio:** acesse artigos e um glossário pesquisável, com interface e conteúdos em português e inglês.

## Como usar

1. [Abra a aplicação](https://gregorysdaniel.github.io/pgPlanDoctor/) e selecione um dos exemplos ou informe o JSON de um plano próprio.
2. Acione a análise para abrir a árvore de execução.
3. Expanda as operações para consultar suas métricas e selecione os pontos de atenção para ler as dicas.
4. Consulte as explicações e os [materiais de apoio](https://gregorysdaniel.github.io/pgPlanDoctor/#/aprender) durante a análise.

Para obter um plano próprio, execute no PostgreSQL um comando como o exemplo abaixo, substituindo o `SELECT` pela consulta que deseja analisar:

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT * FROM sua_tabela WHERE id = 1;
```

A opção `ANALYZE` executa a consulta para coletar as métricas. Copie a saída JSON e informe esse conteúdo na aplicação.

## Processamento e histórico

O plano é analisado no próprio navegador, sem envio do JSON a um servidor e sem conexão da ferramenta com o banco de dados. O usuário gera o plano no PostgreSQL e escolhe o que investigar a partir da análise.

O histórico também fica no navegador utilizado. As dez últimas análises podem ser reabertas enquanto esses dados locais estiverem disponíveis; limpar os dados do site remove o histórico.

## Heurísticas e benchmark

As heurísticas relacionam as informações do plano a situações que merecem investigação. Cada dica apresenta o motivo de seu acionamento e uma orientação para comparar o efeito de uma possível alteração no banco.

As sugestões são estudadas em cenários controlados, comparando consultas antes e depois de alterações como a criação de índices ou a atualização de estatísticas. O programa de benchmark é separado da aplicação web.

Os cenários, scripts, planos e medições estão no repositório **[pgPlanDoctor-benchmark](https://github.com/gregorysdaniel/pgPlanDoctor-benchmark)**.

## Desenvolvimento e documentação

O projeto foi desenvolvido como parte do Trabalho de Conclusão de Curso em Engenharia de Computação da Universidade do Vale do Itajaí (UNIVALI).

A aplicação utiliza Vue 3 e TypeScript, com D3 para posicionar os nós da árvore e Element Plus nos componentes da interface. O funcionamento dos componentes, do processamento e do histórico está descrito na [documentação de arquitetura](docs/architecture.md).

Para relatar dificuldades ou sugerir melhorias, utilize o [formulário de feedback](https://docs.google.com/forms/d/e/1FAIpQLSeXqZDfLya7yDvoR3p8gYea43z7M2ohOUgiCvCSDI2hL43VxA/viewform).

## Executar localmente

Para executar uma cópia local, utilize **Node.js 22.12 ou superior**. Na pasta do projeto:

```bash
npm ci
npm run dev
```

Abra o endereço indicado pelo Vite no terminal.

Para gerar e conferir o build de produção:

```bash
npm run build
npm run preview
```

Os links de feedback e benchmark já têm endereços padrão. Caso queira substituí-los na cópia local, crie um arquivo `.env` com as variáveis opcionais `VITE_FEEDBACK_FORM_URL` e `VITE_BENCHMARK_GITHUB_URL`.
