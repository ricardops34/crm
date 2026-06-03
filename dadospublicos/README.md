# Dados Públicos CNPJ — Receita Federal

> Documentação de referência para incorporação no módulo de **Prospecção de Clientes** do CRM Visão 360.
> Repositório fonte: https://github.com/aphonsoar/Receita_Federal_do_Brasil_-_Dados_Publicos_CNPJ

---

## Objetivo deste módulo no CRM

Usar a base pública de CNPJ da Receita Federal para:

- **Encontrar novos clientes** — prospecção por CNAE, UF, município, porte e situação
- **Enriquecer cadastro** — preencher automaticamente dados de empresa a partir do CNPJ
- **Validar clientes existentes** — cruzar base interna com situação cadastral atual

---

## Sobre o projeto de referência

| Item | Detalhe |
|---|---|
| Repositório | https://github.com/aphonsoar/Receita_Federal_do_Brasil_-_Dados_Publicos_CNPJ |
| Licença | MIT |
| Linguagem | Python 3.8+ |
| Banco | PostgreSQL 14.2+ |
| Fonte dos dados | Receita Federal — dados.gov.br |
| Atualização | Mensal (pela RFB) |
| Volume compactado | ~4,68 GB |
| Volume descompactado | ~17,1 GB |
| Tempo de carga | Muitas horas (depende da infra) |

---

## Fonte oficial dos dados

- **Portal**: https://dados.gov.br/dados/conjuntos-dados/cadastro-nacional-da-pessoa-juridica---cnpj
- **Metadados**: https://www.gov.br/receitafederal/dados/cnpj-metadados.pdf
- **Layout**: `NOVOLAYOUTDOSDADOSABERTOSDOCNPJ.pdf` (incluído no repositório)

Os arquivos são disponibilizados em ZIP com layout fixo definido pela RFB. O repositório de referência trata todo o processo de download, descompressão, limpeza e carga.

---

## Estrutura do ETL (repositório de referência)

```
ETL_coletar_dados_e_gravar_BD.py   ← script principal
banco_de_dados.sql                 ← cria as 10 tabelas no PostgreSQL
.env_template                      ← variáveis de ambiente necessárias
requirements.txt                   ← dependências Python
NOVOLAYOUTDOSDADOSABERTOSDOCNPJ.pdf ← especificação oficial do layout
Dados_RFB_ERD.png                  ← diagrama E-R visual
```

### As 4 fases do ETL

1. **Download** — baixa os ZIPs da RFB automaticamente
2. **Descompressão** — extrai os arquivos para pasta configurada
3. **Tratamento** — lê, limpa e transforma conforme layout oficial
4. **Carga** — insere nas 10 tabelas do PostgreSQL

---

## Tabelas criadas pelo ETL

### Tabelas principais

| Tabela | Conteúdo | Chave de junção |
|---|---|---|
| `empresa` | Dados da matriz (razão social, natureza jurídica, capital social, porte, regime) | `cnpj_basico` |
| `estabelecimento` | Dados por filial (endereço, telefone, situação, CNAE, data de abertura) | `cnpj_basico` |
| `socios` | Sócios/acionistas (nome, qualificação, entrada na sociedade) | `cnpj_basico` |
| `simples` | Optantes MEI e Simples Nacional | `cnpj_basico` |

### Tabelas de referência (lookup)

| Tabela | Conteúdo |
|---|---|
| `cnae` | Classificação Nacional de Atividades Econômicas |
| `natju` | Naturezas jurídicas |
| `quals` | Qualificações de sócios/responsáveis |
| `moti` | Motivos da situação cadastral |
| `pais` | Países |
| `munic` | Municípios |

> As tabelas de referência (`cnae`, `munic`) se alinham diretamente com as entities `cnaes` e `municipios` do CRM.

---

## Variáveis de ambiente necessárias (.env)

```env
OUTPUT_FILES_PATH=      # pasta para download dos ZIPs
EXTRACTED_FILES_PATH=   # pasta para extração
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=5432
DB_NAME=Dados_RFB
```

---

## Como executar localmente

```bash
# 1. Clonar o repositório
git clone https://github.com/aphonsoar/Receita_Federal_do_Brasil_-_Dados_Publicos_CNPJ

# 2. Criar banco no PostgreSQL
psql -U postgres -f banco_de_dados.sql

# 3. Copiar e preencher .env
cp .env_template code/.env

# 4. Instalar dependências
pip install -r requirements.txt

# 5. Executar ETL (pode levar horas)
cd code
python ETL_coletar_dados_e_gravar_BD.py
```

**Requisitos de disco:** mínimo 22 GB livres antes de iniciar.

---

## Plano de incorporação no CRM

### Módulo: Prospecção de Clientes

O módulo terá um banco de dados separado (ou schema isolado) com os dados da RFB, consultado via API interna. Não fará parte do banco transacional do CRM.

```
[Base RFB] ←── leitura somente ──→ [API Prospecção] ──→ [Frontend CRM]
                                          │
                                    converte lead
                                          │
                                          ↓
                                    [Base CRM: clientes]
```

### Funcionalidades previstas

| Funcionalidade | Descrição |
|---|---|
| **Busca por CNPJ** | Consulta direta — retorna cartão completo |
| **Busca por CNAE** | Lista empresas de um setor em uma região |
| **Filtros de prospecção** | CNAE + UF + Município + Porte + Situação cadastral |
| **Enriquecimento automático** | Preenche cadastro de empresa nova pelo CNPJ |
| **Importar como lead** | Converte resultado em lead/cliente na base CRM |
| **Exclusão de carteira** | Oculta CNPJs já na carteira do vendedor logado |

### Campos relevantes para prospecção

Da tabela `estabelecimento` (RFB):
- `cnpj_basico` + `cnpj_ordem` + `cnpj_dv` → CNPJ completo
- `razao_social` (via join com `empresa`)
- `nome_fantasia`
- `cnae_fiscal_principal` → join com `cnae`
- `situacao_cadastral` → 02=Ativa, 03=Suspensa, 04=Inapta, 08=Baixada
- `data_situacao_cadastral`
- `data_inicio_atividade`
- `logradouro`, `numero`, `complemento`, `bairro`, `municipio`, `uf`, `cep`
- `ddd_telefone_1`, `telefone_1`
- `email`

Da tabela `empresa` (RFB):
- `porte_empresa` → 01=ME, 03=EPP, 05=Demais
- `natureza_juridica` → join com `natju`
- `capital_social_empresa`

Da tabela `simples` (RFB):
- `opcao_pelo_simples` → S/N
- `opcao_pelo_mei` → S/N

---

## Alinhamento com entities do CRM

| Campo na RFB | Entity/Campo no CRM |
|---|---|
| `cnae_fiscal_principal` | `cnaes.codigo` |
| `municipio` (código RFB) | `municipios.codigo_ibge` |
| `uf` | `ufs.sigla` |
| `cep` | `ceps.cep` |
| `razao_social` | `clientes.razao_social` / `empresas.razao_social` |
| `situacao_cadastral` | `clientes.situacao` / `empresas.situacao_cadastral` |
| `porte_empresa` | `empresas.porte` |
| `capital_social_empresa` | `empresas.capital_social` |

---

## Próximos passos

- [ ] Definir infraestrutura — servidor dedicado ou schema separado no PostgreSQL do CRM
- [ ] Executar carga inicial com dados da RFB
- [ ] Criar API NestJS para o módulo de prospecção (endpoint de busca)
- [ ] Criar tela frontend (fora do escopo V1 — prevista para V2)
- [ ] Definir rotina de atualização mensal (cron + re-carga incremental ou full)
