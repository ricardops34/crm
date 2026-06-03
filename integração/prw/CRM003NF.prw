// ============================================================
// CRM003NF.prw  -  Sincronizacao de Notas Fiscais de Saida
// POST /integracao/notas-fiscais
// Origem: SF2 + SD2 via TCQuery
// ============================================================
#Include "Protheus.ch"

#Define NF_PATH   "/integracao/notas-fiscais"
#Define NF_LOTE   20
#Define NF_STKEY  "MV_CRMSTNE"

User Function CRM003NF()
    Local _cStamp  := GetMv(NF_STKEY)
    Local _cNStamp := ""
    Local _aLote   := {}
    Local _nEnv    := 0
    Local _nErr    := 0
    Local _oQry
    Local _oItens
    Local _oRest
    Local _cTabSF2 := RetSQLName("SF2")
    Local _cTabSD2 := RetSQLName("SD2")
    Local _cFil    := xFilial("SF2")
    Local _cFilSD2 := xFilial("SD2")
    Local _cSql    := ""
    Local _cBody   := ""
    Local _cStat   := ""
    Local _cJ      := ""
    Local _cNum    := ""
    Local _cSerie  := ""
    Local _cItensJ := ""
    Local _dEmis
    Local _cDtJs   := ""
    Local _nI      := 0

    If Empty(_cStamp)
        _cStamp := "19000101000000"
    EndIf

    ConOut("[CRM003NF] inicio stamp:" + _cStamp)

    _cSql := "SELECT F2_DOC, F2_SERIE, F2_CLIENTE, F2_LOJA, F2_EMISSAO, F2_VALBRUT, S_T_A_M_P_ " + ;
             "  FROM " + _cTabSF2 + ;
             " WHERE F2_FILIAL = '" + _cFil + "'" + ;
             "   AND D_E_L_E_T_ = ' '" + ;
             "   AND F2_TIPO <> 'E'" + ;
             "   AND S_T_A_M_P_ >= '" + _cStamp + "'" + ;
             " ORDER BY S_T_A_M_P_"

    _oQry := TCQuery(_cSql, .T., "QNF001")

    While _oQry->(!EOF())
        If _oQry->S_T_A_M_P_ > _cNStamp
            _cNStamp := _oQry->S_T_A_M_P_
        EndIf

        _cNum   := AllTrim(_oQry->F2_DOC)
        _cSerie := AllTrim(_oQry->F2_SERIE)
        _dEmis  := STOD(AllTrim(_oQry->F2_EMISSAO))
        _cDtJs  := If(Empty(_dEmis), "null", ;
                      '"' + SubStr(DTOS(_dEmis),1,4) + '-' + ;
                            SubStr(DTOS(_dEmis),5,2) + '-' + ;
                            SubStr(DTOS(_dEmis),7,2) + '"')

        // Busca itens da NF
        _cItensJ := "["
        _oItens := TCQuery( ;
            "SELECT D2_COD, D2_DESCRI, D2_QUANT, D2_PRCVEN, D2_TOTAL " + ;
            "  FROM " + _cTabSD2 + ;
            " WHERE D2_FILIAL = '" + _cFilSD2 + "'" + ;
            "   AND D2_DOC = '" + _cNum + "'" + ;
            "   AND D2_SERIE = '" + _cSerie + "'" + ;
            "   AND D_E_L_E_T_ = ' '", .T., "QNF002")

        _nI := 0
        While _oItens->(!EOF())
            If _nI > 0
                _cItensJ += ","
            EndIf
            _cItensJ += '{'
            _cItensJ += '"cod_produto":'    + '"' + AllTrim(_oItens->D2_COD) + '",'
            _cItensJ += '"descricao":'      + '"' + StrTran(StrTran(AllTrim(_oItens->D2_DESCRI),'\','\\'),'"','\"') + '",'
            _cItensJ += '"quantidade":'     + cValToChar(Val(_oItens->D2_QUANT)) + ','
            _cItensJ += '"valor_unitario":' + cValToChar(Val(_oItens->D2_PRCVEN)) + ','
            _cItensJ += '"valor_total":'    + cValToChar(Val(_oItens->D2_TOTAL))
            _cItensJ += '}'
            _nI++
            _oItens->(DbSkip())
        End While
        _oItens->(DbCloseArea())
        _cItensJ += "]"

        // Ignora NF sem itens
        If _nI == 0
            _oQry->(DbSkip())
            Loop
        EndIf

        _cJ := '{'
        _cJ += '"empresa_id":'      + cValToChar(Val(GetMv("MV_CRMEID"))) + ','
        _cJ += '"cod_erp_cliente":' + '"' + AllTrim(_oQry->F2_CLIENTE) + AllTrim(_oQry->F2_LOJA) + '",'
        _cJ += '"numero":'          + '"' + _cNum + '",'
        _cJ += '"serie":'           + '"' + _cSerie + '",'
        _cJ += '"data_emissao":'    + _cDtJs + ','
        _cJ += '"valor_total":'     + cValToChar(Val(_oQry->F2_VALBRUT)) + ','
        _cJ += '"itens":'           + _cItensJ
        _cJ += '}'

        AAdd(_aLote, _cJ)

        If Len(_aLote) >= NF_LOTE
            _cBody := '{"registros":['
            For _nI := 1 To Len(_aLote)
                _cBody += _aLote[_nI]
                If _nI < Len(_aLote) ; _cBody += "," ; EndIf
            Next _nI
            _cBody += ']}'

            _oRest := FWRest(GetMv("MV_CRMURL"))
            _oRest:SetPath(NF_PATH)
            _oRest:SetHeader("Authorization", "Bearer " + GetMv("MV_CRMTKN"))
            _oRest:SetHeader("Content-Type", "application/json")
            If _oRest:Post(_cBody)
                _cStat := cValToChar(_oRest:nStatusCode)
                If _cStat $ "200|201"
                    _nEnv += Len(_aLote)
                Else
                    _nErr += Len(_aLote)
                    ConOut("[CRM003NF] HTTP " + _cStat + " " + SubStr(_oRest:GetResult(),1,150))
                EndIf
            Else
                _nErr += Len(_aLote)
                ConOut("[CRM003NF] FWRest erro: " + _oRest:GetLastError())
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
        _oRest:SetPath(NF_PATH)
        _oRest:SetHeader("Authorization", "Bearer " + GetMv("MV_CRMTKN"))
        _oRest:SetHeader("Content-Type", "application/json")
        If _oRest:Post(_cBody)
            _cStat := cValToChar(_oRest:nStatusCode)
            If _cStat $ "200|201"
                _nEnv += Len(_aLote)
            Else
                _nErr += Len(_aLote)
                ConOut("[CRM003NF] HTTP " + _cStat + " " + SubStr(_oRest:GetResult(),1,150))
            EndIf
        Else
            _nErr += Len(_aLote)
            ConOut("[CRM003NF] FWRest erro: " + _oRest:GetLastError())
        EndIf
        FreeObj(_oRest)
    EndIf

    If _nErr == 0 .And. !Empty(_cNStamp)
        PutMv(NF_STKEY, _cNStamp)
    EndIf

    ConOut("[CRM003NF] fim env:" + cValToChar(_nEnv) + " err:" + cValToChar(_nErr))
Return
