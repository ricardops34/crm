import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PoModule, PoTableColumn } from '@po-ui/ng-components';
import { CurrencyPipe, DatePipe } from '@angular/common';

interface Cliente {
  id: string; codErp: string; razaoSocial: string; nomeFantasia: string;
  cnpj: string; cidade: string; uf: string; grupoEconomico: string;
  cnaePrincipal: string; contatoPrincipal: string; limiteCredito: number;
  ultimaCompra: string; diasSemComprar: number; titulosAberto: number; bloqueado: boolean;
}

@Component({
  selector: 'app-cliente-360',
  imports: [PoModule, CurrencyPipe, DatePipe],
  template: `
    <po-loading-overlay [p-screen-lock]="loading()"></po-loading-overlay>

    <po-page-default
      [p-title]="cliente()?.razaoSocial ?? 'Cliente 360'"
      [p-breadcrumb]="{ items: [{ label: 'MCV', link: '/mcv' }, { label: 'Cliente 360' }] }">

      <po-tabs>
        <!-- Aba Cadastro -->
        <po-tab p-label="Cadastro / Resumo" [p-active]="abaAtiva === 'cadastro'">
          @if (cliente(); as c) {
            <po-container class="po-mt-2">
              <div class="po-row">
                <po-info class="po-col-4" p-label="Razão Social" [p-value]="c.razaoSocial"></po-info>
                <po-info class="po-col-4" p-label="Nome Fantasia" [p-value]="c.nomeFantasia"></po-info>
                <po-info class="po-col-4" p-label="CNPJ" [p-value]="c.cnpj"></po-info>
                <po-info class="po-col-4" p-label="Cidade/UF" [p-value]="(c.cidade ?? '') + '/' + (c.uf ?? '')"></po-info>
                <po-info class="po-col-4" p-label="Contato Principal" [p-value]="c.contatoPrincipal"></po-info>
                <po-info class="po-col-4" p-label="Grupo Econômico" [p-value]="c.grupoEconomico"></po-info>
                <po-info class="po-col-4" p-label="CNAE Principal" [p-value]="c.cnaePrincipal"></po-info>
              </div>
              <hr class="po-divider po-my-3">
              <div class="po-row">
                <po-info class="po-col-3" p-label="Última Compra" [p-value]="(c.ultimaCompra | date:'dd/MM/yyyy') ?? ''"></po-info>
                <po-info class="po-col-3" p-label="Dias sem comprar" [p-value]="c.diasSemComprar?.toString() ?? '—'"></po-info>
                <po-info class="po-col-3" p-label="Limite de Crédito" [p-value]="(c.limiteCredito | currency:'BRL') ?? ''"></po-info>
                <po-info class="po-col-3" p-label="Títulos em Aberto" [p-value]="(c.titulosAberto | currency:'BRL') ?? ''"></po-info>
              </div>
            </po-container>
          }
        </po-tab>

        <!-- Aba Financeiro -->
        <po-tab p-label="Financeiro" [p-active]="abaAtiva === 'financeiro'" (p-click)="carregarFinanceiro()">
          <po-table [p-columns]="colsTitulos" [p-items]="titulos()" [p-loading]="loadingAba()"></po-table>
        </po-tab>

        <!-- Aba Notas Fiscais -->
        <po-tab p-label="Notas Fiscais" (p-click)="carregarNF()">
          <po-table [p-columns]="colsNF" [p-items]="notas()" [p-loading]="loadingAba()"></po-table>
        </po-tab>

        <!-- Aba MIX -->
        <po-tab p-label="MIX" (p-click)="carregarMix()">
          <po-table [p-columns]="colsMix" [p-items]="mix()" [p-loading]="loadingAba()"></po-table>
        </po-tab>

        <!-- Aba Orçamentos -->
        <po-tab p-label="Orçamentos" (p-click)="carregarOrcamentos()">
          <po-table [p-columns]="colsOrc" [p-items]="orcamentos()" [p-loading]="loadingAba()"
            [p-actions]="[{ label: 'Novo orçamento', action: novoOrcamento.bind(this) }]">
          </po-table>
        </po-tab>
      </po-tabs>
    </po-page-default>
  `,
})
export class Cliente360Component implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  cliente = signal<Cliente | null>(null);
  titulos = signal<any[]>([]);
  notas = signal<any[]>([]);
  mix = signal<any[]>([]);
  orcamentos = signal<any[]>([]);

  loading = signal(false);
  loadingAba = signal(false);
  abaAtiva = 'cadastro';

  colsTitulos: PoTableColumn[] = [
    { property: 'numero', label: 'Número' },
    { property: 'parcela', label: 'Parcela' },
    { property: 'vencimento', label: 'Vencimento', type: 'date' },
    { property: 'valor', label: 'Valor', type: 'currency', format: 'BRL' },
    { property: 'status', label: 'Status' },
    { property: 'urlBoleto', label: 'Boleto', type: 'link' },
  ];

  colsNF: PoTableColumn[] = [
    { property: 'numero', label: 'Número' },
    { property: 'dataEmissao', label: 'Emissão', type: 'date' },
    { property: 'valorTotal', label: 'Valor', type: 'currency', format: 'BRL' },
    { property: 'urlDanfe', label: 'DANFE', type: 'link' },
  ];

  colsMix: PoTableColumn[] = [
    { property: 'descricao', label: 'Produto' },
    { property: 'quantidade', label: 'Quantidade', type: 'number' },
    { property: 'ultimaCompra', label: 'Última Compra', type: 'date' },
    { property: 'valorTotal', label: 'Valor Total', type: 'currency', format: 'BRL' },
    { property: 'frequencia', label: 'Frequência', type: 'number' },
  ];

  colsOrc: PoTableColumn[] = [
    { property: 'numeroPortal', label: 'Número' },
    { property: 'criadoEm', label: 'Data', type: 'date' },
    { property: 'valorTotal', label: 'Valor', type: 'currency', format: 'BRL' },
    { property: 'status', label: 'Status' },
    { property: 'origem', label: 'Origem' },
  ];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    const aba = this.route.snapshot.queryParams['aba'];
    if (aba) this.abaAtiva = aba;

    this.loading.set(true);
    this.http.get<Cliente>(`/api/clientes/${id}`).subscribe({
      next: (c) => { this.cliente.set(c); this.loading.set(false); },
      error: () => this.loading.set(false),
    });

    if (this.abaAtiva === 'financeiro') this.carregarFinanceiro();
  }

  carregarFinanceiro() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadingAba.set(true);
    this.http.get<any[]>(`/api/clientes/${id}/financeiro`).subscribe({
      next: (d) => { this.titulos.set(d); this.loadingAba.set(false); },
      error: () => this.loadingAba.set(false),
    });
  }

  carregarNF() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadingAba.set(true);
    this.http.get<any[]>(`/api/clientes/${id}/notas-fiscais`).subscribe({
      next: (d) => { this.notas.set(d); this.loadingAba.set(false); },
      error: () => this.loadingAba.set(false),
    });
  }

  carregarMix() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadingAba.set(true);
    this.http.get<any[]>(`/api/clientes/${id}/mix`).subscribe({
      next: (d) => { this.mix.set(d); this.loadingAba.set(false); },
      error: () => this.loadingAba.set(false),
    });
  }

  carregarOrcamentos() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadingAba.set(true);
    this.http.get<any[]>(`/api/orcamentos?cliente_id=${id}`).subscribe({
      next: (d) => { this.orcamentos.set(d); this.loadingAba.set(false); },
      error: () => this.loadingAba.set(false),
    });
  }

  novoOrcamento() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.router.navigate(['/orcamentos/novo'], { queryParams: { cliente_id: id } });
  }
}
