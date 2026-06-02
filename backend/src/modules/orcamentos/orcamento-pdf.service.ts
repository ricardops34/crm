import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as PDFDocument from 'pdfkit';
import { Orcamento } from '../../entities/orcamento.entity';
import { Empresa } from '../../entities/empresa.entity';
import { Cliente } from '../../entities/cliente.entity';
import { LogEnvioOrcamento } from '../../entities/log-envio-orcamento.entity';
import { Parametro } from '../../entities/parametro.entity';

@Injectable()
export class OrcamentoPdfService {
  constructor(
    @InjectRepository(Orcamento) private orcRepo: Repository<Orcamento>,
    @InjectRepository(Empresa) private empresaRepo: Repository<Empresa>,
    @InjectRepository(Cliente) private clienteRepo: Repository<Cliente>,
    @InjectRepository(LogEnvioOrcamento) private logRepo: Repository<LogEnvioOrcamento>,
    @InjectRepository(Parametro) private paramRepo: Repository<Parametro>,
  ) {}

  async gerarPdf(orcamentoId: string, usuarioId: string): Promise<Buffer> {
    const orc = await this.orcRepo.findOne({
      where: { id: orcamentoId },
      relations: ['itens'],
    });
    if (!orc) throw new Error('Orçamento não encontrado.');

    const empresa = await this.empresaRepo.findOne({ where: { id: orc.empresaId } });
    const cliente = await this.clienteRepo.findOne({ where: { id: orc.clienteId } });

    const nomeSistema = await this.getParam(null, 'sistema', 'sistema.nome_sistema') ?? 'CRM Comercial 360';

    const buffer = await this.buildPdf(orc, empresa, cliente, nomeSistema);

    await this.logRepo.save(
      this.logRepo.create({
        orcamentoId,
        usuarioId,
        canal: 'pdf',
        sucesso: true,
        detalhe: `PDF gerado em ${new Date().toISOString()}`,
      }),
    );

    return buffer;
  }

  async getLogs(orcamentoId: string) {
    return this.logRepo.find({
      where: { orcamentoId },
      order: { criadoEm: 'DESC' },
    });
  }

  private buildPdf(
    orc: Orcamento,
    empresa: Empresa | null,
    cliente: Cliente | null,
    nomeSistema: string,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new (PDFDocument as any)({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (c: Buffer) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const corPrimaria = '#2D6A9F';
      const largura = doc.page.width - 100;

      // Cabeçalho
      doc.rect(50, 40, largura, 60).fill(corPrimaria);
      doc.fillColor('white').fontSize(18).font('Helvetica-Bold')
        .text(empresa?.nome ?? nomeSistema, 60, 55, { width: largura / 2 });
      doc.fontSize(10).font('Helvetica')
        .text(`ORÇAMENTO Nº ${orc.numeroPortal}`, largura / 2 + 60, 55, { align: 'right' })
        .text(`Data: ${new Date(orc.criadoEm).toLocaleDateString('pt-BR')}`, largura / 2 + 60, 70, { align: 'right' })
        .text(`Validade: ${orc.validade}`, largura / 2 + 60, 85, { align: 'right' });

      doc.fillColor('black').moveDown(2);

      // Dados do cliente
      doc.fontSize(11).font('Helvetica-Bold').text('CLIENTE', 50, 120);
      doc.fontSize(10).font('Helvetica')
        .text(`${cliente?.razaoSocial ?? 'N/D'}`, 50, 135)
        .text(`CNPJ: ${cliente?.cnpj ?? 'N/D'} | ${cliente?.cidade ?? ''} - ${cliente?.uf ?? ''}`, 50, 150);

      // Status
      doc.moveDown();
      const statusCorMap: Record<string, string> = {
        rascunho: '#999',
        enviado: '#2196F3',
        bloqueado_credito: '#F44336',
        bloqueado_desconto: '#FF9800',
        bloqueado_estoque: '#FF9800',
        faturado: '#4CAF50',
        cancelado: '#9E9E9E',
      };
      const corStatus = statusCorMap[orc.status] ?? '#999';
      doc.fontSize(10)
        .fillColor(corStatus)
        .text(`Status: ${orc.status.replace(/_/g, ' ').toUpperCase()}`, 50, doc.y);
      doc.fillColor('black');

      // Tabela de itens
      const yTabela = doc.y + 20;
      doc.rect(50, yTabela, largura, 20).fill('#4472C4');
      doc.fillColor('white').fontSize(9).font('Helvetica-Bold');
      const colunas = [
        { x: 55, label: 'Código', w: 70 },
        { x: 130, label: 'Descrição', w: 200 },
        { x: 335, label: 'Qtd', w: 50 },
        { x: 390, label: 'Preço Unit.', w: 80 },
        { x: 475, label: 'Desc.%', w: 40 },
        { x: 520, label: 'Total', w: 70 },
      ];
      colunas.forEach((c) => doc.text(c.label, c.x, yTabela + 5, { width: c.w }));
      doc.fillColor('black');

      let y = yTabela + 25;
      for (const item of orc.itens) {
        if (y > 700) {
          doc.addPage();
          y = 50;
        }
        const bg = orc.itens.indexOf(item) % 2 === 0 ? '#F5F5F5' : 'white';
        doc.rect(50, y - 2, largura, 18).fill(bg);
        doc.fillColor(item.semEstoque ? '#E53935' : 'black').fontSize(9).font('Helvetica');
        doc.text(item.codProduto, colunas[0].x, y, { width: colunas[0].w });
        doc.text(
          item.descricao + (item.semEstoque ? ' ⚠ sem estoque' : ''),
          colunas[1].x, y, { width: colunas[1].w },
        );
        doc.text(Number(item.quantidade).toFixed(2), colunas[2].x, y, { width: colunas[2].w });
        doc.text(
          `R$ ${Number(item.precoUnitario).toFixed(2)}`,
          colunas[3].x, y, { width: colunas[3].w },
        );
        doc.text(
          `${Number(item.descontoPct).toFixed(1)}%`,
          colunas[4].x, y, { width: colunas[4].w },
        );
        doc.text(
          `R$ ${Number(item.valorTotal).toFixed(2)}`,
          colunas[5].x, y, { width: colunas[5].w },
        );
        doc.fillColor('black');
        y += 20;
      }

      // Totais
      y += 10;
      doc.moveTo(50, y).lineTo(50 + largura, y).stroke();
      y += 10;
      doc.fontSize(12).font('Helvetica-Bold')
        .text(
          `TOTAL: R$ ${Number(orc.valorTotal).toFixed(2)}`,
          50, y, { align: 'right', width: largura },
        );

      // Observação
      if (orc.observacao) {
        doc.moveDown(2).fontSize(9).font('Helvetica-Bold').text('Observações:');
        doc.font('Helvetica').text(orc.observacao);
      }

      // Rodapé
      doc.fontSize(8).fillColor('#888')
        .text(
          `Documento gerado em ${new Date().toLocaleString('pt-BR')} — ${nomeSistema}`,
          50, doc.page.height - 40, { align: 'center', width: largura },
        );

      doc.end();
    });
  }

  private async getParam(empresaId: number | null, grupo: string, chave: string): Promise<string | null> {
    let p = empresaId !== null
      ? await this.paramRepo.findOne({ where: { empresaId, grupo, chave } })
      : null;
    if (!p) p = await this.paramRepo.findOne({ where: { empresaId: null as any, grupo, chave } });
    return p?.valor ?? null;
  }
}
