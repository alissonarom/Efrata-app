import {NativeStackScreenProps} from '@react-navigation/native-stack';

export type RootStackParamList = {
    // Login: any;
    Cliente: { vendedor: TVendedorResponse };
    CadastroCliente: undefined;
    Pedido: { cliente: TClienteResponse, vendedor: TVendedorResponse };
    Financeiro: { cliente: TClienteResponse, vendedor: TVendedorResponse };
    Painel: { cliente: TClienteResponse, vendedor: TVendedorResponse };
    Home: { vendedor: TVendedorResponse };
    Vendedor: any
    Despesas: { vendedor: TVendedorResponse };
    Baixa: { vendedor: TVendedorResponse };

};

export type HomeScreenProps = NativeStackScreenProps<
 RootStackParamList,
 'Home'
>;

export type ClienteScreenProps = NativeStackScreenProps<
 RootStackParamList,
 'Cliente'
>;

export type CadastroClienteScreenProps = NativeStackScreenProps<
 RootStackParamList,
 'CadastroCliente'
>;

export type NovoPedidoScreenPorps = NativeStackScreenProps<
 RootStackParamList,
 'Pedido'
>;

export type FinanceiroScreenPorps = NativeStackScreenProps<
 RootStackParamList,
 'Financeiro'
>;

export type VendedorScreenPorps = NativeStackScreenProps<
 RootStackParamList,
 'Vendedor'
>;

export type DespesasScreenPorps = NativeStackScreenProps<
 RootStackParamList,
 'Despesas'
>;

export type BaixaScreenPorps = NativeStackScreenProps<
 RootStackParamList,
 'Baixa'
>;

// Cliente Resposta
export type TClienteResponse = {
  id_cliente: number; //
  id_registro: number; //
  tipo_pessoa: string; //
  tipo_cadastro: string; //
  cnpj_cliente: string;//
  rg_cliente: string | null;//
  data_emissao_rg_cliente: string | null;//
  orgao_expedidor_rg_cliente: string | null;//
  passaporte_cliente: string | null;//
  estrangeiro_cliente: string | null | number;//
  razao_cliente: string;//
  fantasia_cliente: string;//
  endereco_cliente: string;//
  numero_cliente: string;//
  bairro_cliente: string;//
  complemento_cliente: string;//
  referencia_cliente: string | null;//
  cep_cliente: string;//
  cidade_cliente: string;//
  cidade_cliente_cod: number;//
  uf_cliente: string;//
  tel_destinatario_cliente: string | null;//
  doc_destinatario_cliente: string | null;//
  nome_destinatario_cliente: string | null;//
  contato_cliente: string | null;//
  fone_cliente: string;//
  fone_contato_cliente: string | null;//
  fone_ramal_cliente: string | null;//
  fax_cliente: string | null;//
  celular_cliente: string;//
  email_cliente: string;//
  email_contato_cliente: string | null;
  celular_contato_cliente: string | null;
  estado_civil_cliente: string | null;
  website_cliente: string | null;
  aposentado_cliente: string | null | number;
  empregador_cliente: string | null;
  profissao_cliente: string | null;
  genero_cliente: string | null;
  insc_estadual_cliente: string;
  insc_municipal_cliente: string | null;
  insc_produtor_cliente: string | null;
  insc_suframa_cliente: string | null;
  nif: string | null;
  situacao_cliente: string; // e.g. "Ativo"
  vendedor_cliente: string | null;
  vendedor_cliente_id: string | null | number;
  modalidade_frete: number;
  id_transportadora: string | null;
  desc_transportadora: string | null;
  observacoes_cliente: string | null;
  listapreco_cliente: number;
  condicaopag_cliente: number;
  limite_credito: string; // Assuming it's a string representation of a number
  ultrapassar_limite_credito: number; // e.g. 0 or 1
  consumidor_final: string; // e.g. "1"
  contribuinte_icms: number; // e.g. 0 or 1
  atividade_encerrada_cliente: string | null | number;
  data_nasc_cliente: string; // Format: "YYYY-MM-DD"
  data_cad_cliente: string; // Format: "YYYY-MM-DD HH:mm:ss"
  data_mod_cliente: string | null; // Format: "YYYY-MM-DD HH:mm:ss"
  lixeira: string; // e.g. "Sim"
};

