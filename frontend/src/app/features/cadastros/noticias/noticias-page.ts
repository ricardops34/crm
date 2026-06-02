import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import {
  PoModule,
  PoModalAction,
  PoModalComponent,
  PoNotificationService,
  PoTableColumn,
} from '@po-ui/ng-components';

interface Noticia {
  id: string;
  titulo: string;
  categoria: string;
  dataInicio: string;
  dataFim: string | null;
  ativo: boolean;
  perfisAlvo: string[] | null;
}

@Component({
  selector: 'app-noticias-page',
  imports: [PoModule, FormsModule],
  template: `
    <po-page-default
      p-title="Notícias e Avisos"
      [p-breadcrumb]="{ items: [{ label: 'Cadastros' }, { label: 'Notícias' }] }">

      <po-button p-label="Nova notícia" p-icon="an an-plus" p-kind="primary" (p-click)="abrirNovo()"></po-button>

      <po-table
        [p-columns]="colunas"
        [p-items]="noticias()"
        [p-loading]="loading()"
        [p-actions]="acoes"
        p-sort="true">
      </po-table>
    </po-page-default>

    <po-modal
      #modal
      [p-title]="modoEdicao ? 'Editar' : 'Nova Notícia/Aviso'"
      [p-primary-action]="acaoPrimaria"
      [p-secondary-action]="acaoSecundaria">

      <po-select name="categoria"
        [ngModel]="form.categoria"
        (ngModelChange)="form.categoria = $event"
        p-label="Categoria"
        [p-options]="categoriaOpts">
      </po-select>

      <po-input name="titulo" [(ngModel)]="form.titulo" p-label="Título" p-required></po-input>

      <po-textarea name="conteudo" [(ngModel)]="form.conteudo" p-label="Conteúdo" [p-required]="true"></po-textarea>

      <po-datepicker name="inicio" [(ngModel)]="form.data_inicio" p-label="Início" p-required></po-datepicker>
      <po-datepicker name="fim" [(ngModel)]="form.data_fim" p-label="Fim (opcional)"></po-datepicker>
    </po-modal>
  `,
})
export class NoticiasPageComponent implements OnInit {
  @ViewChild('modal') modal!: PoModalComponent;

  private http = inject(HttpClient);
  private notify = inject(PoNotificationService);

  noticias = signal<Noticia[]>([]);
  loading = signal(false);
  modoEdicao = false;
  idEdicao = '';
  form: any = { categoria: 'noticia', titulo: '', conteudo: '', data_inicio: '', data_fim: null };

  categoriaOpts = [
    { label: 'Notícia', value: 'noticia' },
    { label: 'Aviso', value: 'aviso' },
  ];

  colunas: PoTableColumn[] = [
    { property: 'titulo', label: 'Título', sortable: true },
    { property: 'categoria', label: 'Tipo' },
    { property: 'dataInicio', label: 'Início', type: 'date' },
    { property: 'dataFim', label: 'Fim', type: 'date' },
    { property: 'ativo', label: 'Ativo', type: 'boolean' },
  ];

  acoes = [
    { label: 'Editar', action: (row: Noticia) => this.editar(row) },
    { label: 'Ativar/Desativar', action: (row: Noticia) => this.toggle(row) },
  ];

  acaoPrimaria: PoModalAction = { label: 'Salvar', action: () => this.salvar() };
  acaoSecundaria: PoModalAction = { label: 'Cancelar', action: () => this.modal.close() };

  ngOnInit() { this.carregar(); }

  carregar() {
    this.loading.set(true);
    this.http.get<Noticia[]>('/api/noticias/admin').subscribe({
      next: (d) => { this.noticias.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  abrirNovo() {
    this.modoEdicao = false;
    this.form = { categoria: 'noticia', titulo: '', conteudo: '', data_inicio: '', data_fim: null };
    this.modal.open();
  }

  editar(n: Noticia) {
    this.modoEdicao = true;
    this.idEdicao = n.id;
    this.form = { categoria: n.categoria, titulo: n.titulo, conteudo: '', data_inicio: n.dataInicio, data_fim: n.dataFim };
    this.modal.open();
  }

  salvar() {
    const obs = this.modoEdicao
      ? this.http.patch(`/api/noticias/${this.idEdicao}`, this.form)
      : this.http.post('/api/noticias', this.form);
    obs.subscribe({
      next: () => { this.notify.success('Salvo!'); this.modal.close(); this.carregar(); },
      error: (err) => this.notify.error(err?.error?.message ?? 'Erro.'),
    });
  }

  toggle(n: Noticia) {
    this.http.patch(`/api/noticias/${n.id}/toggle`, {}).subscribe({
      next: () => this.carregar(),
      error: () => this.notify.error('Erro.'),
    });
  }
}
