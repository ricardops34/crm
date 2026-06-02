import { Component } from '@angular/core';
import { PoPageDefaultComponent } from '@po-ui/ng-components';

@Component({
  selector: 'app-financeiro',
  imports: [PoPageDefaultComponent],
  template: `
    <po-page-default p-title="Financeiro">
      <p class="po-mt-4">Visão geral financeira — acesse o financeiro de um cliente pelo MCV ou pelo Cliente 360.</p>
    </po-page-default>
  `,
})
export class FinanceiroComponent {}