// Cliente Resposta
export type TClienteRegister = {
  id_cliente: number;
  tipo_pessoa: string;
  tipo_cadastro: string;
  cnpj_cliente: string;
  razao_cliente: string;
  fantasia_cliente: string;
  endereco_cliente: string;
  numero_cliente: number;
  bairro_cliente: string;
  complemento_cliente: string;
  cep_cliente: string;
  cidade_cliente: string;
  cidade_cliente_cod: number;
  uf_cliente: string;
  contato_cliente: string;
  fone_cliente: string;
  fone_contato_cliente: string;
  fone_ramal_cliente: string;
  fax_cliente: string;
  celular_cliente: string;
  email_cliente: string;
  email_contato_cliente: string;
  website_cliente: string;
  insc_estadual_cliente: number;
  insc_municipal_cliente: number;
  insc_produtor_cliente: number;
  insc_suframa_cliente: number;
  situacao_cliente: string;
  vendedor_cliente: string;
  vendedor_cliente_id: number;
  observacoes_cliente: string;
  data_nasc_cliente: string;
  data_cad_cliente: string;
  data_mod_cliente: string;
  lixeira: string;
};

export type TVendedorResponse = {
    id_vendedor: number;
    id_registro: number;
    tipo_pessoa: string;
    cnpj_vendedor: string;
    razao_vendedor: string;
    fantasia_vendedor: string;
    endereco_vendedor: string;
    numero_vendedor: string;
    bairro_vendedor: string;
    complemento_vendedor: string;
    cep_vendedor: string;
    cidade_vendedor: string;
    uf_vendedor: string;
    contato_vendedor: string;
    fone_vendedor: string;
    fone_ramal_vendedor: string;
    celular_vendedor: string;
    email_vendedor: string;
    website_vendedor: string;
    banco_vendedor: string;
    banco_agencia: string;
    banco_conta: string;
    banco_salario: string;
    situacao_vendedor: string;
    comissao_usuario: string;
    comissao_regra: number;
    usuario_vendedor: number;
    observacoes_vendedor: string;
    data_cad_vendedor: string; // formato "0000-00-00 00:00:00"
    data_mod_vendedor: string; // formato "0000-00-00 00:00:00"
    lixeira: string;
};

// Pedido via PDV
export type PedidoResponse = {
    id_ped: number,
    id_pedido: number,
    id_cliente: number,
    nome_cliente:  string ,
    id_local_retirada: number,
    id_local_cobranca: number,
    vendedor_pedido: string,
    vendedor_pedido_id: number,
    listapreco_produtos: number,
    valor_total_produtos: number,
    desconto_pedido: number,
    desconto_pedido_porc: number,
    peso_total_nota: number,
    peso_total_nota_liq: number,
    frete_pedido: number,
    valor_total_nota: number,
    valor_baseICMS: number,
    valor_ICMS: number,
    valor_baseST: number,
    valor_ST: number,
    valor_IPI: number,
    condicao_pagamento_id: number,
    condicao_pagamento: number,
    frete_por_pedido: number,
    transportadora_pedido: string,
    id_transportadora: number,
    data_pedido: string,
    prazo_entrega: string,
    referencia_pedido: string,
    obs_pedido: string,
    obs_interno_pedido: string,
    status_pedido: string,
    contas_pedido: 0,
    comissao_pedido: 0,
    estoque_pedido: 0,
    pdv_emitido: any,
    ordemc_emitido: number,
    data_cad_pedido: string,
    data_mod_pedido: string,
    id_aplicativo: any,
    id_pedido_aplicativo: any,
    id_almoxarifado: number,
    pagamento_com_vhpay: number,
    pagamento_com_conta_integrada: number,
    link_pgto_gerado: number,
    lixeira:  string 
};

