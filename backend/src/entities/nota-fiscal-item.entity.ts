import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { NotaFiscal } from './nota-fiscal.entity';

@Entity('nota_fiscal_itens')
export class NotaFiscalItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'nota_fiscal_id', type: 'uuid' })
  notaFiscalId: string;

  @Column({ name: 'cod_produto', type: 'varchar', length: 30 })
  codProduto: string;

  @Column({ type: 'varchar', length: 200 })
  descricao: string;

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  quantidade: number;

  @Column({ name: 'valor_unitario', type: 'decimal', precision: 15, scale: 4 })
  valorUnitario: number;

  @Column({ name: 'valor_total', type: 'decimal', precision: 15, scale: 2 })
  valorTotal: number;

  @ManyToOne(() => NotaFiscal, (nf) => nf.itens)
  @JoinColumn({ name: 'nota_fiscal_id' })
  notaFiscal: NotaFiscal;
}
