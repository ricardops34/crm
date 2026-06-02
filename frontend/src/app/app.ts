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
import { AuthService } from './core/services/auth.service';
import { MenuService } from './core/services/menu.service';

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
    const telas = this.auth.payload()?.telas ?? [];
    return this.menuService.buildMenu(telas);
  });

  profile = computed<PoToolbarProfile>(() => {
    const p = this.auth.payload();
    const empresas = p?.empresas ?? [];
    const profileActions = [
      { label: 'Meu perfil', icon: 'ph ph-user', action: () => { this.router.navigate(['/perfil']); } },
    ];

    if (empresas.length > 1) {
      profileActions.push({
        label: 'Trocar empresa',
        icon: 'ph ph-buildings',
        action: () => { this.trocarEmpresa(); },
      });
    }

    profileActions.push({
      label: 'Sair',
      icon: 'ph ph-sign-out',
      type: 'danger',
      action: () => { this.auth.logout(); },
    } as any);

    return {
      title: p?.nome ?? 'Usuário',
      subtitle: p?.perfil_nome ?? '',
      profileActions,
    };
  });

  ngOnInit() {
    this.themeService.setTheme(rcgPoUiTheme, PoThemeTypeEnum.light, PoThemeA11yEnum.AAA, true);
  }

  private trocarEmpresa() {
    // Navega para selector de empresa — implementado como modal na home
    this.router.navigate(['/trocar-empresa']);
  }
}
