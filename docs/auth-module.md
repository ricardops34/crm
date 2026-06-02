# MÃ³dulo de AutenticaÃ§Ã£o â€” CRM Comercial 360

## VisÃ£o Geral

AutenticaÃ§Ã£o por e-mail + senha, com emissÃ£o de JWT (8h). Perfil do usuÃ¡rio define
quais telas ele pode acessar â€” essa lista Ã© carregada no token e usada pelo Angular
para montar o menu lateral dinamicamente.

---

## Tipos de UsuÃ¡rio

| Tipo | DescriÃ§Ã£o | Vinculado ao ERP? |
|---|---|---|
| **Sistema** | Admin, Diretor e gestores internos | NÃ£o |
| **Vendedor** | Vendedor/Supervisor/Gerente ligados ao cadastro de vendedores | Sim (`usuario_id` no cadastro do vendedor) |

O vÃ­nculo entre autenticaÃ§Ã£o e operaÃ§Ã£o comercial deve partir do cadastro do vendedor,
que armazena o `usuario_id`. A partir desse relacionamento, o CRM identifica o usuÃ¡rio
logado na estrutura comercial e aplica filtros automÃ¡ticos de carteira, metas e dados
relacionados sem que cada mÃ³dulo precise repetir essa lÃ³gica.

---

## Modelo de Dados

### Tabela `usuarios`

| Coluna | Tipo | DescriÃ§Ã£o |
|---|---|---|
| `id` | uuid PK | â€” |
| `nome` | varchar(150) | Nome completo |
| `email` | varchar(200) UNIQUE | Credencial de login |
| `senha_hash` | varchar(255) | bcrypt, rounds: 12 |
| `perfil_id` | uuid FK â†’ `perfis` | Perfil do usuÃ¡rio (substitui enum de role) |
| `ativo` | boolean | Soft disable sem deletar |
| `primeiro_acesso` | boolean | `true` forÃ§a troca de senha no prÃ³ximo login |
| `reset_token` | varchar(255) nullable | Token para redefiniÃ§Ã£o de senha |
| `reset_token_expira` | timestamp nullable | Validade de 2 horas apÃ³s geraÃ§Ã£o |
| `criado_em` | timestamp | â€” |
| `atualizado_em` | timestamp | â€” |

### Tabela `usuario_empresas` (N:N)

| Coluna | Tipo | DescriÃ§Ã£o |
|---|---|---|
| `usuario_id` | uuid FK | â€” |
| `empresa_id` | integer FK | â€” |
| PK | `(usuario_id, empresa_id)` | â€” |

Um usuÃ¡rio tem um **Ãºnico perfil** (global). As empresas que ele pode acessar ficam
nesta tabela. O Diretor terÃ¡ [RCG, CBA]; demais usuÃ¡rios terÃ£o apenas uma empresa.

### Tabela `empresas`

| Coluna | Tipo | DescriÃ§Ã£o |
|---|---|---|
| `id` | integer PK | 1 = RCG Â· 2 = CBA |
| `nome` | varchar(100) | â€” |
| `cod_erp` | varchar(20) | CÃ³digo no Protheus |
| `ativo` | boolean | â€” |

> Detalhamento de `perfis` e `telas` no documento **perfis-module.md**.

---

## JWT Payload

```json
{
  "sub":            "uuid-do-usuario",
  "email":          "joao@rcg.com.br",
  "nome":           "JoÃ£o Silva",
  "perfil_id":      "uuid-do-perfil",
  "perfil_nome":    "Vendedor",
  "telas":          ["mcv", "clientes", "orcamentos"],
  "empresa_id":     1,
  "empresas":       [1],
  "primeiro_acesso": false,
  "iat":            1748808000,
  "exp":            1748836800
}
```

O array `telas` contÃ©m os **cÃ³digos das telas** que o perfil do usuÃ¡rio tem acesso.
O Angular usa essa lista para montar o `po-menu` e os `RouteGuards` â€” sem chamadas
adicionais Ã  API apÃ³s o login.

