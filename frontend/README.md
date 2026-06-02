# Frontend - CRM Comercial 360

Aplicação `Angular + PO-UI` do CRM Comercial 360.

## Responsabilidades

- Login e shell principal do sistema
- Home inicial por perfil
- MCV
- Cliente 360
- Orçamentos
- Metas e dashboard
- Cadastros operacionais

## Stack

- Angular 21
- PO-UI
- TypeScript

## Scripts

```bash
npm install
npm start
npm run build
npm test
```

## Diretrizes de UI

- Usar PO-UI como base visual
- O menu deve ser montado dinamicamente a partir de `telas[]` do JWT
- O MCV deve priorizar grade e ações por linha
- O Cliente 360 deve usar navegação por abas
- A Home deve variar por perfil

## Escopo da V1

Inclui:

- Home
- MCV
- Cliente 360
- Orçamentos
- Financeiro
- Metas
- Dashboard
- Cadastros essenciais

Não inclui:

- Leads
- Atendimentos
- Atualização cadastral

## Referências

- [../PRD.md](../PRD.md)
- [../docs/perfis-module.md](../docs/perfis-module.md)
- [../docs/auth-module.md](../docs/auth-module.md)
- [../.specs/features/v1-core/spec.md](../.specs/features/v1-core/spec.md)
