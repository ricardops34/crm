import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { UpperCasePipe, CurrencyPipe } from '@angular/common';
import { PoModule, PoNotificationService, PoTableColumn } from '@po-ui/ng-components';

interface OrcItem {
  id?: string;
  codProduto: string;
  descricao: string;
  quantidade: number;
  precoUnitario: number;
  descontoPct: number;
  valorTotal: number;
  semEstoque: boolean;
}

interface Orcamento {
  id: string;
  numeroPortal: number;
  status: string;
  clienteId: string;
  valorTotal: number;
  validade: string;
  itens: OrcItem[];
}

@Component({
  selector: 'app-orcamento-form',
  imports: [PoModule, FormsModule, UpperCasePipe, CurrencyPipe],
  template: `
    <po-page-default
      [p-title]="titulo()"
      [p-breadcrumb]="{ items: [{ label: 'Orçamentos', link: '/orcamentos' }, { label: titulo() }] }">

      @if (orcamento(); as orc) {
        <div class="po-d-flex po-align-center po-mb-3" style="gap: 8px;">
          <span>Status: <strong>{{ orc.status | uppercase }}</strong></span>
          <span>Validade: <strong>{{ orc.validade }}</strong></span>
          <span>Valor: <strong>{{ orc.valorTotal | currency:'BRL' }}</strong></span>

          @if (orc.status === 'rascunho') {
            <po-button p-label="Enviar" p-kind="primary" p-icon="ph ph-paper-plane-right" (p-click)="enviar()"></po-button>
          }
          <po-button p-label="Copiar" p-icon="ph ph-copy" (p-click)="copiar()"></po-button>
          <po-button p-label="Download PDF" p-icon="ph ph-file-pdf" (p-click)="downloadPdf()"></po-button>
        </div>

        <po-table
          [p-columns]="colunas"
          [p-items]="orc.itens"
          p-striped="true">
        </po-table>
      } @else {
        <p class="po-mt-4">Carregando...</p>
      }
    </po-page-default>
  `,
})
export class OrcamentoFormComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notify = inject(PoNotificationService);

  orcamento = signal<Orcamento | null>(null);
  loading = signal(false);

  titulo = signal('Orçamento');

  colunas: PoTableColumn[] = [
    { property: 'codProduto', label: 'Código' },
    { property: 'descricao', label: 'Produto' },
    { property: 'quantidade', label: 'Qtd', type: 'number' },
    { property: 'precoUnitario', label: 'Preço Unit.', type: 'currency', format: 'BRL' },
    { property: 'descontoPct', label: 'Desc. %', type: 'number' },
    { property: 'valorTotal', label: 'Total', type: 'currency', format: 'BRL' },
    {
      property: 'semEstoque', label: '', type: 'icon',
      icons: [{ value: 'true', icon: 'ph ph-warning', color: 'color-08', tooltip: 'Sem estoque' }],
    },
  ];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.titulo.set(`Orçamento #${id.slice(0, 8)}`);
      this.http.get<Orcamento>(`/api/orcamentos/${id}`).subscribe((o) => {
        this.orcamento.set(o);
        this.titulo.set(`Orçamento #${o.numeroPortal}`);
      });
    }
  }

  enviar() {
    const orc = this.orcamento();
    if (!orc) return;
    this.http
      .post(`/api/orcamentos/${orc.id}/enviar`, {}, { responseType: 'blob' })
      .subscribe({
        next: (blob: Blob) => {
          this.notify.success('Orçamento enviado! Baixando PDF...');
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `orcamento-${orc.numeroPortal}.pdf`;
          a.click();
          URL.revokeObjectURL(url);
          this.http.get<Orcamento>(`/api/orcamentos/${orc.id}`).subscribe((o) => this.orcamento.set(o));
        },
        error: (err) => this.notify.error(err?.error?.message ?? 'Erro ao enviar.'),
      });
  }

  downloadPdf() {
    const orc = this.orcamento();
    if (!orc) return;
    this.http.get(`/api/orcamentos/${orc.id}/pdf`, { responseType: 'blob' }).subscribe({
      next: (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orcamento-${orc.numeroPortal}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        this.notify.success('PDF baixado!');
      },
      error: () => this.notify.error('Erro ao gerar PDF.'),
    });
  }

  copiar() {
    const id = this.orcamento()?.id;
    if (!id) return;
    this.http.post<Orcamento>(`/api/orcamentos/${id}/copiar`, {}).subscribe({
      next: (novo) => {
        this.notify.success(`Cópia criada: #${novo.numeroPortal}`);
        this.router.navigate(['/orcamentos', novo.id]);
      },
      error: () => this.notify.error('Erro ao copiar.'),
    });
  }
}
