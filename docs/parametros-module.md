# Módulo de Parâmetros do Sistema — CRM Comercial 360

## Visão Geral

Cadastro centralizado de configurações do sistema, administrado pelo Admin/Diretor
diretamente no CRM. Elimina a necessidade de alterar arquivos de configuração no
servidor para ajustes operacionais.

Parâmetros são organizados em **grupos** e podem ser **globais** (valem para todas as
empresas) ou **por empresa** (cada empresa tem seu valor).

---

## Modelo de Dados

### Tabela `parametros`

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | serial PK | — |
| `empresa_id` | integer FK nullable | NULL = global para todas as empresas |
| `grupo` | varchar(50) | Agrupador lógico (smtp, orcamento, atendimento…) |
| `chave` | varchar(100) | Identificador único do parâmetro dentro do grupo |
| `valor` | text nullable | Valor armazenado como texto |
| `tipo` | varchar(20) | Tipo de dado: `string` `number` `boolean` `password` `email` `url` |
| `sensivel` | boolean | `true` = valor é criptografado em repouso (AES-256) |
| `descricao` | varchar(255) | Descrição exibida na tela de configuração |
| `criado_em` | timestamp | — |
| `atualizado_em` | timestamp | — |

**Constraint:** `UNIQUE (empresa_id, grupo, chave)`

> Parâmetros globais usam `empresa_id = NULL`.
> Quando o sistema busca um parâmetro para uma empresa específica, tenta primeiro
> `empresa_id = N`; se não encontrar, cai no global (`empresa_id = NULL`).

---

## Grupos e Parâmetros Previstos

### Grupo: `smtp`
Escopo: **global** (uma configuração para todas as empresas)

| Chave | Tipo | Sensível | Descrição |
|---|---|---|---|
| `smtp.host` | string | não | Servidor SMTP (ex: mail.empresa.com.br) |
| `smtp.port` | number | não | Porta (587, 465, 25) |
| `smtp.secure` | boolean | não | true = SSL/TLS (porta 465) |
| `smtp.user` | email | não | Usuário de autenticação SMTP |
| `smtp.pass` | password | **sim** | Senha SMTP (criptografada) |
| `smtp.from` | string | não | Remetente padrão (ex: CRM 360 \<noreply@empresa.com.br\>) |

### Grupo: `orcamento`
Escopo: **por empresa**

| Chave | Tipo | Sensível | Descrição |
|---|---|---|---|
| `orcamento.validade_dias` | number | não | Dias de validade a partir da data de emissão |

### Grupo: `atendimento`
Escopo: **por empresa**

| Chave | Tipo | Sensível | Descrição |
|---|---|---|---|
| `atendimento.limite_anexos` | number | não | Quantidade máxima de anexos por atendimento |
| `atendimento.tamanho_max_mb` | number | não | Tamanho máximo por arquivo (MB) |

### Grupo: `sistema`
Escopo: **global**

| Chave | Tipo | Sensível | Descrição |
|---|---|---|---|
| `sistema.url_frontend` | url | não | URL pública do CRM (usada em e-mails) |
| `sistema.nome_sistema` | string | não | Nome exibido nos e-mails e PDFs |

---

## Endpoints da API

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/api/parametros` | ADMIN / DIRETOR | Lista todos os parâmetros (valores sensíveis mascarados) |
| GET | `/api/parametros/:grupo` | ADMIN / DIRETOR | Lista parâmetros de um grupo |
| PUT | `/api/parametros/:grupo/:chave` | ADMIN / DIRETOR | Atualiza valor de um parâmetro |
| PUT | `/api/parametros/:grupo` | ADMIN / DIRETOR | Atualiza grupo inteiro (batch) |

> Valores com `sensivel = true` são retornados mascarados na API (`"••••••••"`).
> O frontend nunca exibe o valor real de campos sensíveis — apenas permite sobrescrevê-los.

---

## Seed — Parâmetros Iniciais

Inseridos junto ao seed do Admin, com valores padrão/vazios para o operador completar:

```sql
-- SMTP (global, sensível)
INSERT INTO parametros (empresa_id, grupo, chave, valor, tipo, sensivel, descricao)
VALUES
  (NULL, 'smtp', 'smtp.host',   '',      'string',  false, 'Servidor SMTP'),
  (NULL, 'smtp', 'smtp.port',   '587',   'number',  false, 'Porta SMTP'),
  (NULL, 'smtp', 'smtp.secure', 'false', 'boolean', false, 'Usar SSL/TLS'),
  (NULL, 'smtp', 'smtp.user',   '',      'email',   false, 'Usuário SMTP'),
  (NULL, 'smtp', 'smtp.pass',   '',      'password',true,  'Senha SMTP'),
  (NULL, 'smtp', 'smtp.from',   '',      'string',  false, 'Remetente padrão'),
-- Sistema (global)
  (NULL, 'sistema', 'sistema.url_frontend', 'http://localhost:4200', 'url',    false, 'URL do CRM'),
  (NULL, 'sistema', 'sistema.nome_sistema', 'CRM Comercial 360',     'string', false, 'Nome do sistema');

-- Orçamento (por empresa — RCG=1, CBA=2)
INSERT INTO parametros (empresa_id, grupo, chave, valor, tipo, sensivel, descricao)
VALUES
  (1, 'orcamento', 'orcamento.validade_dias', '30', 'number', false, 'Validade do orçamento (dias)'),
  (2, 'orcamento', 'orcamento.validade_dias', '30', 'number', false, 'Validade do orçamento (dias)'),
-- Atendimento (por empresa)
  (1, 'atendimento', 'atendimento.limite_anexos',   '5',  'number', false, 'Limite de anexos por atendimento'),
  (1, 'atendimento', 'atendimento.tamanho_max_mb',  '10', 'number', false, 'Tamanho máximo por arquivo (MB)'),
  (2, 'atendimento', 'atendimento.limite_anexos',   '5',  'number', false, 'Limite de anexos por atendimento'),
  (2, 'atendimento', 'atendimento.tamanho_max_mb',  '10', 'number', false, 'Tamanho máximo por arquivo (MB)');
```

---

## Cache

Parâmetros são lidos com frequência (a cada e-mail enviado, a cada orçamento criado).
O serviço de parâmetros usa **Redis** como cache:

- Chave Redis: `parametros:{empresa_id}:{grupo}:{chave}` (ou `global` quando NULL)
- TTL: 5 minutos
- Invalidação: ao salvar via `PUT`, o cache daquele grupo é invalidado

---

## Impacto no Módulo de Auth

O `MailService` (usado nos fluxos de esqueci-senha e primeiro acesso) lê as
configurações SMTP da tabela `parametros` em vez do `.env`.

Comportamento quando SMTP não está configurado:
- Log de aviso no console
- Resposta `503 Service Unavailable` com mensagem: "Serviço de e-mail não configurado.
  Contate o administrador."

As variáveis `SMTP_*` são **removidas** do `.env` — apenas `FRONTEND_URL` permanece
como fallback de desenvolvimento, sobrescrito pelo parâmetro `sistema.url_frontend`
quando disponível.
