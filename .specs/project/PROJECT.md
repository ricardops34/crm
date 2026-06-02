# CRM Comercial 360

## Vision

Construir um CRM comercial multiempresa integrado ao Protheus, com foco em operação diária de vendas, visão 360 do cliente e execução comercial orientada por carteira.

## Product Goal

Entregar a V1 com capacidade real de uso para vendedores, supervisores, gerentes e áreas de apoio, cobrindo:

- Home inicial por perfil
- MCV operacional
- Cliente 360
- Orçamentos integrados ao Protheus
- Financeiro do cliente
- Dashboard e metas
- Cadastros e parametrizações essenciais

## Business Context

- Empresas alvo iniciais: `RCG` e `CBA`
- Operação multiempresa com segregação por `empresa_id`
- Protheus é a autoridade final para cadastro mestre e validação comercial
- Portal deve continuar funcional com base sincronizada mesmo quando o ERP estiver indisponível

## Success Criteria

- Vendedor consegue navegar da Home ao MCV e abrir Cliente 360 da própria carteira
- Vendedor consegue criar e enviar orçamento com rastreabilidade
- Supervisor e gerente acompanham resultados e orçamentos conforme hierarquia
- Administrativo/Financeiro acessam cadastros e consultas da empresa com segregação correta
- Perfis e telas são aplicados dinamicamente no frontend

## Non-Goals for V1

- Leads, prospects e conversão
- Atendimentos e agenda de retorno
- Atualização cadastral de clientes
- Diretor comercial em operação de go-live

## Technology Constraints

- Frontend: Angular + PO-UI
- Backend: API REST
- Database: PostgreSQL
- Cache: Redis
- Documentation: Swagger / OpenAPI
- ERP: Protheus

