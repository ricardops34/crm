# Spec - v1-core

## Scope

Implementar o núcleo funcional da V1 do Visão 360para operação comercial diária, sem incluir leads, atendimentos ou atualização cadastral.

## Requirements

### Access and Context

- `V1-REQ-001` O sistema deve operar em modelo multiempresa com segregação por `empresa_id`.
- `V1-REQ-002` O login deve usar e-mail e senha com JWT e controle de acesso por perfil e tela.
- `V1-REQ-003` O vínculo principal entre usuário e operação comercial deve ser resolvido no cadastro do vendedor via `usuario_id`.
- `V1-REQ-004` O vendedor deve visualizar apenas clientes da própria carteira.
- `V1-REQ-005` O supervisor deve visualizar apenas a própria carteira.
- `V1-REQ-006` O gerente deve visualizar dados comerciais dos supervisores e vendedores subordinados.
- `V1-REQ-007` Administrativo e Financeiro devem visualizar todos os dados da empresa à qual possuem permissão.

### Home

- `V1-REQ-010` Todos os perfis da V1 devem iniciar pela Home.
- `V1-REQ-011` A Home deve exibir notícias, avisos, indicadores por perfil, atalhos e favoritos.
- `V1-REQ-012` Notícias e avisos devem permitir segmentação por empresa e perfil.
- `V1-REQ-013` Notícias e avisos devem ser gerenciáveis por Administrativo e Gerente.

### MCV

- `V1-REQ-020` O MCV deve ser a principal tela operacional do vendedor.
- `V1-REQ-021` O MCV deve usar grade tabular por cliente.
- `V1-REQ-022` O MCV deve exibir as colunas: situação, código, última compra, razão social, cidade, diferença entre mês e média, venda últimos 30 dias, venda média últimos 90 dias, dias e comodato.
- `V1-REQ-023` O MCV deve possuir filtros rápidos de 15/30/60/90/120 dias, bloqueados e ativo.
- `V1-REQ-024` O filtro bloqueados deve representar clientes inativos ou bloqueados no ERP.
- `V1-REQ-025` A situação deve usar ícones visuais: cadeado aberto verde para ativo e cadeado fechado vermelho para bloqueado.
- `V1-REQ-026` As ações por linha devem ser `Cliente 360` e `Financeiro`.
- `V1-REQ-027` O botão `Cliente 360` deve abrir a aba `Cadastro/Resumo`.
- `V1-REQ-028` O botão `Financeiro` deve abrir a aba `Financeiro` do Cliente 360.
- `V1-REQ-029` O MCV não deve possuir cards no topo nem exportação na V1.

### Cliente 360

- `V1-REQ-040` O Cliente 360 deve expor as abas Cadastro/Resumo, Financeiro, Orçamentos, Notas Fiscais, MIX e Comodato.
- `V1-REQ-041` Apenas a aba Orçamentos deve ter ação operacional na V1.
- `V1-REQ-042` A aba Cadastro/Resumo deve exibir razão social, nome fantasia, CNPJ, cidade/UF, contato principal, grupo econômico, CNAE principal, CNAEs secundários e limite de crédito.
- `V1-REQ-043` A aba Cadastro/Resumo deve exibir última compra, dias sem comprar, limite de crédito e títulos em aberto.
- `V1-REQ-044` Dias sem comprar deve ser calculado pela última nota faturada no Protheus.
- `V1-REQ-045` A aba Financeiro deve priorizar títulos em aberto com número, parcela, vencimento, valor, status e boleto.
- `V1-REQ-046` A aba Financeiro não deve listar títulos pagos na V1.
- `V1-REQ-047` A aba Notas Fiscais deve listar notas, itens e permitir download de DANFE/PDF.
- `V1-REQ-048` A aba MIX deve focar em produtos já comprados e abrir por produto com filtro por categoria.
- `V1-REQ-049` A aba MIX deve exibir produto, quantidade, última compra, valor total e frequência de compra.
- `V1-REQ-050` A aba Comodato deve permitir consulta detalhada com produto, quantidade, data de entrega e status.

### Quotations

