# Backend - CRM Comercial 360

API REST do CRM Comercial 360, construída com `NestJS`.

## Responsabilidades

- Autenticação e autorização
- Perfis, telas e contexto multiempresa
- Integração com PostgreSQL e Redis
- Exposição dos domínios da V1
- Boundary de integração com Protheus

## Stack

- NestJS 11
- TypeORM
- PostgreSQL
- Redis
- JWT
- Swagger

## Scripts

```bash
npm install
npm run start:dev
npm run build
npm test
npm run test:e2e
```

## Módulos Esperados na V1

- `auth`
- `usuarios`
- `perfis`
- `parametros`
- `empresas`
- `estrutura-comercial`
- `clientes`
- `financeiro`
- `orcamentos`
- `metas`
- `dashboard`
- `integracao-protheus`

## Decisões Importantes

- O vínculo comercial principal é resolvido via `usuario_id` no cadastro do vendedor
- O backend é responsável pela filtragem por empresa, carteira e hierarquia
- O Protheus é autoridade final para validação comercial e status

## Referências

- [../PRD.md](../PRD.md)
- [../docs/auth-module.md](../docs/auth-module.md)
- [../docs/perfis-module.md](../docs/perfis-module.md)
- [../docs/parametros-module.md](../docs/parametros-module.md)
- [../.specs/features/v1-core/design.md](../.specs/features/v1-core/design.md)

