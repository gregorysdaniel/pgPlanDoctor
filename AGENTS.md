# Orientações para agentes

## Projeto

O pgPlanDoctor é uma aplicação Vue 3 e TypeScript para analisar e visualizar planos de execução do PostgreSQL. O processamento acontece no navegador. A interface, os artigos e o glossário estão disponíveis em português e inglês.

Consulte o `README.md` para execução e publicação e `docs/architecture.md` para o funcionamento da aplicação.

## Organização

- `src/domain/plan.ts`: modelo do plano.
- `src/domain/planParser.ts`: validação e conversão do JSON.
- `src/domain/heuristics.ts`: regras de investigação.
- `src/router/index.ts`: rotas, guardas, títulos e rolagem.
- `src/views/`: coordenação das páginas.
- `src/components/`: componentes da interface.
- `src/composables/usePlanSession.ts`: plano e entrada da sessão.
- `src/composables/useRecentPlans.ts`: histórico local.
- `src/i18n/index.ts`: mensagens e estado do idioma.
- `src/content/`: artigos e glossário nos dois idiomas.
- `src/data/`: exemplos de planos.
- `src/styles.css`: tokens e estilos globais.

Mantenha a validação e as heurísticas no domínio. O D3 calcula o layout de uma árvore já convertida. Use o Vue Router para navegação e os composables para o estado compartilhado.

## Convenções

- Use TypeScript e componentes Vue com `<script setup lang="ts">`.
- Siga o estilo existente: dois espaços, aspas simples no TypeScript e ausência de ponto e vírgula.
- Adicione mensagens de interface em português e inglês no módulo de localização.
- Preserve os slugs e identificadores entre idiomas.
- Formate números e datas com `Intl` no idioma ativo.
- Mantenha termos de operadores, relações, índices e expressões conforme o plano original.
- Reserve comentários para decisões, limitações e casos que o código não explica por si só.
- Concentre instruções para agentes neste arquivo. O README e a documentação devem descrever o produto, sua operação e sua arquitetura.
- Siga o padrão dos commits existentes: mensagens curtas em inglês e minúsculas.

## Planos e métricas

- Preserve as entradas aceitas pelo parser: array com um documento, objeto com `Plan` ou operador raiz isolado.
- Exija `Node Type`, `Plan Rows`, `Actual Rows`, `Actual Loops` e `Actual Total Time`.
- Valide os campos opcionais quando presentes; aceite zero e rejeite números negativos, não finitos e textos no lugar de números.
- Preserve os valores por execução. Multiplique por loops somente nos totais calculados.
- Mantenha custos separados de tempos e buffers separados de métricas por execução.
- Não multiplique contadores de buffers por loops. Diferencie contadores ausentes de contadores informados como zero.
- Identifique operadores com zero loops como não executados.
- Preserve os caminhos do JSON nas mensagens de erro e IDs únicos dos operadores na árvore.
- Mantenha o processamento e os planos recentes no navegador. O histórico tem limite de dez planos e deduplica pelo JSON original.

## Heurísticas

Preserve os identificadores R01 a R06 e a correspondência com as descrições e o benchmark. Ao alterar uma regra, atualize também os textos de acionamento e validação.

| Regra | Condição atual |
|---|---|
| R01 | q-error ≥ 10; as quantidades estimada e observada têm piso de 1 no cálculo |
| R02 | Seq Scan sem função reconhecida no filtro, ao menos 1.000 linhas descartadas e descarte ≥ 80% |
| R03 | Index Scan com ao menos 1.000 linhas descartadas e descarte ≥ 80% |
| R04 | Seq Scan com função reconhecida no filtro, ao menos 1.000 linhas descartadas e descarte ≥ 80% |
| R05 | Limit com filho Sort direto; entradas do Sort ≥ 1.000 e ≥ 10 vezes as linhas produzidas pelo Limit |
| R06 | Ramo interno de Nested Loop com ao menos 10 loops e tempo acumulado ≥ 10 ms |

R02, R03 e R04 usam linhas acumuladas com loops. Cada achado conserva o operador de origem. Um operador pode produzir vários achados.

Apresente evidência, interpretação, próximo passo e forma de validação separadamente. As regras indicam pontos de investigação; sugestões precisam ser confirmadas por medição no banco.

## Interface

- Preserve o tema escuro único, a composição compacta e as superfícies planas.
- Reutilize os tokens de `src/styles.css` para cores, espaçamento, tipografia e dimensões.
- Use fonte de sistema na interface, Poppins na marca e JetBrains Mono em código e dados técnicos.
- Mantenha o contêiner compartilhado de até 1360 px nas páginas; a análise aproveita a largura disponível.
- Use azul para ações, foco e seleção; laranja para pontos de atenção; vermelho para erros.
- Represente tempo relativo com a escala sequencial cinza–azul existente.
- Use Phosphor Icons e os componentes do Element Plus já adotados, com os tokens do projeto.
- Escreva textos que expliquem entradas, métricas, evidências, ações ou limites concretos.
- Preserve rótulos acessíveis, foco visível, navegação por teclado, contraste e suporte a movimento reduzido.
- Mantenha controles essenciais com alvos de toque de pelo menos 44 px no celular.

### Entrada

Mantenha o aviso de execução acima do editor, o seletor de exemplos no cabeçalho do campo e os planos recentes abaixo da entrada. Carregar um exemplo preenche e focaliza o editor; a análise começa pela ação explícita de analisar. Preserve a sincronização da numeração e a rolagem horizontal de linhas longas. Erros devem ficar associados ao campo sem apagar a entrada.

### Análise

Preserve o fluxo horizontal das folhas à esquerda para o resultado à direita. O nó virtual de resultado pertence somente à visualização.

Mantenha expansão local dos operadores, abas condicionais, expressões completas e separação entre valores observados, estimados e totais. A expansão considera as dimensões reais dos nós e preserva a posição do operador acionado.

O zoom altera a transformação geométrica, mantendo o conteúdo. Preserve pan, ajuste à tela, ajuste para leitura e retorno a 100%.

O painel de pontos de atenção fica à esquerda e alterna entre lista e detalhe. Trocar de achado no mesmo operador ou recolher o painel preserva a câmera. Selecionar um achado na lista centraliza seu operador.

### Conteúdos e informações

Use a documentação oficial do PostgreSQL 17 como referência principal para artigos e glossário. Mantenha os artigos independentes da navegação da ferramenta, com exemplos pequenos e referências ligadas às seções correspondentes.

Na página Sobre, preserve a descrição do processamento local, as condições das heurísticas, os limites da análise e os links de feedback e benchmark.

## Validação e publicação

- Use Node.js 22.12 ou superior. O workflow de publicação usa Node.js 24.
- Execute `npm run build` e `git diff --check` após as alterações.
- Ao alterar o domínio, confira os exemplos e os casos afetados, incluindo zeros, campos ausentes e múltiplos achados.
- Para alterações visuais, confira desktop, tablet e celular, além de foco, abas, expansão e zoom quando afetados.
- O projeto não possui um script de testes automatizados. Não declare testes que não foram executados.
- Preserve o build estático, o roteamento por hash e o suporte ao caminho base do GitHub Pages.
- `VITE_FEEDBACK_FORM_URL` e `VITE_BENCHMARK_GITHUB_URL` são opcionais; os links padrão funcionam com valores ausentes ou vazios.
- Mantenha `dist/`, `node_modules/`, `.env` e arquivos `*.tsbuildinfo` fora do versionamento.
