import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

import { Empresa } from '../entities/empresa.entity';
import { Perfil } from '../entities/perfil.entity';
import { Tela } from '../entities/tela.entity';
import { Usuario } from '../entities/usuario.entity';
import { UsuarioEmpresa } from '../entities/usuario-empresa.entity';
import { Parametro } from '../entities/parametro.entity';
import { Noticia } from '../entities/noticia.entity';

const ds = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'crm_user',
  password: process.env.DB_PASSWORD ?? 'crm_pass',
  database: process.env.DB_DATABASE ?? 'crm_db',
  entities: [Empresa, Perfil, Tela, Usuario, UsuarioEmpresa, Parametro, Noticia],
  synchronize: true,
});

const TELAS = [
  { codigo: 'home',              nome: 'Home',           icone: 'ph ph-house',                       rota: '/home',                       modulo: 'geral',     ordem: 0 },
  { codigo: 'mcv',               nome: 'MCV',            icone: 'ph ph-chart-line',                  rota: '/mcv',                        modulo: 'comercial', ordem: 1 },
  { codigo: 'clientes',          nome: 'Clientes',       icone: 'ph ph-users',                       rota: '/clientes',                   modulo: 'comercial', ordem: 2 },
  { codigo: 'orcamentos',        nome: 'Orçamentos',     icone: 'ph ph-file-text',                   rota: '/orcamentos',                 modulo: 'comercial', ordem: 3 },
  { codigo: 'metas',             nome: 'Metas',          icone: 'ph ph-target',                      rota: '/metas',                      modulo: 'comercial', ordem: 4 },
  { codigo: 'financeiro',        nome: 'Financeiro',     icone: 'ph ph-currency-circle-dollar',      rota: '/financeiro',                 modulo: 'comercial', ordem: 5 },
  { codigo: 'usuarios',          nome: 'Usuários',       icone: 'ph ph-user-gear',                   rota: '/cadastros/usuarios',         modulo: 'cadastros', ordem: 1 },
  { codigo: 'perfis',            nome: 'Perfis',         icone: 'ph ph-shield-check',                rota: '/cadastros/perfis',           modulo: 'cadastros', ordem: 2 },
  { codigo: 'parametros',        nome: 'Parâmetros',     icone: 'ph ph-sliders',                     rota: '/cadastros/parametros',       modulo: 'cadastros', ordem: 3 },
  { codigo: 'vendedores',        nome: 'Vendedores',     icone: 'ph ph-identification-card',         rota: '/cadastros/vendedores',       modulo: 'cadastros', ordem: 4 },
  { codigo: 'noticias',          nome: 'Notícias',       icone: 'ph ph-newspaper',                   rota: '/cadastros/noticias',         modulo: 'cadastros', ordem: 5 },
];

const PERFIS_SEED: Array<{ nome: string; descricao: string; telas: string[] }> = [
  {
    nome: 'Admin',
    descricao: 'Acesso total ao sistema',
    telas: TELAS.map((t) => t.codigo),
  },
  {
    nome: 'Diretor',
    descricao: 'Diretor Comercial — fora do escopo V1',
    telas: ['home', 'mcv', 'clientes', 'orcamentos', 'metas', 'financeiro'],
  },
  {
    nome: 'Gerente',
    descricao: 'Gerente Comercial',
    telas: ['home', 'mcv', 'clientes', 'orcamentos', 'metas', 'financeiro'],
  },
  {
    nome: 'Supervisor',
    descricao: 'Supervisor de Vendas',
    telas: ['home', 'mcv', 'clientes', 'orcamentos', 'metas'],
  },
  {
    nome: 'Vendedor',
    descricao: 'Vendedor',
    telas: ['home', 'mcv', 'clientes', 'orcamentos'],
  },
  {
    nome: 'Administrativo',
    descricao: 'Perfil Administrativo',
    telas: ['home', 'clientes', 'orcamentos', 'usuarios', 'perfis', 'parametros', 'vendedores', 'noticias'],
  },
  {
    nome: 'Financeiro',
    descricao: 'Perfil Financeiro',
    telas: ['home', 'clientes', 'financeiro'],
  },
];

