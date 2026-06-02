import { Component } from '@angular/core';
import { PoPageDefaultComponent } from '@po-ui/ng-components';

@Component({
  selector: 'app-clientes-list',
  imports: [PoPageDefaultComponent],
  template: `
    <po-page-default p-title="Clientes">
      <p class="po-mt-4 po-text-center">
        Use o <strong>MCV</strong> para acessar os clientes da carteira e abrir o Cliente 360.
      </p>
    </po-page-default>
  `,
})
export class ClientesListComponent {}
