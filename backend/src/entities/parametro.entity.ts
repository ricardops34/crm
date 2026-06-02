import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('parametros')
@Unique(['empresaId', 'grupo', 'chave'])
export class Parametro {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'empresa_id', type: 'integer', nullable: true })
  empresaId: number | null;

  @Column({ type: 'varchar', length: 50 })
  grupo: string;

  @Column({ type: 'varchar', length: 100 })
  chave: string;

  @Column({ type: 'text', nullable: true })
  valor: string | null;

  @Column({ type: 'varchar', length: 20 })
  tipo: string;

  @Column({ default: false })
  sensivel: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  descricao: string | null;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}
