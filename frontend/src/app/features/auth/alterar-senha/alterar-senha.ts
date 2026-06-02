import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  PoButtonComponent,
  PoFieldContainerComponent,
  PoInputComponent,
  PoNotificationService,
  PoPageDefaultComponent,
} from '@po-ui/ng-components';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-alterar-senha',
  imports: [
    FormsModule,
    PoPageDefaultComponent,
    PoInputComponent,
    PoButtonComponent,
    PoFieldContainerComponent,
  ],
  template: `
    <po-page-default p-title="Alterar Senha">
      <div class="po-row po-mt-2">
        <div class="po-col-6 po-offset-3">
          <po-field-container *ngIf="!primeiroAcesso()" p-label="Senha atual">
            <po-input
              type="password"
              name="senhaAtual"
              [(ngModel)]="senhaAtual"
              p-placeholder="Senha atual">
            </po-input>
          </po-field-container>

          <po-field-container p-label="Nova senha">
            <po-input
              type="password"
              name="novaSenha"
              [(ngModel)]="novaSenha"
              p-placeholder="Mínimo 8 caracteres, maiúscula, minúscula e número">
            </po-input>
          </po-field-container>

          <po-field-container p-label="Confirmar nova senha">
            <po-input
              type="password"
              name="confirmar"
              [(ngModel)]="confirmar"
              p-placeholder="Repita a nova senha">
            </po-input>
          </po-field-container>

          <po-button
            p-label="Salvar"
            p-type="primary"
            [p-loading]="loading()"
            [p-disabled]="!podeEnviar()"
            (p-click)="salvar()">
          </po-button>
        </div>
      </div>
    </po-page-default>
  `,
})
export class AlterarSenhaComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private notify = inject(PoNotificationService);

  senhaAtual = '';
  novaSenha = '';
  confirmar = '';
  loading = signal(false);

  primeiroAcesso = computed(() => this.auth.payload()?.primeiro_acesso ?? false);

  podeEnviar = computed(
    () => this.novaSenha.length >= 8 && this.novaSenha === this.confirmar,
  );

  salvar() {
    this.loading.set(true);
    const atual = this.primeiroAcesso() ? undefined : this.senhaAtual;
    this.auth.alterarSenha(this.novaSenha, atual).subscribe({
      next: () => {
        this.loading.set(false);
        this.notify.success('Senha alterada com sucesso!');
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.loading.set(false);
        this.notify.error(err?.error?.message ?? 'Erro ao alterar senha.');
      },
    });
  }
}
