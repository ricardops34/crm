// ============================================================
// CRM005VND.prw  -  Sincronizacao de Vendedores e Carteira
// POST /integracao/vendedores        (upsert empresa_id + cod_erp)
// POST /integracao/carteira-clientes (vinculo vendedor x cliente)
// Origem: SA3 e SA1 via TCQuery
// ============================================================
#Include "Protheus.ch"

#Define VND_PVND  "/integracao/vendedores"
#Define VND_PCRT  "/integracao/carteira-clientes"
#Define VND_LOTE  50
#Define VND_STVND "MV_CRMSTVO"
#Define VND_STCRT "MV_CRMSTCT"

User Function CRM005VND()

    // --------------------------------------------------------
    // Bloco 1 - Vendedores (SA3)
    // --------------------------------------------------------
    Local _cStamp  := GetMv(VND_STVND)
    Local _cNStamp := ""
    Local _aLote   := {}
    Local _nEnv    := 0
    Local _nErr    := 0
    Local _oQry
    Local _oRest
    Local _cTabSA3 := RetSQLName("SA3")
    Local _cFil    := xFilial("SA3")
    Local _cSql    := ""
    Local _cBody   := ""
    Local _cStat   := ""
    Local _cJ      := ""
    Local _cTipo   := ""
    Local _nI      := 0

    If Empty(_cStamp)
        _cStamp := "19000101000000"
    EndIf

    ConOut("[CRM005VND] vendedores stamp:" + _cStamp)

    _cSql := "SELECT A3_COD, A3_NOME, A3_MSBLQL, S_T_A_M_P_ " + ;
             "  FROM " + _cTabSA3 + ;
             " WHERE A3_FILIAL = '" + _cFil + "'" + ;
             "   AND D_E_L_E_T_ = ' '" + ;
             "   AND S_T_A_M_P_ >= '" + _cStamp + "'" + ;
             " ORDER BY S_T_A_M_P_"

    _oQry := TCQuery(_cSql, .T., "QVN001")

    While _oQry->(!EOF())
        If _oQry->S_T_A_M_P_ > _cNStamp
            _cNStamp := _oQry->S_T_A_M_P_
        EndIf

        // Infere tipo pelo campo A3_TIPO (customizavel por implantacao)
        _cTipo := "vendedor"
        If _oQry->(FieldPos("A3_TIPO")) > 0
            Do Case
            Case AllTrim(_oQry->A3_TIPO) $ "S|SUP|SUPERVISOR"
                _cTipo := "supervisor"
            Case AllTrim(_oQry->A3_TIPO) $ "G|GER|GERENTE"
                _cTipo := "gerente"
            EndCase
        EndIf

        _cJ := '{'
        _cJ += '"empresa_id":'  + cValToChar(Val(GetMv("MV_CRMEID"))) + ','
        _cJ += '"cod_erp":'     + '"' + AllTrim(_oQry->A3_COD) + '",'
        _cJ += '"nome":'        + '"' + StrTran(StrTran(AllTrim(_oQry->A3_NOME),'\','\\'),'"','\"') + '",'
        _cJ += '"tipo":'        + '"' + _cTipo + '",'
        _cJ += '"ativo":'       + If(AllTrim(_oQry->A3_MSBLQL) <> "1", "true", "false")
        _cJ += '}'

        AAdd(_aLote, _cJ)

        If Len(_aLote) >= VND_LOTE
            _cBody := '{"registros":['
            For _nI := 1 To Len(_aLote)
                _cBody += _aLote[_nI]
                If _nI < Len(_aLote) ; _cBody += "," ; EndIf
            Next _nI
            _cBody += ']}'

            _oRest := FWRest(GetMv("MV_CRMURL"))
            _oRest:SetPath(VND_PVND)
            _oRest:SetHeader("Authorization", "Bearer " + GetMv("MV_CRMTKN"))
            _oRest:SetHeader("Content-Type", "application/json")
            If _oRest:Post(_cBody)
                _cStat := cValToChar(_oRest:nStatusCode)
                If _cStat $ "200|201"
                    _nEnv += Len(_aLote)
                Else
                    _nErr += Len(_aLote)
                    ConOut("[CRM005VND:VND] HTTP " + _cStat + " " + SubStr(_oRest:GetResult(),1,150))
                EndIf
            Else
                _nErr += Len(_aLote)
                ConOut("[CRM005VND:VND] FWRest erro: " + _oRest:GetLastError())
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
        _oRest:SetPath(VND_PVND)
        _oRest:SetHeader("Authorization", "Bearer " + GetMv("MV_CRMTKN"))
        _oRest:SetHeader("Content-Type", "application/json")
        If _oRest:Post(_cBody)
            _cStat := cValToChar(_oRest:nStatusCode)
            If _cStat $ "200|201"
                _nEnv += Len(_aLote)
            Else
                _nErr += Len(_aLote)
                ConOut("[CRM005VND:VND] HTTP " + _cStat + " " + SubStr(_oRest:GetResult(),1,150))
            EndIf
        Else
            _nErr += Len(_aLote)
            ConOut("[CRM005VND:VND] FWRest erro: " + _oRest:GetLastError())
        EndIf
        FreeObj(_oRest)
    EndIf

    If _nErr == 0 .And. !Empty(_cNStamp)
        PutMv(VND_STVND, _cNStamp)
    EndIf

    ConOut("[CRM005VND] vend fim env:" + cValToChar(_nEnv) + " err:" + cValToChar(_nErr))

    // --------------------------------------------------------
    // Bloco 2 - Carteira de Clientes (SA1 x A1_VEND)
    // --------------------------------------------------------
    _cStamp  := GetMv(VND_STCRT)
    _cNStamp := ""
    _aLote   := {}
    _nEnv    := 0
    _nErr    := 0

    Local _cTabSA1 := RetSQLName("SA1")
    Local _cFilA1  := xFilial("SA1")

    If Empty(_cStamp)
        _cStamp := "19000101000000"
    EndIf

    ConOut("[CRM005VND] carteira stamp:" + _cStamp)

    _cSql := "SELECT A1_COD, A1_LOJA, A1_VEND, S_T_A_M_P_ " + ;
             "  FROM " + _cTabSA1 + ;
             " WHERE A1_FILIAL = '" + _cFilA1 + "'" + ;
             "   AND D_E_L_E_T_ = ' '" + ;
             "   AND A1_VEND <> ''" + ;
             "   AND S_T_A_M_P_ >= '" + _cStamp + "'" + ;
             " ORDER BY S_T_A_M_P_"

    _oQry := TCQuery(_cSql, .T., "QVN002")

    While _oQry->(!EOF())
        If _oQry->S_T_A_M_P_ > _cNStamp
            _cNStamp := _oQry->S_T_A_M_P_
        EndIf

        _cJ := '{'
        _cJ += '"empresa_id":'       + cValToChar(Val(GetMv("MV_CRMEID"))) + ','
        _cJ += '"cod_erp_vendedor":' + '"' + AllTrim(_oQry->A1_VEND) + '",'
        _cJ += '"cod_erp_cliente":'  + '"' + AllTrim(_oQry->A1_COD) + AllTrim(_oQry->A1_LOJA) + '"'
        _cJ += '}'

        AAdd(_aLote, _cJ)

        If Len(_aLote) >= VND_LOTE
            _cBody := '{"registros":['
            For _nI := 1 To Len(_aLote)
                _cBody += _aLote[_nI]
                If _nI < Len(_aLote) ; _cBody += "," ; EndIf
            Next _nI
            _cBody += ']}'

            _oRest := FWRest(GetMv("MV_CRMURL"))
            _oRest:SetPath(VND_PCRT)
            _oRest:SetHeader("Authorization", "Bearer " + GetMv("MV_CRMTKN"))
            _oRest:SetHeader("Content-Type", "application/json")
            If _oRest:Post(_cBody)
                _cStat := cValToChar(_oRest:nStatusCode)
                If _cStat $ "200|201"
                    _nEnv += Len(_aLote)
                Else
                    _nErr += Len(_aLote)
                    ConOut("[CRM005VND:CRT] HTTP " + _cStat + " " + SubStr(_oRest:GetResult(),1,150))
                EndIf
            Else
                _nErr += Len(_aLote)
                ConOut("[CRM005VND:CRT] FWRest erro: " + _oRest:GetLastError())
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
        _oRest:SetPath(VND_PCRT)
        _oRest:SetHeader("Authorization", "Bearer " + GetMv("MV_CRMTKN"))
        _oRest:SetHeader("Content-Type", "application/json")
        If _oRest:Post(_cBody)
            _cStat := cValToChar(_oRest:nStatusCode)
            If _cStat $ "200|201"
                _nEnv += Len(_aLote)
            Else
                _nErr += Len(_aLote)
                ConOut("[CRM005VND:CRT] HTTP " + _cStat + " " + SubStr(_oRest:GetResult(),1,150))
            EndIf
        Else
            _nErr += Len(_aLote)
            ConOut("[CRM005VND:CRT] FWRest erro: " + _oRest:GetLastError())
        EndIf
        FreeObj(_oRest)
    EndIf

    If _nErr == 0 .And. !Empty(_cNStamp)
        PutMv(VND_STCRT, _cNStamp)
    EndIf

    ConOut("[CRM005VND] cart fim env:" + cValToChar(_nEnv) + " err:" + cValToChar(_nErr))
Return