// Produto
export type TProduto = {
    id_produto: number;
    id_registro: number;
    id_empresa: number;
    id_categoria: number;
    cod_produto: string;
    marca_produto: string | number | null;
    desc_produto: string;
    atalho_produto: string | null;
    fornecedor_produto: string;
    fornecedor_produto_id: number | null;
    produto_variado: number;
    id_produto_parent: number;
    minimo_produto: string;
    maximo_produto: string;
    estoque_produto: string;
    unidade_produto: string;
    valor_produto: string;
    valor_custo_produto: string;
    peso_produto: string | number | null;
    peso_liq_produto: string | number | null;
    icms_produto: string | null;
    ipi_produto: string | null;
    pis_produto: string | null;
    cofins_produto: string | null;
    unidade_tributavel: string | null;
    cest_produto: string | number | null;
    beneficio_fiscal: string | null;
    ncm_produto: string | number | null;
    origem_produto: number;
    codigo_barra_produto: string | number | null;
    codigo_barras_internos: string | null;
    obs_produto: string | null;
    tipo_produto: string;
    tamanho_produto: string | number | null;
    localizacao_produto: string | number | null;
    kit_produto: string;
    baixar_kit: number;
    desmembrar_kit: number;
    loja_visivel: number;
    loja_video_url: string | null;
    valor_tributos: string | number | null;
    valor_tributosEst: string | number | null;
    status_produto: string;
    id_comissionamento: number | null;
    data_cad_produto: string;
    data_mod_produto: string | number | null;
    data_mod_estoque: string | null;
    lixeira: string;
    endereco_fixo: string | null;
    controla_lote: string | null;
    controla_validade: string | null;
    lista_preco: string | null;
    subcategoria: any[];
    grades: any[];
    variacoes: any[];
    imagens: any[];
};

export type TProdutoOnPedido ={
    
};

// Produto inserido no pedido
export type TProdutoPedido = {
    id_produto: number,
    desc_produto: string,
    qtde_produto: string,
    valor_unit_produto: string,
    valor_custo_produto?: string,
    valor_total_produto?: string,
    desconto_produto?: any,
    ipi_produto?: any,
    icms_produto?: any,
    peso_produto?: any,
    peso_liq_produto?: any,
    id_ped_produto?: number,
    id_lote?: number,
    id_almoxarifado?: number,
    info_adicional?: string,
    valor_desconto?: string
};

// Transportadora
export type TTransportadora =
	{
		id_transportadora: number,
		id_registro: number,
		tipo_pessoa: string,
		desc_transportadora: string,
		fantasia_transportadora: string,
		cnpj_transportadora: string,
		ie_transportadora: string,
		endereco_transportadora: string,
		numero_transportadora: number,
		cep_transportadora: string,
		bairro_transportadora: string,
		complemento_transportadora: string,
		cidade_transportadora: string,
		cidade_transportadora_cod: number,
		estado_transportadora: string,
		fone_transportadora: string,
		email_transportadora: string,
		rntc_transportadora: string | null,
		observacoes_transportadora: string | null,
		data_cad_transportadora: string,
		data_mod_transportadora: string | null,
		lixeira: string
};

// Status do pedido
export enum Status_pedido {
        'Em Aberto'='Em Aberto',
        'Em Andamento'='Em Andamento',
        'Atendido'='Atendido',
        'Cancelado'='Cancelado'
};

// Lixeira
export enum Lixeira_pedido {
        'Sim'= 'Sim',
        'Não'='Nao'
};

export enum Liquidado {
    'Sim'= 'Sim',
    'Não'='Nao'
};

// Estoque lançado
export enum Estoque_pedido {
'Sim'=1,
'Não'=0
};

// Conta lançada
export enum Conta_lancada {
    'Sim'=1,
    'Não'=0
};

// Parcelas do pedido
export type TParcelas = {
    data_parcela: string,
    valor_parcela: string,
    forma_pagamento: string | null,
    observacoes_parcela: string,
    conta_liquidada: number
};

// Pedido via CRM
export type TPedido = {
    id_ped: number;
    id_pedido: number;
    id_cliente: number;
    nome_cliente: string;
    id_local_retirada: number;
    id_local_cobranca: number;
    vendedor_pedido: string;
    vendedor_pedido_id: number;
    listapreco_produtos: number;
    valor_total_produtos: string;
    desconto_pedido: string;
    desconto_pedido_porc: string;
    peso_total_nota: string;
    peso_total_nota_liq: string;
    frete_pedido: string;
    valor_total_nota: string;
    valor_baseICMS: string;
    valor_ICMS: string;
    valor_baseST: string;
    valor_ST: string;
    valor_IPI: string;
    condicao_pagamento_id: number;
    condicao_pagamento: number;
    frete_por_pedido: number;
    transportadora_pedido: string;
    id_transportadora: number;
    data_pedido: string;
    prazo_entrega: string;
    referencia_pedido: string;
    obs_pedido: string;
    obs_interno_pedido: string;
    status_pedido: string;
    contas_pedido: number;
    comissao_pedido: number;
    estoque_pedido: number;
    pdv_emitido: null | string;
    ordemc_emitido: number;
    data_cad_pedido: string;
    data_mod_pedido: string;
    id_aplicativo: null | number;
    id_pedido_aplicativo: null | number;
    id_almoxarifado: number;
    pagamento_com_vhpay: number;
    pagamento_com_conta_integrada: number;
    link_pgto_gerado: number;
    lixeira: string;
    produtos: TProdutoPedido[],
    parcelas: TParcelas[]
};

