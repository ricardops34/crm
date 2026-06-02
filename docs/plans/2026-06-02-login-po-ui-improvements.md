# Plano de Implementação - Melhoria do Login com PO-UI

> **Para Claude:** SUB-SKILL OBRIGATÓRIO: Use `executing-plans` para implementar este plano tarefa por tarefa.

**Objetivo:** Evoluir a tela de login para usar `logo`, `secondary logo`, `background` e `support` nativos do `po-page-login`, mantendo o fluxo atual de autenticação.

**Arquitetura:** A mudança ficará concentrada no componente de login Angular, sem alterar contrato da API REST nem o `AuthService`. O plano mantém o `po-page-login` como base única da interface, usando apenas propriedades documentadas pelo PO-UI e assets locais já definidos.

**Stack Tecnológica:** Angular 21, PO-UI (`@po-ui/ng-templates`), TypeScript, assets locais em `frontend/public`

---

### Tarefa 1: Atualizar a configuração visual do `po-page-login`

**Arquivos:**
- Modificar: `frontend/src/app/features/auth/login/login.ts`
- Referência: `docs/auth-module.md`
- Referência: `po-ui/doc/sources/llms-full.txt`

**Passo 1: Ajustar o template para ativar os recursos nativos do PO-UI**

Adicionar ao `po-page-login`:

- `p-logo="/logo_padrao.png"`
- `p-secondary-logo="/logo_bj.png"`
- `p-background="/assets/crm_login_bg.png"`
- `p-support="mailto:ricardo@bjsoft.com.br"`

Manter:

- `p-product-name="CRM Comercial 360"`
- `p-recovery="/esqueci-senha"`
- `[p-literals]="literals"`
- `[p-loading]="loading()"`
- `(p-login-submit)="onLogin($event)"`

**Passo 2: Revisar as literais do login**

Atualizar `PoPageLoginLiterals` para cobrir pelo menos:

- `loginPlaceholder`
- `passwordPlaceholder`
- `forgotPassword`
- `support`
- `welcome`

Usar textos coerentes com o CRM e com o padrão visual esperado do `po-page-login`.

**Passo 3: Preservar o comportamento do submit**

Não alterar o fluxo:

- login com `email + senha`
- redirecionamento para `/alterar-senha` no primeiro acesso
- redirecionamento para `/home` nos demais casos

**Passo 4: Revisar imports**

Garantir que o arquivo mantenha apenas imports necessários após a mudança.

**Passo 5: Commit**

```bash
git add frontend/src/app/features/auth/login/login.ts
git commit -m "feat: melhora branding da tela de login com po-ui"
```

### Tarefa 2: Validar assets e coerência com o frontend

**Arquivos:**
- Referência: `frontend/public/logo_padrao.png`
- Referência: `frontend/public/logo_bj.png`
- Referência: `frontend/public/assets/crm_login_bg.png`

**Passo 1: Confirmar os caminhos públicos usados pelo Angular**

Validar que os assets escolhidos estão acessíveis por:

- `/logo_padrao.png`
- `/logo_bj.png`
- `/assets/crm_login_bg.png`

**Passo 2: Verificar consistência visual**

Checar:

- se a logo principal mantém boa leitura no topo
- se a `secondary logo` funciona no rodapé sem ruído visual
- se o `background` não prejudica contraste ou legibilidade do formulário

**Passo 3: Validar sem trocar tema global**

A mudança não deve alterar `frontend/src/app/app.ts` nem os temas `rcg` e `allia`.

**Passo 4: Commit**

```bash
git add frontend/public/logo_padrao.png frontend/public/logo_bj.png frontend/public/assets/crm_login_bg.png
git commit -m "chore: valida assets da tela de login"
```

### Tarefa 3: Verificação funcional e visual

**Arquivos:**
- Alvo de teste: `frontend/src/app/features/auth/login/login.ts`

**Passo 1: Executar build do frontend**

Executar:

```bash
npm run build
```

Diretório de trabalho:

```bash
frontend
```

Esperado: build concluído sem erros de template, tipagem ou assets.

**Passo 2: Executar a aplicação localmente**

Executar:

```bash
npm run start
```

Diretório de trabalho:

```bash
frontend
```

Esperado:

- a tela `/login` renderiza com logo principal, logo secundária, background e botão de suporte
- o link `Esqueci minha senha` continua funcional
- o botão de suporte abre `mailto:ricardo@bjsoft.com.br`

**Passo 3: Testar o fluxo de autenticação**

Validar manualmente:

- credenciais válidas
- primeiro acesso
- recuperação de senha
- estado de loading no submit

**Passo 4: Teste responsivo**

Validar visualmente em largura desktop e mobile:

- o formulário permanece legível
- o layout do `po-page-login` continua dentro do padrão do componente
- nenhum asset quebra o alinhamento

**Passo 5: Commit**

```bash
git add frontend/src/app/features/auth/login/login.ts
git commit -m "test: verifica experiência do login com po-ui"
```
