# Contributing

## Antes de Codar

Leia nesta ordem:

1. [PRD.md](./PRD.md)
2. [docs/auth-module.md](./docs/auth-module.md)
3. [docs/perfis-module.md](./docs/perfis-module.md)
4. [docs/parametros-module.md](./docs/parametros-module.md)
5. [.specs/features/v1-core/spec.md](./.specs/features/v1-core/spec.md)
6. [.specs/features/v1-core/design.md](./.specs/features/v1-core/design.md)
7. [.specs/features/v1-core/tasks.md](./.specs/features/v1-core/tasks.md)

## Regras do Projeto

- Stack obrigatória: Angular + PO-UI, NestJS, PostgreSQL, Redis, Protheus
- A V1 não inclui `leads`, `atendimentos` e `atualização cadastral`
- Toda feature deve respeitar multiempresa por `empresa_id`
- Segurança real deve estar no backend, não só no frontend
- Protheus é a autoridade final para status e regras comerciais

## Branches e Commits

- Prefira branches curtas e focadas por tarefa
- Faça commits pequenos e rastreáveis
- Relacione mudanças à task da SDD quando aplicável, por exemplo `T5`, `T6`, `T8`

Exemplos:

- `feat: implementa login com contexto multiempresa`
- `feat: adiciona grade do MCV`
- `fix: corrige filtro de carteira por vendedor`

## Checklist de Mudança

Antes de abrir PR ou entregar a alteração:

- Confirme aderência ao `PRD.md`
- Atualize a documentação afetada se a decisão funcional/técnica mudou
- Rode os testes do escopo alterado
- Verifique impacto em perfis, empresas e integração com Protheus

## Quando Atualizar Documentação

Atualize a documentação sempre que mudar:

- escopo funcional da V1
- telas, perfis ou permissões
- autenticação/autorização
- parâmetros e cadastros
- contratos de integração
- comportamento de orçamento, financeiro, MCV ou Cliente 360

## Pendências Conhecidas

Ainda existem definições abertas para:

- modelo físico final das entidades
- contratos REST completos
- sincronização detalhada com Protheus
- catálogo final de status retornados pelo ERP

Evite “fechar no código” algo que ainda está marcado como decisão aberta na SDD.