const PARAMETROS_SEED: Array<{
  empresaId: number | null;
  grupo: string;
  chave: string;
  valor: string;
  tipo: string;
  sensivel: boolean;
  descricao: string;
}> = [
  { empresaId: null, grupo: 'smtp', chave: 'smtp.host',   valor: '',      tipo: 'string',  sensivel: false, descricao: 'Servidor SMTP' },
  { empresaId: null, grupo: 'smtp', chave: 'smtp.port',   valor: '587',   tipo: 'number',  sensivel: false, descricao: 'Porta SMTP' },
  { empresaId: null, grupo: 'smtp', chave: 'smtp.secure', valor: 'false', tipo: 'boolean', sensivel: false, descricao: 'Usar SSL/TLS' },
  { empresaId: null, grupo: 'smtp', chave: 'smtp.user',   valor: '',      tipo: 'email',   sensivel: false, descricao: 'Usuário SMTP' },
  { empresaId: null, grupo: 'smtp', chave: 'smtp.pass',   valor: '',      tipo: 'password',sensivel: true,  descricao: 'Senha SMTP' },
  { empresaId: null, grupo: 'smtp', chave: 'smtp.from',   valor: '',      tipo: 'string',  sensivel: false, descricao: 'Remetente padrão' },
  { empresaId: null, grupo: 'sistema', chave: 'sistema.url_frontend', valor: 'http://localhost:4200', tipo: 'url',    sensivel: false, descricao: 'URL do CRM' },
  { empresaId: null, grupo: 'sistema', chave: 'sistema.nome_sistema', valor: 'CRM Comercial 360',     tipo: 'string', sensivel: false, descricao: 'Nome do sistema' },
  { empresaId: 1, grupo: 'orcamento',   chave: 'orcamento.validade_dias',      valor: '30', tipo: 'number', sensivel: false, descricao: 'Validade do orçamento (dias)' },
  { empresaId: 2, grupo: 'orcamento',   chave: 'orcamento.validade_dias',      valor: '30', tipo: 'number', sensivel: false, descricao: 'Validade do orçamento (dias)' },
  { empresaId: 1, grupo: 'atendimento', chave: 'atendimento.limite_anexos',    valor: '5',  tipo: 'number', sensivel: false, descricao: 'Limite de anexos por atendimento' },
  { empresaId: 1, grupo: 'atendimento', chave: 'atendimento.tamanho_max_mb',   valor: '10', tipo: 'number', sensivel: false, descricao: 'Tamanho máximo por arquivo (MB)' },
  { empresaId: 2, grupo: 'atendimento', chave: 'atendimento.limite_anexos',    valor: '5',  tipo: 'number', sensivel: false, descricao: 'Limite de anexos por atendimento' },
  { empresaId: 2, grupo: 'atendimento', chave: 'atendimento.tamanho_max_mb',   valor: '10', tipo: 'number', sensivel: false, descricao: 'Tamanho máximo por arquivo (MB)' },
];

async function seed() {
  await ds.initialize();
  console.log('Conectado ao banco. Iniciando seed...');

  // Empresas
  const empRepo = ds.getRepository(Empresa);
  await empRepo.upsert([
    { id: 1, nome: 'RCG', codErp: 'RCG', ativo: true },
    { id: 2, nome: 'CBA', codErp: 'CBA', ativo: true },
  ], ['id']);
  console.log('✓ Empresas');

  // Telas
  const telaRepo = ds.getRepository(Tela);
  for (const t of TELAS) {
    await telaRepo.upsert({ ...t, ativo: true }, ['codigo']);
  }
  const telasDb = await telaRepo.find();
  const telaMap = new Map(telasDb.map((t) => [t.codigo, t]));
  console.log('✓ Telas');

  // Perfis
  const perfilRepo = ds.getRepository(Perfil);
  for (const ps of PERFIS_SEED) {
    let perfil = await perfilRepo.findOne({ where: { nome: ps.nome }, relations: ['telas'] });
    if (!perfil) {
      perfil = perfilRepo.create({ nome: ps.nome, descricao: ps.descricao, versao: 1, sistema: true, ativo: true });
    }
    perfil.telas = ps.telas.map((c) => telaMap.get(c)!).filter(Boolean);
    await perfilRepo.save(perfil);
  }
  console.log('✓ Perfis');

  // Usuário Admin
  const usuRepo = ds.getRepository(Usuario);
  const ueRepo  = ds.getRepository(UsuarioEmpresa);

  const perfilAdmin = await perfilRepo.findOne({ where: { nome: 'Admin' } });
  if (!perfilAdmin) throw new Error('Perfil Admin não encontrado.');

  let admin = await usuRepo.findOne({ where: { email: 'admin@crm.local' } });
  if (!admin) {
    admin = usuRepo.create({
      nome: 'Administrador',
      email: 'admin@crm.local',
      senhaHash: await bcrypt.hash('Admin@123', 12),
      perfilId: perfilAdmin.id,
      ativo: true,
      primeiroAcesso: true,
    });
    admin = await usuRepo.save(admin);

    await ueRepo.save([
      ueRepo.create({ usuarioId: admin.id, empresaId: 1 }),
      ueRepo.create({ usuarioId: admin.id, empresaId: 2 }),
    ]);
    console.log('✓ Usuário admin@crm.local | senha: Admin@123');
  } else {
    console.log('✓ Usuário admin já existe');
  }

  // Parâmetros
  const paramRepo = ds.getRepository(Parametro);
  for (const p of PARAMETROS_SEED) {
    await paramRepo.upsert(p, ['empresaId', 'grupo', 'chave']);
  }
  console.log('✓ Parâmetros');

  // Notícia de boas-vindas
  const noticiaRepo = ds.getRepository(Noticia);
  const jaTemNoticia = await noticiaRepo.count();
  if (jaTemNoticia === 0) {
    const hoje = new Date().toISOString().split('T')[0];
    await noticiaRepo.save(
      noticiaRepo.create({
        empresaId: null,
        categoria: 'aviso',
        titulo: 'Bem-vindo ao CRM Comercial 360!',
        conteudo: 'O sistema está configurado e pronto para uso. Configure os vendedores em Cadastros → Vendedores.',
        dataInicio: hoje,
        dataFim: null,
        autorId: admin!.id,
      }),
    );
    console.log('✓ Notícia de boas-vindas');
  }

  await ds.destroy();
  console.log('\nSeed concluído com sucesso!');
}

seed().catch((err) => {
  console.error('Erro no seed:', err);
  process.exit(1);
});
