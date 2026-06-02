import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Orcamento } from './orcamento.entity';

@Entity('orcamento_itens')
export class OrcamentoItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'orcamento_id', type: 'uuid' })
  orcamentoId: string;

  @Column({ name: 'produto_id', type: 'uuid', nullable: true })
  produtoId: string | null;

  @Column({ name: 'cod_produto', type: 'varchar', length: 30 })
  codProduto: string;

  @Column({ name: 'descricao', type: 'varchar', length: 200 })
  descricao: string;

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  quantidade: number;

  @Column({ name: 'preco_unitario', type: 'decimal', precision: 15, scale: 4 })
  precoUnitario: number;

  @Column({ name: 'desconto_pct', type: 'decimal', precision: 5, scale: 2, default: 0 })
  descontoPct: number;

  @Column({ name: 'valor_total', type: 'decimal', precision: 15, scale: 2 })
  valorTotal: number;

  @Column({ name: 'estoque_disponivel', type: 'decimal', precision: 10, scale: 3, nullable: true })
  estoqueDisponivel: number | null;

  @Column({ name: 'sem_estoque', default: false })
  semEstoque: boolean;

  @ManyToOne(() => Orcamento, (o) => o.itens)
  @JoinColumn({ name: 'orcamento_id' })
  orcamento: Orcamento;
}