- `V1-REQ-060` Apenas o vendedor pode criar orçamentos na V1.
- `V1-REQ-061` Supervisor e gerente podem visualizar, editar e reenviar orçamentos do time sob sua responsabilidade.
- `V1-REQ-062` O módulo de orçamentos deve estar acessível por menu e pelo Cliente 360.
- `V1-REQ-063` A lista de orçamentos do Cliente 360 deve exibir número, data, valor, status e origem.
- `V1-REQ-064` A origem comercial/tipo de orçamento deve ser parametrizável no portal.
- `V1-REQ-065` Os itens do orçamento devem poder ser montados por busca direta, histórico do cliente e sugestão de mix.
- `V1-REQ-066` A busca de produto deve exibir código, descrição, estoque, preço, último preço do cliente e último desconto por item.
- `V1-REQ-067` O vendedor pode alterar preço e desconto do item.
- `V1-REQ-068` O portal deve apenas avisar exceções comerciais e permitir o envio; a decisão final é do Protheus.
- `V1-REQ-069` Itens sem estoque podem entrar no orçamento com aviso.
- `V1-REQ-070` A tabela de preço padrão deve vir do Protheus.
- `V1-REQ-071` O status do orçamento no portal deve ser atualizado apenas por retorno do Protheus.
- `V1-REQ-072` O orçamento pode ser enviado ao cliente antes da confirmação final do Protheus.
- `V1-REQ-073` O portal deve gerar log de envio do orçamento.
- `V1-REQ-074` O canal da V1 é PDF para download com layout por empresa.
- `V1-REQ-075` Após enviado, o orçamento não pode mais ser editado.
- `V1-REQ-076` Se não aceito pelo Protheus, o orçamento deve ser copiado, ajustado e reenviado.
- `V1-REQ-077` A cópia deve gerar novo sequencial e manter rastreabilidade com o original.
- `V1-REQ-078` A listagem de orçamentos deve filtrar por status, período e cliente e ordenar por mais recentes primeiro.

### Commercial Proposal

- `V1-REQ-080` A proposta comercial deve ser gerada a partir de um orçamento existente.
- `V1-REQ-081` A proposta comercial deve funcionar como camada de apresentação comercial sem alterar itens e valores do orçamento.
- `V1-REQ-082` O sistema deve permitir múltiplas propostas para o mesmo orçamento.
- `V1-REQ-083` A proposta deve usar páginas selecionáveis com ordem livre.
- `V1-REQ-084` Vendedor e supervisor podem montar, editar e aprovar propostas.
- `V1-REQ-085` O conteúdo institucional e os perfis de proposta devem ser administrados pelo Administrativo.
- `V1-REQ-086` A proposta deve suportar destinatário/setor e perfil de proposta.
- `V1-REQ-087` A biblioteca base da V1 deve incluir capa, sobre a empresa, diferenciais, produtos, condições comerciais e fechamento.
- `V1-REQ-088` A página de produtos deve usar conteúdo padrão do produto no portal e quantidade/valor vindos do orçamento.
- `V1-REQ-089` A página de condições comerciais deve ser alimentada automaticamente com pagamento, prazo de entrega, validade e observações do orçamento.
- `V1-REQ-090` A página de fechamento deve ser texto livre por proposta.
- `V1-REQ-091` A proposta deve exportar apenas PDF e manter histórico mínimo de data/hora e usuário.
- `V1-REQ-092` A aprovação da proposta deve travar sua edição e disparar o envio do orçamento ao Protheus.

### Dashboard and Goals

- `V1-REQ-100` O dashboard deve iniciar como painel executivo resumido.
- `V1-REQ-101` O dashboard deve conter blocos de metas x realizado, ranking comercial e carteira sem compra.
- `V1-REQ-102` Metas devem ser cadastradas por empresa, vendedor e ano/mês.
- `V1-REQ-103` O realizado da meta deve usar nota fiscal faturada no Protheus.
- `V1-REQ-104` O principal indicador de metas deve ser percentual atingido.
- `V1-REQ-105` O ranking deve ser por percentual da meta e comparar apenas vendedores.
- `V1-REQ-106` O bloco de carteira sem compra deve combinar quantidade, percentual e lista resumida.
- `V1-REQ-107` O módulo de metas deve respeitar a visão por perfil: vendedor própria meta, supervisor consolidado + detalhe por vendedor, gerente consolidado dos subordinados + detalhe por vendedor.

### Operational Registries

- `V1-REQ-120` A V1 deve incluir os cadastros comuns do `MASTER_REQUIREMENTS`.
- `V1-REQ-121` Os cadastros operacionais devem ser mantidos manualmente no portal.
- `V1-REQ-122` Os cadastros operacionais devem ser administrados por Administrativo.
- `V1-REQ-123` Usuários, perfis e parâmetros de segurança/sistema devem seguir gestão por Admin/Diretor.

## Exclusions

- `V1-EXC-001` Leads e prospects não fazem parte da V1.
- `V1-EXC-002` Atendimentos não fazem parte da V1.
- `V1-EXC-003` Atualização cadastral não faz parte da V1.

## Open Technical Topics

- `V1-OPEN-001` Modelo físico detalhado das tabelas de negócio.
- `V1-OPEN-002` Contratos REST completos por recurso.
- `V1-OPEN-003` Estratégia técnica de sincronização e retry com Protheus.
- `V1-OPEN-004` Catálogo exato de status retornados pelo Protheus para orçamento e financeiro.
