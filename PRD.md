# PRD - CRM Comercial 360 RCG/CBA

## Base de Referência

Este PRD consolida e detalha o escopo definido em `MASTER_REQUIREMENTS.md`.

## Objetivo da Primeira Versão

A primeira versão do produto deve priorizar a operação comercial do dia a dia, com foco em produtividade do time de vendas, visão consolidada do cliente e suporte ao processo comercial integrado ao ERP.

## Prioridades da Primeira Versão

### Prioridade Principal

1. MCV + Cliente 360
2. Orçamentos integrados ao Protheus

### Prioridades Complementares

1. Dashboard de acompanhamento de objetivos
2. Cadastros e parametrizações
3. Metas e gestão comercial
4. Financeiro do cliente
5. Atendimentos e agenda de retorno

## Usuários da Primeira Versão

O go-live da primeira versão deve atender os seguintes perfis:

- Vendedores
- Supervisores
- Gerentes
- Áreas de apoio, incluindo Administrativo e Financeiro

O Diretor Comercial não fará parte da primeira versão. Esse perfil deve ser tratado em fase posterior.

## Escopo de Visibilidade na Primeira Versão

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

## Integração e Autoridade de Cadastro

No go-live, clientes e produtos serão espelhados do Protheus, sem criação manual no portal.

O Protheus deve ser tratado como autoridade final para aceite e consolidação do cadastro de cliente.

## Orçamentos na Primeira Versão

Na primeira versão, apenas o vendedor poderá criar orçamentos.

Supervisor e gerente poderão visualizar, editar e reenviar os orçamentos do time sob sua responsabilidade, respeitando a hierarquia e a segmentação por empresa.

Quando houver exceções de política comercial, o portal deve apenas sinalizar a condição. A decisão final deve ocorrer no Protheus.

Quando houver bloqueio por crédito, desconto ou estoque, vendedor, supervisor e gerente apenas visualizam o bloqueio no portal. O portal não deve permitir liberação manual dessas condições.

O status do orçamento no portal deve ser atualizado apenas a partir do retorno do Protheus.

O orçamento poderá ser enviado ao cliente pelo portal antes da confirmação final do Protheus.

O portal deve gerar e armazenar log de envio do orçamento ao cliente, contemplando ao menos data/hora, canal utilizado e resultado da tentativa de envio.

Na primeira versão, o canal disponível para envio ao cliente será PDF para download.

O PDF do orçamento deve possuir layout por empresa, com logo e dados comerciais próprios.

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

O vendedor poderá alterar preço e desconto diretamente no item do orçamento.

O portal deve permitir a edição, emitir aviso de possível exceção comercial e deixar a decisão final para o Protheus.

Itens sem estoque poderão ser incluídos no orçamento, com aviso no portal.

A tabela de preço utilizada na primeira versão deve ser a tabela padrão do cliente vinda do Protheus.

Após o orçamento ser enviado, ele não poderá mais ser editado.

Se o Protheus retornar que o orçamento não foi aceito, o vendedor não deve corrigir o orçamento original. O fluxo correto da primeira versão deve ser copiar o orçamento, ajustar a cópia e realizar novo envio.

A cópia do orçamento deve gerar novo número sequencial do portal.

O sistema deve manter rastreabilidade entre orçamento original e orçamento copiado.

## MCV e Cliente 360

No MCV, a ação principal da primeira versão deve ser a abertura do Cliente 360.

No MCV, cada linha da grade principal deve representar um cliente.

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

O MCV deve possuir ações rápidas por linha. Na primeira versão, os botões disponíveis por cliente devem ser:

- Cliente 360
- Financeiro

As ações principais do MCV devem ocorrer por botões/ícones na linha, e não por clique genérico sobre a linha inteira.

O botão `Cliente 360` do MCV deve abrir o cliente sempre na aba padrão `Cadastro/Resumo`.

O botão `Financeiro` do MCV deve abrir o Cliente 360 já posicionado na aba `Financeiro`.

No Cliente 360, a aba padrão de abertura deve ser `Cadastro/Resumo do cliente`.

