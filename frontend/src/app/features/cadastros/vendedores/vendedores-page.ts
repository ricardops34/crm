import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import {
  PoModule,
  PoModalAction,
  PoNotificationService,
  PoTableColumn,
} from '@po-ui/ng-components';

interface Vendedor {
  id: string;
  nome: string;
  codErp: string;
  tipo: string;
  ativo: boolean;
  usuarioId: string | null;
  supervisorId: string | null;
  gerenteId: string | null;
  usuario?: { nome: string; email: string };
}

interface UsuarioOpt { label: string; value: string; }

@Component({
  selector: 'app-vendedores-page',
  imports: [PoModule, FormsModule],
  template: `
    <po-page-default
      p-title="Estrutura Comercial — Vendedores"
      [p-breadcrumb]="{ items: [{ label: 'Cadastros' }, { label: 'Vendedores' }] }">

      <po-button
        p-label="Novo vendedor"
        p-icon="an an-plus"
        p-kind="primary"
        (p-click)="abrirNovo()">
      </po-button>

      <po-table
        [p-columns]="colunas"
        [p-items]="vendedores()"
        [p-loading]="loading()"
        [p-actions]="acoes"
        p-sort="true">
      </po-table>
    </po-page-default>

    <po-modal
      #modal
      [p-title]="modoEdicao ? 'Editar Vendedor' : 'Novo Vendedor'"
      [p-primary-action]="acaoPrimaria"
      [p-secondary-action]="acaoSecundaria">

      <po-input name="codErp" [(ngModel)]="form.codErp" p-label="Código ERP" p-required></po-input>
      <po-input name="nome" [(ngModel)]="form.nome" p-label="Nome completo" p-required></po-input>

      <po-select
        name="tipo"
        [ngModel]="form.tipo"
        (ngModelChange)="form.tipo = $event"
        p-label="Tipo"
        [p-options]="tipoOpcoes">
      </po-select>

      <po-select
        name="usuario"
        [ngModel]="form.usuario_id"
        (ngModelChange)="form.usuario_id = $event"
        p-label="Usuário vinculado"
        [p-options]="usuariosOpt()">
      </po-select>

      @if (form.tipo === 'vendedor' || form.tipo === 'supervisor') {
        <po-select
          name="supervisor"
          [ngModel]="form.supervisor_id"
          (ngModelChange)="form.supervisor_id = $event"
          p-label="Supervisor"
          [p-options]="supervisoresOpt()">
        </po-select>
      }

      @if (form.tipo === 'vendedor' || form.tipo === 'supervisor') {
        <po-select
          name="gerente"
          [ngModel]="form.gerente_id"
          (ngModelChange)="form.gerente_id = $event"
          p-label="Gerente"
          [p-options]="gerentesOpt()">
        </po-select>
      }
    </po-modal>
  `,
})
export class VendedoresPageComponent implements OnInit {
  private http = inject(HttpClient);
  private notify = inject(PoNotificationService);

  vendedores = signal<Vendedor[]>([]);
  loading = signal(false);
  modoEdicao = false;
  idEdicao = '';

  form: any = { codErp: '', nome: '', tipo: 'vendedor', usuario_id: null, supervisor_id: null, gerente_id: null };

  tipoOpcoes = [
    { label: 'Vendedor', value: 'vendedor' },
    { label: 'Supervisor', value: 'supervisor' },
    { label: 'Gerente', value: 'gerente' },
  ];

  usuariosOpt = signal<UsuarioOpt[]>([{ label: '-- Nenhum --', value: '' }]);
  supervisoresOpt = signal<UsuarioOpt[]>([{ label: '-- Nenhum --', value: '' }]);
  gerentesOpt = signal<UsuarioOpt[]>([{ label: '-- Nenhum --', value: '' }]);

  colunas: PoTableColumn[] = [
    { property: 'codErp', label: 'Cód. ERP', sortable: true },
    { property: 'nome', label: 'Nome', sortable: true },
    { property: 'tipo', label: 'Tipo', sortable: true },
    { property: 'usuario.nome', label: 'Usuário' },
    { property: 'ativo', label: 'Ativo', type: 'boolean' },
  ];

  acoes = [
    { label: 'Editar', action: (row: Vendedor) => this.editar(row) },
  ];

  acaoPrimaria: PoModalAction = { label: 'Salvar', action: () => this.salvar() };
  acaoSecundaria: PoModalAction = { label: 'Cancelar', action: () => {} };

  ngOnInit() {
    this.carregar();
    this.http.get<any[]>('/api/usuarios').subscribe((users) => {
      const opts = [
        { label: '-- Nenhum --', value: '' },
        ...users.map((u) => ({ label: `${u.nome} (${u.email})`, value: u.id })),
      ];
      this.usuariosOpt.set(opts);
    });
  }

  carregar() {
    this.loading.set(true);
    this.http.get<Vendedor[]>('/api/vendedores').subscribe({
      next: (d) => {
        this.vendedores.set(d);
        this.loading.set(false);
        const supers = [
          { label: '-- Nenhum --', value: '' },
          ...d.filter(v => v.tipo === 'supervisor').map(v => ({ label: v.nome, value: v.id })),
        ];
        const gerentes = [
          { label: '-- Nenhum --', value: '' },
          ...d.filter(v => v.tipo === 'gerente').map(v => ({ label: v.nome, value: v.id })),
        ];
        this.supervisoresOpt.set(supers);
        this.gerentesOpt.set(gerentes);
      },
      error: () => this.loading.set(false),
    });
  }

  abrirNovo() {
    this.modoEdicao = false;
    this.form = { codErp: '', nome: '', tipo: 'vendedor', usuario_id: null, supervisor_id: null, gerente_id: null };
  }

  editar(v: Vendedor) {
    this.modoEdicao = true;
    this.idEdicao = v.id;
    this.form = {
      codErp: v.codErp, nome: v.nome, tipo: v.tipo,
      usuario_id: v.usuarioId ?? '', supervisor_id: v.supervisorId ?? '', gerente_id: v.gerenteId ?? '',
    };
  }

  salvar() {
    const payload = {
      ...this.form,
      usuario_id: this.form.usuario_id || null,
      supervisor_id: this.form.supervisor_id || null,
      gerente_id: this.form.gerente_id || null,
    };

    const obs = this.modoEdicao
      ? this.http.patch(`/api/vendedores/${this.idEdicao}`, payload)
      : this.http.post('/api/vendedores', { ...payload, empresa_id: 1, cod_erp: payload.codErp });

    obs.subscribe({
      next: () => { this.notify.success('Salvo!'); this.carregar(); },
      error: (err) => this.notify.error(err?.error?.message ?? 'Erro ao salvar.'),
    });
  }
}
