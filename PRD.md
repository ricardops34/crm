# PRD - CRM Comercial 360 RCG/CBA

## Base de Referência

Este PRD consolida e detalha o escopo funcional da V1 com base em `MASTER_REQUIREMENTS.md` e nas definições complementares já registradas em `docs/auth-module.md`, `docs/perfis-module.md` e `docs/parametros-module.md`.

## Objetivo da V1

A primeira versão do produto deve priorizar a operação comercial do dia a dia, com foco em produtividade da equipe de vendas, visão consolidada do cliente e suporte ao processo comercial integrado ao Protheus.

## Escopo da V1

### Prioridades Principais

1. MCV + Cliente 360
2. Orçamentos integrados ao Protheus
3. Proposta comercial gerada a partir do orçamento

### Prioridades Complementares

1. Home inicial por perfil
2. Dashboard de acompanhamento de objetivos
3. Metas e gestão comercial
4. Financeiro do cliente
5. Cadastros e parametrizações

## Fora da V1

Os módulos abaixo não fazem parte da primeira versão e devem ser tratados em fase posterior:

- Leads, prospects e conversão comercial
- Atendimentos e agenda de retorno
- Atualização cadastral de clientes

As telas e permissões de `leads` e `atendimentos` também devem ser removidas da V1 em menu, perfis e catálogo funcional visível ao usuário.

## Perfis da V1

O go-live da primeira versão deve atender os seguintes perfis:

- Vendedor
- Supervisor
- Gerente
- Administrativo
- Financeiro

O Diretor Comercial não fará parte da primeira versão.

## Multiempresa e Visibilidade

O sistema deve operar em modelo multiempresa, com segregação lógica por `empresa_id`.

### Vendedor

- Visualiza apenas clientes da própria carteira

### Supervisor

- Visualiza apenas a própria carteira

### Gerente

- Visualiza todos os dados comerciais dos supervisores e vendedores subordinados
- O acesso deve respeitar a segmentação por empresa

### Administrativo/Financeiro

- Visualiza todos os dados da empresa à qual possui permissão de acesso

## Integração com Protheus

- Clientes e produtos serão espelhados do Protheus, sem criação manual no portal
- A estrutura comercial da V1 deve ser carregada apenas do Protheus
- O Protheus é a autoridade final para aceite e consolidação de regras comerciais e cadastro mestre
- O portal deve continuar operando mesmo com o ERP indisponível, dentro do limite dos dados já sincronizados

## Home Inicial

Todos os perfis da primeira versão devem acessar inicialmente uma Home comum do sistema.

A Home deve apresentar conteúdo adaptado ao perfil do usuário e contemplar, no mínimo:

- Notícias
- Avisos
- Indicadores relacionados ao perfil do usuário
- Atalhos do usuário
- Favoritos do usuário

Regras complementares:

- Notícias e avisos poderão ser gerenciados por `Administrativo` e `Gerente`
- Notícias e avisos devem permitir segmentação por empresa e por perfil
- Os atalhos da Home devem seguir modelo misto, com parte fixa por contexto/perfil e parte personalizável pelo usuário

## MCV

O MCV é o principal módulo operacional do vendedor na V1.

### Estrutura da Tela

- A tela deve priorizar grade, filtros e ações operacionais
- Não deve exibir cards-resumo no topo
- Não deve possuir exportação na V1
- O botão `Atualizar` deve apenas reconsultar os dados já disponíveis no portal

### Grade Principal

Cada linha da grade principal deve representar um cliente.

O MCV da primeira versão deve seguir formato tabular com colunas operacionais e ações rápidas por linha.

As colunas mínimas da grade do MCV devem ser:

- Situação
- Código
- Última compra
- Razão social
- Cidade
- Diferença entre mês e média
- Venda nos últimos 30 dias
- Venda média nos últimos 90 dias
- Dias
- Comodato

### Ações por Linha

As ações principais do MCV devem ocorrer por botões/ícones na linha, e não por clique genérico sobre a linha inteira.

Na primeira versão, os botões disponíveis por cliente devem ser:

- Cliente 360
- Financeiro

Comportamento:

- O botão `Cliente 360` deve abrir o cliente sempre na aba padrão `Cadastro/Resumo`
- O botão `Financeiro` deve abrir o Cliente 360 já posicionado na aba `Financeiro`

### Filtros

Os filtros rápidos do MCV na primeira versão devem contemplar:

- 15 dias
- 30 dias
- 60 dias
- 90 dias
- 120 dias
- Bloqueados
- Ativo

Regras de filtro e status:

- O filtro `Bloqueados` deve representar clientes inativos ou bloqueados no ERP
- A coluna `Situação` deve utilizar semáforo visual sem texto
- Cadeado aberto verde para cliente ativo
- Cadeado fechado vermelho para cliente bloqueado
- Mesmo quando o cliente estiver bloqueado, os acessos a `Cliente 360` e `Financeiro` devem permanecer disponíveis

## Cliente 360

O Cliente 360 deve expor, já na primeira versão, todas as abas previstas no requisito original, mesmo quando parte delas operar inicialmente em modo prioritariamente consultivo.

