import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { PoModule, PoModalAction, PoNotificationService, PoTableColumn, PoCheckboxGroupOption } from '@po-ui/ng-components';

interface Tela { id: string; codigo: string; nome: string; modulo: string; }
interface Perfil { id: string; nome: string; descricao: string; versao: number; ativo: boolean; telas?: Tela[]; }

@Component({
  selector: 'app-perfis-page',
  imports: [PoModule, FormsModule],
  template: `
    <po-page-default
      p-title="Perfis"
      [p-breadcrumb]="{ items: [{ label: 'Cadastros' }, { label: 'Perfis' }] }">

      <po-table
        [p-columns]="colunas"
        [p-items]="perfis()"
        [p-loading]="loading()"
        [p-actions]="acoes">
      </po-table>
    </po-page-default>

    <po-modal
      #modal
      [p-title]="perfilSelecionado()?.nome ?? 'Permissões'"
      [p-primary-action]="acaoPrimaria"
      [p-secondary-action]="acaoSecundaria"
      p-size="xl">

      <div class="po-row">
        <div class="po-col-12">
          <p><strong>Selecione as telas que este perfil pode acessar:</strong></p>

          @for (modulo of modulos(); track modulo.nome) {
            <div class="po-mb-2">
              <p class="po-text-color-neutral-dark-60"><strong>{{ modulo.nome }}</strong></p>
              <po-checkbox-group
                [p-options]="modulo.opcoes"
                [ngModel]="telasSelecionadas"
                (ngModelChange)="telasSelecionadas = $event"
                [name]="'telas_' + modulo.nome">
              </po-checkbox-group>
            </div>
          }
        </div>
      </div>
    </po-modal>
  `,
})
export class PerfisPageComponent implements OnInit {
  private http = inject(HttpClient);
  private notify = inject(PoNotificationService);

  perfis = signal<Perfil[]>([]);
  todasTelas = signal<Tela[]>([]);
  perfilSelecionado = signal<Perfil | null>(null);
  loading = signal(false);

  telasSelecionadas: string[] = [];

  colunas: PoTableColumn[] = [
    { property: 'nome', label: 'Nome' },
    { property: 'descricao', label: 'Descrição' },
    { property: 'versao', label: 'Versão' },
    { property: 'ativo', label: 'Ativo', type: 'boolean' },
  ];

  acoes = [
    { label: 'Gerenciar telas', action: (row: Perfil) => this.gerenciarTelas(row) },
  ];

  acaoPrimaria: PoModalAction = { label: 'Salvar', action: () => this.salvarTelas() };
  acaoSecundaria: PoModalAction = { label: 'Cancelar', action: () => {} };

  modulos = signal<{ nome: string; opcoes: PoCheckboxGroupOption[] }[]>([]);

  ngOnInit() {
    this.carregar();
    this.http.get<Tela[]>('/api/perfis/telas').subscribe((telas) => {
      this.todasTelas.set(telas);
    });
  }

  carregar() {
    this.loading.set(true);
    this.http.get<Perfil[]>('/api/perfis').subscribe({
      next: (data) => { this.perfis.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  gerenciarTelas(perfil: Perfil) {
    this.perfilSelecionado.set(perfil);
    this.telasSelecionadas = (perfil.telas ?? []).map((t) => t.id);

    const porModulo = new Map<string, PoCheckboxGroupOption[]>();
    for (const t of this.todasTelas()) {
      if (!porModulo.has(t.modulo)) porModulo.set(t.modulo, []);
      porModulo.get(t.modulo)!.push({ label: t.nome, value: t.id });
    }

    this.modulos.set(
      Array.from(porModulo.entries()).map(([nome, opcoes]) => ({ nome, opcoes })),
    );
  }

  salvarTelas() {
    const p = this.perfilSelecionado();
    if (!p) return;

    this.http.put(`/api/perfis/${p.id}/telas`, { tela_ids: this.telasSelecionadas }).subscribe({
      next: () => { this.notify.success('Telas atualizadas!'); this.carregar(); },
      error: (err) => this.notify.error(err?.error?.message ?? 'Erro ao salvar.'),
    });
  }
}
