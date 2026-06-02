import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PoModule, PoNotificationService } from '@po-ui/ng-components';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-esqueci-senha',
  imports: [FormsModule, PoModule, RouterLink],
  template: `
    <po-page-default p-title="Esqueci minha senha">
      <div class="po-row po-mt-2">
        <div class="po-col-4 po-offset-4">
          @if (!enviado()) {
            <p class="po-mb-2">Informe seu e-mail para receber o link de redefinição.</p>
            <po-input
              name="email"
              type="email"
              [(ngModel)]="email"
              p-label="E-mail"
              p-placeholder="seu@email.com.br"
              class="po-mb-2">
            </po-input>
            <po-button
              p-label="Enviar"
              p-kind="primary"
              [p-loading]="loading()"
              [p-disabled]="!email"
              (p-click)="enviar()">
            </po-button>
          } @else {
            <p>Se o e-mail existir, você receberá as instruções em breve.</p>
          }
          <p class="po-mt-2"><a routerLink="/login">Voltar ao login</a></p>
        </div>
      </div>
    </po-page-default>
  `,
})
export class EsqueciSenhaComponent {
  private auth = inject(AuthService);
  private notify = inject(PoNotificationService);

  email = '';
  loading = signal(false);
  enviado = signal(false);

  enviar() {
    this.loading.set(true);
    this.auth.esqueciSenha(this.email).subscribe({
      next: () => {
        this.loading.set(false);
        this.enviado.set(true);
      },
      error: () => {
        this.loading.set(false);
        this.enviado.set(true); // não revelar se existe
      },
    });
  }
}
