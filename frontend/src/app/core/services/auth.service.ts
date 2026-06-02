import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { JwtPayload, LoginResponse } from '../interfaces/jwt-payload.interface';

const API = '/api';
const TOKEN_KEY = 'crm_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _payload = signal<JwtPayload | null>(null);

  readonly payload = this._payload.asReadonly();

  constructor(private http: HttpClient, private router: Router) {
    this.restaurarSessao();
  }

  login(email: string, senha: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API}/auth/login`, { email, senha }).pipe(
      tap((res) => this.salvarToken(res.access_token)),
    );
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
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(base64)) as JwtPayload;
    } catch {
      return null;
    }
  }
}
