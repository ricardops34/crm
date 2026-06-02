import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import {
  PoButtonComponent,
  PoInputComponent,
  PoNotificationService,
  PoPageDefaultComponent,
  PoSwitchComponent,
} from '@po-ui/ng-components';

interface Parametro {
  id: number;
  grupo: string;
  chave: string;
  valor: string | null;
  tipo: string;
  sensivel: boolean;
  descricao: string;
}

@Component({
  selector: 'app-parametros-page',
  imports: [PoPageDefaultComponent, FormsModule, PoInputComponent, PoButtonComponent, PoSwitchComponent],
  template: `
    <po-page-default
      p-title="Parâmetros do Sistema"
      [p-breadcrumb]="{ items: [{ label: 'Cadastros' }, { label: 'Parâmetros' }] }">

      @for (grupo of grupos(); track grupo.nome) {
        <div class="po-mb-4">
          <h4 class="po-text-color-primary po-mb-2">{{ grupo.nome | uppercase }}</h4>
          <div class="po-row">
            @for (p of grupo.parametros; track p.chave) {
              <div class="po-col-6 po-mb-2">
                @if (p.tipo === 'boolean') {
                  <po-switch
                    [name]="p.chave"
                    [(ngModel)]="valoresForm[p.chave]"
                    [p-label]="p.descricao ?? p.chave">
                  </po-switch>
                } @else {
                  <po-input
                    [name]="p.chave"
                    [(ngModel)]="valoresForm[p.chave]"
                    [p-label]="p.descricao ?? p.chave"
                    [p-type]="p.tipo === 'password' ? 'password' : 'text'"
                    [p-placeholder]="p.sensivel ? '••••••••' : ''">
                  </po-input>
                }
              </div>
            }
          </div>

          <po-button
            [p-label]="'Salvar ' + grupo.nome"
            p-type="primary"
            [p-loading]="salvando()"
            (p-click)="salvarGrupo(grupo.nome)">
          </po-button>
        </div>
      }
    </po-page-default>
  `,
})
export class ParametrosPageComponent implements OnInit {
  private http = inject(HttpClient);
  private notify = inject(PoNotificationService);

  grupos = signal<{ nome: string; parametros: Parametro[] }[]>([]);
  valoresForm: Record<string, string> = {};
  salvando = signal(false);

  ngOnInit() {
    this.http.get<Parametro[]>('/api/parametros').subscribe((params) => {
      const mapa = new Map<string, Parametro[]>();
      for (const p of params) {
        if (!mapa.has(p.grupo)) mapa.set(p.grupo, []);
        mapa.get(p.grupo)!.push(p);
        this.valoresForm[p.chave] = p.valor ?? '';
      }
      this.grupos.set(Array.from(mapa.entries()).map(([nome, parametros]) => ({ nome, parametros })));
    });
  }

  salvarGrupo(grupo: string) {
    const grpParams = this.grupos().find((g) => g.nome === grupo)?.parametros ?? [];
    const updates: Record<string, string | null> = {};
    for (const p of grpParams) {
      updates[p.chave] = this.valoresForm[p.chave] || null;
    }

    this.salvando.set(true);
    this.http.put(`/api/parametros/${grupo}`, updates).subscribe({
      next: () => { this.salvando.set(false); this.notify.success(`Grupo ${grupo} salvo!`); },
      error: () => { this.salvando.set(false); this.notify.error('Erro ao salvar.'); },
    });
  }
}
