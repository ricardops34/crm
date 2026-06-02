import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PoModule } from '@po-ui/ng-components';

@Component({
  selector: 'app-sem-acesso',
  imports: [PoModule, RouterLink],
  template: `
    <po-page-default p-title="Sem acesso">
      <div class="po-row po-mt-4 po-text-center">
        <div class="po-col-12">
          <span class="an an-lock" style="font-size: 48px; color: var(--color-07)"></span>
          <h2 class="po-mt-2">Acesso Negado</h2>
          <p>Você não tem permissão para acessar esta página.</p>
          <p>Contate o administrador: <strong>admin@crm.local</strong></p>
          <a routerLink="/home">Voltar à Home</a>
        </div>
      </div>
    </po-page-default>
  `,
})
export class SemAcessoComponent {}