// POST Criar pedido
export type TNovoPedido = {
    id_cliente: number | null; //ID do cliente 
    nome_cliente: string; //Nome do cliente
    vendedor_pedido: string; //Nome do vendedor
    vendedor_pedido_id: number | null; //Nome do vendedor
    desconto_pedido?: string | number | null;//Valor total do desconto
    peso_total_nota?: string | number | null;//Peso total do pedido
    peso_total_nota_liq?: string | number | null;//Peso liquido do pedido
    data_pedido: string | null;//Data do pedido
    prazo_entrega: string | null;//Prazo de entrega (Dias)
    referencia_pedido: string | null;//Referência do pedido
    obs_pedido: string | null;//Observações do pedido
    obs_interno_pedido: string | null;//Observação interna do pedido
    status_pedido: Status_pedido;//Status do pedido
    estoque_pedido: Estoque_pedido;//Estoque lançado 1 = Sim, 0 = Não
    contas_pedido: Conta_lancada;//Contas lançada 1 = Sim, 0 = Não
    valor_total_nota?: string | number | null,
    valor_total_produtos: string | number | null
};

export const dataFrete = [{ nome:'Destinatário', valor:1}, {nome: 'Terceiro', valor:2}, {nome:'Sem frete', valor:9}, {nome:'Emitente', valor:0}];

//POST
export type TDespesas ={
        nome_conta: string;
        id_banco: number;
        vencimento_pag: string; // Formato "YYYY-MM-DD"
        valor_pag: number; // Formato "00.00"
        valor_pago?: number; // Formato "00.00"
        categoria_pag?: string;
        id_categoria?: number | null;
        id_fornecedor?: number;
        nome_fornecedor?: string;
        data_emissao?: string; // Formato "YYYY-MM-DD"
        n_documento_pag?: string;
        observacoes_pag?: string;
        id_centro_custos?: number;
        centro_custos_pag?: string;
        liquidado_pag?: string; // Valores possíveis: "Sim", "Não"
        data_pagamento?: string; // Formato "YYYY-MM-DD"
        obs_pagamento?: string;
        forma_pagamento?: string | null; // Ex: "Cartão"
        valor_juros?: number; // Formato "00.00"
        valor_desconto?: number; // Formato "00.00"
        valor_taxa?: number; // Formato "00.00"
        valor_acrescimo?: string,
};

export type TBancoCadastro = {
    id_banco_cad: number;
    nome_banco_cad: string;
    saldo_inicial: string; // Formato "0.00"
    saldo_inicial_data: string; // Formato "YYYY-MM-DD"
    gerar_boletos: number; // 0 ou 1
    id_carteira: number;
    carteira_banco: string | null;
    convenio_banco: string | null;
    cedente_banco: string | null;
    agencia_banco: string | null;
    agencia_dv_banco: string | null;
    conta_banco: string | null;
    conta_dv_banco: string | null;
    codigo_cedente: string | null;
    instrucoes_boleto: string | null;
    dias_multa: number;
    correcao_dia: string; // Formato "0.000"
    taxa_boleto: string; // Formato "0.00"
    cobrar_juros: number; // 0 ou 1
    dias_juros: number;
    msg_juros: number;
    tipo_desconto: string; // Exemplo: "P"
    status_banco: string; // Exemplo: "Ativo"
    com_registro: number; // 0 ou 1
    especie_cobranca: number;
    data_cad_banco: string; // Formato "YYYY-MM-DD HH:mm:ss"
    data_mod_banco: string; // Formato "YYYY-MM-DD HH:mm:ss"
    sequencia: number;
    padrao_receita: number; // 0 ou 1
    padrao_despesa: number; // 0 ou 1
    trampolin: number; // 0 ou 1
    conta_externa_dda: number; // 0 ou 1
    gerencianet: number; // 0 ou 1
    layout_cobranca_cad: string | null;
    protesto_codigo: number;
    juros_codigo: number;
    multa_codigo: number;
    aceite_banco: string; // Exemplo: "N"
    lixeira: string; // Exemplo: "Sim"
    id_conta_ob: string | null;
    consentimento_ob: string; // Exemplo: "N"
    hash_ob: string | null;
    liquida_taxa: number; // 0 ou 1
    id_especie_titulo: string | null;
    criar_conta_stone: number; // 0 ou 1
    conta_stone: number; // 0 ou 1
    data_consentimento: string | null; // Formato "YYYY-MM-DD" ou null
    boleto_facil_observacao_boleto: number; // 0 ou 1
    segmento_S: number; // 0 ou 1
    numero_banco: number;
    multa_atraso: string; // Formato "0.00"
};

