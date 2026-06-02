import { Component } from '@angular/core';
import { PoPageDefaultComponent } from '@po-ui/ng-components';

@Component({
  selector: 'app-metas',
  imports: [PoPageDefaultComponent],
  template: `
    <po-page-default p-title="Metas">
      <p class="po-mt-4">Dashboard de metas — em implementação.</p>
    </po-page-default>
  `,
})
export class MetasComponent {}
