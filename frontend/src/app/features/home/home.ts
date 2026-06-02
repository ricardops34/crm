import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PoModule } from '@po-ui/ng-components';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  imports: [PoModule, RouterLink],
  template: `
    <po-page-default [p-title]="titulo()">
      <po-container>
        <div class="po-row">
          <div class="po-col-12 po-mb-3">
            <h3>Bem-vindo, {{ nome() }}!</h3>
            <p>Perfil: <strong>{{ perfil() }}</strong></p>
          </div>

          @for (atalho of atalhos(); track atalho.rota) {
            <div class="po-col-3">
              <a [routerLink]="atalho.rota" class="po-text-center po-d-flex po-flex-column po-align-center po-p-3 po-border po-rounded">
                <span [class]="atalho.icone + ' po-icon-size-large po-mb-1'"></span>
                <span>{{ atalho.label }}</span>
              </a>
            </div>
          }
        </div>
      </po-container>
    </po-page-default>
  `,
})
export class HomeComponent {
  private auth = inject(AuthService);

  nome = computed(() => this.auth.payload()?.nome ?? 'Usuário');
  perfil = computed(() => this.auth.payload()?.perfil_nome ?? '');
  titulo = computed(() => `Home — CRM Comercial 360`);

  atalhos = computed(() => {
    const telas = this.auth.payload()?.telas ?? [];
    const mapa = [
      { codigo: 'mcv',        label: 'MCV',        icone: 'ph ph-chart-line',             rota: '/mcv' },
      { codigo: 'clientes',   label: 'Clientes',   icone: 'ph ph-users',                  rota: '/clientes' },
      { codigo: 'orcamentos', label: 'Orçamentos', icone: 'ph ph-file-text',              rota: '/orcamentos' },
      { codigo: 'metas',      label: 'Metas',      icone: 'ph ph-target',                 rota: '/metas' },
      { codigo: 'financeiro', label: 'Financeiro', icone: 'ph ph-currency-circle-dollar', rota: '/financeiro' },
    ];
    return mapa.filter((a) => telas.includes(a.codigo));
  });
}
