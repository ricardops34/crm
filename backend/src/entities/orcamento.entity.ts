import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrcamentoItem } from './orcamento-item.entity';

export type OrcamentoStatus =
  | 'rascunho'
  | 'enviado'
  | 'bloqueado_credito'
  | 'bloqueado_desconto'
  | 'bloqueado_estoque'
  | 'faturado'
  | 'cancelado';

@Entity('orcamentos')
export class Orcamento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'numero_portal', unique: true })
  numeroPortal: number;

  @Column({ name: 'empresa_id' })
  empresaId: number;

  @Column({ name: 'cliente_id', type: 'uuid' })
  clienteId: string;

  @Column({ name: 'vendedor_id', type: 'uuid' })
  vendedorId: string;

  @Column({ name: 'usuario_id', type: 'uuid' })
  usuarioId: string;

  @Column({ name: 'status', type: 'varchar', length: 30, default: 'rascunho' })
  status: OrcamentoStatus;

  @Column({ name: 'origem', type: 'varchar', length: 50, nullable: true })
  origem: string | null;

  @Column({ name: 'validade', type: 'date' })
  validade: string;

  @Column({ name: 'valor_total', type: 'decimal', precision: 15, scale: 2, default: 0 })
  valorTotal: number;

  @Column({ name: 'observacao', type: 'text', nullable: true })
  observacao: string | null;

  @Column({ name: 'orcamento_origem_id', type: 'uuid', nullable: true })
  orcamentoOrigemId: string | null;

  @Column({ name: 'cod_erp', type: 'varchar', length: 30, nullable: true })
  codErp: string | null;

  @Column({ name: 'enviado_em', type: 'timestamp', nullable: true })
  enviadoEm: Date | null;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;

  @OneToMany(() => OrcamentoItem, (i) => i.orcamento, { cascade: true })
  itens: OrcamentoItem[];
}