### Regras Gerais

- A aba padrão de abertura deve ser `Cadastro/Resumo do cliente`
- Apenas a aba `Orçamentos` deve possuir ação operacional na V1
- O módulo de `Orçamentos` deve estar acessível por menu próprio e também a partir do Cliente 360
- O módulo de `Proposta Comercial` deve estar vinculado ao fluxo de `Orçamentos`

### Aba Cadastro/Resumo

Na primeira versão, a aba deve exibir no mínimo:

- Razão social
- Nome fantasia
- CNPJ
- Cidade/UF
- Contato principal
- Grupo econômico
- CNAE principal
- CNAEs secundários
- Limite de crédito

Indicadores obrigatórios:

- Última compra
- Dias sem comprar
- Limite de crédito
- Títulos em aberto

Regras:

- O indicador `dias sem comprar` deve ser calculado com base na última nota faturada no Protheus
- O contato principal deve vir apenas do cadastro espelhado do Protheus
- Desconto não deve ser tratado como indicador-resumo do cliente; o desconto é controlado por item do orçamento

### Aba Financeiro

- Deve aparecer como aba própria dentro do Cliente 360
- A abertura da primeira versão deve priorizar títulos em aberto
- Não deve listar títulos já pagos

A lista de títulos em aberto deve apresentar, no mínimo:

- Número
- Parcela
- Vencimento
- Valor
- Status
- Boleto

Regras:

- O status do título deve ser exibido exatamente conforme retornado pelo ERP, sem simplificação do portal
- Os boletos devem estar disponíveis para link/download
- Não haverá reenvio por canal direto no portal na V1

### Aba Orçamentos

A primeira versão deve apresentar:

- Lista de orçamentos do cliente
- Ação de criação de novo orçamento

A lista deve exibir, no mínimo:

- Número
- Data
- Valor
- Status
- Origem

Regras:

- O campo `Origem` representa a origem comercial ou tipo de orçamento
- A origem comercial/tipo de orçamento deve ser parametrizável no portal

### Aba Notas Fiscais

A primeira versão deve permitir:

- Lista de notas fiscais
- Visualização de itens da nota
- Download de DANFE/PDF

A ordenação padrão da aba deve exibir as notas mais recentes primeiro.

### Aba MIX

A primeira versão deve focar nos produtos e categorias já comprados pelo cliente.

A aba deve abrir com visão direta por produto, com filtros por categoria.

As colunas mínimas da visão de `MIX` devem ser:

- Produto
- Quantidade
- Última compra
- Valor total
- Frequência de compra

### Aba Comodato

A primeira versão deve permitir consulta detalhada com itens.

As colunas mínimas devem ser:

- Produto
- Quantidade
- Data de entrega
- Status

Regra:

- O status do comodato deve vir exatamente como o ERP informar

## Orçamentos

### Escopo Operacional

- Na V1, apenas o vendedor poderá criar orçamentos
- Supervisor e gerente poderão visualizar, editar e reenviar os orçamentos do time sob sua responsabilidade, respeitando hierarquia e segmentação por empresa

### Política Comercial e Bloqueios

- Quando houver exceções de política comercial, o portal deve apenas sinalizar a condição
- A decisão final deve ocorrer no Protheus
- Quando houver bloqueio por crédito, desconto ou estoque, vendedor, supervisor e gerente apenas visualizam o bloqueio no portal
- O portal não deve permitir liberação manual dessas condições

### Montagem de Itens

Os itens do orçamento devem poder ser montados por:

- Busca direta de produto
- Histórico do cliente
- Sugestão de mix

Na busca de produto do orçamento, a primeira versão deve exibir:

- Código
- Descrição
- Estoque
- Preço
- Último preço do cliente
- Último desconto aplicado por item

Regras:

- O vendedor poderá alterar preço e desconto diretamente no item
- O portal deve permitir a edição, emitir aviso de possível exceção comercial e deixar a decisão final para o Protheus
- Itens sem estoque poderão ser incluídos no orçamento, com aviso no portal
- A tabela de preço da V1 deve ser a tabela padrão do cliente vinda do Protheus

### Status e Envio

- O status do orçamento no portal deve ser atualizado apenas a partir do retorno do Protheus
- O orçamento poderá ser enviado ao cliente pelo portal antes da confirmação final do Protheus
- O portal deve gerar e armazenar log de envio do orçamento ao cliente, contemplando ao menos data/hora, canal utilizado e resultado da tentativa
- Na V1, o canal disponível para envio ao cliente será PDF para download
- O PDF do orçamento deve possuir layout por empresa, com logo e dados comerciais próprios

### Pós-envio e Reenvio

- Após o orçamento ser enviado, ele não poderá mais ser editado
- Se o Protheus retornar que o orçamento não foi aceito, o vendedor não deve corrigir o original
- O fluxo correto da V1 deve ser copiar o orçamento, ajustar a cópia e realizar novo envio
- A cópia deve gerar novo número sequencial do portal
- O sistema deve manter rastreabilidade entre orçamento original e orçamento copiado

### Listagem

A listagem de orçamentos deve priorizar combinação de:

