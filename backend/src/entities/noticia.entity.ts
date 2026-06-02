import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type NoticiaCategoria = 'noticia' | 'aviso';

@Entity('noticias')
export class Noticia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'empresa_id', type: 'integer', nullable: true })
  empresaId: number | null;

  @Column({ name: 'categoria', type: 'varchar', length: 20, default: 'noticia' })
  categoria: NoticiaCategoria;

  @Column({ type: 'varchar', length: 200 })
  titulo: string;

  @Column({ type: 'text' })
  conteudo: string;

  @Column({ name: 'perfis_alvo', type: 'jsonb', nullable: true })
  perfisAlvo: string[] | null;

  @Column({ name: 'data_inicio', type: 'date' })
  dataInicio: string;

  @Column({ name: 'data_fim', type: 'date', nullable: true })
  dataFim: string | null;

  @Column({ name: 'ativo', default: true })
  ativo: boolean;

  @Column({ name: 'autor_id', type: 'uuid', nullable: true })
  autorId: string | null;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}
