import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('cnaes')
export class Cnae {
  /** Código no formato 0000-0/00 — armazenado sem máscara ex: "4711301" */
  @PrimaryColumn({ type: 'varchar', length: 7 })
  codigo: string;

  @Column({ type: 'varchar', length: 300 })
  descricao: string;

  /** Seção  (letra A-U) */
  @Column({ type: 'varchar', length: 1 })
  secao: string;

  /** Divisão (2 dígitos) */
  @Column({ type: 'varchar', length: 2 })
  divisao: string;

  /** Grupo (3 dígitos) */
  @Column({ type: 'varchar', length: 3 })
  grupo: string;

  /** Classe (5 dígitos) */
  @Column({ type: 'varchar', length: 5 })
  classe: string;
}