Quando o Admin altera as permissÃµes de um perfil, o token do usuÃ¡rio Ã© invalidado
na prÃ³xima verificaÃ§Ã£o (ver seÃ§Ã£o InvalidaÃ§Ã£o de Token).

---

## Endpoints da API

### AutenticaÃ§Ã£o

| MÃ©todo | Rota | Auth | DescriÃ§Ã£o |
|---|---|---|---|
| POST | `/api/auth/login` | PÃºblico | Autenticar â†’ retorna JWT + dados do usuÃ¡rio |
| GET | `/api/auth/me` | JWT | Dados do usuÃ¡rio logado (renova telas se perfil mudou) |
| POST | `/api/auth/empresa/:id` | JWT | Trocar empresa ativa â†’ emite novo JWT |

### Senha

| MÃ©todo | Rota | Auth | DescriÃ§Ã£o |
|---|---|---|---|
| POST | `/api/auth/alterar-senha` | JWT | Alterar prÃ³pria senha |
| POST | `/api/auth/esqueci-senha` | PÃºblico | Solicitar link de redefiniÃ§Ã£o por e-mail |
| POST | `/api/auth/redefinir-senha` | PÃºblico | Confirmar nova senha via token do e-mail |

### AdministraÃ§Ã£o de UsuÃ¡rios

| MÃ©todo | Rota | Auth | DescriÃ§Ã£o |
|---|---|---|---|
| POST | `/api/usuarios` | Admin/Diretor | Criar usuÃ¡rio |
| GET | `/api/usuarios` | Admin/Diretor | Listar usuÃ¡rios |
| GET | `/api/usuarios/:id` | Admin/Diretor | Detalhe |
| PATCH | `/api/usuarios/:id` | Admin/Diretor | Atualizar dados e perfil |
| PATCH | `/api/usuarios/:id/reset-senha` | Admin/Diretor | ForÃ§ar reset de senha |
| PATCH | `/api/usuarios/:id/ativo` | Admin/Diretor | Ativar / desativar |

---

## Fluxos

### Login

```
POST /auth/login { email, senha }
  â†“ e-mail nÃ£o encontrado ou senha invÃ¡lida
  401 "Credenciais invÃ¡lidas"           â† mesma mensagem para nÃ£o revelar qual campo errou
  â†“ usuÃ¡rio inativo
  401 "UsuÃ¡rio inativo"
  â†“ ok
  Carrega perfil â†’ busca telas do perfil (Redis ou banco)
  Resolve o cadastro comercial vinculado ao `usuario_id`
  Monta JWT com { perfil_id, perfil_nome, telas, empresa_id, empresas }
  Retorna { access_token, usuario: { id, nome, perfil_nome, empresas, primeiro_acesso } }
  â†“ primeiro_acesso = true
  [Angular] redireciona para /alterar-senha antes de qualquer outra rota
```

### Troca de Empresa

```
[Angular] Seletor de empresa (visÃ­vel apenas se empresas.length > 1)
POST /auth/empresa/2
  â†“ empresa_id nÃ£o estÃ¡ em usuario.empresas[]
  403 Forbidden
  â†“ ok
  Emite novo JWT com empresa_id = 2 (mantÃ©m demais claims)
[Angular] Substitui token no localStorage â†’ recarrega contexto
```

### Esqueci Minha Senha

```
POST /auth/esqueci-senha { email }
  â†’ Sempre retorna 200 (nÃ£o revela se o e-mail existe)
  â†’ Se encontrado: gera UUID â†’ persiste em reset_token + reset_token_expira (now + 2h)
  â†’ LÃª config SMTP da tabela parametros
  â†’ Envia e-mail com link: {sistema.url_frontend}/redefinir-senha?token=UUID

[Angular] /redefinir-senha?token=...
POST /auth/redefinir-senha { token, nova_senha }
  â†’ Valida token e expiraÃ§Ã£o â†’ atualiza hash â†’ limpa reset_token
```

