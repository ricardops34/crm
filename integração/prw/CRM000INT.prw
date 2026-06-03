// ============================================================
// CRM000INT.prw  -  Centralizadora de Integracao CRM Visao 360
// Menu  : barra de progresso (MsNewProcess)
// JOB   : execucao silenciosa via Schedule / AppServer
//
// Parametros SX6:
//   MV_CRMURL  - URL base da API
//   MV_CRMTKN  - Bearer token
//   MV_CRMEID  - empresa_id numerico
//   MV_CRMPRTB - tabela de preco padrao
// ============================================================
#Include "Protheus.ch"

Static _aEP := { ;
    { "Clientes"          , "CRM001CLI" }, ;
    { "Produtos"          , "CRM002PRD" }, ;
    { "Notas Fiscais"     , "CRM003NF"  }, ;
    { "Titulos Financ."   , "CRM004FIN" }, ;
    { "Vendedores"        , "CRM005VND" } }

User Function CRM000INT()
    If Empty(GetClientType()) .Or. GetClientType() == "BATCH"
        U_INT0Job()
    Else
        U_INT0Menu()
    EndIf
Return

User Function INT0Menu()
    Local _oBar
    Local _nTotal := Len(_aEP)
    Local _nI     := 0
    Local _lOk    := .T.
    Local _aErros := {}
    Local _cErros := ""
    Local _cMsg   := ""

    _oBar := MsNewProcess():New()
    _oBar:SetRegua(_nTotal)
    _oBar:SetMensagem("Iniciando integracao CRM...")
    _oBar:Open()

    For _nI := 1 To _nTotal
        _cMsg := "Sincronizando: " + _aEP[_nI][1] + ;
                 " (" + cValToChar(_nI) + "/" + cValToChar(_nTotal) + ")"
        _oBar:SetMensagem(_cMsg)
        _oBar:IncRegua()

        Begin Sequence
            ExecBlock(_aEP[_nI][2], .F., .F.)
        Recover
            _lOk := .F.
            AAdd(_aErros, _aEP[_nI][1])
        End Sequence
    Next _nI

    _oBar:Close()

    If _lOk
        MsgInfo("Integracao CRM concluida com sucesso!", "CRM Visao 360")
    Else
        AEval(_aErros, {|_x| _cErros += "  - " + _x + Chr(13)})
        MsgAlert("Erros nos endpoints:" + Chr(13) + _cErros, "CRM Visao 360")
    EndIf
Return

User Function INT0Job()
    Local _nI := 0
    ConOut("=== CRM Integracao " + DToC(Date()) + " " + Time() + " ===")
    For _nI := 1 To Len(_aEP)
        ConOut("-> " + _aEP[_nI][1])
        Begin Sequence
            ExecBlock(_aEP[_nI][2], .F., .F.)
            ConOut("OK: " + _aEP[_nI][1])
        Recover
            ConOut("ERRO: " + _aEP[_nI][1])
        End Sequence
    Next _nI
    ConOut("=== CRM Integracao finalizada ===")
Return
