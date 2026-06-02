import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Tela } from './tela.entity';
import { Usuario } from './usuario.entity';

@Entity('perfis')
export class Perfil {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  nome: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  descricao: string;

  @Column({ default: 1 })
  versao: number;

  @Column({ default: false })
  sistema: boolean;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;

  @ManyToMany(() => Tela, (tela) => tela.perfis)
  telas: Tela[];

  @OneToMany(() => Usuario, (u) => u.perfil)
  usuarios: Usuario[];
}
