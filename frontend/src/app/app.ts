import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  PoMenuComponent,
  PoMenuItem,
  PoToolbarComponent,
  PoToolbarProfile,
  PoThemeService,
  PoThemeTypeEnum,
  PoThemeA11yEnum
} from '@po-ui/ng-components';

import { rcgPoUiTheme } from '../temas/rcg/rcg-theme';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PoMenuComponent, PoToolbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private themeService = inject(PoThemeService);

  readonly menus: PoMenuItem[] = [
    { label: 'MCV',          icon: 'ph ph-chart-line',    link: '/mcv' },
    { label: 'Clientes',     icon: 'ph ph-users',         link: '/clientes' },
    { label: 'Atendimentos', icon: 'ph ph-headset',       link: '/atendimentos' },
    { label: 'Orçamentos',   icon: 'ph ph-file-text',     link: '/orcamentos' },
    { label: 'Leads',        icon: 'ph ph-funnel',        link: '/leads' },
    { label: 'Metas',        icon: 'ph ph-target',        link: '/metas' },
    { label: 'Financeiro',   icon: 'ph ph-currency-circle-dollar', link: '/financeiro' },
    { label: 'Cadastros',    icon: 'ph ph-gear',          link: '/cadastros' }
  ];

  readonly profile: PoToolbarProfile = {
    title: 'Usuário',
    subtitle: 'Vendedor',
    profileActions: [
      { label: 'Meu perfil', icon: 'ph ph-user' },
      { label: 'Sair',       icon: 'ph ph-sign-out', type: 'danger', action: () => this.logout() }
    ]
  };

  ngOnInit() {
    this.themeService.setTheme(rcgPoUiTheme, PoThemeTypeEnum.light, PoThemeA11yEnum.AAA, true);
  }

  private logout() {
    // TODO: redirecionar para /login e limpar sessão
  }
}
