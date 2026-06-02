import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('produtos')
export class Produto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'empresa_id' })
  empresaId: number;

  @Column({ name: 'cod_erp', type: 'varchar', length: 30 })
  codErp: string;

  @Column({ type: 'varchar', length: 200 })
  descricao: string;

  @Column({ name: 'unidade', type: 'varchar', length: 10, nullable: true })
  unidade: string | null;

  @Column({ name: 'estoque', type: 'decimal', precision: 10, scale: 3, default: 0 })
  estoque: number;

  @Column({ name: 'preco_tabela', type: 'decimal', precision: 15, scale: 4, default: 0 })
  precoTabela: number;

  @Column({ name: 'ativo', default: true })
  ativo: boolean;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}
