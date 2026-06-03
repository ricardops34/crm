// ============================================================
// CRM001CLI.prw  -  Sincronizacao de Clientes
// POST /integracao/clientes  (upsert empresa_id + cod_erp)
// Origem: SA1 via TCQuery
// ============================================================
#Include "Protheus.ch"

#Define CLI_PATH  "/integracao/clientes"
#Define CLI_LOTE  50
#Define CLI_STKEY "MV_CRMSTCL"

User Function CRM001CLI()
    Local _cStamp  := GetMv(CLI_STKEY)
    Local _cNStamp := ""
    Local _aLote   := {}
    Local _nEnv    := 0
    Local _nErr    := 0
    Local _oQry
    Local _oRest
    Local _cTabSA1 := RetSQLName("SA1")
    Local _cFil    := xFilial("SA1")
    Local _cSql    := ""
    Local _cBody   := ""
    Local _cStat   := ""
    Local _cJ      := ""
    Local _lBlq    := .F.
    Local _cSit    := ""
    Local _cNome   := ""
    Local _cNreduz := ""
    Local _nI      := 0

    If Empty(_cStamp)
        _cStamp := "19000101000000"
    EndIf

    ConOut("[CRM001CLI] inicio stamp:" + _cStamp)

    _cSql := "SELECT A1_COD, A1_LOJA, A1_NOME, A1_NREDUZ, A1_CGC, A1_MUN, A1_EST, " + ;
             "       A1_GRPVEN, A1_TABELA, A1_LC, A1_ATIVO, A1_MSBLQL, S_T_A_M_P_ " + ;
             "  FROM " + _cTabSA1 + ;
             " WHERE A1_FILIAL = '" + _cFil + "'" + ;
             "   AND D_E_L_E_T_ = ' '" + ;
             "   AND S_T_A_M_P_ >= '" + _cStamp + "'" + ;
             " ORDER BY S_T_A_M_P_"

    _oQry := TCQuery(_cSql, .T., "QCL001")

    While _oQry->(!EOF())
        If _oQry->S_T_A_M_P_ > _cNStamp
            _cNStamp := _oQry->S_T_A_M_P_
        EndIf

        _lBlq  := (AllTrim(_oQry->A1_MSBLQL) == "1")
        _cSit  := If(AllTrim(_oQry->A1_ATIVO) == "N", "inativo", "ativo")
        _cNome   := StrTran(StrTran(AllTrim(_oQry->A1_NOME),   '\','\\'), '"','\"')
        _cNreduz := StrTran(StrTran(AllTrim(_oQry->A1_NREDUZ), '\','\\'), '"','\"')

        _cJ := '{'
        _cJ += '"empresa_id":'      + cValToChar(Val(GetMv("MV_CRMEID"))) + ','
        _cJ += '"cod_erp":'         + '"' + AllTrim(_oQry->A1_COD) + AllTrim(_oQry->A1_LOJA) + '",'
        _cJ += '"razao_social":'    + '"' + _cNome   + '",'
        _cJ += '"nome_fantasia":'   + '"' + _cNreduz + '",'
        _cJ += '"cnpj":'            + '"' + AllTrim(_oQry->A1_CGC)    + '",'
        _cJ += '"cidade":'          + '"' + AllTrim(_oQry->A1_MUN)    + '",'
        _cJ += '"uf":'              + '"' + AllTrim(_oQry->A1_EST)    + '",'
        _cJ += '"grupo_economico":' + '"' + AllTrim(_oQry->A1_GRPVEN) + '",'
        _cJ += '"tabela_preco":'    + '"' + AllTrim(_oQry->A1_TABELA) + '",'
        _cJ += '"limite_credito":'  + cValToChar(Val(_oQry->A1_LC)) + ','
        _cJ += '"situacao":'        + '"' + _cSit + '",'
        _cJ += '"bloqueado":'       + If(_lBlq, "true", "false")
        _cJ += '}'

        AAdd(_aLote, _cJ)

        If Len(_aLote) >= CLI_LOTE
            _cBody := '{"registros":['
            For _nI := 1 To Len(_aLote)
                _cBody += _aLote[_nI]
                If _nI < Len(_aLote) ; _cBody += "," ; EndIf
            Next _nI
            _cBody += ']}'

            _oRest := FWRest(GetMv("MV_CRMURL"))
            _oRest:SetPath(CLI_PATH)
            _oRest:SetHeader("Authorization", "Bearer " + GetMv("MV_CRMTKN"))
            _oRest:SetHeader("Content-Type", "application/json")
            If _oRest:Post(_cBody)
                _cStat := cValToChar(_oRest:nStatusCode)
                If _cStat $ "200|201"
                    _nEnv += Len(_aLote)
                Else
                    _nErr += Len(_aLote)
                    ConOut("[CRM001CLI] HTTP " + _cStat + " " + SubStr(_oRest:GetResult(),1,150))
                EndIf
            Else
                _nErr += Len(_aLote)
                ConOut("[CRM001CLI] FWRest erro: " + _oRest:GetLastError())
            EndIf
            FreeObj(_oRest)
            _aLote := {}
        EndIf

        _oQry->(DbSkip())
    End While
    _oQry->(DbCloseArea())

    // Envia restante
    If Len(_aLote) > 0
        _cBody := '{"registros":['
        For _nI := 1 To Len(_aLote)
            _cBody += _aLote[_nI]
            If _nI < Len(_aLote) ; _cBody += "," ; EndIf
        Next _nI
        _cBody += ']}'

        _oRest := FWRest(GetMv("MV_CRMURL"))
        _oRest:SetPath(CLI_PATH)
        _oRest:SetHeader("Authorization", "Bearer " + GetMv("MV_CRMTKN"))
        _oRest:SetHeader("Content-Type", "application/json")
        If _oRest:Post(_cBody)
            _cStat := cValToChar(_oRest:nStatusCode)
            If _cStat $ "200|201"
                _nEnv += Len(_aLote)
            Else
                _nErr += Len(_aLote)
                ConOut("[CRM001CLI] HTTP " + _cStat + " " + SubStr(_oRest:GetResult(),1,150))
            EndIf
        Else
            _nErr += Len(_aLote)
            ConOut("[CRM001CLI] FWRest erro: " + _oRest:GetLastError())
        EndIf
        FreeObj(_oRest)
    EndIf

    If _nErr == 0 .And. !Empty(_cNStamp)
        PutMv(CLI_STKEY, _cNStamp)
    EndIf

    ConOut("[CRM001CLI] fim env:" + cValToChar(_nEnv) + " err:" + cValToChar(_nErr))
Return
