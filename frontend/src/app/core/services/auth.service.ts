import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

import {
  AuthLoginResult,
  BuscarEmpresasLoginResponse,
  JwtPayload,
  LoginResponse,
} from '../interfaces/jwt-payload.interface';

const API = '/api';
const TOKEN_KEY = 'crm_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _payload = signal<JwtPayload | null>(null);

  readonly payload = this._payload.asReadonly();

  constructor(private http: HttpClient, private router: Router) {
    this.restaurarSessao();
  }

  login(email: string, senha: string, empresaId?: number): Observable<AuthLoginResult> {
    return this.http.post<AuthLoginResult>(`${API}/auth/login`, {
      email,
      senha,
      ...(empresaId ? { empresa_id: empresaId } : {}),
    }).pipe(
      tap((res) => {
        if (this.isLoginResponse(res)) {
          this.salvarToken(res.access_token);
        }
      }),
    );
  }

  buscarEmpresasPorLogin(email: string): Observable<BuscarEmpresasLoginResponse> {
    return this.http.post<BuscarEmpresasLoginResponse>(`${API}/auth/login/empresas`, { email });
  }

  trocarEmpresa(empresaId: number): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API}/auth/empresa/${empresaId}`, {}).pipe(
      tap((res) => this.salvarToken(res.access_token)),
    );
  }

  alterarSenha(novaSenha: string, senhaAtual?: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${API}/auth/alterar-senha`, { nova_senha: novaSenha, senha_atual: senhaAtual })
      .pipe(tap((res) => this.salvarToken(res.access_token)));
  }

  esqueciSenha(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${API}/auth/esqueci-senha`, { email });
  }

  redefinirSenha(token: string, novaSenha: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${API}/auth/redefinir-senha`, {
      token,
      nova_senha: novaSenha,
    });
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this._payload.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    const p = this._payload();
    if (!p) return false;
    return p.exp * 1000 > Date.now();
  }

  temTela(codigo: string): boolean {
    return this._payload()?.telas.includes(codigo) ?? false;
  }

  get estaLogado(): boolean {
    return this.isLoggedIn();
  }

  isLoginResponse(response: AuthLoginResult): response is LoginResponse {
    return 'access_token' in response;
  }

  private salvarToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    this._payload.set(this.decodificar(token));
  }

  private restaurarSessao(): void {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      const p = this.decodificar(token);
      if (p && p.exp * 1000 > Date.now()) {
        this._payload.set(p);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    }
  }

  private decodificar(token: string): JwtPayload | null {
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) return null;

      const json = this.base64UrlParaUtf8(base64Url);
      return JSON.parse(json) as JwtPayload;
    } catch {
      return null;
    }
  }

  private base64UrlParaUtf8(base64Url: string): string {
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(`${base64}${padding}`);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

    return new TextDecoder('utf-8').decode(bytes);
  }
}
