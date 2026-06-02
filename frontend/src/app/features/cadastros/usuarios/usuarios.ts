import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { PoModule, PoModalAction, PoNotificationService, PoTableColumn } from '@po-ui/ng-components';

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
        p-icon="ph ph-plus"
        p-kind="primary"
        (p-click)="abrirNovo()">
      </po-button>

      <po-table
        [p-columns]="colunas"
        [p-items]="usuarios()"
        [p-loading]="loading()"
        [p-actions]="acoes">
      </po-table>
    </po-page-default>

    <po-modal
      #modal
      [p-title]="modoEdicao ? 'Editar Usuário' : 'Novo Usuário'"
      [p-primary-action]="acaoPrimaria"
      [p-secondary-action]="acaoSecundaria">
      <po-input name="nome" [(ngModel)]="form.nome" p-label="Nome completo" p-required></po-input>
      <po-input name="email" [(ngModel)]="form.email" p-label="E-mail" p-required [p-disabled]="$any(modoEdicao)"></po-input>
      <po-select
        name="perfil"
        [ngModel]="form.perfil_id"
        (ngModelChange)="form.perfil_id = $event"
        p-label="Perfil"
        [p-options]="opcooesPerfis()">
      </po-select>
    </po-modal>
  `,
})
export class UsuariosComponent implements OnInit {
  private http = inject(HttpClient);
  private notify = inject(PoNotificationService);

  usuarios = signal<Usuario[]>([]);
  perfis = signal<Perfil[]>([]);
  loading = signal(false);
  modoEdicao = false;
  idEdicao = '';

  form = { nome: '', email: '', perfil_id: '', empresa_ids: [1] };

  opcooesPerfis = signal<{ label: string; value: string }[]>([]);

  colunas: PoTableColumn[] = [
    { property: 'nome', label: 'Nome' },
    { property: 'email', label: 'E-mail' },
    { property: 'perfil.nome', label: 'Perfil' },
    { property: 'ativo', label: 'Ativo', type: 'boolean' },
    { property: 'primeiroAcesso', label: 'Primeiro acesso', type: 'boolean' },
  ];

  acoes = [
    { label: 'Editar', action: (row: Usuario) => this.editar(row) },
    { label: 'Reset senha', action: (row: Usuario) => this.resetSenha(row) },
    { label: 'Ativar/Desativar', action: (row: Usuario) => this.toggleAtivo(row) },
  ];

  acaoPrimaria: PoModalAction = { label: 'Salvar', action: () => this.salvar() };
  acaoSecundaria: PoModalAction = { label: 'Cancelar', action: () => {} };

  ngOnInit() {
    this.carregar();
    this.http.get<Perfil[]>('/api/perfis').subscribe((p) => {
      this.perfis.set(p);
      this.opcooesPerfis.set(p.map((pf) => ({ label: pf.nome, value: pf.id })));
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
    this.form = { nome: '', email: '', perfil_id: '', empresa_ids: [1] };
  }

  editar(u: Usuario) {
    this.modoEdicao = true;
    this.idEdicao = u.id;
    this.form = { nome: u.nome, email: u.email, perfil_id: u.perfil?.id ?? '', empresa_ids: [1] };
  }

  salvar() {
    const obs = this.modoEdicao
      ? this.http.patch(`/api/usuarios/${this.idEdicao}`, this.form)
      : this.http.post<{ senha_temporaria?: string }>('/api/usuarios', this.form);

    obs.subscribe({
      next: (res: any) => {
        this.notify.success('Usuário salvo!');
        if (res?.senha_temporaria) {
          this.notify.information(`Senha temporária: ${res.senha_temporaria}`);
        }
        this.carregar();
      },
      error: (err) => this.notify.error(err?.error?.message ?? 'Erro ao salvar.'),
    });
  }

  resetSenha(u: Usuario) {
    this.http.patch<{ senha_temporaria: string }>(`/api/usuarios/${u.id}/reset-senha`, {}).subscribe({
      next: (res) => this.notify.information(`Nova senha temporária: ${res.senha_temporaria}`),
      error: () => this.notify.error('Erro ao resetar senha.'),
    });
  }

  toggleAtivo(u: Usuario) {
    this.http.patch(`/api/usuarios/${u.id}/ativo`, { ativo: !u.ativo }).subscribe({
      next: () => { this.notify.success('Atualizado!'); this.carregar(); },
      error: () => this.notify.error('Erro ao atualizar.'),
    });
  }
}
