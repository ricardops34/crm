import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Tela } from './tela.entity';
import { Perfil } from './perfil.entity';

@Entity('modulos')
export class Modulo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  nome: string;

  @Column({ type: 'varchar', length: 100 })
  icone: string;

  @Column({ default: 0 })
  ordem: number;

  /** true = visível apenas para perfil ADMIN (nunca por regra de perfil_modulos) */
  @Column({ name: 'somente_admin', default: false })
  somenteAdmin: boolean;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;

  @OneToMany(() => Tela, (t) => t.moduloEntity)
  telas: Tela[];

  @ManyToMany(() => Perfil, (p) => p.modulos)
  perfis: Perfil[];
}
