import { Component, computed, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import {
  PoModule,
  PoMenuItem,
  PoToolbarProfile,
  PoThemeService,
  PoThemeTypeEnum,
  PoThemeA11yEnum,
} from '@po-ui/ng-components';

import { rcgPoUiTheme } from '../temas/rcg/rcg-theme';
import { alliaPoUiTheme } from '../temas/allia/allia-theme';
import { AuthService } from './core/services/auth.service';
import { MenuService } from './core/services/menu.service';

export type TemaApp = 'rcg' | 'allia';
const TEMA_KEY = 'crm_tema';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PoModule],
  template: `
    @if (logado()) {
      <po-toolbar
        p-title="CRM Comercial 360"
        [p-profile]="profile()">
      </po-toolbar>

      <po-menu
        [p-menus]="menus()"
        [p-filter]="true"
        p-filter-placeholder="Buscar...">
        <router-outlet></router-outlet>
      </po-menu>
    } @else {
      <router-outlet></router-outlet>
    }
  `,
})
export class App implements OnInit {
  private themeService = inject(PoThemeService);
  private auth = inject(AuthService);
  private menuService = inject(MenuService);
  private router = inject(Router);

  logado = computed(() => this.auth.isLoggedIn() && !this.auth.payload()?.primeiro_acesso);

  menus = computed<PoMenuItem[]>(() => {
    const payload = this.auth.payload();
    if (payload?.modulos?.length) {
      return this.menuService.buildMenuFromModulos(payload.modulos);
    }
    return this.menuService.buildMenu(payload?.telas ?? []);
  });

  profile = computed<PoToolbarProfile>(() => {
    const p = this.auth.payload();
    const empresas = p?.empresas ?? [];
    const temaAtual = this.getTemaAtual();

    const profileActions: any[] = [
      { label: 'Meu perfil', icon: 'an an-user-circle', action: () => { this.router.navigate(['/perfil']); } },
      {
        label: temaAtual === 'rcg' ? 'Tema Allia' : 'Tema RCG',
        icon: 'an an-palette',
        action: () => { this.alternarTema(); },
      },
    ];

    if (empresas.length > 1) {
      profileActions.push({
        label: 'Trocar empresa',
        icon: 'an an-buildings',
        action: () => { this.trocarEmpresa(); },
      });
    }

    profileActions.push({
      label: 'Sair',
      icon: 'an an-sign-out',
      type: 'danger',
      action: () => { this.auth.logout(); },
    });

    return {
      title: p?.nome ?? 'Usuário',
      subtitle: p?.perfil_nome ?? '',
      profileActions,
    };
  });

  ngOnInit() {
    this.aplicarTema(this.getTemaAtual());
  }

  private getTemaAtual(): TemaApp {
    return (localStorage.getItem(TEMA_KEY) as TemaApp) ?? 'rcg';
  }

  private alternarTema() {
    const atual = this.getTemaAtual();
    const novo: TemaApp = atual === 'rcg' ? 'allia' : 'rcg';
    localStorage.setItem(TEMA_KEY, novo);
    this.aplicarTema(novo);
  }

  private aplicarTema(tema: TemaApp) {
    const theme = tema === 'allia' ? alliaPoUiTheme : rcgPoUiTheme;
    this.themeService.setTheme(theme, PoThemeTypeEnum.light, PoThemeA11yEnum.AAA, true);
  }

  private trocarEmpresa() {
    this.router.navigate(['/trocar-empresa']);
  }
}
