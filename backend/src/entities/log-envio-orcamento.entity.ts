import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('log_envio_orcamentos')
export class LogEnvioOrcamento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'orcamento_id', type: 'uuid' })
  orcamentoId: string;

  @Column({ name: 'usuario_id', type: 'uuid', nullable: true })
  usuarioId: string | null;

  @Column({ name: 'canal', type: 'varchar', length: 20, default: 'pdf' })
  canal: string;

  @Column({ name: 'sucesso', default: true })
  sucesso: boolean;

  @Column({ name: 'detalhe', type: 'text', nullable: true })
  detalhe: string | null;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;
}