- Status
- Período
- Cliente

A ordenação padrão deve ser `mais recentes primeiro`.

## Proposta Comercial

### Escopo Funcional

- A proposta comercial deve ser gerada a partir de um orçamento existente
- A proposta não substitui o orçamento; ela funciona como camada de apresentação comercial
- O sistema deve permitir mais de uma proposta comercial para o mesmo orçamento

### Modelo de Composição

- A proposta deve usar páginas selecionáveis com ordem livre
- O usuário pode ajustar textos e reorganizar páginas
- Itens e valores do orçamento não podem ser alterados dentro da proposta

### Perfis e Permissões

Podem montar e editar propostas:

- Vendedor
- Supervisor

Conteúdo institucional e biblioteca de páginas devem ser mantidos por:

- Administrativo

Podem aprovar propostas:

- Vendedor
- Supervisor

### Perfis de Proposta

- O sistema deve suportar destinatário/setor e perfil de proposta
- Os perfis de proposta devem ser cadastrados pelo Administrativo
- Cada perfil de proposta deve possuir páginas padrão associadas

### Biblioteca de Páginas

O sistema deve trabalhar com biblioteca de páginas avulsas.

Páginas base da V1:

- Capa
- Sobre a empresa
- Diferenciais
- Produtos
- Condições comerciais
- Fechamento

### Página de Produtos

- A página de produtos deve ser gerada como uma ou mais páginas com grade/lista de produtos

Conteúdo padrão do produto, mantido no portal:

- Foto
- Nome
- Descrição comercial
- Características

Campos vindos do orçamento:

- Quantidade
- Valor

### Integração com Produtos

- Os produtos devem vir do cadastro espelhado do Protheus
- O portal deve permitir complemento comercial do produto

### Condições Comerciais

- A página de condições comerciais deve ser preenchida automaticamente com base no orçamento

Campos mínimos:

- Pagamento
- Prazo de entrega
- Validade
- Observações

### Fechamento

- A página de fechamento deve ser texto livre por proposta

### Exportação e Histórico

- A proposta comercial da V1 deve ser exportada apenas como PDF
- O PDF pode ser gerado antes da aprovação, já com aparência final
- O sistema deve guardar histórico dos PDFs gerados
- O histórico deve registrar no mínimo data/hora e usuário

### Aprovação e Travamento

- A proposta permanece editável até sua aprovação
- Ao ser aprovada, a proposta deve ser travada para edição
- A aprovação da proposta deve disparar o envio do orçamento ao Protheus

## Financeiro do Cliente

O módulo financeiro do cliente deve entrar na primeira versão como consulta com detalhamento de títulos e histórico em aberto, acessível pela aba financeira do Cliente 360.

## Dashboard e Metas

O dashboard de acompanhamento de objetivos deve iniciar como um painel executivo resumido.

### Blocos Obrigatórios

- Metas x realizado
- Ranking comercial
- Carteira sem compra

### Metas

- As metas devem ser cadastradas por empresa, vendedor e ano/mês
- Supervisor e gerente não terão meta própria cadastrada na primeira versão; acompanharão o consolidado do time
- O realizado da meta deve ser calculado com base em nota fiscal faturada no Protheus
- O principal indicador de metas na primeira versão deve ser o percentual atingido

Visão por perfil:

- Vendedor visualiza apenas a própria meta
- Supervisor visualiza consolidado da equipe e detalhe por vendedor
- Gerente visualiza consolidado dos subordinados e detalhe por vendedor

### Ranking Comercial

- A ordenação principal deve ser por percentual da meta atingida
- O ranking da primeira versão deve comparar apenas vendedores

### Carteira sem Compra

O recorte principal deve combinar:

- Quantidade de clientes
- Percentual sobre a carteira
- Lista resumida dos principais clientes impactados

## Cadastros e Parametrizações

### Cadastros Operacionais

A primeira versão deve incluir todos os cadastros comuns previstos no `MASTER_REQUIREMENTS`.

Os cadastros comuns serão mantidos manualmente no portal.

Os cadastros operacionais da primeira versão devem ser administrados pelo perfil `Administrativo`.

### Parâmetros e Segurança

- A administração de usuários, perfis e parâmetros de segurança/sistema deve seguir a documentação específica já existente do projeto, com gestão por `Admin/Diretor`
- Os parâmetros do sistema devem ser definidos por empresa

## Autenticação e Autorização

O PRD deve aproveitar as definições já documentadas em `docs/auth-module.md`, `docs/perfis-module.md` e `docs/parametros-module.md`.

Na primeira versão:

- A autenticação deve utilizar login próprio do portal com e-mail e senha
- A sessão deve utilizar JWT
- O controle de acesso deve ocorrer por perfil e por tela

No modelo funcional da primeira versão, o vínculo principal entre usuário e operação comercial deve ser realizado no cadastro do vendedor, por meio do campo `usuario_id`.

Essa definição prevalece sobre versões anteriores da documentação técnica que utilizavam `vendedor_id` no cadastro de usuário como referência principal.

Supervisor e gerente também devem estar vinculados à estrutura comercial.
