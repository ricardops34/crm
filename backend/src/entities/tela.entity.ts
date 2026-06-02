import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Perfil } from './perfil.entity';
import { Modulo } from './modulo.entity';

@Entity('telas')
export class Tela {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  codigo: string;

  @Column({ type: 'varchar', length: 100 })
  nome: string;

  @Column({ type: 'varchar', length: 100 })
  icone: string;

  @Column({ type: 'varchar', length: 200 })
  rota: string;

  /** Mantido para compatibilidade; será preenchido pelo módulo vinculado */
  @Column({ type: 'varchar', length: 50 })
  modulo: string;

  @Column({ name: 'modulo_id', type: 'uuid', nullable: true })
  moduloId: string | null;

  @Column()
  ordem: number;

  @Column({ default: true })
  ativo: boolean;

  @ManyToOne(() => Modulo, (m) => m.telas, { nullable: true })
  @JoinColumn({ name: 'modulo_id' })
  moduloEntity: Modulo;

  @ManyToMany(() => Perfil, (perfil) => perfil.telas)
  @JoinTable({
    name: 'perfil_telas',
    joinColumn: { name: 'tela_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'perfil_id', referencedColumnName: 'id' },
  })
  perfis: Perfil[];
}
