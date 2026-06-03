import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { Municipio } from './municipio.entity';

/**
 * Cache de CEPs consultados via ViaCEP / Correios.
 * Não é a base completa — registros são inseridos sob demanda.
 */
@Entity('ceps')
export class Cep {
  /** 8 dígitos sem hífen ex: "01310100" */
  @PrimaryColumn({ type: 'varchar', length: 8 })
  cep: string;

  @Column({ type: 'varchar', length: 150 })
  logradouro: string;

  @Column({ type: 'varchar', length: 80, nullable: true })
  bairro: string | null;

  @Column({ name: 'municipio_ibge', type: 'integer' })
  municipioIbge: number;

  @Column({ name: 'uf_sigla', type: 'varchar', length: 2 })
  ufSigla: string;

  /** Complemento de faixa ex: "de 1 a 999" */
  @Column({ type: 'varchar', length: 100, nullable: true })
  complemento: string | null;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;

  @ManyToOne(() => Municipio)
  @JoinColumn({ name: 'municipio_ibge', referencedColumnName: 'codigoIbge' })
  municipio: Municipio;
}
