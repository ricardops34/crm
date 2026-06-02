# MÃ³dulo de Perfis e Menu DinÃ¢mico â€” CRM Comercial 360

## VisÃ£o Geral

Perfis definem **quais telas** cada usuÃ¡rio pode acessar. O Admin configura as
permissÃµes pelo CRM â€” sem alterar cÃ³digo ou reiniciar o servidor.

ApÃ³s o login, o array `telas` no JWT alimenta o `po-menu` lateral e os `RouteGuards`
do Angular. O menu reflete exatamente o que o perfil do usuÃ¡rio permite, sem telas
extras visÃ­veis ou rotas acessÃ­veis fora do perfil.

Este documento jÃ¡ estÃ¡ alinhado ao escopo funcional da V1 definido no `PRD.md`.
Por isso, `leads` e `atendimentos` nÃ£o aparecem entre as telas ativas da primeira versÃ£o.

---

## Modelo de Dados

### Tabela `perfis`

| Coluna | Tipo | DescriÃ§Ã£o |
|---|---|---|
| `id` | uuid PK | â€” |
| `nome` | varchar(100) UNIQUE | Ex: "Vendedor", "Gerente", "Admin" |
| `descricao` | varchar(255) | DescriÃ§Ã£o exibida na tela de gestÃ£o |
| `versao` | integer | Incrementa a cada alteraÃ§Ã£o de telas â€” usado para invalidar JWT |
| `sistema` | boolean | `true` = perfil criado pelo seed, nÃ£o pode ser excluÃ­do |
| `ativo` | boolean | â€” |
| `criado_em` | timestamp | â€” |
| `atualizado_em` | timestamp | â€” |

### Tabela `telas`

CatÃ¡logo de todas as telas/seÃ§Ãµes navegÃ¡veis do sistema. Seeded com todas as telas
previstas para a V1 â€” nÃ£o Ã© alterada pelo usuÃ¡rio.

| Coluna | Tipo | DescriÃ§Ã£o |
|---|---|---|
| `id` | uuid PK | â€” |
| `codigo` | varchar(50) UNIQUE | Chave usada no JWT e nos guards (ex: `mcv`) |
| `nome` | varchar(100) | Nome exibido no menu (ex: "MCV") |
| `icone` | varchar(100) | Classe do Ã­cone PO-UI (ex: `ph ph-chart-line`) |
| `rota` | varchar(200) | Rota Angular (ex: `/mcv`) |
| `modulo` | varchar(50) | Agrupador no menu (ex: `comercial`, `cadastros`) |
| `ordem` | integer | Ordem no menu dentro do mÃ³dulo |
| `ativo` | boolean | â€” |

### Tabela `perfil_telas` (N:N)

| Coluna | Tipo | DescriÃ§Ã£o |
|---|---|---|
| `perfil_id` | uuid FK | â€” |
| `tela_id` | uuid FK | â€” |
| PK | `(perfil_id, tela_id)` | â€” |

---

## Telas Previstas (Seed)

| CÃ³digo | Nome | Ãcone | Rota | MÃ³dulo | Ordem |
|---|---|---|---|---|---|
| `mcv` | MCV | `ph ph-chart-line` | `/mcv` | comercial | 1 |
| `clientes` | Clientes | `ph ph-users` | `/clientes` | comercial | 2 |
| `orcamentos` | OrÃ§amentos | `ph ph-file-text` | `/orcamentos` | comercial | 3 |
| `metas` | Metas | `ph ph-target` | `/metas` | comercial | 4 |
| `financeiro` | Financeiro | `ph ph-currency-circle-dollar` | `/financeiro` | comercial | 5 |
| `usuarios` | UsuÃ¡rios | `ph ph-user-gear` | `/cadastros/usuarios` | cadastros | 1 |
| `perfis` | Perfis | `ph ph-shield-check` | `/cadastros/perfis` | cadastros | 2 |
| `parametros` | ParÃ¢metros | `ph ph-sliders` | `/cadastros/parametros` | cadastros | 3 |
| `cad-tipo-atendimento` | Tipo Atendimento | `ph ph-tag` | `/cadastros/tipo-atendimento` | cadastros | 4 |
| `cad-origem-lead` | Origem Lead | `ph ph-signpost` | `/cadastros/origem-lead` | cadastros | 5 |
| `cad-cnae` | CNAE | `ph ph-factory` | `/cadastros/cnae` | cadastros | 6 |

---

## Perfis PadrÃ£o (Seed)

### Admin

Acesso total ao sistema, incluindo gestÃ£o de usuÃ¡rios e configuraÃ§Ãµes.

| Telas | â€” |
|---|---|
| Todas as telas | â€” |

### Diretor

Mantido na documentaÃ§Ã£o tÃ©cnica como perfil futuro, mas fora do escopo da V1.

| Telas |
|---|
| mcv, clientes, orcamentos, metas, financeiro |
| usuarios *(somente leitura via perfil â€” sem tela de perfis/parÃ¢metros)* |

### Gerente

| Telas |
|---|
| mcv, clientes, orcamentos, metas, financeiro |

### Supervisor

| Telas |
|---|
| mcv, clientes, orcamentos, metas |

### Vendedor

| Telas |
|---|
| mcv, clientes, orcamentos |

> O Admin pode adicionar ou remover telas de qualquer perfil, exceto remover telas
> do prÃ³prio perfil Admin.

---

## Endpoints da API

### Perfis

