# Estrutura do Banco de Dados — CRM Visão 360

> PostgreSQL 16 · TypeORM 0.3.x · Gerado a partir das entities em `backend/src/entities/`

---

## Diagrama de relacionamentos

```
empresas ──< usuario_empresas >── usuarios ──> perfis
                                                │
                                       ┌────────┼────────┐
                                    perfil_telas   perfil_modulos
                                       │               │
                                     telas          modulos
                                       └──> modulo_id (FK em telas)

empresas ──< vendedores ──< carteira_clientes >── clientes
vendedores (auto-ref: supervisor_id, gerente_id)

clientes ──< notas_fiscais ──< nota_fiscal_itens
clientes ──< titulos_financeiros
clientes ──< orcamentos ──< orcamento_itens

orcamentos ──< log_envio_orcamentos

parametros (empresa_id nullable → global ou por empresa)
noticias   (empresa_id nullable → global ou por empresa)
produtos   (isolados por empresa_id)
```

---

## Grupos de tabelas

### 1. Multiempresa e Acesso

#### `empresas`
| Coluna | Tipo | Constraints | Descrição |
|---|---|---|---|
| `id` | integer | PK, autoincrement | — |
| `nome` | varchar(100) | NOT NULL | Nome curto interno |
| `cod_erp` | varchar(20) | NOT NULL | Código no Protheus (SM0) |
| **Cartão CNPJ** | | | |
| `cnpj` | varchar(18) | nullable | CNPJ formatado ex: 00.000.000/0001-00 |
| `razao_social` | varchar(200) | nullable | Razão social conforme Receita Federal |
| `nome_fantasia` | varchar(200) | nullable | Nome fantasia |
| `situacao_cadastral` | varchar(30) | nullable | Ativa / Inapta / Suspensa / Baixada |
| `data_abertura` | date | nullable | — |
| `natureza_juridica` | varchar(100) | nullable | ex: Sociedade Empresária Limitada |
| `porte` | varchar(10) | nullable | ME / EPP / Medio / Grande |
| `regime_tributario` | varchar(30) | nullable | Simples Nacional / Lucro Presumido / Lucro Real |
| `cnae_principal` | varchar(10) | nullable | Código CNAE principal |
| `cnae_descricao` | varchar(200) | nullable | Descrição da atividade principal |
| `capital_social` | decimal(15,2) | nullable | — |
| **Endereço** | | | |
| `cep` | varchar(8) | nullable | Somente dígitos |
| `logradouro` | varchar(150) | nullable | — |
| `numero` | varchar(20) | nullable | — |
| `complemento` | varchar(100) | nullable | — |
| `bairro` | varchar(80) | nullable | — |
| `municipio` | varchar(100) | nullable | — |
| `uf` | varchar(2) | nullable | — |
| **Contato** | | | |
| `telefone` | varchar(20) | nullable | — |
| `email` | varchar(200) | nullable | E-mail da empresa |
| `site` | varchar(200) | nullable | — |
| **Controle** | | | |
| `ativo` | boolean | default true | — |

#### `usuarios`
| Coluna | Tipo | Constraints | Descrição |
|---|---|---|---|
| `id` | uuid | PK | — |
| `nome` | varchar(150) | NOT NULL | — |
| `email` | varchar(200) | UNIQUE NOT NULL | Login |
| `senha_hash` | varchar(255) | NOT NULL | bcrypt |
| `perfil_id` | uuid | FK → perfis.id | — |
| `ativo` | boolean | default true | — |
| `primeiro_acesso` | boolean | default true | Força troca de senha |
| `reset_token` | varchar(255) | nullable | Token de redefinição de senha |
| `reset_token_expira` | timestamp | nullable | Expiração do token |
| `criado_em` | timestamp | auto | — |
| `atualizado_em` | timestamp | auto | — |

#### `usuario_empresas`
Tabela de junção N:N entre usuários e empresas.

| Coluna | Tipo | Constraints |
|---|---|---|
| `usuario_id` | uuid | PK, FK → usuarios.id |
| `empresa_id` | integer | PK, FK → empresas.id |

