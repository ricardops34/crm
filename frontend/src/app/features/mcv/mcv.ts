import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PoModule, PoButtonGroupItem, PoTableAction, PoTableColumn } from '@po-ui/ng-components';

interface ClienteMcv {
  id: string;
  codErp: string;
  razaoSocial: string;
  cidade: string;
  situacao: string;
  bloqueado: boolean;
  ultimaCompra: string | null;
  diasSemComprar: number | null;
  venda30d: number;
  media90d: number;
  difMesMedia: number;
  temComodato: boolean;
}

@Component({
  selector: 'app-mcv',
  imports: [PoModule],
  template: `
    <po-page-default p-title="MCV — Minha Carteira de Vendas">
      <!-- Filtros rápidos -->
      <div class="po-mb-3 po-d-flex po-align-center" style="gap: 8px; flex-wrap: wrap;">
        @for (f of filtrosRapidos; track f.label) {
          <po-button
            [p-label]="f.label"
            [p-kind]="filtroAtivo === f.valor ? 'primary' : 'secondary'"
            (p-click)="aplicarFiltro(f.valor)">
          </po-button>
        }
        <po-button p-label="Atualizar" p-icon="ph ph-arrows-clockwise" (p-click)="carregar()"></po-button>
      </div>

      <po-table
        [p-columns]="colunas"
        [p-items]="clientes()"
        [p-loading]="loading()"
        [p-actions]="acoes"
        p-sort="true">
      </po-table>
    </po-page-default>
  `,
})
export class McvComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  clientes = signal<ClienteMcv[]>([]);
  loading = signal(false);
  filtroAtivo: string | number = '';

  filtrosRapidos = [
    { label: 'Todos',      valor: '' },
    { label: '15 dias',    valor: 15 },
    { label: '30 dias',    valor: 30 },
    { label: '60 dias',    valor: 60 },
    { label: '90 dias',    valor: 90 },
    { label: '120 dias',   valor: 120 },
    { label: 'Bloqueados', valor: 'bloqueados' },
    { label: 'Ativos',     valor: 'ativos' },
  ];

  colunas: PoTableColumn[] = [
    {
      property: 'bloqueado', label: 'Situação', type: 'icon',
      icons: [
        { value: 'false', icon: 'ph ph-lock-open', color: 'color-10', tooltip: 'Ativo' },
        { value: 'true',  icon: 'ph ph-lock',      color: 'color-07', tooltip: 'Bloqueado' },
      ],
    },
    { property: 'codErp',          label: 'Código',      sortable: true },
    { property: 'ultimaCompra',    label: 'Últ. Compra', type: 'date', sortable: true },
    { property: 'razaoSocial',     label: 'Razão Social', sortable: true },
    { property: 'cidade',          label: 'Cidade',      sortable: true },
    { property: 'difMesMedia',     label: 'Dif. Mês/Média', type: 'currency', format: 'BRL', sortable: true },
    { property: 'venda30d',        label: 'Venda 30d',   type: 'currency', format: 'BRL', sortable: true },
    { property: 'media90d',        label: 'Média 90d',   type: 'currency', format: 'BRL', sortable: true },
    { property: 'diasSemComprar',  label: 'Dias',        sortable: true },
    {
      property: 'temComodato', label: 'Comodato', type: 'icon',
      icons: [
        { value: 'true', icon: 'ph ph-package', color: 'color-01', tooltip: 'Possui comodato' },
      ],
    },
  ];

  acoes: PoTableAction[] = [
    {
      label: 'Cliente 360',
      icon: 'ph ph-user-circle',
      action: (row: ClienteMcv) => this.router.navigate(['/clientes', row.id]),
    },
    {
      label: 'Financeiro',
      icon: 'ph ph-currency-circle-dollar',
      action: (row: ClienteMcv) =>
        this.router.navigate(['/clientes', row.id], { queryParams: { aba: 'financeiro' } }),
    },
  ];

  ngOnInit() {
    this.carregar();
  }

  aplicarFiltro(valor: string | number) {
    this.filtroAtivo = valor;
    this.carregar();
  }

  carregar() {
    this.loading.set(true);
    let params = new HttpParams();

    if (typeof this.filtroAtivo === 'number') {
      params = params.set('dias', this.filtroAtivo.toString());
    } else if (this.filtroAtivo === 'bloqueados') {
      params = params.set('bloqueados', 'true');
    } else if (this.filtroAtivo === 'ativos') {
      params = params.set('ativos', 'true');
    }

    this.http.get<ClienteMcv[]>('/api/mcv', { params }).subscribe({
      next: (data) => { this.clientes.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
