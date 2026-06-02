import { Component } from '@angular/core';
import { PoModule } from '@po-ui/ng-components';

@Component({
  selector: 'app-metas',
  imports: [PoModule],
  template: `
    <po-page-default p-title="Metas">
      <p class="po-mt-4">Dashboard de metas — em implementação.</p>
    </po-page-default>
  `,
})
export class MetasComponent {}
