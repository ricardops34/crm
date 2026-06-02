import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UsuarioEmpresa } from './usuario-empresa.entity';

@Entity('empresas')
export class Empresa {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nome: string;

  @Column({ name: 'cod_erp', type: 'varchar', length: 20 })
  codErp: string;

  @Column({ default: true })
  ativo: boolean;

  @OneToMany(() => UsuarioEmpresa, (ue) => ue.empresa)
  usuarioEmpresas: UsuarioEmpresa[];
}
