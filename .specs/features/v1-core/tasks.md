# Tasks - v1-core

## Execution Strategy

Implementar a V1 por fatias técnicas e funcionais, começando por fundação, depois leitura comercial, depois fluxo de orçamento, e por fim dashboard/metas e cadastros.

## Task List

### T1 - Foundation and Access

What:
- Estruturar backend e frontend base da V1
- Implementar autenticação, perfis, empresas e resolução do contexto comercial

Where:
- Backend `auth`, `usuarios`, `perfis`, `empresas`, `estrutura-comercial`
- Frontend `auth`, `shell`, `menu`

Depends on:
- Nenhuma

Reuses:
- `docs/auth-module.md`
- `docs/perfis-module.md`
- `docs/parametros-module.md`

Done when:
- Login funciona
- Menu dinâmico respeita perfil
- Troca de empresa funciona
- Contexto comercial é resolvido via `usuario_id`

Tests:
- Autenticação válida/inválida
- Troca de empresa
- Guards por perfil/tela
- Escopo de carteira por perfil

Gate:
- Todas as rotas-base autenticadas protegem acesso corretamente

### T2 - Parameters and Operational Registries

What:
- Implementar parâmetros e cadastros operacionais da V1

Where:
- Backend `parametros`, `cadastros`
- Frontend `cadastros`

Depends on:
- T1

Reuses:
- `docs/parametros-module.md`

Done when:
- Admin/Diretor gerenciam parâmetros
- Administrativo gerencia cadastros operacionais

Tests:
- CRUD de cadastros-base
- Permissão por perfil
- Cache/invalidação de parâmetros

Gate:
- Cadastros e parâmetros seguem segregação funcional correta

### T3 - Home by Profile

What:
- Implementar Home inicial por perfil

Where:
- Frontend `home`
- Backend `home`

Depends on:
- T1

Reuses:
- `PRD.md` seção Home

Done when:
- Todos os perfis entram na Home
- Notícias, avisos, indicadores, atalhos e favoritos são exibidos

Tests:
- Render por perfil
- Segmentação por empresa e perfil

Gate:
- Home abre após login em todos os perfis válidos da V1

### T4 - Customer Read Model and Cliente 360 [P]

What:
- Implementar leitura local de clientes e Cliente 360

Where:
- Backend `clientes`, `financeiro`, `notas`, `mix`, `comodato`
- Frontend `clientes`, `cliente-360`

Depends on:
- T1

Reuses:
- `PRD.md` seções MCV e Cliente 360

Done when:
- Cliente 360 abre por abas
- Todas as abas da V1 consultiva retornam dados mínimos necessários

Tests:
- Detalhe por aba
- Filtro de empresa
- Filtro de carteira/hierarquia

Gate:
- Nenhuma aba consulta dados fora do escopo do usuário

### T5 - MCV [P]

What:
- Implementar MCV tabular com filtros rápidos e ações por linha

Where:
- Frontend `mcv`
- Backend `clientes` / `dashboard-read`

Depends on:
- T1
- T4

Reuses:
- `PRD.md` seção MCV

Done when:
- Grade do MCV carrega com colunas definidas
- Filtros rápidos funcionam
- Ações Cliente 360 e Financeiro abrem corretamente

Tests:
- Ordenação
- Filtros rápidos
- Situação visual e bloqueados

Gate:
- Vendedor vê apenas a própria carteira

### T6 - Quotations Core

What:
- Implementar criação, listagem, envio, cópia e rastreabilidade de orçamentos

Where:
- Backend `orcamentos`
- Frontend `orcamentos`

Depends on:
- T1
- T4

Reuses:
- `PRD.md` seções Orçamentos e Cliente 360/Aba Orçamentos

Done when:
- Vendedor cria orçamento
- Itens podem ser adicionados pelos três caminhos previstos
- Envio gera log
- Pós-envio fica imutável
- Reenvio acontece por cópia

Tests:
- Criação
- Montagem de item
- Avisos de exceção
- Cópia com novo sequencial
- Rastreabilidade original/cópia

Gate:
- Nenhum orçamento enviado volta a ser editável

### T7 - Commercial Proposal Builder

What:
- Implementar proposta comercial baseada em orçamento, com biblioteca de páginas, perfis de proposta, geração de PDF e aprovação

Where:
- Backend `propostas-comerciais`
- Frontend `propostas-comerciais`

Depends on:
- T2
- T6

Reuses:
- `PRD.md` seção Proposta Comercial
- `docs/proposta-comercial-module.md`

Done when:
- Usuário cria proposta a partir de orçamento
- Biblioteca de páginas e perfis de proposta funcionam
- PDF pode ser gerado antes da aprovação
- Aprovação trava a proposta e envia o orçamento ao Protheus

Tests:
- Criação vinculada ao orçamento
- Ordenação livre de páginas
- Geração de PDF
- Histórico de PDFs
- Aprovação com travamento e disparo do envio

Gate:
- Proposta nunca altera itens ou valores do orçamento

### T8 - Financeiro Read Flow

What:
- Implementar consultas de financeiro em aberto no Cliente 360

Where:
- Backend `financeiro`
- Frontend `cliente-360/financeiro`

Depends on:
- T4

Reuses:
- `PRD.md` seção Financeiro do Cliente

Done when:
- Aba Financeiro lista títulos em aberto com boleto
- Status vem exatamente do ERP/read model

Tests:
- Lista de títulos
- Exclusão de pagos
- Download/link de boleto

Gate:
- Não exibir títulos pagos na V1

### T9 - Goals and Executive Dashboard

What:
- Implementar metas, ranking e carteira sem compra

Where:
- Backend `metas`, `dashboard`
- Frontend `metas`, `dashboard`

Depends on:
- T1
- T4

Reuses:
- `PRD.md` seção Dashboard e Metas

Done when:
- Cadastro de metas funciona
- Visões por perfil respeitam escopo
- Painel executivo exibe os três blocos obrigatórios

Tests:
- Cálculo de percentual atingido
- Visão por perfil
- Ranking por percentual

Gate:
- Vendedor não vê metas de terceiros

### T10 - Protheus Integration Boundary

What:
- Formalizar adapters, contratos internos e jobs/processos de sincronização da V1

Where:
- Backend `integracao-protheus`

Depends on:
- T1

Reuses:
- `PRD.md`
- `design.md`

Done when:
- Existe boundary técnico único para sincronização e retorno de status ERP
- Contratos internos estão definidos por domínio

Tests:
- Parsing/mapeamento de payloads
- Reprocessamento
- Idempotência mínima

Gate:
- Nenhum módulo funcional chama integração Protheus diretamente sem passar pelo boundary

## Dependency Summary

- T1 é base para todas as demais
- T4 e T5 podem avançar em paralelo após T1
- T6 depende de T4
- T7 depende de T6 e T2
- T8 depende de T4
- T9 depende de T4
- T10 deve iniciar cedo para evitar acoplamento incorreto

## Recommended Implementation Order

1. T1
2. T2
3. T10
4. T4
5. T5
6. T6
7. T7
8. T8
9. T9
10. T3

## Verification Checklist

- [ ] Perfis e telas da V1 coerentes com PRD
- [ ] Exclusões da V1 respeitadas
- [ ] Multiempresa aplicada em leituras e operações
- [ ] Hierarquia comercial aplicada no backend
- [ ] Protheus mantido como autoridade final
- [ ] Fluxo de orçamento imutável após envio
- [ ] Proposta comercial vinculada ao orçamento e sem alterar itens/valores
- [ ] Cliente 360 cobre todas as abas consultivas mínimas