export type TEstoque = {
    id_produto: number,
    tipo_estoque: string,
    qtde_estoque?: string,
    valor_estoque?: string,
    obs_estoque?: string,
    identificacao?: string
};

export type TCentrosCusto = {
    id_centro_custos?: number,
    desc_centro_custos?: string,
    status_centro_custos?: string,
    data_cad_centro?: any,
    data_mod_centro?: any,
    lixeira?: Lixeira_pedido
};

export type TContaReceber = {
    nome_conta?: string,
    id_categoria?: number,
    categoria_rec?: string,
    id_banco?: number,
    id_cliente?: number,
    nome_cliente?: string,
    vencimento_rec?: string,
    valor_rec?: string,
    valor_pago?: string,
    data_emissao?: string,
    n_documento_rec?: string,
    observacoes_rec?: string,
    id_centro_custos?: number,
    centro_custos_rec?: string,
    liquidado_rec?: Liquidado,
    data_pagamento?: string | null,
    obs_pagamento?: string | null,
    forma_pagamento?: string,
    tipo_conta?: string,
    valor_juros?: string,
    valor_desconto?: string,
    valor_acrescimo?: string,
    valor_taxa?: number; // Formato "00.00"

};

export type TCategoFinanceira = {
    id_categoria: number,
    id_grupo: number,
    id_categoria_pai: number,
    tipo_categoria: string,
    desc_categoria: string,
    visivel_dre: string,
    id_contabilizacao: number,
    lixeira: string,
    grupo_financeiro: string,
    categoria_pai: null
};

export type TOrcamento = {
    id_cliente: number;
    nome_cliente: string;
    vendedor_pedido: string;
    vendedor_pedido_id: number;
    desconto_pedido?: string;
    peso_total_nota?: string;
    peso_total_nota_liq?: string;
    frete_pedido?: string;
    valor_baseICMS?: string;
    valor_ICMS?: string;
    valor_baseST?: string;
    valor_ST?: string;
    valor_IPI?: string;
    transportadora_pedido?: string;
    id_transportadora?: number;
    data_pedido: string;
    prazo_orcamento?: any;
    referencia_pedido: string | null;
    obs_pedido?: string;
    obs_interno_pedido?: string;
    status_pedido?: string;
};

export type TOrcamentoResponse = {
        id_ped: number;
        id_pedido: number;
        id_cliente: number;
        nome_cliente: string;
        id_local_retirada: number;
        id_local_cobranca: number;
        vendedor_pedido: string;
        vendedor_pedido_id: number;
        listapreco_produtos: number;
        valor_total_produtos: string;
        desconto_pedido: string;
        desconto_pedido_porc: string;
        peso_total_nota: string | null;
        peso_total_nota_liq: string | null;
        frete_pedido: string;
        valor_total_nota: string | null;
        valor_baseICMS: string | null;
        valor_ICMS: string | null;
        valor_baseST: string | null;
        valor_ST: string | null;
        valor_IPI: string | null;
        condicao_pagamento_id: number;
        condicao_pagamento: number;
        frete_por_pedido: number;
        transportadora_pedido: string | null;
        id_transportadora: number | null;
        data_pedido: string; // Data no formato "yyyy-mm-dd"
        prazo_entrega: string | null;
        referencia_pedido: string | null;
        obs_pedido: string;
        obs_interno_pedido: string | null;
        status_pedido: string;
        contas_pedido: number;
        comissao_pedido: number;
        estoque_pedido: number;
        pdv_emitido: null | string;
        ordemc_emitido: number;
        data_cad_pedido: string; // Data e hora no formato "yyyy-mm-dd HH:mm:ss"
        data_mod_pedido: string; // Data e hora no formato "yyyy-mm-dd HH:mm:ss"
        id_aplicativo: null | number;
        id_pedido_aplicativo: null | number;
        id_almoxarifado: number | null;
        pagamento_com_vhpay: number;
        pagamento_com_conta_integrada: number;
        link_pgto_gerado: number;
        lixeira: string;
        produtos: TProdutoPedido[],
        parcelas: TParcelas[]
};
  