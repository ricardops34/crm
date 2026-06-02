# Modulo de Proposta Comercial - CRM Comercial 360

## Visao Geral

O modulo de Proposta Comercial tem como objetivo transformar um orcamento ja existente em uma apresentacao comercial estruturada, visual e personalizada para diferentes publicos do mesmo cliente.

A proposta nao substitui o orcamento. Ela funciona como uma camada de apresentacao comercial, organizada em paginas selecionaveis e ordem livre, mantendo itens e valores vindos do orcamento.

## Objetivo de Negocio

Permitir que vendedor e supervisor gerem propostas mais completas e profissionais, com narrativa comercial, identidade institucional e apresentacao dos produtos negociados, sem perder o vinculo com o orcamento de origem.

## Escopo Funcional

### Origem da Proposta

- Toda proposta comercial deve ser gerada a partir de um orcamento existente
- Produtos, quantidades e valores devem vir do orcamento
- A proposta nao pode alterar itens nem valores do orcamento

### Modelo de Composicao

- A proposta deve utilizar modelo com paginas selecionaveis e ordem livre
- O usuario pode ajustar textos e reorganizar paginas
- O usuario nao pode alterar itens e valores do orcamento dentro da proposta

### Permissoes da V1

Podem montar e editar a proposta comercial:

- Vendedor
- Supervisor

Conteudo institucional e biblioteca de paginas devem ser mantidos por:

- Administrativo

Podem aprovar a proposta comercial:

- Vendedor
- Supervisor

## Versoes de Proposta

- O sistema deve permitir mais de uma proposta comercial para o mesmo orcamento
- As versoes diferentes existem principalmente para publicos diferentes do mesmo cliente
- A proposta deve suportar os conceitos de:
  - destinatario/setor
  - perfil de proposta

## Perfis de Proposta

- Os perfis de proposta devem ser cadastrados pelo Administrativo
- Cada perfil de proposta deve possuir paginas padrao associadas

## Biblioteca de Paginas

O sistema deve trabalhar com biblioteca de paginas avulsas.

Paginas base da V1:

- Capa
- Sobre a empresa
- Diferenciais
- Produtos
- Condicoes comerciais
- Fechamento

## Pagina de Produtos

- A pagina de produtos deve ser gerada como uma ou mais paginas com grade/lista de produtos

### Conteudo padrao do produto

Esses campos devem ser mantidos no portal como complemento comercial do produto:

- Foto
- Nome
- Descricao comercial
- Caracteristicas

### Campos vindos do orcamento

Na proposta, os campos comerciais exibidos por item devem ser:

- Quantidade
- Valor

## Integracao com Produtos

- Os produtos devem vir do cadastro espelhado do Protheus
- O portal deve permitir complemento comercial do produto

## Condicoes Comerciais

- A pagina de condicoes comerciais deve ser preenchida automaticamente com base no orcamento

Campos minimos alimentados pelo orcamento:

- Pagamento
- Prazo de entrega
- Validade
- Observacoes

## Fechamento

- A pagina de fechamento deve ser texto livre por proposta

## Exportacao e PDF

- A proposta comercial da V1 deve ser exportada apenas como PDF
- O PDF pode ser gerado antes da aprovacao, ja com aparencia final

## Historico de PDFs

- O sistema deve guardar historico dos PDFs gerados da proposta
- O historico deve registrar no minimo:
  - Data/hora
  - Usuario

## Aprovacao e Travamento

- A proposta permanece editavel ate sua aprovacao
- Ao ser aprovada, a proposta deve ser travada para edicao
- A aprovacao da proposta deve disparar o envio do orcamento ao Protheus

## Relacao com o Orcamento

- A proposta comercial e sempre vinculada a um unico orcamento
- O orcamento pode possuir varias propostas comerciais
- A proposta nao altera a base comercial do orcamento; ela apenas organiza a apresentacao

## Regras Importantes

- A proposta comercial deve reutilizar o orcamento como fonte unica de itens e valores
- A biblioteca de paginas deve permitir composicoes flexiveis por perfil de proposta
- O modelo deve suportar personalizacao para diferentes publicos do mesmo cliente
- A aprovacao da proposta e um marco operacional que trava o documento e dispara o envio ao Protheus

## Pendencias Abertas

Ainda precisam ser definidos em etapas futuras:

- Modelo visual final das paginas
- Regras de numeracao e identificacao da proposta comercial
- Estrutura de armazenamento dos PDFs historicos
- Regras de permissao detalhadas para leitura de propostas por gerente e administrativo
- Eventual inclusao do modulo no PRD principal da V1 ou em roadmap posterior
