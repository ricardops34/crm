import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Vendedor } from './vendedor.entity';
import { Cliente } from './cliente.entity';

@Entity('carteira_clientes')
export class CarteiraCliente {
  @PrimaryColumn({ name: 'vendedor_id', type: 'uuid' })
  vendedorId: string;

  @PrimaryColumn({ name: 'cliente_id', type: 'uuid' })
  clienteId: string;

  @Column({ name: 'empresa_id' })
  empresaId: number;

  @ManyToOne(() => Vendedor)
  @JoinColumn({ name: 'vendedor_id' })
  vendedor: Vendedor;

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;
}
