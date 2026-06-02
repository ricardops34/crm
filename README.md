# Visão 360

CRM comercial multiempresa para `RCG` e `CBA`, com frontend em `Angular + PO-UI`, backend REST em `NestJS`, banco `PostgreSQL`, cache `Redis` e integração com `Protheus`.

## Status

O projeto está em estruturação da V1, com documentação funcional e técnica já consolidada e base inicial de `frontend` e `backend` em andamento.

## Objetivo da V1

A V1 é focada em operação comercial diária e inclui:

- Home inicial por perfil
- MCV(Manutenção da Carteira de Vendas)
- Cliente 360
- Orçamentos integrados ao Via API
- Financeiro do cliente
- Dashboard e metas
- Cadastros e parametrizações essenciais

Fora da V1:

- Leads e prospects
- Atendimentos
- Atualização cadastral

## Stack

- Frontend: Angular 21 + PO-UI
- Backend: NestJS
- Banco: PostgreSQL
- Cache: Redis
- Armazenamento S3 compatível: MinIO em desenvolvimento
- Documentação de API: Swagger / OpenAPI
- Integração ERP: Via API

## Estrutura do Repositório

```text
.
├── backend/              # API REST em NestJS
├── frontend/             # Aplicação Angular + PO-UI
├── database/             # Scripts e inicialização local
├── docs/                 # Especificações técnicas por módulo
├── .specs/               # SDD da V1
├── po-ui/                # Referências e temas PO-UI
├── PRD.md                # Escopo funcional consolidado da V1
└── docker-compose.dev.yml
```

## Documentação Principal

- [PRD.md](./PRD.md): escopo funcional consolidado da V1
- [docs/auth-module.md](./docs/auth-module.md): autenticação e autorização
- [docs/perfis-module.md](./docs/perfis-module.md): perfis, telas e menu dinâmico
- [docs/parametros-module.md](./docs/parametros-module.md): parâmetros do sistema
- [.specs/project/PROJECT.md](./.specs/project/PROJECT.md): visão do projeto
- [.specs/features/v1-core/spec.md](./.specs/features/v1-core/spec.md): requisitos rastreáveis da V1
- [.specs/features/v1-core/design.md](./.specs/features/v1-core/design.md): desenho técnico da V1
- [.specs/features/v1-core/tasks.md](./.specs/features/v1-core/tasks.md): backlog técnico inicial da V1

## Ambiente de Desenvolvimento

Pré-requisitos:

- Node.js 22+
- npm
- Docker Desktop

Suba a infraestrutura local:

```bash
docker compose -f docker-compose.dev.yml up -d
```

Serviços previstos:

- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- MinIO API: `localhost:9000`
- MinIO Console: `localhost:9001`

## Como Rodar

### Backend

```bash
cd backend
npm install
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

Frontend padrão:

- `http://localhost:4200`

## Testes

### Backend

```bash
cd backend
npm test
npm run test:e2e
```

### Frontend

```bash
cd frontend
npm test
```

## Convenções

- Respeitar o escopo da V1 definido em `PRD.md`
- Tratar Protheus como autoridade final para regras comerciais e cadastro mestre
- Aplicar segregação multiempresa por `empresa_id`
- Aplicar controle de acesso por perfil e tela
- Não reintroduzir `leads` e `atendimentos` na V1 sem atualização formal da documentação

## Fluxo de Trabalho

Leia também:

- [CONTRIBUTING.md](./CONTRIBUTING.md)

