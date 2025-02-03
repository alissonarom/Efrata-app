import { useContext, useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, FlatList } from "react-native";
import { Liquidado, NovoPedidoScreenPorps, TBancoCadastro, TCategoFinanceira, TContaReceber, TOrcamento } from "../../types/index";
import { Button, Card, DataTable, IconButton, TextInput, Snackbar, ActivityIndicator, Switch   } from 'react-native-paper';
import { styles } from "../styles";
import { SafeAreaView } from "react-native";
import DatePicker from '../../components/datePicker'
import React from "react";
import {
    TProduto,
    TProdutoPedido,
    TParcelas,
    TNovoPedido,
    RootStackParamList,
    Status_pedido,
    Estoque_pedido,
    Conta_lancada,
} from "../../types/index";
import { PedidosContext } from '../../utils/PedidoContext';
import { useRoute, RouteProp } from '@react-navigation/native';
// import { dataVendedor, dataClientes } from "../../Mocks/produtoMock";
// utils
import { formatarValor } from "../../utils";
import { headers } from "../../utils";

const NovoPedido: React.FC<NovoPedidoScreenPorps> = () => {
    const [produto, setProduto] = useState<TProduto | null>(null);
    const [arrayProdutos, setArrayProdutos] = useState<TProdutoPedido[]>([]);
    const [quantidadeProdutos, setQuantidadeProdutos] = useState<string>();
    const [descontoProdutos, setDescontoProdutos] = useState<string>('');
    const [totalDescontoProdutos, setTotalDescontoProdutos] = useState(0);
    const [valorUnitario, setValorUnitario] = useState('');
    const [totalProdutos, setTotalProdutos] = useState('')
    const [dataProdutos, setDataProdutos] = useState<TProduto[]>([]);
    const [isSwitchOn, setIsSwitchOn] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filteredData, setFilteredData] = useState<TProduto[]>([]);
    const [isDropdownVisible, setDropdownVisible] = useState(false);

    const onToggleSwitch = () => setIsSwitchOn(!isSwitchOn);

    // route params
    const route = useRoute<RouteProp<RootStackParamList, 'Pedido'>>();
    const { cliente, vendedor } = route.params;

    //pagamento
    const [formaPagamento, setFormaPagamento] = useState('');
    const [pagamentoParcelado, setPagamentoParcelado] = useState<TParcelas[]>([]);

    //obs
    const [observacao, onChangeobservacao] = useState<string>('');
    //prazo
    const [prazo, setPrazo] = useState(new Date());
    const [dataPedido, setdDataPedido] = useState(new Date());
    const [isLoading, setLoading] = useState(false);
    const [isLoadingPedido, setLoadingPedido] = useState(false);
    const [visible, setVisible] = useState(false);
    const pedidosContext = useContext(PedidosContext);
    //conta bancária
    const [contaBancaria, setDataContaBancaria] = useState<TBancoCadastro[]>([]);
    //categorias financeiras
    const [categoFinanceiras, setCategoFinanceiras] = useState<TCategoFinanceira[]>([]);
    const [type, setType] = useState<string>('');

    useEffect(() => {
        getContaBancaria();
        getCategoFinanceiras();
    }, []);

    useEffect(() => {
        setPagamentoParcelado([]);  // Chama a função de atualização de parcelas
    }, [arrayProdutos]);

    useEffect(() => {
            if (pedidosContext) {
              pedidosContext.atualizarPedidos(cliente.id_cliente, vendedor.id_vendedor);
              pedidosContext.atualizarOrcamentos(cliente.id_cliente, vendedor.id_vendedor);
              pedidosContext.getProdutos(setDataProdutos, 'pedido');
            }
        }, []);

    const getContaBancaria = async () => {
        setLoading(true);
        try {
          const response = await fetch('/api/contas-bancarias', {
            method: 'GET',
            headers,
          });
      
          const json = await response.json();
          setDataContaBancaria(json.data);
        } catch (error) {
          console.error('Erro:', error);
        } finally {
          setLoading(false);
        }
        // setDataProdutos(dataProdutoMock);
    };

    const getCategoFinanceiras = async () => {
        setLoading(true);
        try {
          const response = await fetch('/api/categorias-financeiras', {
            method: 'GET',
            headers,
          });
      
          const json = await response.json();
          setCategoFinanceiras(json.data);
        } catch (error) {
          console.error('Erro:', error);
        } finally {
          setLoading(false);
        }
    };

    //clear function
    const clearPainel = () => {
        setArrayProdutos([]);
        setTotalDescontoProdutos(0)
        setFormaPagamento('')
        // setParcelas('')
        setPagamentoParcelado([])
        onChangeobservacao('')
        setPrazo(new Date())
        setLoadingPedido(false);
        setLoading(false);
        setVisible(true);
        setTotalProdutos(''),
        setType('')
    };

