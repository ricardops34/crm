import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Perfil } from './perfil.entity';
import { UsuarioEmpresa } from './usuario-empresa.entity';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  nome: string;

  @Column({ type: 'varchar', length: 200, unique: true })
  email: string;

  @Column({ name: 'senha_hash', type: 'varchar', length: 255 })
  senhaHash: string;

  @Column({ name: 'perfil_id', type: 'uuid' })
  perfilId: string;

  @Column({ default: true })
  ativo: boolean;

  @Column({ name: 'primeiro_acesso', default: true })
  primeiroAcesso: boolean;

  @Column({ name: 'reset_token', type: 'varchar', length: 255, nullable: true })
  resetToken: string | null;

  @Column({ name: 'reset_token_expira', type: 'timestamp', nullable: true })
  resetTokenExpira: Date | null;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;

  @ManyToOne(() => Perfil, (p) => p.usuarios)
  @JoinColumn({ name: 'perfil_id' })
  perfil: Perfil;

  @OneToMany(() => UsuarioEmpresa, (ue) => ue.usuario, { cascade: true })
  usuarioEmpresas: UsuarioEmpresa[];
}
