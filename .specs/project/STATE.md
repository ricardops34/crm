# State

## Decisions

- V1 exclui `leads` e `atendimentos`
- V1 exclui atualização cadastral
- Home é a tela inicial para todos os perfis
- MCV é o principal módulo operacional do vendedor
- Vínculo comercial principal usa `usuario_id` no cadastro do vendedor
- Protheus é autoridade final para regras comerciais e cadastro mestre

## Open Decisions

- Modelo físico detalhado das entidades da V1
- Contratos REST completos por módulo
- Estratégia técnica de sincronização com Protheus
- Catálogo completo de status de orçamento consumidos do ERP
- Escopo técnico final do grupo `atendimento` em parâmetros após exclusão da V1

## Blockers

- Nenhum bloqueador funcional no momento

## Deferred Ideas

- Voltar a leads/prospects como feature separada
- Voltar a atendimentos como feature separada
- Evoluir Home com histórico real além de favoritos

## Preferences

- Preferir documentação incremental e rastreável por feature

