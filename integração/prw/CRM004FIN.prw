// ============================================================
// CRM004FIN.prw  -  Sincronizacao de Titulos Financeiros
// POST /integracao/titulos  (upsert empresa_id + numero + parcela)
// Origem: SE1 via TCQuery
// ============================================================
#Include "Protheus.ch"

#Define FIN_PATH  "/integracao/titulos"
#Define FIN_LOTE  100
#Define FIN_STKEY "MV_CRMSTFI"

User Function CRM004FIN()
    Local _cStamp  := GetMv(FIN_STKEY)
    Local _cNStamp := ""
    Local _aLote   := {}
    Local _nEnv    := 0
    Local _nErr    := 0
    Local _oQry
    Local _oRest
    Local _cTabSE1 := RetSQLName("SE1")
    Local _cFil    := xFilial("SE1")
    Local _cSql    := ""
    Local _cBody   := ""
    Local _cStat   := ""
    Local _cJ      := ""
    Local _cStatus := ""
    Local _dVencto
    Local _cDtJs   := ""
    Local _nI      := 0

    If Empty(_cStamp)
        _cStamp := "19000101000000"
    EndIf

    ConOut("[CRM004FIN] inicio stamp:" + _cStamp)

    _cSql := "SELECT E1_NUM, E1_PARCELA, E1_CLIENTE, E1_LOJA, " + ;
             "       E1_VENCTO, E1_VALOR, E1_SALDO, E1_BAIXA, S_T_A_M_P_ " + ;
             "  FROM " + _cTabSE1 + ;
             " WHERE E1_FILIAL = '" + _cFil + "'" + ;
             "   AND D_E_L_E_T_ = ' '" + ;
             "   AND S_T_A_M_P_ >= '" + _cStamp + "'" + ;
             " ORDER BY S_T_A_M_P_"

    _oQry := TCQuery(_cSql, .T., "QFI001")

    While _oQry->(!EOF())
        If _oQry->S_T_A_M_P_ > _cNStamp
            _cNStamp := _oQry->S_T_A_M_P_
        EndIf

        _dVencto := STOD(AllTrim(_oQry->E1_VENCTO))
        _cDtJs   := If(Empty(_dVencto), "null", ;
                       '"' + SubStr(DTOS(_dVencto),1,4) + '-' + ;
                             SubStr(DTOS(_dVencto),5,2) + '-' + ;
                             SubStr(DTOS(_dVencto),7,2) + '"')

        If !Empty(AllTrim(_oQry->E1_BAIXA))
            _cStatus := "baixado"
        ElseIf Val(_oQry->E1_SALDO) <= 0
            _cStatus := "baixado"
        ElseIf _dVencto < Date()
            _cStatus := "vencido"
        Else
            _cStatus := "aberto"
        EndIf

        _cJ := '{'
        _cJ += '"empresa_id":'      + cValToChar(Val(GetMv("MV_CRMEID"))) + ','
        _cJ += '"cod_erp_cliente":' + '"' + AllTrim(_oQry->E1_CLIENTE) + AllTrim(_oQry->E1_LOJA) + '",'
        _cJ += '"numero":'          + '"' + AllTrim(_oQry->E1_NUM) + '",'
        _cJ += '"parcela":'         + '"' + AllTrim(_oQry->E1_PARCELA) + '",'
        _cJ += '"vencimento":'      + _cDtJs + ','
        _cJ += '"valor":'           + cValToChar(Val(_oQry->E1_VALOR)) + ','
        _cJ += '"saldo":'           + cValToChar(Val(_oQry->E1_SALDO)) + ','
        _cJ += '"status":'          + '"' + _cStatus + '"'
        _cJ += '}'

        AAdd(_aLote, _cJ)

        If Len(_aLote) >= FIN_LOTE
            _cBody := '{"registros":['
            For _nI := 1 To Len(_aLote)
                _cBody += _aLote[_nI]
                If _nI < Len(_aLote) ; _cBody += "," ; EndIf
            Next _nI
            _cBody += ']}'

            _oRest := FWRest(GetMv("MV_CRMURL"))
            _oRest:SetPath(FIN_PATH)
            _oRest:SetHeader("Authorization", "Bearer " + GetMv("MV_CRMTKN"))
            _oRest:SetHeader("Content-Type", "application/json")
            If _oRest:Post(_cBody)
                _cStat := cValToChar(_oRest:nStatusCode)
                If _cStat $ "200|201"
                    _nEnv += Len(_aLote)
                Else
                    _nErr += Len(_aLote)
                    ConOut("[CRM004FIN] HTTP " + _cStat + " " + SubStr(_oRest:GetResult(),1,150))
                EndIf
            Else
                _nErr += Len(_aLote)
                ConOut("[CRM004FIN] FWRest erro: " + _oRest:GetLastError())
            EndIf
            FreeObj(_oRest)
            _aLote := {}
        EndIf

        _oQry->(DbSkip())
    End While
    _oQry->(DbCloseArea())

    If Len(_aLote) > 0
        _cBody := '{"registros":['
        For _nI := 1 To Len(_aLote)
            _cBody += _aLote[_nI]
            If _nI < Len(_aLote) ; _cBody += "," ; EndIf
        Next _nI
        _cBody += ']}'

        _oRest := FWRest(GetMv("MV_CRMURL"))
        _oRest:SetPath(FIN_PATH)
        _oRest:SetHeader("Authorization", "Bearer " + GetMv("MV_CRMTKN"))
        _oRest:SetHeader("Content-Type", "application/json")
        If _oRest:Post(_cBody)
            _cStat := cValToChar(_oRest:nStatusCode)
            If _cStat $ "200|201"
                _nEnv += Len(_aLote)
            Else
                _nErr += Len(_aLote)
                ConOut("[CRM004FIN] HTTP " + _cStat + " " + SubStr(_oRest:GetResult(),1,150))
            EndIf
        Else
            _nErr += Len(_aLote)
            ConOut("[CRM004FIN] FWRest erro: " + _oRest:GetLastError())
        EndIf
        FreeObj(_oRest)
    EndIf

    If _nErr == 0 .And. !Empty(_cNStamp)
        PutMv(FIN_STKEY, _cNStamp)
    EndIf

    ConOut("[CRM004FIN] fim env:" + cValToChar(_nEnv) + " err:" + cValToChar(_nErr))
Return
