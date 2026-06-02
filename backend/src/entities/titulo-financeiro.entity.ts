import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('titulos_financeiros')
export class TituloFinanceiro {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'empresa_id' })
  empresaId: number;

  @Column({ name: 'cliente_id', type: 'uuid' })
  clienteId: string;

  @Column({ type: 'varchar', length: 20 })
  numero: string;

  @Column({ type: 'varchar', length: 10 })
  parcela: string;

  @Column({ type: 'date' })
  vencimento: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  valor: number;

  @Column({ type: 'varchar', length: 50 })
  status: string;

  @Column({ name: 'url_boleto', type: 'text', nullable: true })
  urlBoleto: string | null;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}
