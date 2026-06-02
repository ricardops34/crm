
# MASTER REQUIREMENTS - CRM COMERCIAL 360 RCG/CBA

## EMPRESAS
- RCG
- CBA
- Multiempresa
- Segregação por empresa
- Chave de integração: empresa_id + cod_erp

## TECNOLOGIA
- Frontend: Angular + PO-UI
- Backend: API REST
- Banco: PostgreSQL
- Cache: Redis
- Documentação: Swagger/OpenAPI
- Hospedagem: VPS
- Arquivos: S3 Compatível

## HIERARQUIA
Diretor Comercial
  -> Gerente
      -> Supervisor
          -> Vendedor

Diretor possui acesso total.

## MCV
- Tela principal do vendedor
- Lista apenas clientes da carteira
- Ordenação padrão: Dias da Última Compra
- Todas colunas ordenáveis
- Filtros rápidos: 15/30/60/90/120 dias
- Atalhos:
  - Posição Cliente
  - Atendimento
  - Financeiro
  - Comodato

## CLIENTE 360
- Cadastro
- MIX
- Notas Fiscais
- Financeiro
- Comodato
- Atendimentos
- Orçamentos

## ATENDIMENTOS
Obrigatórios:
- Tipo Atendimento
- Cliente/Lead
- Data/Hora
- Observação
- Gera Retorno
- Data/Hora Retorno
- Código Orçamento

Tipos vindos de cadastro.
Permite anexos.
Limite de anexos parametrizado.

## ORÇAMENTOS
- Sequencial Portal
- PDF
- E-mail
- WhatsApp
- Validade = hoje + parâmetro sistema
- Pode conter item sem estoque
- Estoque zerado apenas alerta
- Integração com ERP

Status:
- Rascunho
- Enviado
- Bloqueado Crédito
- Bloqueado Desconto
- Bloqueado Estoque
- Faturado
- Cancelado

## METAS
- Cadastro por Ano/Mês
- Vendedor
- Supervisor
- Gerente
- Base de cálculo: Nota Fiscal Emitida

## LEADS E PROSPECTS
Lead -> Prospect -> Cliente -> ERP

Campos mínimos:
- Nome
- WhatsApp
- E-mail
- Contato
- UF
- Cidade

Origem:
Cadastro parametrizado.

## CLIENTES
- Exclusivos por empresa
- Grupo Econômico como filtro
- CNAE principal e secundários
- Atualização cadastral com aprovação Administrativo/Financeiro

## FINANCEIRO
- Títulos em aberto
- Boletos
- Limite de crédito

## PRODUTOS
- Fotos
- Estoque
- Tabelas de preço
- Último preço
- Último desconto

## POLÍTICA COMERCIAL
- Desconto por produto
- Comissão por tabela
- Desconto máximo por produto
- ERP é autoridade final

## INTEGRAÇÃO PROTHEUS
- Upsert por empresa_id + cod_erp
- Portal funciona mesmo com ERP offline
- ERP envia e consulta dados
- Leads convertidos ficam disponíveis para ERP consumir

## CADASTROS COMUNS
- CNAE
- UF
- Municípios
- CEP
- Tipo Atendimento
- Origem Lead
- Parâmetros Sistema
