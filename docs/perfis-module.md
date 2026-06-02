# Módulo de Perfis e Menu Dinâmico — CRM Comercial 360

## Visão Geral

Perfis definem **quais telas** cada usuário pode acessar. O Admin configura as
permissões pelo CRM — sem alterar código ou reiniciar o servidor.

Após o login, o array `telas` no JWT alimenta o `po-menu` lateral e os `RouteGuards`
do Angular. O menu reflete exatamente o que o perfil do usuário permite, sem telas
extras visíveis ou rotas acessíveis fora do perfil.

---

## Modelo de Dados

### Tabela `perfis`

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | uuid PK | — |
| `nome` | varchar(100) UNIQUE | Ex: "Vendedor", "Gerente", "Admin" |
| `descricao` | varchar(255) | Descrição exibida na tela de gestão |
| `versao` | integer | Incrementa a cada alteração de telas — usado para invalidar JWT |
| `sistema` | boolean | `true` = perfil criado pelo seed, não pode ser excluído |
| `ativo` | boolean | — |
| `criado_em` | timestamp | — |
| `atualizado_em` | timestamp | — |

### Tabela `telas`

Catálogo de todas as telas/seções navegáveis do sistema. Seeded com todas as telas
previstas — não é alterada pelo usuário.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | uuid PK | — |
| `codigo` | varchar(50) UNIQUE | Chave usada no JWT e nos guards (ex: `mcv`) |
| `nome` | varchar(100) | Nome exibido no menu (ex: "MCV") |
| `icone` | varchar(100) | Classe do ícone PO-UI (ex: `ph ph-chart-line`) |
| `rota` | varchar(200) | Rota Angular (ex: `/mcv`) |
| `modulo` | varchar(50) | Agrupador no menu (ex: `comercial`, `cadastros`) |
| `ordem` | integer | Ordem no menu dentro do módulo |
| `ativo` | boolean | — |

### Tabela `perfil_telas` (N:N)

| Coluna | Tipo | Descrição |
|---|---|---|
| `perfil_id` | uuid FK | — |
| `tela_id` | uuid FK | — |
| PK | `(perfil_id, tela_id)` | — |

---

## Telas Previstas (Seed)

| Código | Nome | Ícone | Rota | Módulo | Ordem |
|---|---|---|---|---|---|
| `mcv` | MCV | `ph ph-chart-line` | `/mcv` | comercial | 1 |
| `clientes` | Clientes | `ph ph-users` | `/clientes` | comercial | 2 |
| `atendimentos` | Atendimentos | `ph ph-headset` | `/atendimentos` | comercial | 3 |
| `orcamentos` | Orçamentos | `ph ph-file-text` | `/orcamentos` | comercial | 4 |
| `leads` | Leads | `ph ph-funnel` | `/leads` | comercial | 5 |
| `metas` | Metas | `ph ph-target` | `/metas` | comercial | 6 |
| `financeiro` | Financeiro | `ph ph-currency-circle-dollar` | `/financeiro` | comercial | 7 |
| `usuarios` | Usuários | `ph ph-user-gear` | `/cadastros/usuarios` | cadastros | 1 |
| `perfis` | Perfis | `ph ph-shield-check` | `/cadastros/perfis` | cadastros | 2 |
| `parametros` | Parâmetros | `ph ph-sliders` | `/cadastros/parametros` | cadastros | 3 |
| `cad-tipo-atendimento` | Tipo Atendimento | `ph ph-tag` | `/cadastros/tipo-atendimento` | cadastros | 4 |
| `cad-origem-lead` | Origem Lead | `ph ph-signpost` | `/cadastros/origem-lead` | cadastros | 5 |
| `cad-cnae` | CNAE | `ph ph-factory` | `/cadastros/cnae` | cadastros | 6 |

---

## Perfis Padrão (Seed)

### Admin
Acesso total ao sistema, incluindo gestão de usuários e configurações.

| Telas | — |
|---|---|
| Todas as telas | — |

### Diretor
Acesso total aos dados comerciais. Não acessa configurações de sistema.

| Telas |
|---|
| mcv, clientes, atendimentos, orcamentos, leads, metas, financeiro |
| usuarios *(somente leitura via perfil — sem tela de perfis/parâmetros)* |

### Gerente

| Telas |
|---|
| mcv, clientes, atendimentos, orcamentos, leads, metas, financeiro |

### Supervisor

| Telas |
|---|
| mcv, clientes, atendimentos, orcamentos, leads, metas |

### Vendedor

| Telas |
|---|
| mcv, clientes, atendimentos, orcamentos, leads |