//GET--------------
    // const getProdutos = async () => {
    // setLoading(true);
    // try {
    //     const response = await fetch('/api/produtos', {
    //         method: 'GET',
    //         headers,
    //     });

    //     const json = await response.json();
    //     const produtosFiltrados = json.data.filter((produto: { tipo_produto: string, id_categoria: number }) => produto.tipo_produto === "Produto" && (produto.id_categoria === 334412 || produto.id_categoria === 339468));
    //     setDataProdutos(produtosFiltrados);
    // } catch (error) {
    //     console.error('Erro:', error);
    // } finally {
    //     setLoading(false);
    // }
    // };

    // Monta pedido
    const novoPedido = () => {
            return {
              id_cliente: cliente.id_cliente, // ID do cliente 
              nome_cliente: cliente.razao_cliente, // Nome do cliente
              vendedor_pedido: vendedor.razao_vendedor, // Nome do vendedor
              vendedor_pedido_id: vendedor.id_vendedor, // ID do vendedor
              desconto_pedido: String(totalDescontoProdutos), // Valor total do desconto
              peso_total_nota: '0', // Peso total do pedido
              peso_total_nota_liq: '0', // Peso líquido do pedido
              data_pedido: new Date(dataPedido).toISOString().split('T')[0], // Data do pedido
              prazo_entrega: new Date(prazo).toISOString().split('T')[0], // Prazo de entrega (Dias)
              referencia_pedido: null, // Referência do pedido
              obs_pedido: observacao, // Observações do pedido
              obs_interno_pedido: type === 'troca' ? 'Pedido de TROCA':'', // Observação interna do pedido
              status_pedido: (type === 'troca' || (type === 'pedido' && isSwitchOn)) ? Status_pedido["Atendido"] : Status_pedido["Em Aberto"],
              estoque_pedido: Estoque_pedido.Não, // Estoque lançado (Sim/Não)
              contas_pedido: Conta_lancada.Sim, // Contas lançadas (Sim/Não)
              valor_total_produtos: type === 'troca' ? '00.00' : totalProdutos
            };
    };
    
    const novoOrcamento = () => {
        return {
          id_cliente: cliente.id_cliente, // ID do cliente 
          nome_cliente: cliente.razao_cliente, // Nome do cliente
          vendedor_pedido: vendedor.razao_vendedor, // Nome do vendedor
          vendedor_pedido_id: vendedor.id_vendedor, // ID do vendedor
          desconto_pedido: String(totalDescontoProdutos), // Valor total do desconto
          peso_total_nota: '0', // Peso total do pedido
          peso_total_nota_liq: '0', // Peso líquido do pedido
          data_pedido: new Date(dataPedido).toISOString().split('T')[0], // Data do pedido
          prazo_orcamento: new Date(prazo).toISOString().split('T')[0], // Prazo de entrega (Dias)
          referencia_pedido: null, // Referência do pedido
          obs_pedido: observacao, // Observações do pedido
          obs_interno_pedido: '', // Observação interna do pedido
          status_pedido: Status_pedido["Em Aberto"], // Status do pedido
        };
    };