#### `perfis`
| Coluna | Tipo | Constraints | Descrição |
|---|---|---|---|
| `id` | uuid | PK | — |
| `nome` | varchar(100) | UNIQUE NOT NULL | ex: Admin, Vendedor |
| `descricao` | varchar(255) | nullable | — |
| `versao` | integer | default 1 | Controle de cache de permissões |
| `sistema` | boolean | default false | Perfis do sistema não podem ser excluídos |
| `ativo` | boolean | default true | — |
| `criado_em` | timestamp | auto | — |
| `atualizado_em` | timestamp | auto | — |

#### `modulos`
| Coluna | Tipo | Constraints | Descrição |
|---|---|---|---|
| `id` | uuid | PK | — |
| `nome` | varchar(100) | UNIQUE NOT NULL | ex: Vendas, Cadastros |
| `icone` | varchar(100) | NOT NULL | Animalia icon (`an an-*`) |
| `ordem` | integer | default 0 | Posição no menu |
| `somente_admin` | boolean | default false | Oculto para não-Admin |
| `ativo` | boolean | default true | — |
| `criado_em` | timestamp | auto | — |
| `atualizado_em` | timestamp | auto | — |

#### `telas`
| Coluna | Tipo | Constraints | Descrição |
|---|---|---|---|
| `id` | uuid | PK | — |
| `codigo` | varchar(50) | UNIQUE NOT NULL | ex: `clientes`, `orcamentos` |
| `nome` | varchar(100) | NOT NULL | Rótulo de exibição |
| `icone` | varchar(100) | NOT NULL | Animalia icon |
| `rota` | varchar(200) | NOT NULL | Rota Angular |
| `modulo` | varchar(50) | NOT NULL | Legado — preenchido pelo módulo vinculado |
| `modulo_id` | uuid | nullable, FK → modulos.id | — |
| `ordem` | integer | NOT NULL | — |
| `ativo` | boolean | default true | — |

#### `perfil_telas` *(join table)*
| Coluna | Tipo |
|---|---|
| `tela_id` | uuid FK → telas.id |
| `perfil_id` | uuid FK → perfis.id |

#### `perfil_modulos` *(join table)*
| Coluna | Tipo |
|---|---|
| `perfil_id` | uuid FK → perfis.id |
| `modulo_id` | uuid FK → modulos.id |

---

### 2. Estrutura Comercial (vinda do ERP)

#### `clientes`
| Coluna | Tipo | Constraints | Descrição |
|---|---|---|---|
| `id` | uuid | PK | — |
| `empresa_id` | integer | NOT NULL | Isolamento multiempresa |
| `cod_erp` | varchar(30) | NOT NULL | Chave de integração (SA1: A1_COD+A1_LOJA) |
| `razao_social` | varchar(200) | NOT NULL | — |
| `nome_fantasia` | varchar(200) | nullable | — |
| `cnpj` | varchar(18) | nullable | — |
| `cidade` | varchar(100) | nullable | — |
| `uf` | varchar(2) | nullable | — |
| `grupo_economico` | varchar(100) | nullable | — |
| `cnae_principal` | varchar(10) | nullable | — |
| `contato_principal` | varchar(150) | nullable | — |
| `limite_credito` | decimal(15,2) | default 0 | — |
| `tabela_preco` | varchar(10) | nullable | — |
| `situacao` | varchar(20) | default 'ativo' | ativo / inativo |
| `bloqueado` | boolean | default false | — |
| `ultima_compra` | date | nullable | — |
| `venda_30d` | decimal(15,2) | default 0 | Calculado pelo ERP |
| `media_90d` | decimal(15,2) | default 0 | Calculado pelo ERP |
| `tem_comodato` | boolean | default false | — |
| `atualizado_em` | timestamp | auto | — |

#### `vendedores`
| Coluna | Tipo | Constraints | Descrição |
|---|---|---|---|
| `id` | uuid | PK | — |
| `empresa_id` | integer | NOT NULL | — |
| `cod_erp` | varchar(30) | NOT NULL | Chave de integração (SA3: A3_COD) |
| `nome` | varchar(150) | NOT NULL | — |
| `usuario_id` | uuid | nullable, FK → usuarios.id | Vínculo com login |
| `supervisor_id` | uuid | nullable, FK → vendedores.id | Auto-referência |
| `gerente_id` | uuid | nullable, FK → vendedores.id | Auto-referência |
| `tipo` | varchar(20) | default 'vendedor' | vendedor / supervisor / gerente |
| `ativo` | boolean | default true | — |
| `atualizado_em` | timestamp | auto | — |