O Cliente 360 deve expor, já na primeira versão, todas as abas previstas no requisito original, mesmo quando parte delas operar inicialmente em modo prioritariamente consultivo.

Na primeira versão, apenas a aba de Orçamentos deve possuir ação operacional dentro do Cliente 360.

O módulo de Orçamentos deve estar acessível por menu próprio e também a partir do Cliente 360.

Na aba `Orçamentos` do Cliente 360, a primeira versão deve apresentar lista de orçamentos do cliente e ação de criação de novo orçamento.

A lista de orçamentos do cliente deve exibir, no mínimo:

- Número
- Data
- Valor
- Status
- Origem

O campo `Origem` do orçamento deve representar a origem comercial ou tipo de orçamento.

A origem comercial/tipo de orçamento deve ser parametrizável no portal.

A atualização cadastral do cliente não fará parte da primeira versão.

Os indicadores obrigatórios do resumo inicial do cliente na primeira versão são:

- Última compra
- Dias sem comprar
- Limite de crédito
- Títulos em aberto

O indicador `dias sem comprar` deve ser calculado com base na última nota faturada no Protheus.

Desconto não deve ser tratado como indicador-resumo do cliente. O desconto deve ser controlado por item do orçamento.

Os filtros rápidos do MCV na primeira versão devem contemplar:

- 15 dias
- 30 dias
- 60 dias
- 90 dias
- 120 dias
- Bloqueados
- Ativo

Na primeira versão, o MCV não deve exibir cards-resumo no topo. A tela deve priorizar grade, filtros e ações operacionais.

O MCV não deve possuir exportação na primeira versão.

O botão `Atualizar` do MCV deve apenas reconsultar os dados já disponíveis no portal.

O filtro `Bloqueados` do MCV deve representar clientes inativos ou bloqueados no ERP.

A coluna `Situação` do MCV deve utilizar semáforo visual sem texto, com a seguinte leitura:

- Cadeado aberto verde para cliente ativo
- Cadeado fechado vermelho para cliente bloqueado

Mesmo quando o cliente estiver bloqueado, os acessos a `Cliente 360` e `Financeiro` devem permanecer disponíveis.

Na aba `Notas Fiscais`, a primeira versão deve permitir:

- Lista de notas fiscais
- Visualização de itens da nota
- Download de DANFE/PDF

A ordenação padrão da aba `Notas Fiscais` deve exibir as notas mais recentes primeiro.

Na aba `MIX`, a primeira versão deve focar nos produtos e categorias já comprados pelo cliente.

Na primeira versão, a aba `MIX` deve abrir com visão direta por produto, com filtros por categoria.

As colunas mínimas da visão de `MIX` devem ser:

- Produto
- Quantidade
- Última compra
- Valor total
- Frequência de compra

Na aba `Comodato`, a primeira versão deve permitir consulta detalhada com itens.

Na aba `Cadastro/Resumo`, a primeira versão deve exibir no mínimo:

- Razão social
- Nome fantasia
- CNPJ
- Cidade/UF
- Contato principal
- Grupo econômico
- CNAE principal
- CNAEs secundários
- Limite de crédito

Na primeira versão, o contato principal deve vir apenas do cadastro espelhado do Protheus.

## Home e Navegação Inicial

Todos os perfis da primeira versão devem acessar inicialmente uma Home comum do sistema.

A Home deve apresentar conteúdo adaptado ao perfil do usuário e contemplar, no mínimo:

- Notícias
- Avisos
- Indicadores relacionados ao perfil do usuário
- Atalhos do usuário
- Favoritos do usuário

O MCV permanece como módulo operacional principal do vendedor, mas não deve ser a tela inicial de login.

Na primeira versão, notícias e avisos da Home poderão ser gerenciados por Administrativo e Gerente.

Notícias e avisos devem permitir segmentação por empresa e por perfil.

Os atalhos da Home devem seguir modelo misto, com parte fixa por contexto/perfil e parte personalizável pelo usuário.

