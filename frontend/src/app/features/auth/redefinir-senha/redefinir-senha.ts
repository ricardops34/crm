import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PoModule, PoNotificationService } from '@po-ui/ng-components';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-redefinir-senha',
  imports: [FormsModule, PoModule, RouterLink],
  template: `
    <po-page-default p-title="Redefinir senha">
      <div class="po-row po-mt-2">
        <div class="po-col-4 po-offset-4">
          @if (tokenValido()) {
            <po-input name="nova" type="password" [(ngModel)]="novaSenha" p-label="Nova senha" class="po-mb-2"></po-input>
            <po-input name="conf" type="password" [(ngModel)]="confirmar"  p-label="Confirmar senha" class="po-mb-2"></po-input>
            <po-button
              p-label="Redefinir senha"
              p-kind="primary"
              [p-loading]="loading()"
              [p-disabled]="novaSenha.length < 8 || novaSenha !== confirmar"
              (p-click)="redefinir()">
            </po-button>
          } @else {
            <p>Link inválido ou expirado.</p>
            <a routerLink="/esqueci-senha">Solicitar novo link</a>
          }
        </div>
      </div>
    </po-page-default>
  `,
})
export class RedefinirSenhaComponent implements OnInit {
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notify = inject(PoNotificationService);

  token = '';
  novaSenha = '';
  confirmar = '';
  loading = signal(false);
  tokenValido = signal(true);

  ngOnInit() {
    this.token = this.route.snapshot.queryParams['token'] ?? '';
    if (!this.token) this.tokenValido.set(false);
  }

  redefinir() {
    this.loading.set(true);
    this.auth.redefinirSenha(this.token, this.novaSenha).subscribe({
      next: () => {
        this.loading.set(false);
        this.notify.success('Senha redefinida! Faça o login.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading.set(false);
        this.notify.error(err?.error?.message ?? 'Token inválido ou expirado.');
        this.tokenValido.set(false);
      },
    });
  }
}
