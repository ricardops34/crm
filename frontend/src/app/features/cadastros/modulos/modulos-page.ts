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

interface Tela { id: string; codigo: string; nome: string; moduloId: string | null; }
interface Perfil { id: string; nome: string; }
interface Modulo {
  id: string;
  nome: string;
  icone: string;
  ordem: number;
  somenteAdmin: boolean;
  ativo: boolean;
  telas?: Tela[];
  perfis?: Perfil[];
}

@Component({
  selector: 'app-modulos-page',
  imports: [PoModule, FormsModule],
  template: `
    <po-page-default
      p-title="Módulos do Sistema"
      [p-breadcrumb]="{ items: [{ label: 'Configurações' }, { label: 'Módulos' }] }">

      <po-button p-label="Novo módulo" p-icon="an an-plus" p-kind="primary" (p-click)="abrirNovo()"></po-button>

      <po-table
        [p-columns]="colunas"
        [p-items]="modulos()"
        [p-loading]="loading()"
        [p-actions]="acoes"
        p-sort="true">
      </po-table>
    </po-page-default>

    <!-- Modal: criar/editar módulo -->
    <po-modal
      #modalForm
      [p-title]="modoEdicao ? 'Editar Módulo' : 'Novo Módulo'"
      [p-primary-action]="acaoPrimaria"
      [p-secondary-action]="acaoCancelarForm">

      <po-input name="nome" [(ngModel)]="form.nome" p-label="Nome" p-required></po-input>
      <po-input name="icone" [(ngModel)]="form.icone" p-label="Ícone (ex: an an-folder-open)" p-placeholder="an an-folder-open" p-required></po-input>
      <po-input name="ordem" [(ngModel)]="form.ordem" p-label="Ordem" p-type="number"></po-input>

      <div class="po-mt-2">
        <po-switch
          name="somenteAdmin"
          [(ngModel)]="form.somente_admin"
          p-label="Visível apenas para ADMIN">
        </po-switch>
      </div>
    </po-modal>

    <!-- Modal: gerenciar telas e perfis -->
    <po-modal
      #modalConfig
      [p-title]="'Configurar: ' + (moduloAtivo()?.nome ?? '')"
      [p-primary-action]="acaoSalvarConfig"
      [p-secondary-action]="acaoCancelarConfig"
      p-size="xl">

      <div class="po-row">
        <!-- Telas do módulo -->
        <div class="po-col-6">
          <h4>Sub-rotinas (telas)</h4>
          <p class="po-text-sm po-text-color-neutral-dark-60">Marque as telas que pertencem a este módulo</p>
          <po-checkbox-group
            name="telasSel"
            [p-options]="telasCatalogo()"
            [ngModel]="telasSelecionadas"
            (ngModelChange)="telasSelecionadas = $event">
          </po-checkbox-group>
        </div>

        <!-- Perfis vinculados -->
        <div class="po-col-6">
          <h4>Perfis com acesso</h4>
          <p class="po-text-sm po-text-color-neutral-dark-60">Perfis que veem este módulo no menu</p>
          <po-checkbox-group
            name="perfisSel"
            [p-options]="perfisCatalogo()"
            [ngModel]="perfisSelecionados"
            (ngModelChange)="perfisSelecionados = $event">
          </po-checkbox-group>
          @if (moduloAtivo()?.somenteAdmin) {
            <p class="po-mt-2" style="color: var(--color-feedback-warning-dark)">
              <span class="an an-lock"></span> Este módulo é exclusivo do ADMIN
            </p>
          }
        </div>
      </div>
    </po-modal>
  `,
})
export class ModulosPageComponent implements OnInit {
  @ViewChild('modalForm') modalForm!: PoModalComponent;
  @ViewChild('modalConfig') modalConfig!: PoModalComponent;

  private http = inject(HttpClient);
  private notify = inject(PoNotificationService);

  modulos = signal<Modulo[]>([]);
  loading = signal(false);
  modoEdicao = false;
  idEdicao = '';
  moduloAtivo = signal<Modulo | null>(null);

  form: any = { nome: '', icone: 'an an-folder-open', ordem: 0, somente_admin: false };
  telasSelecionadas: string[] = [];
  perfisSelecionados: string[] = [];

  telasCatalogo = signal<{ label: string; value: string }[]>([]);
  perfisCatalogo = signal<{ label: string; value: string }[]>([]);

