import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CurrencyPipe } from '@angular/common';
import { PoModule } from '@po-ui/ng-components';
import { AuthService } from '../../core/services/auth.service';

interface Noticia {
  id: string;
  titulo: string;
  conteudo: string;
  categoria: 'noticia' | 'aviso';
  dataInicio: string;
}

interface Indicadores {
  carteira?: {
    total: number;
    semCompra30: number;
    bloqueados: number;
    vendas30d: number;
  };
  financeiro?: {
    titulosAbertoQtd: number;
    titulosAbertoTotal: number;
  };
}

@Component({
  selector: 'app-home',
  imports: [PoModule, RouterLink, CurrencyPipe],
  template: `
    <po-page-default [p-title]="'Olá, ' + nome() + '!'">

      <!-- Indicadores -->
      @if (indicadores(); as ind) {
        <div class="po-row po-mb-4">
          @if (ind.carteira) {
            <div class="po-col-3">
              <po-widget p-title="Carteira Total" [p-primary-label]="'MCV'" (p-primary-action)="ir('/mcv')">
                <p class="po-text-h2" style="color: var(--color-brand-01-dark)">{{ ind.carteira.total }}</p>
                <p class="po-text-sm">clientes ativos</p>
              </po-widget>
            </div>
            <div class="po-col-3">
              <po-widget p-title="Sem Compra 30 dias" [p-primary-label]="'Ver'" (p-primary-action)="ir('/mcv?filtro=30')">
                <p class="po-text-h2" style="color: var(--color-feedback-warning-dark)">{{ ind.carteira.semCompra30 }}</p>
                <p class="po-text-sm">clientes inativos</p>
              </po-widget>
            </div>
            <div class="po-col-3">
              <po-widget p-title="Bloqueados" [p-primary-label]="'Ver'" (p-primary-action)="ir('/mcv?filtro=bloqueados')">
                <p class="po-text-h2" style="color: var(--color-feedback-negative-dark)">{{ ind.carteira.bloqueados }}</p>
                <p class="po-text-sm">clientes bloqueados</p>
              </po-widget>
            </div>
            <div class="po-col-3">
              <po-widget p-title="Vendas 30 dias">
                <p class="po-text-h2" style="color: var(--color-feedback-positive-dark)">
                  {{ ind.carteira.vendas30d | currency:'BRL' }}
                </p>
                <p class="po-text-sm">volume total</p>
              </po-widget>
            </div>
          }

          @if (ind.financeiro) {
            <div class="po-col-6 po-mt-3">
              <po-widget p-title="Títulos em Aberto (Empresa)">
                <div class="po-d-flex po-justify-content-between">
                  <div>
                    <p class="po-text-h2" style="color: var(--color-feedback-negative-dark)">
                      {{ ind.financeiro.titulosAbertoQtd }}
                    </p>
                    <p class="po-text-sm">títulos</p>
                  </div>
                  <div class="po-text-right">
                    <p class="po-text-h2" style="color: var(--color-feedback-negative-dark)">
                      {{ ind.financeiro.titulosAbertoTotal | currency:'BRL' }}
                    </p>
                    <p class="po-text-sm">valor total</p>
                  </div>
                </div>
              </po-widget>
            </div>
          }
        </div>
      }

      <!-- Atalhos rápidos -->
      <div class="po-row po-mb-4">
        <div class="po-col-12">
          <h3 class="po-mb-2">Acesso rápido</h3>
          <div class="po-d-flex" style="gap: 12px; flex-wrap: wrap;">
            @for (atalho of atalhos(); track atalho.rota) {
              <a [routerLink]="atalho.rota"
                 class="po-d-flex po-flex-column po-align-center po-p-3 po-rounded"
                 style="text-decoration: none; border: 1px solid var(--color-neutral-mid-40); min-width: 100px; cursor: pointer; background: white;">
                <span [class]="atalho.icone" style="font-size: 28px; color: var(--color-brand-01-dark); margin-bottom: 4px;"></span>
                <span style="font-size: 12px; color: var(--color-neutral-dark-70);">{{ atalho.label }}</span>
              </a>
            }
          </div>
        </div>
      </div>

      <!-- Notícias e avisos -->
      <div class="po-row">
        @if (avisos().length) {
          <div class="po-col-12 po-mb-3">
            <h3 class="po-mb-2" style="color: var(--color-feedback-warning-dark)">
              <span class="an an-warning-circle po-mr-1"></span> Avisos
            </h3>
            @for (n of avisos(); track n.id) {
              <po-container class="po-mb-2" style="border-left: 4px solid var(--color-feedback-warning-dark);">
                <h4 class="po-mt-0 po-mb-1">{{ n.titulo }}</h4>
                <p class="po-text-sm po-mb-0">{{ n.conteudo }}</p>
              </po-container>
            }
          </div>
        }

        @if (noticiasList().length) {
          <div class="po-col-12">
            <h3 class="po-mb-2" style="color: var(--color-brand-01-dark)">
              <span class="an an-newspaper po-mr-1"></span> Notícias
            </h3>
            <div class="po-row">
              @for (n of noticiasList(); track n.id) {
                <div class="po-col-4 po-mb-2">
                  <po-widget [p-title]="n.titulo">
                    <p class="po-text-sm">{{ n.conteudo }}</p>
                  </po-widget>
                </div>
              }
            </div>
          </div>
        }

        @if (!loading() && !avisos().length && !noticiasList().length) {
          <div class="po-col-12 po-text-center po-mt-4">
            <span class="an an-newspaper" style="font-size: 48px; color: var(--color-neutral-mid-40)"></span>
            <p class="po-text-color-neutral-dark-40">Nenhuma notícia ou aviso no momento.</p>
          </div>
        }
      </div>

    </po-page-default>
  `,
})
export class HomeComponent implements OnInit {
  private auth = inject(AuthService);
  private http = inject(HttpClient);
  private router = inject(Router);

  nome = computed(() => this.auth.payload()?.nome?.split(' ')[0] ?? 'Usuário');

  noticias = signal<Noticia[]>([]);
  indicadores = signal<Indicadores | null>(null);
  loading = signal(false);

  avisos = computed(() => this.noticias().filter((n) => n.categoria === 'aviso'));
  noticiasList = computed(() => this.noticias().filter((n) => n.categoria === 'noticia'));

  atalhos = computed(() => {
    const telas = this.auth.payload()?.telas ?? [];
    const mapa = [
      { codigo: 'mcv',        label: 'MCV',        icone: 'an an-chart-line',             rota: '/mcv' },
      { codigo: 'clientes',   label: 'Clientes',   icone: 'an an-users',                  rota: '/clientes' },
      { codigo: 'orcamentos', label: 'Orçamentos', icone: 'an an-file-text',              rota: '/orcamentos' },
      { codigo: 'metas',      label: 'Metas',      icone: 'an an-target',                 rota: '/metas' },
      { codigo: 'financeiro', label: 'Financeiro', icone: 'an an-currency-circle-dollar', rota: '/financeiro' },
    ];
    return mapa.filter((a) => telas.includes(a.codigo));
  });

  ngOnInit() {
    this.loading.set(true);
    this.http.get<Noticia[]>('/api/noticias').subscribe({
      next: (d) => { this.noticias.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
    this.http.get<Indicadores>('/api/home/indicadores').subscribe({
      next: (d) => this.indicadores.set(d),
      error: () => {},
    });
  }

  ir(rota: string) { this.router.navigate([rota]); }
}
