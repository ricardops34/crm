import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { telaGuard } from './core/guards/tela.guard';
import { primeiroAcessoGuard } from './core/guards/primeiro-acesso.guard';

export const routes: Routes = [
  // Públicas
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'esqueci-senha',
    loadComponent: () =>
      import('./features/auth/esqueci-senha/esqueci-senha').then((m) => m.EsqueciSenhaComponent),
  },
  {
    path: 'redefinir-senha',
    loadComponent: () =>
      import('./features/auth/redefinir-senha/redefinir-senha').then((m) => m.RedefinirSenhaComponent),
  },
  {
    path: 'alterar-senha',
    canActivate: [primeiroAcessoGuard],
    loadComponent: () =>
      import('./features/auth/alterar-senha/alterar-senha').then((m) => m.AlterarSenhaComponent),
  },

  // Sem acesso
  {
    path: 'sem-acesso',
    loadComponent: () =>
      import('./features/shared/sem-acesso/sem-acesso').then((m) => m.SemAcessoComponent),
  },

  // Área autenticada
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },

      {
        path: 'home',
        canActivate: [telaGuard],
        data: { tela: 'home' },
        loadComponent: () =>
          import('./features/home/home').then((m) => m.HomeComponent),
      },

      {
        path: 'mcv',
        canActivate: [telaGuard],
        data: { tela: 'mcv' },
        loadComponent: () =>
          import('./features/mcv/mcv').then((m) => m.McvComponent),
      },

      {
        path: 'clientes',
        canActivate: [telaGuard],
        data: { tela: 'clientes' },
        loadComponent: () =>
          import('./features/clientes/clientes-list/clientes-list').then((m) => m.ClientesListComponent),
      },
      {
        path: 'clientes/:id',
        canActivate: [telaGuard],
        data: { tela: 'clientes' },
        loadComponent: () =>
          import('./features/clientes/cliente-360/cliente-360').then((m) => m.Cliente360Component),
      },

      {
        path: 'orcamentos',
        canActivate: [telaGuard],
        data: { tela: 'orcamentos' },
        loadComponent: () =>
          import('./features/orcamentos/orcamentos-list/orcamentos-list').then((m) => m.OrcamentosListComponent),
      },
      {
        path: 'orcamentos/novo',
        canActivate: [telaGuard],
        data: { tela: 'orcamentos' },
        loadComponent: () =>
          import('./features/orcamentos/orcamento-form/orcamento-form').then((m) => m.OrcamentoFormComponent),
      },
      {
        path: 'orcamentos/:id',
        canActivate: [telaGuard],
        data: { tela: 'orcamentos' },
        loadComponent: () =>
          import('./features/orcamentos/orcamento-form/orcamento-form').then((m) => m.OrcamentoFormComponent),
      },

      {
        path: 'metas',
        canActivate: [telaGuard],
        data: { tela: 'metas' },
        loadComponent: () =>
          import('./features/metas/metas').then((m) => m.MetasComponent),
      },

      {
        path: 'financeiro',
        canActivate: [telaGuard],
        data: { tela: 'financeiro' },
        loadComponent: () =>
          import('./features/financeiro/financeiro').then((m) => m.FinanceiroComponent),
      },

      // Cadastros
      {
        path: 'cadastros/usuarios',
        canActivate: [telaGuard],
        data: { tela: 'usuarios' },
        loadComponent: () =>
          import('./features/cadastros/usuarios/usuarios').then((m) => m.UsuariosComponent),
      },
      {
        path: 'cadastros/perfis',
        canActivate: [telaGuard],
        data: { tela: 'perfis' },
        loadComponent: () =>
          import('./features/cadastros/perfis/perfis-page').then((m) => m.PerfisPageComponent),
      },
      {
        path: 'cadastros/parametros',
        canActivate: [telaGuard],
        data: { tela: 'parametros' },
        loadComponent: () =>
          import('./features/cadastros/parametros/parametros-page').then((m) => m.ParametrosPageComponent),
      },
      {
        path: 'cadastros/vendedores',
        canActivate: [telaGuard],
        data: { tela: 'vendedores' },
        loadComponent: () =>
          import('./features/cadastros/vendedores/vendedores-page').then((m) => m.VendedoresPageComponent),
      },
      {
        path: 'cadastros/noticias',
        canActivate: [telaGuard],
        data: { tela: 'noticias' },
        loadComponent: () =>
          import('./features/cadastros/noticias/noticias-page').then((m) => m.NoticiasPageComponent),
      },
    ],
  },

  { path: '**', redirectTo: 'home' },
];