#### `carteira_clientes`
| Coluna | Tipo | Constraints |
|---|---|---|
| `vendedor_id` | uuid | PK, FK → vendedores.id |
| `cliente_id` | uuid | PK, FK → clientes.id |
| `empresa_id` | integer | NOT NULL |

#### `produtos`
| Coluna | Tipo | Constraints | Descrição |
|---|---|---|---|
| `id` | uuid | PK | — |
| `empresa_id` | integer | NOT NULL | — |
| `cod_erp` | varchar(30) | NOT NULL | Chave de integração (SB1: B1_COD) |
| `descricao` | varchar(200) | NOT NULL | — |
| `unidade` | varchar(10) | nullable | — |
| `estoque` | decimal(10,3) | default 0 | — |
| `preco_tabela` | decimal(15,4) | default 0 | — |
| `ativo` | boolean | default true | — |
| `atualizado_em` | timestamp | auto | — |

---

### 3. Transacional (NFs e Financeiro — vindo do ERP)

#### `notas_fiscais`
| Coluna | Tipo | Constraints | Descrição |
|---|---|---|---|
| `id` | uuid | PK | — |
| `empresa_id` | integer | NOT NULL | — |
| `cliente_id` | uuid | NOT NULL, FK → clientes.id | — |
| `numero` | varchar(20) | NOT NULL | — |
| `serie` | varchar(5) | nullable | — |
| `data_emissao` | date | NOT NULL | — |
| `valor_total` | decimal(15,2) | NOT NULL | — |
| `url_danfe` | text | nullable | Link do PDF DANFE |
| `atualizado_em` | timestamp | auto | — |

#### `nota_fiscal_itens`
| Coluna | Tipo | Constraints |
|---|---|---|
| `id` | uuid | PK |
| `nota_fiscal_id` | uuid | FK → notas_fiscais.id |
| `cod_produto` | varchar(30) | NOT NULL |
| `descricao` | varchar(200) | NOT NULL |
| `quantidade` | decimal(10,3) | NOT NULL |
| `valor_unitario` | decimal(15,4) | NOT NULL |
| `valor_total` | decimal(15,2) | NOT NULL |

#### `titulos_financeiros`
| Coluna | Tipo | Constraints | Descrição |
|---|---|---|---|
| `id` | uuid | PK | — |
| `empresa_id` | integer | NOT NULL | — |
| `cliente_id` | uuid | NOT NULL, FK → clientes.id | — |
| `numero` | varchar(20) | NOT NULL | SE1: E1_NUM |
| `parcela` | varchar(10) | NOT NULL | SE1: E1_PARCELA |
| `vencimento` | date | NOT NULL | — |
| `valor` | decimal(15,2) | NOT NULL | — |
| `status` | varchar(50) | NOT NULL | aberto / vencido / baixado |
| `url_boleto` | text | nullable | — |
| `atualizado_em` | timestamp | auto | — |

---

### 4. Orçamentos (gerado no portal)

#### `orcamentos`
| Coluna | Tipo | Constraints | Descrição |
|---|---|---|---|
| `id` | uuid | PK | — |
| `numero_portal` | integer | UNIQUE NOT NULL | Sequencial interno do portal |
| `empresa_id` | integer | NOT NULL | — |
| `cliente_id` | uuid | NOT NULL, FK → clientes.id | — |
| `vendedor_id` | uuid | NOT NULL, FK → vendedores.id | — |
| `usuario_id` | uuid | NOT NULL, FK → usuarios.id | Quem criou |
| `status` | varchar(30) | default 'rascunho' | rascunho / enviado / bloqueado_credito / bloqueado_desconto / bloqueado_estoque / faturado / cancelado |
| `origem` | varchar(50) | nullable | Canal de origem |
| `validade` | date | NOT NULL | — |
| `valor_total` | decimal(15,2) | default 0 | — |
| `observacao` | text | nullable | — |
| `orcamento_origem_id` | uuid | nullable | FK → orcamentos.id (cópia) |
| `cod_erp` | varchar(30) | nullable | Preenchido após integração com Protheus |
| `enviado_em` | timestamp | nullable | — |
| `criado_em` | timestamp | auto | — |
| `atualizado_em` | timestamp | auto | — |

