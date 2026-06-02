import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PoSelectOption } from '@po-ui/ng-components';
import {
  PoPageLogin,
  PoPageLoginCustomField,
  PoPageLoginLiterals,
  PoTemplatesModule,
} from '@po-ui/ng-templates';

import { EmpresaAcesso } from '../../../core/interfaces/jwt-payload.interface';
import { AuthService } from '../../../core/services/auth.service';

type LoginSubmit = PoPageLogin & { empresa_id?: number | string };

@Component({
  selector: 'app-login',
  imports: [PoTemplatesModule],
  template: `
    <po-page-login
      p-product-name="Visão 360"
      p-logo="/logo_padrao.png"
      p-secondary-logo="/logo_bj.png"
      p-background="/assets/crm_login_bg.png"
      p-support="mailto:ricardo@bjsoft.com.br"
      p-recovery="/esqueci-senha"
      [p-login]="login()"
      [p-custom-field]="customField()"
      [p-literals]="literals()"
      [p-loading]="loading()"
      [p-login-errors]="loginErrors()"
      [p-password-errors]="passwordErrors()"
      (p-login-change)="onLoginChange($event)"
      (p-password-change)="onPasswordChange()"
      (p-login-submit)="onLogin($event)">
    </po-page-login>
  `,
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly loading = signal(false);
  readonly login = signal('');
  readonly loginErrors = signal<string[]>([]);
  readonly passwordErrors = signal<string[]>([]);
  readonly customField = signal<string | PoPageLoginCustomField>('');
  private readonly empresasCarregadas = signal<EmpresaAcesso[]>([]);

  readonly literals = signal<PoPageLoginLiterals>({
    loginPlaceholder: 'seu@email.com.br',
    passwordPlaceholder: 'Senha',
    customFieldPlaceholder: 'Selecione a empresa',
    customFieldErrorPattern: 'Selecione a empresa para continuar.',
    forgotPassword: 'Esqueci minha senha',
    support: 'Suporte',
    welcome: 'Boas-vindas',
    submitLabel: 'Entrar',
    submittedLabel: 'Entrando...',
    highlightInfo: '',
  });

  private ultimoLoginConsultado = '';

  onLogin(event: LoginSubmit) {
    this.loading.set(true);
    this.loginErrors.set([]);
    this.passwordErrors.set([]);

    const empresaId = this.toEmpresaId(event.empresa_id);

    this.auth.login(event.login, event.password, empresaId).subscribe({
      next: (res) => {
        this.loading.set(false);

        if (!this.auth.isLoginResponse(res)) {
          this.aplicarEmpresas(res.empresas);
          return;
        }

        if (res.usuario.primeiro_acesso) {
          this.router.navigate(['/alterar-senha']);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: (err) => {
        this.loading.set(false);

        const mensagem = err?.error?.message ?? 'Credenciais inválidas';
        if (mensagem === 'Credenciais inválidas') {
          this.loginErrors.set(['Credenciais inválidas']);
          this.passwordErrors.set(['Credenciais inválidas']);
          return;
        }

        if (mensagem === 'Usuário inativo') {
          this.loginErrors.set(['Usuário inativo']);
          return;
        }

        if (mensagem === 'Empresa não autorizada para este usuário.') {
          this.passwordErrors.set(['Empresa não autorizada para este usuário']);
          return;
        }

        this.passwordErrors.set(['Não foi possível concluir o login']);
      },
    });
  }

  onLoginChange(login: string) {
    const loginNormalizado = login.trim().toLowerCase();
    this.login.set(login);
    this.loginErrors.set([]);
    this.passwordErrors.set([]);

    if (!loginNormalizado) {
      this.ultimoLoginConsultado = '';
      this.limparEmpresas();
      return;
    }

    if (loginNormalizado === this.ultimoLoginConsultado) {
      return;
    }

    this.ultimoLoginConsultado = loginNormalizado;
    this.loading.set(true);

    this.auth.buscarEmpresasPorLogin(loginNormalizado).subscribe({
      next: ({ empresas }) => {
        this.loading.set(false);

        if (this.login().trim().toLowerCase() !== loginNormalizado) {
          return;
        }

        this.aplicarEmpresas(empresas);
      },
      error: () => {
        this.loading.set(false);

        if (this.login().trim().toLowerCase() !== loginNormalizado) {
          return;
        }

        this.limparEmpresas();
      },
    });
  }

  onPasswordChange() {
    this.passwordErrors.set([]);
  }

  private aplicarEmpresas(empresas: EmpresaAcesso[]) {
    this.empresasCarregadas.set(empresas);

    if (!empresas.length) {
      this.customField.set('');
      return;
    }

    const customField: PoPageLoginCustomField = {
      property: 'empresa_id',
      value: empresas.length === 1 ? empresas[0].id : undefined,
      placeholder: 'Selecione a empresa',
      options: empresas.map((empresa) => this.toOption(empresa)),
    };

    // O sample local do PO-UI recria a referência para garantir a atualização do p-custom-field.
    this.customField.set(Object.assign({}, customField));
  }

  private limparEmpresas() {
    this.empresasCarregadas.set([]);
    this.customField.set('');
  }

  private toEmpresaId(value: number | string | undefined): number | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    const empresaId = Number(value);
    return Number.isNaN(empresaId) ? undefined : empresaId;
  }

  private toOption(empresa: EmpresaAcesso): PoSelectOption {
    return {
      label: empresa.nome,
      value: empresa.id,
    };
  }
}
