import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NotaFiscalItem } from './nota-fiscal-item.entity';

@Entity('notas_fiscais')
export class NotaFiscal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'empresa_id' })
  empresaId: number;

  @Column({ name: 'cliente_id', type: 'uuid' })
  clienteId: string;

  @Column({ name: 'numero', type: 'varchar', length: 20 })
  numero: string;

  @Column({ name: 'serie', type: 'varchar', length: 5, nullable: true })
  serie: string | null;

  @Column({ name: 'data_emissao', type: 'date' })
  dataEmissao: string;

  @Column({ name: 'valor_total', type: 'decimal', precision: 15, scale: 2 })
  valorTotal: number;

  @Column({ name: 'url_danfe', type: 'text', nullable: true })
  urlDanfe: string | null;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;

  @OneToMany(() => NotaFiscalItem, (i) => i.notaFiscal, { cascade: true })
  itens: NotaFiscalItem[];
}
