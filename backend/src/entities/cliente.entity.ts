import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'empresa_id' })
  empresaId: number;

  @Column({ name: 'cod_erp', type: 'varchar', length: 30 })
  codErp: string;

  @Column({ name: 'razao_social', type: 'varchar', length: 200 })
  razaoSocial: string;

  @Column({ name: 'nome_fantasia', type: 'varchar', length: 200, nullable: true })
  nomeFantasia: string | null;

  @Column({ type: 'varchar', length: 18, nullable: true })
  cnpj: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  cidade: string | null;

  @Column({ type: 'varchar', length: 2, nullable: true })
  uf: string | null;

  @Column({ name: 'grupo_economico', type: 'varchar', length: 100, nullable: true })
  grupoEconomico: string | null;

  @Column({ name: 'cnae_principal', type: 'varchar', length: 10, nullable: true })
  cnaePrincipal: string | null;

  @Column({ name: 'contato_principal', type: 'varchar', length: 150, nullable: true })
  contatoPrincipal: string | null;

  @Column({ name: 'limite_credito', type: 'decimal', precision: 15, scale: 2, default: 0 })
  limiteCredito: number;

  @Column({ name: 'tabela_preco', type: 'varchar', length: 10, nullable: true })
  tabelaPreco: string | null;

  @Column({ name: 'situacao', type: 'varchar', length: 20, default: 'ativo' })
  situacao: string;

  @Column({ name: 'bloqueado', default: false })
  bloqueado: boolean;

  @Column({ name: 'ultima_compra', type: 'date', nullable: true })
  ultimaCompra: string | null;

  @Column({ name: 'venda_30d', type: 'decimal', precision: 15, scale: 2, default: 0 })
  venda30d: number;

  @Column({ name: 'media_90d', type: 'decimal', precision: 15, scale: 2, default: 0 })
  media90d: number;

  @Column({ name: 'tem_comodato', default: false })
  temComodato: boolean;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}
