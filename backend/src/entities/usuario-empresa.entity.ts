import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Empresa } from './empresa.entity';
import { Usuario } from './usuario.entity';

@Entity('usuario_empresas')
export class UsuarioEmpresa {
  @PrimaryColumn({ name: 'usuario_id', type: 'uuid' })
  usuarioId: string;

  @PrimaryColumn({ name: 'empresa_id', type: 'integer' })
  empresaId: number;

  @ManyToOne(() => Usuario, (u) => u.usuarioEmpresas)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @ManyToOne(() => Empresa, (e) => e.usuarioEmpresas)
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;
}