  todasTelas: Tela[] = [];
  todosPerfis: Perfil[] = [];

  colunas: PoTableColumn[] = [
    { property: 'nome', label: 'Nome', sortable: true },
    { property: 'icone', label: 'Ícone' },
    { property: 'ordem', label: 'Ordem', type: 'number', sortable: true },
    { property: 'somenteAdmin', label: 'Só Admin', type: 'boolean' },
    { property: 'ativo', label: 'Ativo', type: 'boolean' },
  ];

  acoes = [
    { label: 'Editar', action: (row: Modulo) => this.editar(row) },
    { label: 'Configurar telas e perfis', action: (row: Modulo) => this.configurar(row) },
    { label: 'Ativar/Desativar', action: (row: Modulo) => this.toggle(row) },
  ];

  acaoPrimaria: PoModalAction = { label: 'Salvar', action: () => this.salvar() };
  acaoSalvarConfig: PoModalAction = { label: 'Salvar configuração', action: () => this.salvarConfig() };
  acaoCancelarForm: PoModalAction = { label: 'Cancelar', action: () => this.modalForm.close() };
  acaoCancelarConfig: PoModalAction = { label: 'Cancelar', action: () => this.modalConfig.close() };

  ngOnInit() {
    this.carregar();
    this.http.get<Tela[]>('/api/perfis/telas').subscribe((t) => {
      this.todasTelas = t;
      this.telasCatalogo.set(t.map((x) => ({ label: `${x.nome} (${x.codigo})`, value: x.id })));
    });
    this.http.get<Perfil[]>('/api/perfis').subscribe((p) => {
      this.todosPerfis = p;
      this.perfisCatalogo.set(p.map((x) => ({ label: x.nome, value: x.id })));
    });
  }

  carregar() {
    this.loading.set(true);
    this.http.get<Modulo[]>('/api/modulos').subscribe({
      next: (d) => { this.modulos.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  abrirNovo() {
    this.modoEdicao = false;
    this.form = { nome: '', icone: 'an an-folder-open', ordem: this.modulos().length, somente_admin: false };
    this.modalForm.open();
  }

  editar(m: Modulo) {
    this.modoEdicao = true;
    this.idEdicao = m.id;
    this.form = { nome: m.nome, icone: m.icone, ordem: m.ordem, somente_admin: m.somenteAdmin };
    this.modalForm.open();
  }

  salvar() {
    const obs = this.modoEdicao
      ? this.http.patch(`/api/modulos/${this.idEdicao}`, this.form)
      : this.http.post('/api/modulos', this.form);
    obs.subscribe({
      next: () => {
        this.notify.success('Módulo salvo!');
        this.modalForm.close();
        this.carregar();
      },
      error: (err) => this.notify.error(err?.error?.message ?? 'Erro.'),
    });
  }

  configurar(m: Modulo) {
    this.moduloAtivo.set(m);
    this.telasSelecionadas = (m.telas ?? []).map((t) => t.id);
    this.perfisSelecionados = (m.perfis ?? []).map((p) => p.id);
    this.modalConfig.open();
  }

  salvarConfig() {
    const id = this.moduloAtivo()?.id;
    if (!id) return;

    const telaAtual = (this.moduloAtivo()?.telas ?? []).map((t) => t.id);
    const telasAdicionadas = this.telasSelecionadas.filter((t) => !telaAtual.includes(t));
    const telasRemovidas = telaAtual.filter((t) => !this.telasSelecionadas.includes(t));

    const ops: Promise<any>[] = [
      ...telasAdicionadas.map((tid) => this.http.post(`/api/modulos/${id}/telas/${tid}`, {}).toPromise()),
      ...telasRemovidas.map((tid) => this.http.delete(`/api/modulos/${id}/telas/${tid}`).toPromise()),
      this.http.put(`/api/modulos/${id}/perfis`, { perfil_ids: this.perfisSelecionados }).toPromise(),
    ];

    Promise.all(ops).then(() => {
      this.notify.success('Configuração salva!');
      this.modalConfig.close();
      this.carregar();
    }).catch(() => this.notify.error('Erro ao salvar configuração.'));
  }

  toggle(m: Modulo) {
    this.http.patch(`/api/modulos/${m.id}/toggle`, {}).subscribe({
      next: () => this.carregar(),
      error: () => this.notify.error('Erro.'),
    });
  }
}
