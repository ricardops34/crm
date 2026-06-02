import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity('vendedores')
export class Vendedor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'empresa_id' })
  empresaId: number;

  @Column({ name: 'cod_erp', type: 'varchar', length: 30 })
  codErp: string;

  @Column({ type: 'varchar', length: 150 })
  nome: string;

  @Column({ name: 'usuario_id', type: 'uuid', nullable: true })
  usuarioId: string | null;

  @Column({ name: 'supervisor_id', type: 'uuid', nullable: true })
  supervisorId: string | null;

  @Column({ name: 'gerente_id', type: 'uuid', nullable: true })
  gerenteId: string | null;

  @Column({ name: 'tipo', type: 'varchar', length: 20, default: 'vendedor' })
  tipo: string; // vendedor | supervisor | gerente

  @Column({ default: true })
  ativo: boolean;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @OneToMany(() => Vendedor, (v) => v.supervisor)
  subordinados: Vendedor[];

  @ManyToOne(() => Vendedor, (v) => v.subordinados)
  @JoinColumn({ name: 'supervisor_id' })
  supervisor: Vendedor;
}
