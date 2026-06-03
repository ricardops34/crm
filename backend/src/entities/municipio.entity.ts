import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Uf } from './uf.entity';

@Entity('municipios')
export class Municipio {
  /** Código IBGE de 7 dígitos ex: 3550308 (São Paulo) */
  @PrimaryColumn({ name: 'codigo_ibge', type: 'integer' })
  codigoIbge: number;

  @Column({ type: 'varchar', length: 100 })
  nome: string;

  @Column({ name: 'uf_sigla', type: 'varchar', length: 2 })
  ufSigla: string;

  /** Código SIAFI — usado em documentos fiscais */
  @Column({ name: 'codigo_siafi', type: 'varchar', length: 5, nullable: true })
  codigoSiafi: string | null;

  @ManyToOne(() => Uf, (u) => u.municipios)
  @JoinColumn({ name: 'uf_sigla' })
  uf: Uf;
}
