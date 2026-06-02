import { Injectable } from '@angular/core';
import { PoMenuItem } from '@po-ui/ng-components';

import { JwtModulo } from '../interfaces/jwt-payload.interface';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly legacyIconMap: Record<string, string> = {
    'ph ph-storefront': 'an an-storefront',
    'ph ph-binoculars': 'an an-binoculars',
    'ph ph-folder-open': 'an an-folder-open',
    'ph ph-gear-six': 'an an-gear-six',
    'ph ph-house': 'an an-house',
    'ph ph-chart-line': 'an an-chart-line',
    'ph ph-users': 'an an-users',
    'ph ph-file-text': 'an an-file-text',
    'ph ph-target': 'an an-target',
    'ph ph-currency-circle-dollar': 'an an-currency-circle-dollar',
    'ph ph-user-gear': 'an an-user',
    'ph ph-shield-check': 'an an-shield-check',
    'ph ph-sliders': 'an an-sliders-horizontal',
    'ph ph-identification-card': 'an an-identification-card',
    'ph ph-newspaper': 'an an-newspaper',
    'ph ph-squares-four': 'an an-grid-four',
  };

  private buildLogoutItem(onLogout?: () => void): PoMenuItem {
    return {
      label: 'Sair',
      icon: 'an an-sign-out',
      type: 'danger',
      action: onLogout,
    };
  }

  /**
   * Constrói o po-menu a partir da estrutura de módulos do JWT.
   * Cada módulo vira um grupo com subItems.
   * Módulos com uma única tela aparecem como item direto.
   */
  buildMenuFromModulos(modulos: JwtModulo[], onLogout?: () => void): PoMenuItem[] {
    const sorted = [...modulos].sort((a, b) => a.ordem - b.ordem);
    const menus: PoMenuItem[] = [];

    for (const modulo of sorted) {
      const telas = [...modulo.telas].sort((a, b) => a.ordem - b.ordem);
      const moduloIcone = this.normalizarIcone(modulo.icone, 'an an-folder-open');
      if (!telas.length) continue;

      if (telas.length === 1) {
        menus.push({
          label: modulo.nome,
          icon: moduloIcone,
          link: telas[0].rota,
        });
      } else {
        menus.push({
          label: modulo.nome,
          icon: moduloIcone,
          subItems: telas.map((t) => ({
            label: t.nome,
            icon: this.normalizarIcone(t.icone, 'an an-file-text'),
            link: t.rota,
          })),
        });
      }
    }

    menus.push(this.buildLogoutItem(onLogout));
    return menus;
  }

  /** Fallback: constrói menu a partir de códigos de telas. */
  buildMenu(telas: string[], onLogout?: () => void): PoMenuItem[] {
    const catalog = [
      { codigo: 'home', nome: 'Home', icone: 'an an-house', rota: '/home', cat: 'geral' },
      { codigo: 'mcv', nome: 'MCV', icone: 'an an-chart-line', rota: '/mcv', cat: 'vendas' },
      { codigo: 'clientes', nome: 'Clientes', icone: 'an an-users', rota: '/clientes', cat: 'vendas' },
      { codigo: 'orcamentos', nome: 'Orçamentos', icone: 'an an-file-text', rota: '/orcamentos', cat: 'vendas' },
      { codigo: 'metas', nome: 'Metas', icone: 'an an-target', rota: '/metas', cat: 'sup' },
      { codigo: 'financeiro', nome: 'Financeiro', icone: 'an an-currency-circle-dollar', rota: '/financeiro', cat: 'sup' },
      { codigo: 'usuarios', nome: 'Usuários', icone: 'an an-user', rota: '/cadastros/usuarios', cat: 'cfg' },
      { codigo: 'perfis', nome: 'Perfis', icone: 'an an-shield-check', rota: '/cadastros/perfis', cat: 'cfg' },
      { codigo: 'parametros', nome: 'Parâmetros', icone: 'an an-sliders-horizontal', rota: '/cadastros/parametros', cat: 'cfg' },
      { codigo: 'vendedores', nome: 'Vendedores', icone: 'an an-identification-card', rota: '/cadastros/vendedores', cat: 'cad' },
      { codigo: 'noticias', nome: 'Notícias', icone: 'an an-newspaper', rota: '/cadastros/noticias', cat: 'cad' },
    ];

    const permitidas = catalog.filter((t) => telas.includes(t.codigo));
    const toItem = (t: (typeof catalog)[number]) => ({ label: t.nome, icon: t.icone, link: t.rota } as PoMenuItem);

    const geral = permitidas.filter((t) => t.cat === 'geral').map(toItem);
    const vendas = permitidas.filter((t) => t.cat === 'vendas').map(toItem);
    const sup = permitidas.filter((t) => t.cat === 'sup').map(toItem);
    const cad = permitidas.filter((t) => t.cat === 'cad').map(toItem);
    const cfg = permitidas.filter((t) => t.cat === 'cfg').map(toItem);

    const menus: PoMenuItem[] = [...geral];
    if (vendas.length) menus.push({ label: 'Vendas', icon: 'an an-storefront', subItems: vendas });
    if (sup.length) menus.push({ label: 'Supervisão', icon: 'an an-binoculars', subItems: sup });
    if (cad.length) menus.push({ label: 'Cadastros', icon: 'an an-folder-open', subItems: cad });
    if (cfg.length) menus.push({ label: 'Configurações', icon: 'an an-gear-six', subItems: cfg });
    menus.push(this.buildLogoutItem(onLogout));

    return menus;
  }

  private normalizarIcone(icone?: string, fallback = 'an an-file-text'): string {
    if (!icone) return fallback;
    if (icone.startsWith('an an-')) return icone;

    return this.legacyIconMap[icone] ?? fallback;
  }
}
