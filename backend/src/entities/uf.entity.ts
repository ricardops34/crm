import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Municipio } from './municipio.entity';

@Entity('ufs')
export class Uf {
  /** Sigla ex: SP, RJ, MG */
  @PrimaryColumn({ type: 'varchar', length: 2 })
  sigla: string;

  @Column({ type: 'varchar', length: 50 })
  nome: string;

  @Column({ name: 'codigo_ibge', type: 'integer', unique: true })
  codigoIbge: number;

  /** Norte | Nordeste | Centro-Oeste | Sudeste | Sul */
  @Column({ type: 'varchar', length: 15 })
  regiao: string;

  @OneToMany(() => Municipio, (m) => m.uf)
  municipios: Municipio[];
}
