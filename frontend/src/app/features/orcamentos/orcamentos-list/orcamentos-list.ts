import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { PoModule, PoTableAction, PoTableColumn } from '@po-ui/ng-components';

interface Orcamento {
  id: string;
  numeroPortal: number;
  clienteId: string;
  status: string;
  origem: string;
  valorTotal: number;
  criadoEm: string;
  validade: string;
}

@Component({
  selector: 'app-orcamentos-list',
  imports: [PoModule, FormsModule],
  template: `
    <po-page-default p-title="Orçamentos">
      <div class="po-d-flex po-mb-3" style="gap:8px; align-items:flex-end;">
        <po-select
          name="status"
          [ngModel]="filtroStatus"
          (ngModelChange)="filtroStatus = $event; carregar()"
          p-label="Status"
          [p-options]="statusOpcoes"
          style="min-width: 220px">
        </po-select>
        <po-button p-label="Novo orçamento" p-kind="primary" p-icon="an an-plus" (p-click)="novo()"></po-button>
      </div>

      <po-table
        [p-columns]="colunas"
        [p-items]="orcamentos()"
        [p-loading]="loading()"
        [p-actions]="acoes"
        p-sort="true">
      </po-table>
    </po-page-default>
  `,
})
export class OrcamentosListComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  orcamentos = signal<Orcamento[]>([]);
  loading = signal(false);
  filtroStatus = '';

  statusOpcoes = [
    { label: 'Todos', value: '' },
    { label: 'Rascunho', value: 'rascunho' },
    { label: 'Enviado', value: 'enviado' },
    { label: 'Bloqueado Crédito', value: 'bloqueado_credito' },
    { label: 'Bloqueado Desconto', value: 'bloqueado_desconto' },
    { label: 'Bloqueado Estoque', value: 'bloqueado_estoque' },
    { label: 'Faturado', value: 'faturado' },
    { label: 'Cancelado', value: 'cancelado' },
  ];

  colunas: PoTableColumn[] = [
    { property: 'numeroPortal', label: 'Número', sortable: true },
    { property: 'criadoEm', label: 'Data', type: 'date', sortable: true },
    { property: 'validade', label: 'Validade', type: 'date', sortable: true },
    { property: 'valorTotal', label: 'Valor', type: 'currency', format: 'BRL', sortable: true },
    { property: 'status', label: 'Status', sortable: true },
    { property: 'origem', label: 'Origem' },
  ];

  acoes: PoTableAction[] = [
    { label: 'Editar', action: (row: Orcamento) => this.editar(row), disabled: (row: Orcamento) => row.status !== 'rascunho' },
    { label: 'Copiar', action: (row: Orcamento) => this.copiar(row) },
  ];

  ngOnInit() { this.carregar(); }

  carregar() {
    this.loading.set(true);
    const qs = this.filtroStatus ? `?status=${this.filtroStatus}` : '';
    this.http.get<Orcamento[]>(`/api/orcamentos${qs}`).subscribe({
      next: (d) => { this.orcamentos.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  novo() { this.router.navigate(['/orcamentos/novo']); }

  editar(orc: Orcamento) { this.router.navigate(['/orcamentos', orc.id]); }

  copiar(orc: Orcamento) {
    this.http.post(`/api/orcamentos/${orc.id}/copiar`, {}).subscribe({
      next: (novo: any) => this.router.navigate(['/orcamentos', novo.id]),
      error: () => {},
    });
  }
}