### Primeiro Acesso

```
Login retorna { primeiro_acesso: true }
[Angular] Redireciona para /alterar-senha â€” RouteGuard bloqueia demais rotas
POST /auth/alterar-senha { nova_senha }    â† senha_atual nÃ£o exigida no primeiro acesso
  â†’ Atualiza hash â†’ seta primeiro_acesso = false â†’ emite novo JWT
[Angular] Redireciona para tela inicial do perfil
```

---

## InvalidaÃ§Ã£o de Token (Perfil Alterado)

JWT Ã© stateless â€” nÃ£o hÃ¡ blacklist. Para lidar com mudanÃ§a de permissÃµes:

- VersÃ£o do perfil: a tabela `perfis` tem coluna `versao` (integer, incrementa a cada
  alteraÃ§Ã£o de permissÃµes).
- O JWT carrega `perfil_versao`.
- O `JwtAuthGuard` compara `perfil_versao` do token com o valor em cache (Redis, TTL 5min).
- Se divergirem â†’ responde `401` com mensagem `"SessÃ£o desatualizada. FaÃ§a login novamente."`.
- [Angular] Interceptor detecta esse 401 especÃ­fico â†’ limpa token â†’ redireciona para login.

---

## Guards e Decorators (NestJS)

```typescript
// Qualquer usuÃ¡rio autenticado
@UseGuards(JwtAuthGuard)

// Restrito a perfis especÃ­ficos pelo nome
@UseGuards(JwtAuthGuard, PerfilGuard)
@Perfis('Admin', 'Diretor')

// Restrito a quem tem acesso Ã  tela
@UseGuards(JwtAuthGuard, TelaGuard)
@Tela('usuarios')

// Acesso ao payload do token no mÃ©todo
@CurrentUser() usuario: JwtPayload
```

---

## SeguranÃ§a

| Item | DecisÃ£o |
|---|---|
| Hash de senha | bcrypt, rounds: 12 |
| Token reset senha | UUID v4, expira em 2h, uso Ãºnico |
| Resposta ao login invÃ¡lido | Sempre "Credenciais invÃ¡lidas" |
| Rate limit no login | 5 tentativas por IP em 15 min |
| HTTPS | ObrigatÃ³rio em produÃ§Ã£o (Traefik) |
| Token no cliente | localStorage (SPA corporativa interna) |
| SMTP config | Tabela `parametros` â€” nÃ£o fica no `.env` |

## ObservaÃ§Ã£o de Modelagem

O cadastro de usuÃ¡rio nÃ£o deve ser a referÃªncia principal do vÃ­nculo comercial.
Na versÃ£o atual da especificaÃ§Ã£o, o relacionamento principal fica no cadastro do
vendedor/estrutura comercial por meio do campo `usuario_id`.

---

## Seed â€” Primeiro UsuÃ¡rio Admin

`npm run seed` no backend cria:

1. Empresas: `RCG (id=1)` e `CBA (id=2)`
2. Perfis padrÃ£o com suas telas (ver perfis-module.md)
3. UsuÃ¡rio admin inicial:

| Campo | Valor |
|---|---|
| E-mail | `admin@crm.local` |
| Senha inicial | `Admin@123` |
| Perfil | `Admin` |
| Empresas | RCG + CBA |
| `primeiro_acesso` | `true` |

---

## Tela de Login (Angular + PO-UI)

Componente: `po-page-login` (template PO-UI) com tema RCG aplicado.

- Campo **UsuÃ¡rio**: e-mail (`po-input type="email"`)
- Campo **Senha**: (`po-input type="password"`)
- Link "Esqueci minha senha" â†’ `/esqueci-senha`
- ApÃ³s login bem-sucedido â†’ menu e header PO-UI montados dinamicamente
  (ver **perfis-module.md** â€” Menu DinÃ¢mico)
