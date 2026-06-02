import { Component, computed, inject, OnInit, signal, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import {
  PoDialogService,
  PoModule,
  PoModalAction,
  PoModalComponent,
  PoNotificationService,
  PoTableAction,
  PoTableColumn,
} from '@po-ui/ng-components';

import { AuthService } from '../../../core/services/auth.service';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  primeiroAcesso: boolean;
  perfil?: { id: string; nome: string };
}

interface Perfil { id: string; nome: string; }

@Component({
  selector: 'app-usuarios',
  imports: [PoModule, FormsModule],
  template: `
    <po-page-default
      p-title="Usuários"
      [p-breadcrumb]="{ items: [{ label: 'Cadastros' }, { label: 'Usuários' }] }">

      <po-button
        p-label="Novo usuário"
        p-icon="an an-user-plus"
        p-kind="primary"
        (p-click)="abrirNovo()">
      </po-button>

      <po-table
        [p-columns]="colunas"
        [p-items]="usuarios()"
        [p-loading]="loading()"
        [p-actions]="acoes"
        p-sort="true">
      </po-table>
    </po-page-default>

    <po-modal
      #modal
      [p-title]="modoEdicao ? 'Editar Usuário' : 'Novo Usuário'"
      [p-primary-action]="acaoPrimaria()"
      [p-secondary-action]="acaoSecundaria">

      <div class="po-row">
        <div class="po-col-12">
          <po-input
            name="nome"
            [(ngModel)]="form.nome"
            p-label="Nome completo"
            p-required>
          </po-input>
        </div>
        <div class="po-col-12">
          <po-input
            name="email"
            [(ngModel)]="form.email"
            p-label="E-mail"
            p-required
            [p-disabled]="$any(modoEdicao)">
          </po-input>
        </div>
        <div class="po-col-12">
          <po-select
            name="perfil_id"
            [ngModel]="form.perfil_id"
            (ngModelChange)="form.perfil_id = $event"
            p-label="Perfil"
            p-required
            [p-options]="opcoesPerfis()">
          </po-select>
        </div>
      </div>
    </po-modal>
  `,
})
export class UsuariosComponent implements OnInit {
  @ViewChild('modal') modal!: PoModalComponent;

  private http = inject(HttpClient);
  private notify = inject(PoNotificationService);
  private dialog = inject(PoDialogService);
  private auth = inject(AuthService);

  readonly usuarios = signal<Usuario[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly opcoesPerfis = signal<{ label: string; value: string }[]>([]);

  modoEdicao = false;
  idEdicao = '';
  form: { nome: string; email: string; perfil_id: string } = { nome: '', email: '', perfil_id: '' };

  readonly colunas: PoTableColumn[] = [
    { property: 'nome', label: 'Nome', sortable: true },
    { property: 'email', label: 'E-mail', sortable: true },
    { property: 'perfil.nome', label: 'Perfil' },
    {
      property: 'ativo',
      label: 'Status',
      type: 'boolean',
      boolean: { trueLabel: 'Ativo', falseLabel: 'Inativo' },
    },
    { property: 'primeiroAcesso', label: '1º acesso', type: 'boolean' },
  ];

  readonly acoes: PoTableAction[] = [
    {
      label: 'Editar',
      icon: 'an an-pencil-simple',
      action: (row: Usuario) => this.editar(row),
    },
    {
      label: 'Reset senha',
      icon: 'an an-lock',
      action: (row: Usuario) => this.confirmarResetSenha(row),
    },
    {
      label: 'Desativar',
      icon: 'an an-prohibit',
      type: 'danger',
      action: (row: Usuario) => this.confirmarToggleAtivo(row),
      visible: (row: Usuario) => row.ativo,
    },
    {
      label: 'Ativar',
      icon: 'an an-check-circle',
      action: (row: Usuario) => this.confirmarToggleAtivo(row),
      visible: (row: Usuario) => !row.ativo,
    },
  ];

  readonly acaoPrimaria = computed<PoModalAction>(() => ({
    label: 'Salvar',
    action: () => this.salvar(),
    loading: this.saving(),
    disabled: this.saving(),
  }));

  readonly acaoSecundaria: PoModalAction = {
    label: 'Cancelar',
    action: () => this.modal.close(),
  };

  ngOnInit() {
    this.carregar();
    this.http.get<Perfil[]>('/api/perfis').subscribe((p) => {
      this.opcoesPerfis.set(p.map((pf) => ({ label: pf.nome, value: pf.id })));
    });
  }

  carregar() {
    this.loading.set(true);
    this.http.get<Usuario[]>('/api/usuarios').subscribe({
      next: (data) => { this.usuarios.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  abrirNovo() {
    this.modoEdicao = false;
    this.idEdicao = '';
    this.form = { nome: '', email: '', perfil_id: '' };
    this.modal.open();
  }

  editar(u: Usuario) {
    this.modoEdicao = true;
    this.idEdicao = u.id;
    this.form = { nome: u.nome, email: u.email, perfil_id: u.perfil?.id ?? '' };
    this.modal.open();
  }

  salvar() {
    this.saving.set(true);

    const empresaId = this.auth.payload()?.empresa_id ?? 1;

    const obs = this.modoEdicao
      ? this.http.patch(`/api/usuarios/${this.idEdicao}`, {
          nome: this.form.nome,
          perfil_id: this.form.perfil_id,
        })
      : this.http.post<{ senha_temporaria?: string }>('/api/usuarios', {
          nome: this.form.nome,
          email: this.form.email,
          perfil_id: this.form.perfil_id,
          empresa_ids: [empresaId],
        });

    obs.subscribe({
      next: (res: any) => {
        this.saving.set(false);
        this.modal.close();
        this.carregar();

        if (res?.senha_temporaria) {
          this.dialog.alert({
            title: 'Usuário criado',
            message: `Senha temporária gerada: ${res.senha_temporaria}\n\nO usuário deverá alterá-la no primeiro acesso.`,
            ok: () => {},
          });
        } else {
          this.notify.success('Usuário salvo com sucesso!');
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.notify.error(err?.error?.message ?? 'Erro ao salvar.');
      },
    });
  }

  confirmarResetSenha(u: Usuario) {
    this.dialog.confirm({
      title: 'Redefinir senha',
      message: `Deseja redefinir a senha de ${u.nome}? Uma nova senha temporária será gerada.`,
      confirm: () => this.resetSenha(u),
    });
  }

  private resetSenha(u: Usuario) {
    this.http.patch<{ senha_temporaria: string }>(`/api/usuarios/${u.id}/reset-senha`, {}).subscribe({
      next: (res) => {
        this.dialog.alert({
          title: 'Senha redefinida',
          message: `Nova senha temporária de ${u.nome}:\n\n${res.senha_temporaria}`,
          ok: () => {},
        });
      },
      error: () => this.notify.error('Erro ao redefinir senha.'),
    });
  }

  confirmarToggleAtivo(u: Usuario) {
    const acao = u.ativo ? 'desativar' : 'ativar';
    this.dialog.confirm({
      title: u.ativo ? 'Desativar usuário' : 'Ativar usuário',
      message: `Deseja ${acao} o usuário ${u.nome}?`,
      confirm: () => this.toggleAtivo(u),
    });
  }

  private toggleAtivo(u: Usuario) {
    this.http.patch(`/api/usuarios/${u.id}/ativo`, { ativo: !u.ativo }).subscribe({
      next: () => {
        this.notify.success(`Usuário ${u.ativo ? 'desativado' : 'ativado'} com sucesso!`);
        this.carregar();
      },
      error: () => this.notify.error('Erro ao atualizar status.'),
    });
  }
}
