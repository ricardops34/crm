# Design - v1-core

## Design Goal

Definir a arquitetura funcional e técnica mínima para implementar a V1 do CRM Comercial 360 com Angular + PO-UI no frontend e API REST com PostgreSQL + Redis no backend, preservando integração forte com Protheus.

## System Decomposition

### Frontend Modules

- `auth`
- `home`
- `mcv`
- `clientes` / `cliente-360`
- `orcamentos`
- `propostas-comerciais`
- `metas`
- `financeiro`
- `cadastros`
- `shared`

### Backend Domains

- `auth`
- `usuarios`
- `perfis`
- `parametros`
- `empresas`
- `estrutura-comercial`
- `clientes`
- `financeiro`
- `orcamentos`
- `propostas-comerciais`
- `metas`
- `dashboard`
- `integracao-protheus`

## Architectural Decisions

### AD-001 Multiempresa

- Toda entidade funcional deve carregar `empresa_id` quando aplicável
- Contexto de empresa ativa deve vir do token e do seletor de empresa
- Consultas devem sempre aplicar filtro de empresa antes de regras hierárquicas

### AD-002 Access Control

- Login próprio com JWT
- Perfil define telas disponíveis
- Resolução do contexto comercial deve partir do cadastro do vendedor via `usuario_id`
- Backend deve aplicar filtro de carteira/hierarquia; frontend não é fonte de segurança

### AD-003 ERP Authority

- Protheus é a autoridade final para cadastro mestre, crédito, estoque, desconto e status do orçamento
- Portal pode antecipar avisos e experiência operacional, mas não decisões finais

### AD-004 Cached Operational Read Model

- Dados operacionais consumidos pelo usuário devem preferir leitura local em PostgreSQL
- Redis deve ser usado para cache de parâmetros, perfil/telas e consultas frequentes
- Integração com Protheus deve alimentar e reconciliar o modelo local

## Main Flows

### Flow 1 - Login and Context Resolution

1. Usuário faz login por e-mail/senha
2. Backend valida credenciais e perfil
3. Backend resolve empresas permitidas
4. Backend resolve vínculo comercial via `usuario_id`
5. Backend emite JWT com perfil, telas e empresa ativa
6. Frontend monta menu lateral dinamicamente

### Flow 2 - MCV to Cliente 360

1. Usuário abre Home
2. Vendedor acessa MCV
3. Backend retorna grade com clientes já filtrados por carteira/empresa
4. Usuário aciona Cliente 360 ou Financeiro por ícone
5. Frontend abre Cliente 360 na aba correspondente

### Flow 3 - Quotation Lifecycle

1. Vendedor cria orçamento
2. Backend monta rascunho com tabela padrão do cliente
3. Usuário inclui itens via busca, histórico ou mix
4. Portal avisa exceções locais, sem bloquear por política ERP
5. Usuário envia orçamento
6. Orçamento fica imutável
7. Protheus aceita ou rejeita
8. Se rejeitado, usuário cria cópia com novo sequencial e reenvia

### Flow 4 - Dashboard and Goals

1. Backend consolida metas e faturamento por empresa/perfil/período
2. Frontend mostra visão filtrada conforme perfil
3. Ranking e carteira sem compra usam leitura local consolidada

### Flow 5 - Commercial Proposal from Quotation

1. Usuário acessa um orçamento existente
2. Usuário cria uma proposta comercial vinculada ao orçamento
3. Sistema carrega perfil de proposta, páginas padrão e dados comerciais do orçamento
4. Usuário seleciona páginas, ordena a proposta e ajusta textos livres
5. Sistema gera PDF com aparência final
6. Usuário aprova a proposta
7. Sistema trava a proposta e dispara o envio do orçamento ao Protheus

## Data Design - Logical View

### Core Aggregates

- `Usuario`
- `Perfil`
- `Empresa`
- `Vendedor`
- `Cliente`
- `ClienteFinanceiroSnapshot`
- `ClienteMixSnapshot`
- `ClienteComodatoSnapshot`
- `NotaFiscalSnapshot`
- `Orcamento`
- `OrcamentoItem`
- `OrcamentoEnvioLog`
- `PropostaComercial`
- `PropostaComercialPagina`
- `PropostaComercialPdfHistorico`
- `PerfilProposta`
- `MetaMensalVendedor`
- `Parametro`
- `HomeAviso`
- `HomeAtalhoFavorito`

### Required Supporting Relations

- `usuario_empresas`
- `perfil_telas`
- `orcamento_origem`
- `orcamento_relacao_copia`
- `proposta_comercial_orcamento`

## API Design Guidelines

- REST por domínio
- DTOs específicos para lista e detalhe
- Endpoints de leitura do Cliente 360 desacoplados por aba quando o payload for pesado
- Endpoints de dashboard devem receber `empresa_id`, período e contexto opcional de vendedor
- Endpoint de envio de orçamento deve produzir log e estado imutável
- Propostas comerciais devem ter endpoints próprios para composição, ordenação de páginas, geração de PDF e aprovação

## UI Design Guidelines

- PO-UI como base
- MCV em `po-table` com ações por linha
- Cliente 360 em layout com abas
- Home em layout modular por perfil
- Menu construído por `telas[]` do JWT
- Proposta comercial deve usar builder de páginas com biblioteca reutilizável

## Risks and Mitigations

### R-001 Sync Ambiguity with Protheus

Risco:
- Não há contrato detalhado de integração ainda

Mitigação:
- Implementar `integracao-protheus` como boundary explícito
- Isolar adapters, mapeamentos e estados de reconciliação

### R-002 Scope Drift

Risco:
- Reintrodução indevida de leads/atendimentos na V1

Mitigação:
- Manter exclusões explícitas na spec e no catálogo de telas

### R-003 Hierarchical Security Bugs

Risco:
- Filtragem incorreta por carteira/hierarquia

Mitigação:
- Centralizar resolução do escopo comercial no backend
- Cobrir com testes de autorização por perfil

## Open Design Decisions

- `DD-001` esquema físico final de snapshots e tabelas transacionais
- `DD-002` estratégia de sincronização full vs incremental por domínio
- `DD-003` formato final dos payloads de status de orçamento/financeiro
- `DD-004` separação entre módulo `clientes` e `cliente-360` nas rotas finais
- `DD-005` modelo visual final das páginas da proposta comercial
- `DD-006` regras finais de numeração e identificação da proposta comercial
