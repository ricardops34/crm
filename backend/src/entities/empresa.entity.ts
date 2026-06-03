import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UsuarioEmpresa } from './usuario-empresa.entity';
import { Cnae } from './cnae.entity';
import { Municipio } from './municipio.entity';
import { Uf } from './uf.entity';
import { Cep } from './cep.entity';

@Entity('empresas')
export class Empresa {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nome: string;

  @Column({ name: 'cod_erp', type: 'varchar', length: 20 })
  codErp: string;

  // --- Cartão CNPJ ---

  @Column({ type: 'varchar', length: 18, nullable: true })
  cnpj: string | null;

  @Column({ name: 'razao_social', type: 'varchar', length: 200, nullable: true })
  razaoSocial: string | null;

  @Column({ name: 'nome_fantasia', type: 'varchar', length: 200, nullable: true })
  nomeFantasia: string | null;

  @Column({ name: 'situacao_cadastral', type: 'varchar', length: 30, nullable: true })
  situacaoCadastral: string | null; // Ativa | Inapta | Suspensa | Baixada

  @Column({ name: 'data_abertura', type: 'date', nullable: true })
  dataAbertura: string | null;

  @Column({ name: 'natureza_juridica', type: 'varchar', length: 100, nullable: true })
  naturezaJuridica: string | null;

  @Column({ name: 'porte', type: 'varchar', length: 10, nullable: true })
  porte: string | null; // ME | EPP | Medio | Grande

  @Column({ name: 'regime_tributario', type: 'varchar', length: 30, nullable: true })
  regimeTributario: string | null; // Simples Nacional | Lucro Presumido | Lucro Real

  @Column({ name: 'cnae_codigo', type: 'varchar', length: 7, nullable: true })
  cnaeCodigo: string | null;

  @Column({ name: 'capital_social', type: 'decimal', precision: 15, scale: 2, nullable: true })
  capitalSocial: number | null;

  // --- Endereço ---

  @Column({ name: 'cep_codigo', type: 'varchar', length: 8, nullable: true })
  cepCodigo: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  numero: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  complemento: string | null;

  @Column({ name: 'municipio_ibge', type: 'integer', nullable: true })
  municipioIbge: number | null;

  @Column({ name: 'uf_sigla', type: 'varchar', length: 2, nullable: true })
  ufSigla: string | null;

  // --- Contato ---

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefone: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  site: string | null;

  // --- Controle ---

  @Column({ default: true })
  ativo: boolean;

  // --- Relacionamentos ---

  @ManyToOne(() => Cnae, { nullable: true })
  @JoinColumn({ name: 'cnae_codigo', referencedColumnName: 'codigo' })
  cnae: Cnae | null;

  @ManyToOne(() => Cep, { nullable: true })
  @JoinColumn({ name: 'cep_codigo', referencedColumnName: 'cep' })
  cep: Cep | null;

  @ManyToOne(() => Municipio, { nullable: true })
  @JoinColumn({ name: 'municipio_ibge', referencedColumnName: 'codigoIbge' })
  municipio: Municipio | null;

  @ManyToOne(() => Uf, { nullable: true })
  @JoinColumn({ name: 'uf_sigla', referencedColumnName: 'sigla' })
  uf: Uf | null;

  @OneToMany(() => UsuarioEmpresa, (ue) => ue.empresa)
  usuarioEmpresas: UsuarioEmpresa[];
}
