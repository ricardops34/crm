import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Perfil } from './perfil.entity';

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

  @Column({ type: 'varchar', length: 50 })
  modulo: string;

  @Column()
  ordem: number;

  @Column({ default: true })
  ativo: boolean;

  @ManyToMany(() => Perfil, (perfil) => perfil.telas)
  @JoinTable({
    name: 'perfil_telas',
    joinColumn: { name: 'tela_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'perfil_id', referencedColumnName: 'id' },
  })
  perfis: Perfil[];
}
