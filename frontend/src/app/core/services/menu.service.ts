import { Injectable } from '@angular/core';
import { PoMenuItem } from '@po-ui/ng-components';

interface TelaCatalogo {
  codigo: string;
  nome: string;
  icone: string;
  rota: string;
  modulo: string;
  ordem: number;
}

const TELAS_CATALOGO: TelaCatalogo[] = [
  { codigo: 'home',       nome: 'Home',       icone: 'ph ph-house',                  rota: '/home',                modulo: 'geral',     ordem: 0 },
  { codigo: 'mcv',        nome: 'MCV',        icone: 'ph ph-chart-line',             rota: '/mcv',                 modulo: 'comercial', ordem: 1 },
  { codigo: 'clientes',   nome: 'Clientes',   icone: 'ph ph-users',                  rota: '/clientes',            modulo: 'comercial', ordem: 2 },
  { codigo: 'orcamentos', nome: 'Orçamentos', icone: 'ph ph-file-text',              rota: '/orcamentos',          modulo: 'comercial', ordem: 3 },
  { codigo: 'metas',      nome: 'Metas',      icone: 'ph ph-target',                 rota: '/metas',               modulo: 'comercial', ordem: 4 },
  { codigo: 'financeiro', nome: 'Financeiro', icone: 'ph ph-currency-circle-dollar', rota: '/financeiro',          modulo: 'comercial', ordem: 5 },
  { codigo: 'usuarios',   nome: 'Usuários',   icone: 'ph ph-user-gear',              rota: '/cadastros/usuarios',  modulo: 'cadastros', ordem: 1 },
  { codigo: 'perfis',     nome: 'Perfis',     icone: 'ph ph-shield-check',           rota: '/cadastros/perfis',    modulo: 'cadastros', ordem: 2 },
  { codigo: 'parametros', nome: 'Parâmetros', icone: 'ph ph-sliders',                rota: '/cadastros/parametros',modulo: 'cadastros', ordem: 3 },
  { codigo: 'vendedores', nome: 'Vendedores', icone: 'ph ph-identification-card',   rota: '/cadastros/vendedores',modulo: 'cadastros', ordem: 4 },
  { codigo: 'noticias',   nome: 'Notícias',   icone: 'ph ph-newspaper',             rota: '/cadastros/noticias',  modulo: 'cadastros', ordem: 5 },
];

@Injectable({ providedIn: 'root' })
export class MenuService {
  buildMenu(telas: string[]): PoMenuItem[] {
    const permitidas = TELAS_CATALOGO.filter((t) => telas.includes(t.codigo));

    const comercial = permitidas
      .filter((t) => t.modulo === 'comercial' || t.modulo === 'geral')
      .sort((a, b) => a.ordem - b.ordem)
      .map((t) => ({ label: t.nome, icon: t.icone, link: t.rota } as PoMenuItem));

    const cadastros = permitidas
      .filter((t) => t.modulo === 'cadastros')
      .sort((a, b) => a.ordem - b.ordem)
      .map((t) => ({ label: t.nome, icon: t.icone, link: t.rota } as PoMenuItem));

    const menus: PoMenuItem[] = [...comercial];

    if (cadastros.length) {
      menus.push({
        label: 'Cadastros',
        icon: 'ph ph-folder-open',
        subItems: cadastros,
      });
    }

    return menus;
  }
}