## Dashboard de Acompanhamento

O dashboard de acompanhamento de objetivos deve iniciar como um painel executivo resumido.

Na primeira versão, os blocos obrigatórios do dashboard são:

- Metas x realizado
- Ranking comercial
- Carteira sem compra

Na primeira versão, as metas devem ser cadastradas por empresa, vendedor e ano/mês.

Supervisor e gerente não terão meta própria cadastrada na primeira versão. Esses perfis devem acompanhar o consolidado do time.

O realizado da meta deve ser calculado com base em nota fiscal faturada no Protheus.

O principal indicador de metas na primeira versão deve ser o percentual atingido.

No bloco de carteira sem compra, o recorte principal deve combinar quantidade de clientes e lista resumida dos principais clientes impactados.

Esse bloco deve priorizar leitura executiva por meio de indicadores sintéticos, como quantidade e percentual sobre a carteira, com possibilidade de detalhamento em lista resumida.

No bloco de ranking comercial, a ordenação principal da primeira versão deve ser por percentual da meta atingida.

O ranking comercial da primeira versão deve comparar apenas vendedores.

O módulo de metas da primeira versão deve estar disponível para todos os perfis da V1, com visão filtrada conforme permissão e escopo hierárquico.

No módulo de metas:

- Vendedor visualiza apenas a própria meta
- Supervisor visualiza consolidado da equipe e detalhe por vendedor
- Gerente visualiza consolidado dos subordinados e detalhe por vendedor

## Escopo Fora da V1

O módulo de atendimentos não fará parte da primeira versão, embora permaneça como requisito previsto para fases futuras.

A tela e as permissões de `atendimentos` também devem ser removidas da V1 em menu, perfis e catálogo funcional visível ao usuário.

O módulo de leads também não fará parte da primeira versão e deve ser tratado em fase posterior, incluindo conversão, agenda de atividades e integração de prospects.

## Financeiro do Cliente na V1

O módulo financeiro do cliente deve entrar na primeira versão como consulta com detalhamento de títulos e histórico.

Os boletos devem estar disponíveis para download e reenvio.

Na primeira versão, o reenvio de boletos não deve ocorrer por canal direto no portal. O portal deve apenas disponibilizar link e download do boleto.

No Cliente 360, o financeiro deve aparecer como aba própria.

Na aba `Financeiro` do Cliente 360, a abertura da primeira versão deve priorizar títulos em aberto.

A lista de títulos em aberto deve apresentar, no mínimo:

- Número
- Parcela
- Vencimento
- Valor
- Status
- Boleto

O status do título deve ser exibido exatamente conforme retornado pelo ERP, sem simplificação do portal.

Na primeira versão, a aba `Financeiro` não deve listar títulos já pagos.

## Cadastros e Parametrizações na V1

A primeira versão deve incluir todos os cadastros comuns previstos no `MASTER_REQUIREMENTS`.

Os cadastros comuns serão mantidos manualmente no portal.

A administração de usuários, perfis e parâmetros de segurança/sistema deve seguir a documentação específica já existente do projeto, com gestão por Admin/Diretor.

Os cadastros operacionais da primeira versão devem ser administrados pelo perfil Administrativo.

Os parâmetros do sistema devem ser definidos por empresa.

## Autenticação e Autorização

O PRD deve aproveitar as definições já documentadas em `docs/auth-module.md`, `docs/perfis-module.md` e `docs/parametros-module.md`.

Na primeira versão, a autenticação deve utilizar login próprio do portal com e-mail e senha, emissão de JWT e controle de acesso por perfil e por tela.

No modelo funcional da primeira versão, o vínculo principal entre usuário e operação comercial deve ser realizado no cadastro do vendedor, por meio do campo `usuario_id`.

Essa definição prevalece sobre versões anteriores da documentação técnica que utilizavam `vendedor_id` no cadastro de usuário como referência principal.

Supervisor e gerente também devem estar vinculados à estrutura comercial.

A estrutura comercial da primeira versão deve ser carregada apenas do Protheus.