#### `orcamento_itens`
| Coluna | Tipo | Constraints | Descrição |
|---|---|---|---|
| `id` | uuid | PK | — |
| `orcamento_id` | uuid | FK → orcamentos.id | — |
| `produto_id` | uuid | nullable, FK → produtos.id | — |
| `cod_produto` | varchar(30) | NOT NULL | — |
| `descricao` | varchar(200) | NOT NULL | — |
| `quantidade` | decimal(10,3) | NOT NULL | — |
| `preco_unitario` | decimal(15,4) | NOT NULL | — |
| `desconto_pct` | decimal(5,2) | default 0 | — |
| `valor_total` | decimal(15,2) | NOT NULL | — |
| `estoque_disponivel` | decimal(10,3) | nullable | Snapshot no momento da criação |
| `sem_estoque` | boolean | default false | Flag de bloqueio |

#### `log_envio_orcamentos`
| Coluna | Tipo | Constraints | Descrição |
|---|---|---|---|
| `id` | uuid | PK | — |
| `orcamento_id` | uuid | NOT NULL, FK → orcamentos.id | — |
| `usuario_id` | uuid | nullable, FK → usuarios.id | — |
| `canal` | varchar(20) | default 'pdf' | pdf / email / whatsapp |
| `sucesso` | boolean | default true | — |
| `detalhe` | text | nullable | Mensagem de erro ou retorno |
| `criado_em` | timestamp | auto | — |

---

### 5. Configuração e Conteúdo

#### `parametros`
| Coluna | Tipo | Constraints | Descrição |
|---|---|---|---|
| `id` | integer | PK, autoincrement | — |
| `empresa_id` | integer | nullable | NULL = parâmetro global |
| `grupo` | varchar(50) | NOT NULL | smtp / orcamento / atendimento / sistema |
| `chave` | varchar(100) | NOT NULL | Nome do parâmetro |
| `valor` | text | nullable | — |
| `tipo` | varchar(20) | NOT NULL | string / number / boolean / password / email / url |
| `sensivel` | boolean | default false | Oculta o valor na API |
| `descricao` | varchar(255) | nullable | — |
| `criado_em` | timestamp | auto | — |
| `atualizado_em` | timestamp | auto | — |

> **Unique:** `(empresa_id, grupo, chave)`

#### `noticias`
| Coluna | Tipo | Constraints | Descrição |
|---|---|---|---|
| `id` | uuid | PK | — |
| `empresa_id` | integer | nullable | NULL = visível para todas as empresas |
| `categoria` | varchar(20) | default 'noticia' | noticia / aviso |
| `titulo` | varchar(200) | NOT NULL | — |
| `conteudo` | text | NOT NULL | — |
| `perfis_alvo` | jsonb | nullable | Array de nomes de perfis ex: `["Vendedor","Gerente"]` |
| `data_inicio` | date | NOT NULL | — |
| `data_fim` | date | nullable | — |
| `ativo` | boolean | default true | — |
| `autor_id` | uuid | nullable, FK → usuarios.id | — |
| `criado_em` | timestamp | auto | — |
| `atualizado_em` | timestamp | auto | — |

---

## Regras gerais

| Regra | Detalhe |
|---|---|
| **Multiempresa** | Toda entidade de negócio tem `empresa_id`. Queries sempre filtram por `empresa_id`. |
| **Chave de integração ERP** | Upsert por `empresa_id + cod_erp` para clientes, vendedores e produtos. |
| **UUIDs** | Entidades de negócio usam `uuid`. Entidades de configuração (empresas, parametros) usam `integer` autoincrement. |
| **Soft timestamps** | `atualizado_em` atualizado automaticamente pelo TypeORM em qualquer UPDATE. |
| **Isolamento** | Não há FK entre `empresa_id` das tabelas de negócio e a tabela `empresas` — o isolamento é por convenção de query, não por constraint. |
