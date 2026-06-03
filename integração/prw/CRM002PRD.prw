// ============================================================
// CRM002PRD.prw  -  Sincronizacao de Produtos
// POST /integracao/produtos  (upsert empresa_id + cod_erp)
// Origem: SB1 via TCQuery + SB2 (saldo) + DA0 (preco)
// ============================================================
#Include "Protheus.ch"

#Define PRD_PATH  "/integracao/produtos"
#Define PRD_LOTE  100
#Define PRD_STKEY "MV_CRMSTPR"

User Function CRM002PRD()
    Local _cStamp  := GetMv(PRD_STKEY)
    Local _cNStamp := ""
    Local _aLote   := {}
    Local _nEnv    := 0
    Local _nErr    := 0
    Local _oQry
    Local _oAux
    Local _oRest
    Local _cTabSB1 := RetSQLName("SB1")
    Local _cTabSB2 := RetSQLName("SB2")
    Local _cTabDA0 := RetSQLName("DA0")
    Local _cFil    := xFilial("SB1")
    Local _cFilSB2 := xFilial("SB2")
    Local _cFilDA0 := xFilial("DA0")
    Local _cTabPrc := GetMv("MV_CRMPRTB")
    Local _cSql    := ""
    Local _cBody   := ""
    Local _cStat   := ""
    Local _cJ      := ""
    Local _cCod    := ""
    Local _cDesc   := ""
    Local _nEst    := 0
    Local _nPrc    := 0
    Local _nI      := 0

    If Empty(_cStamp)
        _cStamp := "19000101000000"
    EndIf

    ConOut("[CRM002PRD] inicio stamp:" + _cStamp)

    _cSql := "SELECT B1_COD, B1_DESC, B1_UM, B1_PRV1, B1_MSBLQL, S_T_A_M_P_ " + ;
             "  FROM " + _cTabSB1 + ;
             " WHERE B1_FILIAL = '" + _cFil + "'" + ;
             "   AND D_E_L_E_T_ = ' '" + ;
             "   AND S_T_A_M_P_ >= '" + _cStamp + "'" + ;
             " ORDER BY S_T_A_M_P_"

    _oQry := TCQuery(_cSql, .T., "QPR001")

    While _oQry->(!EOF())
        If _oQry->S_T_A_M_P_ > _cNStamp
            _cNStamp := _oQry->S_T_A_M_P_
        EndIf

        _cCod  := AllTrim(_oQry->B1_COD)
        _cDesc := StrTran(StrTran(AllTrim(_oQry->B1_DESC), '\','\\'), '"','\"')
        _nEst  := 0
        _nPrc  := Val(_oQry->B1_PRV1)

        // Saldo em SB2
        _oAux := TCQuery( ;
            "SELECT B2_QATU FROM " + _cTabSB2 + ;
            " WHERE B2_FILIAL = '" + _cFilSB2 + "'" + ;
            "   AND B2_COD = '" + _cCod + "'" + ;
            "   AND D_E_L_E_T_ = ' '", .T., "QPR002")
        If !_oAux->EOF()
            _nEst := Val(_oAux->B2_QATU)
        EndIf
        _oAux->(DbCloseArea())

        // Preco em DA0
        If !Empty(_cTabPrc)
            _oAux := TCQuery( ;
                "SELECT DA0_PRCVEN FROM " + _cTabDA0 + ;
                " WHERE DA0_FILIAL = '" + _cFilDA0 + "'" + ;
                "   AND DA0_TABELA = '" + _cTabPrc + "'" + ;
                "   AND DA0_CODPRO = '" + _cCod + "'" + ;
                "   AND D_E_L_E_T_ = ' '", .T., "QPR003")
            If !_oAux->EOF()
                _nPrc := Val(_oAux->DA0_PRCVEN)
            EndIf
            _oAux->(DbCloseArea())
        EndIf

        _cJ := '{'
        _cJ += '"empresa_id":'   + cValToChar(Val(GetMv("MV_CRMEID"))) + ','
        _cJ += '"cod_erp":'      + '"' + _cCod + '",'
        _cJ += '"descricao":'    + '"' + _cDesc + '",'
        _cJ += '"unidade":'      + '"' + AllTrim(_oQry->B1_UM) + '",'
        _cJ += '"estoque":'      + cValToChar(_nEst) + ','
        _cJ += '"preco_tabela":' + cValToChar(_nPrc) + ','
        _cJ += '"ativo":'        + If(AllTrim(_oQry->B1_MSBLQL) <> "1", "true", "false")
        _cJ += '}'

        AAdd(_aLote, _cJ)

        If Len(_aLote) >= PRD_LOTE
            _cBody := '{"registros":['
            For _nI := 1 To Len(_aLote)
                _cBody += _aLote[_nI]
                If _nI < Len(_aLote) ; _cBody += "," ; EndIf
            Next _nI
            _cBody += ']}'

            _oRest := FWRest(GetMv("MV_CRMURL"))
            _oRest:SetPath(PRD_PATH)
            _oRest:SetHeader("Authorization", "Bearer " + GetMv("MV_CRMTKN"))
            _oRest:SetHeader("Content-Type", "application/json")
            If _oRest:Post(_cBody)
                _cStat := cValToChar(_oRest:nStatusCode)
                If _cStat $ "200|201"
                    _nEnv += Len(_aLote)
                Else
                    _nErr += Len(_aLote)
                    ConOut("[CRM002PRD] HTTP " + _cStat + " " + SubStr(_oRest:GetResult(),1,150))
                EndIf
            Else
                _nErr += Len(_aLote)
                ConOut("[CRM002PRD] FWRest erro: " + _oRest:GetLastError())
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
        _oRest:SetPath(PRD_PATH)
        _oRest:SetHeader("Authorization", "Bearer " + GetMv("MV_CRMTKN"))
        _oRest:SetHeader("Content-Type", "application/json")
        If _oRest:Post(_cBody)
            _cStat := cValToChar(_oRest:nStatusCode)
            If _cStat $ "200|201"
                _nEnv += Len(_aLote)
            Else
                _nErr += Len(_aLote)
                ConOut("[CRM002PRD] HTTP " + _cStat + " " + SubStr(_oRest:GetResult(),1,150))
            EndIf
        Else
            _nErr += Len(_aLote)
            ConOut("[CRM002PRD] FWRest erro: " + _oRest:GetLastError())
        EndIf
        FreeObj(_oRest)
    EndIf

    If _nErr == 0 .And. !Empty(_cNStamp)
        PutMv(PRD_STKEY, _cNStamp)
    EndIf

    ConOut("[CRM002PRD] fim env:" + cValToChar(_nEnv) + " err:" + cValToChar(_nErr))
Return