| MÃ©todo | Rota | Auth | DescriÃ§Ã£o |
|---|---|---|---|
| GET | `/api/perfis` | Admin/Diretor | Listar perfis |
| GET | `/api/perfis/:id` | Admin/Diretor | Detalhe do perfil com telas |
| POST | `/api/perfis` | Admin | Criar perfil |
| PATCH | `/api/perfis/:id` | Admin | Atualizar nome/descriÃ§Ã£o |
| DELETE | `/api/perfis/:id` | Admin | Excluir (sÃ³ se nÃ£o houver usuÃ¡rios vinculados e `sistema = false`) |

### PermissÃµes de Telas por Perfil

| MÃ©todo | Rota | Auth | DescriÃ§Ã£o |
|---|---|---|---|
| GET | `/api/perfis/:id/telas` | Admin | Listar telas do perfil |
| PUT | `/api/perfis/:id/telas` | Admin | Substituir conjunto de telas (batch) |
| POST | `/api/perfis/:id/telas/:telaId` | Admin | Adicionar tela ao perfil |
| DELETE | `/api/perfis/:id/telas/:telaId` | Admin | Remover tela do perfil |

> Toda alteraÃ§Ã£o em `perfil_telas` incrementa `perfis.versao`, o que invalida os
> tokens dos usuÃ¡rios daquele perfil na prÃ³xima requisiÃ§Ã£o (ver auth-module.md â€”
> InvalidaÃ§Ã£o de Token).

### Telas (catÃ¡logo â€” somente leitura)

| MÃ©todo | Rota | Auth | DescriÃ§Ã£o |
|---|---|---|---|
| GET | `/api/telas` | Admin | Listar todas as telas disponÃ­veis |

---

## Menu DinÃ¢mico (Angular + PO-UI)

### Estrutura

```
po-toolbar   â† header fixo com tÃ­tulo, empresa ativa e perfil do usuÃ¡rio
po-menu      â† menu lateral retrÃ¡til com campo de pesquisa (p-filter="true")
  â””â”€â”€ router-outlet  â† conteÃºdo da tela ativa
```

### ConstruÃ§Ã£o do Menu

1. No login, o backend retorna `telas: string[]` (cÃ³digos) no JWT.
2. O `AppComponent` usa o `MenuService` para transformar esses cÃ³digos em
   `PoMenuItem[]` consultando o catÃ¡logo local.
3. O `po-menu` recebe o array de itens prontos.
4. Se `telas` mudar (novo login apÃ³s alteraÃ§Ã£o de perfil), o menu Ã© reconstruÃ­do.

```typescript
// menu.service.ts
buildMenu(telas: string[]): PoMenuItem[] {
  return TELAS_CATALOGO
    .filter(t => telas.includes(t.codigo))
    .sort((a, b) => a.ordem - b.ordem)
    .map(t => ({ label: t.nome, icon: t.icone, link: t.rota }));
}
```

### Agrupamento no Menu

Telas do mÃ³dulo `comercial` aparecem primeiro.
Telas do mÃ³dulo `cadastros` aparecem agrupadas sob "Cadastros" como subitem.

```typescript
readonly menus: PoMenuItem[] = [
  { label: 'MCV',        icon: 'ph ph-chart-line',             link: '/mcv' },
  { label: 'Clientes',   icon: 'ph ph-users',                  link: '/clientes' },
  { label: 'OrÃ§amentos', icon: 'ph ph-file-text',              link: '/orcamentos' },
  { label: 'Metas',      icon: 'ph ph-target',                 link: '/metas' },
  { label: 'Financeiro', icon: 'ph ph-currency-circle-dollar', link: '/financeiro' },
  {
    label: 'Cadastros',
    icon: 'ph ph-folder-open',
    subItems: [
      { label: 'UsuÃ¡rios',   icon: 'ph ph-user-gear',    link: '/cadastros/usuarios' },
      { label: 'Perfis',     icon: 'ph ph-shield-check', link: '/cadastros/perfis' },
      { label: 'ParÃ¢metros', icon: 'ph ph-sliders',      link: '/cadastros/parametros' }
    ]
  }
];
```

### PO-UI â€” ConfiguraÃ§Ã£o do po-menu

```html
<po-toolbar
  p-title="CRM Comercial 360"
  [p-profile]="profile">
</po-toolbar>

<po-menu
  [p-menus]="menus"
  p-filter="true"
  p-filter-placeholder="Buscar...">
  <router-outlet></router-outlet>
</po-menu>
```

### Route Guards

```typescript
canActivate(route: ActivatedRouteSnapshot): boolean {
  const codigoTela = route.data['tela'];
  const { telas } = this.authService.getPayload();
  if (!telas.includes(codigoTela)) {
    this.router.navigate(['/sem-acesso']);
    return false;
  }
  return true;
}
```

---

## Cache (Redis)

| Chave | TTL | ConteÃºdo |
|---|---|---|
| `perfil:telas:{perfil_id}` | 5 min | Array de cÃ³digos de telas do perfil |
| `perfil:versao:{perfil_id}` | 5 min | VersÃ£o atual do perfil |

InvalidaÃ§Ã£o: ao salvar `perfil_telas`, deleta `perfil:telas:{id}` e `perfil:versao:{id}`.

---

## Tela de GestÃ£o de Perfis (Admin)

**Rota:** `/cadastros/perfis`

Layout PO-UI:

- `po-page-default` com breadcrumb
- Lista de perfis: `po-table` com colunas Nome, UsuÃ¡rios vinculados, VersÃ£o, Ativo
- Detalhe/ediÃ§Ã£o: `po-modal` ou pÃ¡gina separada
- Lista de todas as telas com `po-checkbox`, agrupadas por mÃ³dulo
- BotÃ£o "Salvar" â†’ `PUT /api/perfis/:id/telas`