//POST--------------
    // Função para criar o pedido
    const postPedido = async (novoPedido:TNovoPedido) => {
    try {
        const pedidoResponse = await fetch('/api/pedidos', {
            method: 'POST',
            headers,
            body: JSON.stringify(novoPedido),
        });
        if (!pedidoResponse.ok) {
            throw new Error('Erro ao criar o pedido');
        }
        const pedidoData = await pedidoResponse.json();
        return pedidoData.data[0].id_ped; // Retorna o ID do pedido criado
    } catch (error) {
        console.error('Erro ao criar o pedido:', error);
        throw error;
    }
    };

    const postOrcamento = async (novoOrcamento:TOrcamento) => {
        try {
            const pedidoResponse = await fetch('/api/orcamentos', {
                method: 'POST',
                headers,
                body: JSON.stringify(novoOrcamento),
            });
            if (!pedidoResponse.ok) {
                throw new Error('Erro interno ao criar o orçamento');
            }
            const pedidoData = await pedidoResponse.json();
            return pedidoData.data.id_orcamento; // Retorna o ID do orçamento criado
        } catch (error) {
            console.error('Erro ao criar o orçamento:', error);
            throw error;
        }
    };

    // Função para adicionar os produtos ao pedido
    const postProdutosPedido = async (idPedido:number, produtos:TProdutoPedido[]) => {
            try {
                    const response = await fetch(`/api/pedidos/${idPedido}/produtos`, {
                        method: 'POST',
                        headers,
                        body: JSON.stringify(produtos),
                    });
                if (!response.ok) {
                    console.error('Erro: gravar produtos no pedido');
                    throw new Error('Erro ao cadastrar os produtos no pedido');
                }
                const produtosData = await response.json(); // Espera a resolução da Promise
                
            } catch (error) {
                console.error('Erro ao cadastrar os produtos no pedido:', error);
                throw error;
           
        };
    };

    // Função para adicionar os produtos ao pedido
    const postProdutosOrcamento = async (idPedido:number, produtos:TProdutoPedido[]) => {
        try {
            const response = await fetch(`/api/orcamentos/${idPedido}/produtos`, {
                method: 'POST',
                headers,
                body: JSON.stringify(produtos),
            });
                if (!response.ok) {
                    console.error('Erro: gravar produtos no orcamento');
                    throw new Error('Erro ao cadastrar os produtos no orcamento');
                }
                const produtosData = await response.json(); // Espera a resolução da Promise
                
        } catch (error) {
            console.error('Erro ao cadastrar os produtos no orcamento:', error);
            throw error;

        };
    };
    
    // Monta produtos do pedido
    const adicionarProduto = () => {
        if (produto && quantidadeProdutos) {
          const novoProduto: TProdutoPedido = {
              id_produto: produto.id_produto,
              desc_produto: produto.desc_produto,
              qtde_produto: quantidadeProdutos,
              valor_unit_produto: valorUnitario,
              valor_custo_produto: produto.valor_custo_produto,
              valor_total_produto: (parseFloat(valorUnitario) * parseFloat(quantidadeProdutos)).toFixed(2),
              desconto_produto: descontoProdutos,
              valor_desconto: ""
          };
          setTotalProdutos(String(parseFloat(totalProdutos || "0") + (parseFloat(quantidadeProdutos || "0") * parseFloat(valorUnitario || "0"))));
          setTotalDescontoProdutos(totalDescontoProdutos + (descontoProdutos ? parseFloat(descontoProdutos): 0));
          setArrayProdutos((prevArray) => [...prevArray, novoProduto]);
        }
        setProduto(null); // Reset Picker
        setQuantidadeProdutos('');
        setDescontoProdutos('');
        setValorUnitario('');
        setSearchText('');
    };

    //formata Nome vendedor
    function formatarNomeCliente(nomeCliente:string) {
        const nomes = nomeCliente.split(' ');
        return nomes.length > 1 ? `${nomes[0]} ${nomes[nomes.length - 1]}` : nomes[0];
    };

    const criarContaReceber:any = async (idPedido:string) => {
        setLoading(true);
        const despesa: TContaReceber = {
            nome_conta : `Venda de ${formatarNomeCliente(vendedor.razao_vendedor)}`,
            id_categoria : categoFinanceiras[0].id_categoria,
            categoria_rec :  categoFinanceiras[0].desc_categoria,
            id_banco : contaBancaria[0].id_banco_cad,
            id_cliente : cliente.id_cliente,
            nome_cliente : cliente.razao_cliente,
            vencimento_rec : new Date(prazo).toISOString().split('T')[0],
            valor_rec : type === 'troca' ? '00.00' : (parseFloat(totalProdutos)-totalDescontoProdutos).toFixed(2),
            valor_pago : "00.00",
            data_emissao : new Date().toISOString().split('T')[0],
            n_documento_rec : idPedido,
            observacoes_rec : type === 'troca' ? 'Conta a receber de TROCA' : "",
            id_centro_custos : 0,
            centro_custos_rec : "",
            liquidado_rec : Liquidado.Não,
            data_pagamento : null,
            obs_pagamento : null,
            forma_pagamento : formaPagamento,
            tipo_conta : '',
            valor_juros : "00.00",
            valor_desconto : String(totalDescontoProdutos)
        };
        try {
            const ContaReceberResponse = await fetch(`/api/contas-receber`, {
                method: 'POST',
                headers,
                body: JSON.stringify(despesa),
            });
            if (!ContaReceberResponse.ok) {
                throw new Error('Erro ao cadastrar Conta Receber');
            }
            const ContaReceber = await ContaReceberResponse.json();
            return ContaReceber.data.id_conta_rec; // Retorna o ID da receita criada
    
        } catch (error) {
            console.error('Erro ao criar contas a receber:', error);
        }
    };

    // Função principal para criar o pedido, cadastrar produtos e parcelas
    const criaNovoPedido = async () => {
    setLoading(true);
    setLoadingPedido(true);
    try {
        // Cria o pedido
        const idPedido = await postPedido(novoPedido());
        await criarContaReceber(idPedido);

        // Cadastra os produtos no pedido
        const produtos = arrayProdutos.map((produto) => ({
            id_produto: produto.id_produto,
            desc_produto: produto.desc_produto,
            qtde_produto: parseFloat(produto.qtde_produto).toFixed(4),
            valor_unit_produto: type === 'troca' ? '00.00' : parseFloat(produto.valor_unit_produto).toFixed(4),
            ipi_produto: produto.ipi_produto ? parseFloat(produto.ipi_produto).toFixed(2) : undefined,
            icms_produto: produto.icms_produto ? parseFloat(produto.icms_produto).toFixed(2) : undefined,
            valor_custo_produto: type === 'troca' ? '00.00' : produto.valor_custo_produto ? parseFloat(produto.valor_custo_produto).toFixed(4) : undefined,
            peso_produto: produto.peso_produto ? parseFloat(produto.peso_produto).toFixed(2) : undefined,
            peso_liq_produto: produto.peso_liq_produto ? parseFloat(produto.peso_liq_produto).toFixed(2) : undefined,
        }));
        await postProdutosPedido(idPedido, produtos);

        // Atualiza pedidos, se necessário
        if (pedidosContext) {
            pedidosContext.atualizarPedidos(cliente.id_cliente, vendedor.id_vendedor);
        }

    } catch (error) {
        console.error('Erro ao criar o pedido ou cadastrar os produtos e parcelas:', error);
    } finally {
        setLoading(false);
        setLoadingPedido(false);
        clearPainel();
    }
    };

    const criaNovoOrcamento = async () => {
        setLoading(true);
        setLoadingPedido(true);
        try {
            // Cria o pedido
            const idPedido = await postOrcamento(novoOrcamento());
            // await criarContaReceber(String(idPedido));
            
            // Cadastra os produtos no pedido
            const produtos = arrayProdutos.map((produto) => ({
                id_produto: produto.id_produto,
                desc_produto: produto.desc_produto,
                qtde_produto: parseFloat(produto.qtde_produto).toFixed(4),
                valor_unit_produto: parseFloat(produto.valor_unit_produto).toFixed(4),
                desconto_produto: produto.desconto_produto ? parseFloat(produto.desconto_produto).toFixed(2) : undefined,
                ipi_produto: produto.ipi_produto ? parseFloat(produto.ipi_produto).toFixed(2) : undefined,
                icms_produto: produto.icms_produto ? parseFloat(produto.icms_produto).toFixed(2) : undefined,
                valor_custo_produto: produto.valor_custo_produto ? parseFloat(produto.valor_custo_produto).toFixed(4) : undefined,
                peso_produto: produto.peso_produto ? parseFloat(produto.peso_produto).toFixed(2) : undefined,
                peso_liq_produto: produto.peso_liq_produto ? parseFloat(produto.peso_liq_produto).toFixed(2) : undefined,
            }));
            await postProdutosOrcamento(idPedido, produtos);
    
            // Cadastra as parcelas no pedido
            const parcelas = pagamentoParcelado.map((parcela) => ({
                data_parcela: parcela.data_parcela,
                valor_parcela: parcela.valor_parcela,
                forma_pagamento: parcela.forma_pagamento,
                observacoes_parcela: parcela.observacoes_parcela,
                conta_liquidada: parcela.conta_liquidada
            }));
            // await postParcelas(idPedido, parcelas);
    
            // Atualiza pedidos, se necessário
            
        } catch (error) {
            console.error('Erro ao criar o orçamento ou cadastrar os produtos e parcelas:', error);
        } finally {
            setLoading(false);
            setLoadingPedido(false);
            clearPainel();
            if (pedidosContext) {
                pedidosContext.atualizarOrcamentos(cliente.id_cliente, vendedor.id_vendedor);
            }
        }
    };

    const removerProduto = (index: number) => {
        setArrayProdutos((prevArray) => {
            // Obter o produto que será removido
            const produtoRemovido = prevArray[index];
            
            // Atualizar o total de produtos removendo o valor do produto removido
            const valorRemovido = parseFloat(produtoRemovido.valor_unit_produto) * parseInt(produtoRemovido.qtde_produto);
            setTotalProdutos((parseFloat(totalProdutos) - valorRemovido).toFixed(2));
            
            // Atualizar o total de desconto removendo o desconto do produto removido
            const descontoRemovido = produtoRemovido.desconto_produto ? parseFloat(produtoRemovido.desconto_produto) : 0;
            setTotalDescontoProdutos(totalDescontoProdutos - descontoRemovido);

            // Retornar o novo array de produtos sem o produto removido
            return prevArray.filter((_, i) => i !== index);
        });
    };

    const handleChangeDesconto = (texto: any) => {
        const valorFormatado = formatarValor(texto);
        setDescontoProdutos(valorFormatado)
    };
    
    const handleChangeValorUnitario = (texto: any) => {
        const valorFormatado = formatarValor(texto);
        setValorUnitario(valorFormatado)
    };

    const handleChangeQuantidade = (texto: any) => {
        // const valorFormatado = formatarValor(texto);
        setQuantidadeProdutos(texto)
    };

    const handlePostFunction = () => {
        if (type === 'pedido' || 'troca'){
            criaNovoPedido();
        }else if(type === 'orcamento'){
            criaNovoOrcamento();
        };
    };

    const handleSearch = (text: string) => {
        setSearchText(text);
        // Filtra os dados conforme o texto digitado
        if (text === '') {
          setFilteredData([]); // Se o campo de busca estiver vazio, não exibe resultados
        } else {
          setDropdownVisible(true);
        const filtered = dataProdutos.filter(item =>
          item.desc_produto.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredData(filtered);
      }
    };

    const handleSelectProduto = (produto: TProduto) => {
            setProduto(produto); // Seleciona o cliente
            setSearchText(produto.desc_produto); // Atualiza o campo de pesquisa com o nome do cliente
            setFilteredData([]); // Restaura os dados filtrados para mostrar todos novamente
            setDropdownVisible(false);
            setValorUnitario(Number(produto.valor_produto).toFixed(2))
        };
      
    return (
        <SafeAreaView style={styles.container}>
            <View style={{ backgroundColor: "#145B91", display: "flex", flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 5 }}>
                <View>
                    <Text style={{ fontWeight: '600', color: 'white' }}>Cliente</Text>
                    <Text numberOfLines={1} ellipsizeMode="tail" style={{ color: 'white', maxWidth: 130 }}>{cliente.razao_cliente}</Text>
                </View>
                <View>
                    <Text style={{ fontWeight: '600', color: 'white' }}>Vendedor</Text>
                    {/* <Text numberOfLines={1} ellipsizeMode="tail" style={{ color: 'white', maxWidth: 130 }}>{vendedor.razao_vendedor}</Text> */}
                    <Text numberOfLines={1} ellipsizeMode="tail" style={{ color: 'white', maxWidth: 130 }}>{vendedor.razao_vendedor}</Text>
                </View>
            </View>
            {isLoading ? (
            <View>
                <ActivityIndicator size={'large'} color="#145B91"/>
                {isLoadingPedido ? (
                <Text style={[styles.h3, {alignSelf:'center'}]}>Criando {type} </Text>
                ): null
            }
            </View>
            ) : (
                <ScrollView style={styles.scrollView}>
                    {/* Tipo pedido */}
                    <Card mode="elevated" style={styles.cardPanel}>
                        <View style={[styles.cardPanelContent, { justifyContent: 'space-between' }]}>
                            <Text style={styles.h3}>Selecione o tipo  </Text>
                            <Text style={{ fontSize: 10, alignSelf: 'flex-start', color: type ? 'green' : 'red' }}>obrigatório</Text>
                        </View>
                        <View style={[styles.cardPanelContent, {justifyContent: 'space-around', flexDirection: 'column'}]}>
                            <View style={{ display: "flex", flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                                <Button
                                    style={{ marginVertical: 5, borderColor: '#145B91', flexGrow: 1 }}
                                    labelStyle={{ fontSize: 15, fontWeight: "600" }}
                                    buttonColor={type === 'pedido' ? '#145B91' : 'white'}
                                    textColor={type === 'pedido' ? 'white' : '#145B91'}
                                    mode={type === 'pedido' ? "contained" : 'outlined'}
                                    onPress={()=> setType('pedido')}
                                >       
                                    Criar Pedido
                                </Button>
                                {type === 'pedido' ?
                                <><Text style={{maxWidth: 60, textAlign: 'center', marginRight: 10, marginLeft: 10, lineHeight: 15, color: 'rgb(20, 91, 145)'}}>Pedido atendido</Text><Switch color="rgb(20, 91, 145)" value={isSwitchOn} onValueChange={onToggleSwitch} /></>
                                : null
                                }
                            </View>
                            <Button
                                style={{ marginVertical: 5, borderColor: '#145B91' }}
                                labelStyle={{ fontSize: 15, fontWeight: "600" }}
                                buttonColor={type === 'orcamento' ? '#145B91' : 'white'}
                                textColor={type === 'orcamento' ? 'white' : '#145B91'}
                                mode={type === 'orcamento' ? "contained" : 'outlined'}
                                onPress={() => { setType('orcamento'); setIsSwitchOn(false); }}
                            >       
                                Criar Orçamento
                            </Button>
                            <Button
                                style={{ marginVertical: 5, borderColor: '#145B91' }}
                                labelStyle={{ fontSize: 15, fontWeight: "600" }}
                                buttonColor={type === 'troca' ? '#145B91' : 'white'}
                                textColor={type === 'troca' ? 'white' : '#145B91'}
                                mode={type === 'troca' ? "contained" : 'outlined'}
                                onPress={() => { setType('troca'); setIsSwitchOn(false); }}
                            >       
                                Troca
                            </Button>
                        </View>
                    </Card>
                    {/* Produtos */}
                    <Card mode="elevated" style={[styles.cardPanel, {overflow: 'visible'}]}>
                        <View style={[styles.cardPanelContent, { justifyContent: 'space-between' }]}>
                            <Text style={styles.h3}>Produtos  </Text>
                            <Text style={{ fontSize: 10, alignSelf: 'flex-start', color: arrayProdutos.length ? 'green' : 'red' }}>obrigatório</Text>
                        </View>
                        <View style={[styles.cardPanelContent, {overflow: 'visible'}]}>
                            <View style={{flex: 1}}>
                                <View style={[styles.cardPanelContent, {overflow: 'visible'}]}>
                                    <View style={{width:100, flexGrow: 1, zIndex: 10000, borderWidth: 0, flex: 1, overflow: 'visible'}}>
                                        {/* Barra de Pesquisa */}
                                        <TextInput
                                            outlineColor='#145B91'
                                            activeOutlineColor='#145B91'
                                            mode="outlined"
                                            style={[styles.input, {marginRight: 0}]}
                                            label="Pesquisar produtos"
                                            value={searchText}
                                            onChangeText={handleSearch}
                                            onFocus={() => setDropdownVisible(true)}
                                            disabled={type === ''}
                                        />
                                    </View>
                                    <Text style={[styles.h4, {marginHorizontal: 4,  display: 'flex',  color:'#145B91', alignItems: 'center'}]}>{produto?.unidade_produto??'un'}  </Text>
                                    <TextInput
                                        outlineColor='#145B91'
                                        activeOutlineColor='#145B91'
                                        mode="outlined"
                                        label="Qtde"
                                        style={{ marginHorizontal: 5, width: 60, backgroundColor: 'white', fontSize: 14, fontFamily: 'Roboto' }}
                                        value={quantidadeProdutos}
                                        keyboardType="numeric"
                                        onChangeText={handleChangeQuantidade}
                                        disabled={type === ''}/>
                                </View>
                                <View style={[styles.cardPanelContent, {overflow: 'visible'}]}>
                                    <TextInput
                                        outlineColor='#145B91'
                                        activeOutlineColor='#145B91'
                                        style={{ marginTop: 6, marginHorizontal: 2, flex: 1, backgroundColor: 'white', fontSize: 14, fontFamily: 'Roboto' }}
                                        value={descontoProdutos}
                                        onChangeText={handleChangeDesconto}
                                        mode="outlined"
                                        label="Desconto"
                                        keyboardType="numeric"
                                        disabled={type === ''}/>
                                    <TextInput
                                        outlineColor='#145B91'
                                        activeOutlineColor='#145B91'
                                        style={{ marginHorizontal: 2, marginTop: 6, flex: 1, backgroundColor: 'white', fontSize: 14, fontFamily: 'Roboto' }}
                                        value={valorUnitario}
                                        onChangeText={handleChangeValorUnitario}
                                        mode="outlined"
                                        label="Valor unitário"
                                        keyboardType="numeric"
                                        disabled={type === ''}/>
                                </View>
                            </View>
                            <IconButton
                                style={{ width: 25, height: '100%' }}
                                icon="plus-circle"
                                iconColor='green'
                                size={25}
                                onPress={() => adicionarProduto()}
                                disabled={(produto && quantidadeProdutos) ? false : true}
                            />
                        </View>
                        {arrayProdutos.length ?
                        <View style={styles.viewCardPedido}>
                                    <DataTable>
                                        <DataTable.Header>
                                            <DataTable.Title style={{ paddingBottom: 0, flexGrow: 2 }}>Produtos</DataTable.Title>
                                            <DataTable.Title numeric style={{ justifyContent: 'center', flexGrow: 1 }}>Qtd</DataTable.Title>
                                            <DataTable.Title numeric style={{ justifyContent: 'center', flexGrow: 1 }}>V. unit.</DataTable.Title>
                                            <DataTable.Title numeric style={{ justifyContent: 'center', flexGrow: 1 }}>Desc.</DataTable.Title>
                                            <DataTable.Title numeric style={{ justifyContent: 'center', flexGrow: 1 }}>Total</DataTable.Title>
                                        </DataTable.Header>
                                        {arrayProdutos.map((item, index) => (
                                            <View style={{ display: "flex", justifyContent: "space-between", flexDirection: "row", }}>
                                                <DataTable.Row key={index} style={{paddingHorizontal: 0, flexGrow: 1}}>
                                                    <DataTable.Cell style={{ flexGrow: 2 }} textStyle={{ fontSize: 11 }}>{item.desc_produto}</DataTable.Cell>
                                                    <DataTable.Cell style={{ justifyContent: 'center', flexGrow: 1 }} textStyle={{ fontSize: 11 }}>{Number(item.qtde_produto)}</DataTable.Cell>
                                                    <DataTable.Cell style={{ justifyContent: 'center', flexGrow: 1 }} textStyle={{ fontSize: 11 }}>{`R$${Number(item.valor_unit_produto)}`}</DataTable.Cell>
                                                    <DataTable.Cell style={{ justifyContent: 'center', flexGrow: 1 }} textStyle={{ fontSize: 11 }}>{`R$${Number(item.desconto_produto)}`}</DataTable.Cell>
                                                    <DataTable.Cell style={{ justifyContent: 'center', flexGrow: 1 }} textStyle={{ fontSize: 11 }}>{`R$${(Number(item.valor_total_produto) - Number(item.desconto_produto)).toFixed(2)}`}</DataTable.Cell>
                                                </DataTable.Row>
                                                <IconButton
                                                    icon="delete"
                                                    iconColor="red"
                                                    size={25}
                                                    onPress={() => removerProduto(index)}
                                                    style={{marginLeft: 0, marginRight: 0, width: 15, height: 41}}
                                                />
                                            </View>
                                        ))}
                                    </DataTable>
                        </View> : null}
                    </Card>
                    {isDropdownVisible && (
                        <View style={styles.dropdownContainer}>
                        <FlatList
                            data={filteredData}
                            keyExtractor={(item) => item.id_produto.toString()}
                            renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => handleSelectProduto(item)}>
                                <Text style={styles.dropdownItem}>
                                {item.desc_produto}
                                </Text>
                            </TouchableOpacity>
                            )}
                        />
                        </View>
                    )}
                    {/* Prazo */}
                    <Card mode="elevated" style={styles.cardPanel}>
                        <Text style={styles.h3}>Prazos</Text>
                        <View style={styles.cardPanelContent}>
                            <View style={styles.cardInputs}>
                                <Text>Data do pedido</Text>
                                {<DatePicker date={dataPedido} setDate={setdDataPedido} />}
                            </View>
                            <View style={styles.cardInputs}>
                                <Text>Prazo de entrega</Text>
                                {<DatePicker date={prazo} setDate={setPrazo} />}
                            </View>
                        </View>
                    </Card>
                    {/* Observação */}
                    <Card mode="elevated" style={styles.cardPanel}>
                            <Text style={styles.h3}>Observação</Text>
                            <View style={styles.cardPanelContent}>
                                <TextInput
                                    outlineColor='#145B91'
                                    activeOutlineColor='#145B91'
                                    mode="outlined"
                                    label="Detalhes do pedido"
                                    numberOfLines={2}
                                    style={{ color: "grey", backgroundColor: '#F7F8FA', flexGrow: 1, marginTop: 10 }}
                                    onChangeText={onChangeobservacao}
                                    value={observacao}
                                    multiline />
                            </View>
                    </Card>
                </ScrollView>
                )}
                <View style={styles.footer}>
                    <View style={styles.subFooter}>
                        <Text style={styles.textFooter}>Total em Produto</Text>
                        <Text style={styles.textFooter}>R$ {totalProdutos ? totalProdutos : 0}</Text>
                    </View>
                    <View style={styles.subFooter}>
                        <Text style={styles.textFooter}>Desconto</Text>
                        <Text style={{ color: '#ff9090', fontWeight: "600" }}>-R$ {totalDescontoProdutos ? totalDescontoProdutos : 0}</Text>
                    </View>
                    <View style={[styles.subFooter, { marginBottom: 10 }]}>
                        <Text style={[styles.textFooter, { fontSize: 21 }]}>Total</Text>
                        <Text style={[styles.textFooter, { fontSize: 21 }]}>R$ {totalProdutos ? (parseInt(totalProdutos) - totalDescontoProdutos) : 0}</Text>
                    </View>
                    <Button
                        style={{ marginHorizontal: 60 }}
                        disabled={arrayProdutos.length ? false : true}
                        labelStyle={{ fontSize: 15, fontWeight: "600", color: arrayProdutos.length ? '#145B91' : 'darkgrey'  }}
                        buttonColor='white'
                        textColor="#145B91"
                        mode="contained"
                        onPress={handlePostFunction}
                    >
                        Criar {type ? type : 'Pedido'}
                    </Button>
                </View>
                <Snackbar
                    style={{backgroundColor: 'green'}}
                    visible={visible}
                    onDismiss={()=>setVisible(false)}
                    duration={1000}
                    >
                    <Text style={{ color: 'white'}}>{type} criado com sucesso.</Text>
                </Snackbar>
        </SafeAreaView>
    );
  };

  export default NovoPedido;
  