> O Admin pode adicionar ou remover telas de qualquer perfil, exceto remover telas
> do próprio perfil Admin.

---

## Endpoints da API

### Perfis

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/api/perfis` | Admin/Diretor | Listar perfis |
| GET | `/api/perfis/:id` | Admin/Diretor | Detalhe do perfil com telas |
| POST | `/api/perfis` | Admin | Criar perfil |
| PATCH | `/api/perfis/:id` | Admin | Atualizar nome/descrição |
| DELETE | `/api/perfis/:id` | Admin | Excluir (só se não houver usuários vinculados e `sistema = false`) |

### Permissões de Telas por Perfil

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/api/perfis/:id/telas` | Admin | Listar telas do perfil |
| PUT | `/api/perfis/:id/telas` | Admin | Substituir conjunto de telas (batch) |
| POST | `/api/perfis/:id/telas/:telaId` | Admin | Adicionar tela ao perfil |
| DELETE | `/api/perfis/:id/telas/:telaId` | Admin | Remover tela do perfil |

> Toda alteração em `perfil_telas` incrementa `perfis.versao`, o que invalida os
> tokens dos usuários daquele perfil na próxima requisição (ver auth-module.md —
> Invalidação de Token).

### Telas (catálogo — somente leitura)

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/api/telas` | Admin | Listar todas as telas disponíveis |

---

## Menu Dinâmico (Angular + PO-UI)

### Estrutura

```
po-toolbar   ← header fixo com título, empresa ativa e perfil do usuário
po-menu      ← menu lateral retrátil com campo de pesquisa (p-filter="true")
  └── router-outlet  ← conteúdo da tela ativa
```

### Construção do Menu

1. No login, o backend retorna `telas: string[]` (códigos) no JWT.
2. O `AppComponent` usa o `MenuService` para transformar esses códigos em
   `PoMenuItem[]` consultando o catálogo local (seed de telas embutido no frontend).
3. O `po-menu` recebe o array de itens prontos.
4. Se `telas` mudar (novo login após alteração de perfil), o menu é reconstruído.

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

Telas do módulo `comercial` aparecem primeiro (sem subgrupo visual).
Telas do módulo `cadastros` aparecem agrupadas sob "Cadastros" como subitem.

```typescript
readonly menus: PoMenuItem[] = [
  // telas comerciais (nível raiz)
  { label: 'MCV',          icon: 'ph ph-chart-line',   link: '/mcv' },
  { label: 'Clientes',     icon: 'ph ph-users',         link: '/clientes' },
  // ...
  // telas de cadastros (agrupadas)
  {
    label: 'Cadastros',
    icon: 'ph ph-folder-open',
    subItems: [
      { label: 'Usuários',   icon: 'ph ph-user-gear',    link: '/cadastros/usuarios' },
      { label: 'Perfis',     icon: 'ph ph-shield-check', link: '/cadastros/perfis' },
      // ...
    ]
  }
];
```

### PO-UI — Configuração do po-menu

```html
<!-- app.html -->
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

- `p-filter="true"` — campo de pesquisa no topo do menu lateral
- Menu totalmente retrátil (comportamento padrão PO-UI)
- Ícone ativo destacado com cor do tema RCG (`--background-color-item-selected: #EAF5FB`)

### Route Guards

```typescript
// tela.guard.ts
canActivate(route: ActivatedRouteSnapshot): boolean {
  const codigoTela = route.data['tela'];
  const { telas } = this.authService.getPayload();
  if (!telas.includes(codigoTela)) {
    this.router.navigate(['/sem-acesso']);
    return false;
  }
  return true;
}

// nas rotas:
{
  path: 'cadastros/perfis',
  component: PerfisComponent,
  canActivate: [TelaGuard],
  data: { tela: 'perfis' }
}
```

---

## Cache (Redis)

| Chave | TTL | Conteúdo |
|---|---|---|
| `perfil:telas:{perfil_id}` | 5 min | Array de códigos de telas do perfil |
| `perfil:versao:{perfil_id}` | 5 min | Versão atual do perfil |

Invalidação: ao salvar `perfil_telas`, deleta `perfil:telas:{id}` e `perfil:versao:{id}`.

---

## Tela de Gestão de Perfis (Admin)

**Rota:** `/cadastros/perfis`

Layout PO-UI:
- `po-page-default` com breadcrumb
- Lista de perfis: `po-table` com colunas Nome, Usuários vinculados, Versão, Ativo
- Detalhe/edição: `po-modal` ou página separada
  - Lista de **todas as telas** com `po-checkbox` indicando quais o perfil tem acesso
  - Agrupadas por módulo
  - Botão "Salvar" → `PUT /api/perfis/:id/telas`
