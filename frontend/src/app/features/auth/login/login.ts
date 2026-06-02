import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PoPageLoginComponent, PoPageLoginLiterals } from '@po-ui/ng-templates';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [PoPageLoginComponent],
  template: `
    <po-page-login
      p-product-name="CRM Comercial 360"
      p-logo="/assets/logo-rcg.png"
      [p-literals]="literals"
      [p-loading]="loading()"
      (p-login-submit)="onLogin($event)">
    </po-page-login>
  `,
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);

  readonly literals: PoPageLoginLiterals = {
    loginPlaceholder: 'seu@email.com.br',
    passwordPlaceholder: 'Senha',
    forgotPassword: 'Esqueci minha senha',
    forgotPasswordRoute: '/esqueci-senha',
  };

  onLogin(event: { login: string; password: string }) {
    this.loading.set(true);
    this.auth.login(event.login, event.password).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.usuario.primeiro_acesso) {
          this.router.navigate(['/alterar-senha']);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: () => this.loading.set(false),
    });
  }
}
