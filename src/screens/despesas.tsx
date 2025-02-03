import React, { useEffect, useState, useContext } from "react";
import { View, Text, ScrollView, TouchableOpacity, FlatList } from "react-native";
import { TDespesas, DespesasScreenPorps, TBancoCadastro, RootStackParamList, TCentrosCusto, TProduto, TProdutoPedido, TEstoque } from "../../src/types/index";
import { Button, Card, TextInput, Snackbar, ActivityIndicator, Checkbox, DataTable, IconButton  } from 'react-native-paper';
import { styles } from "./styles"
import { SafeAreaView } from "react-native";
import DatePicker from '../components/datePicker'
import {Picker} from '@react-native-picker/picker';
import { useRoute, RouteProp } from '@react-navigation/native';
// utils
import { truncateText, dataFormaPagamento, formatDate, formatarValor, headers } from "../utils";
import { PedidosContext } from "../utils/PedidoContext";

export default function Despesas({navigation}:DespesasScreenPorps) {
    const pedidosContext = useContext(PedidosContext);
    const [checked, setChecked] = useState(false);
    const [checkedProduto, setCheckedProduto] = useState(false);
    const [visible, setVisible] = useState(false);
    
    // Produtos
    const [produto, setProduto] = useState<TProduto | null>(null);
    const [arrayProdutos, setArrayProdutos] = useState<TProdutoPedido[]>([]);
    const [quantidadeProdutos, setQuantidadeProdutos] = useState<string>();
    const [descontoProdutos, setDescontoProdutos] = useState<string>('');
    const [totalProdutos, setTotalProdutos] = useState('');
    const [totalDescontoProdutos, setTotalDescontoProdutos] = useState(0);
    const [dataProdutos, setDataProdutos] = useState<TProduto[]>([]);
    const [searchText, setSearchText] = useState('');
    const [filteredData, setFilteredData] = useState<TProduto[]>([]);
    const [isDropdownVisible, setDropdownVisible] = useState(false);
    // centros de custo
    const [centroCusto, setCentroCusto] = useState<TCentrosCusto>();
    //Dados pagamento
    const [nomeDespesa, setNomeDespesa] = useState('');
    //conta bancaria
    const [dataContaBancaria, setDataContaBancaria] = useState<TBancoCadastro[]>([]);
    const [contaBancaria, setContaBancaria] = useState<TBancoCadastro | null>(null);
    //Forma pagamento
    const [formaPagamento, setFormaPagamento] = useState(null);
    //data vencimento
    const [vencimento, setVencimento] = useState(new Date());
    //data emissão
    const [dataEmissao, setDataEmissao] = useState(new Date());
    //fornecedor
    const [fornecedor, setFornecedor] = useState('');
    //data pagamento
    const [dataPagamento, setDataPagamento] = useState(new Date());
    //valor baixa
    const [valorBaixa, setValorBaixa] = useState('');
    //desconto
    const [desconto, setDesconto] = useState('');
    //juros/multa
    const [jurosMulta, setJurosMulta] = useState('');
    //taxa
    const [taxa, setTaxa] = useState('');
    //observação
    const [observacao, onChangeobservacao] = useState<string>('');
    
    //route params
    const route = useRoute<RouteProp<RootStackParamList, 'Pedido'>>();
    const { vendedor } = route.params;
    //loading
    const [isLoading, setLoading] = useState(false);

    useEffect(() => {
        getContaBancaria();
        pedidosContext?.atualizarCentroCusto();
        pedidosContext?.getProdutos(setDataProdutos, 'despesa');
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
    };
    const handleChangeTextJurosMulta = (texto: any) => {
        const valorFormatado = formatarValor(texto);
        setJurosMulta(valorFormatado)
    };
    const handleChangeTextDesconto = (texto: any) => {
        const valorFormatado = formatarValor(texto);
        setDesconto(valorFormatado)
    };
    const handleChangeQuantidade = (texto: any) => {
        setQuantidadeProdutos(texto)
    };
    const handleChangeTextTaxa = (texto: any) => {
        const valorFormatado = formatarValor(texto);
        setTaxa(valorFormatado)
    };
    const handleChangeTextValor = (texto: any) => {
        const valorFormatado = formatarValor(texto);
        setValorBaixa(valorFormatado)
    };
    const criaNovaDespesa = async () => {
    setLoading(true);
    const despesa: TDespesas = {
        nome_conta: nomeDespesa,
        id_banco: contaBancaria ? contaBancaria.id_banco_cad : 0,
        vencimento_pag: formatDate(vencimento), // Formato "YYYY-MM-DD"
        valor_pag: parseFloat(valorBaixa), // Formato "00.00"
        valor_pago: (parseFloat(formatarValor(valorBaixa))
        - parseFloat(formatarValor(desconto))
        + parseFloat(formatarValor(taxa))
        + parseFloat(formatarValor(jurosMulta))
        || 0), // Formato "00.00"
        nome_fornecedor: fornecedor,
        data_emissao: formatDate(dataEmissao), // Corrigido para evitar caracteres especiais
        observacoes_pag: observacao,
        liquidado_pag: (checked || checkedProduto) ? 'Sim' : 'Nao', // Corrigido "Não" para "Nao" sem acento
        data_pagamento: formatDate(dataPagamento), // Formato "YYYY-MM-DD"
        forma_pagamento: formaPagamento, // Ex: "Cartão"
        valor_juros: parseFloat(jurosMulta), // Formato "00.00"
        valor_taxa: parseFloat(String(taxa)), // Formato "00.00"
        valor_desconto: parseFloat(desconto),
        id_centro_custos: centroCusto?.id_centro_custos,
		centro_custos_pag: centroCusto?.desc_centro_custos,
        n_documento_pag: `${vendedor.id_vendedor}`,
        obs_pagamento: `Despesa de ${vendedor.razao_vendedor}`
    };
    
    try {
        const despesaResponse = await fetch(`/api/contas-pagar`, {
            method: 'POST',
            body: JSON.stringify(despesa),
            headers
        });
        if (!despesaResponse.ok) {
            throw new Error('Erro ao cadastrar despesas');
        }
        const data = await despesaResponse.json();
        console.log('conta pagar', data.data.id_conta_pag)

        setVisible(true);
        lancarEstoque(data.data.id_conta_pag)

    } catch (error) {
        console.error('Erro ao criar contas a pagar:', error);
    } finally {
        setTimeout(() => {
            navigation.navigate('Home', { vendedor: vendedor });
        }, 2000);
    }
    };
    const lancarEstoque = async (id_conta_rec:number) => {
    
        try {
            for (const item of arrayProdutos) {
                const estoque: TEstoque = {
                    id_produto: item.id_produto,
                    tipo_estoque: "Entrada",
                    qtde_estoque: item.qtde_produto, // Certifique-se de converter para número, se necessário
                    obs_estoque: observacao+` Estoque lançado com a despesa ${id_conta_rec}`,
                    identificacao: `Ped_${id_conta_rec}`,
                };
    
                const estoqueResponse = await fetch(`/api/produtos/${item.id_produto}/estoque`, {
                    method: 'POST',
                    body: JSON.stringify(estoque),
                    headers,
                });
    
                if (!estoqueResponse.ok) {
                    throw new Error(`Erro ao cadastrar o estoque do produto ${item.desc_produto}`);
                }
                const data = await estoqueResponse.json();
                console.log('Estoque lançado', data.data)
            }
    
        } catch (error) {
            console.error('Erro ao lançar estoque:', error);
    
        };
    };
    const adicionarProduto = () => {
            if (produto && quantidadeProdutos) {
              const novoProduto: TProdutoPedido = {
                  id_produto: produto.id_produto,
                  desc_produto: produto.desc_produto,
                  qtde_produto: quantidadeProdutos,
                  valor_unit_produto: produto.valor_produto,
                  valor_custo_produto: produto.valor_custo_produto,
                  valor_total_produto: (parseInt(produto.valor_produto) * parseInt(quantidadeProdutos)).toFixed(2),
                  desconto_produto: descontoProdutos,
                  valor_desconto: ""
              };
              setTotalProdutos(String(parseFloat(totalProdutos || "0") + (parseFloat(quantidadeProdutos || "0") * parseFloat(produto.valor_produto || "0"))));
                setTotalDescontoProdutos(totalDescontoProdutos + (descontoProdutos ? parseFloat(descontoProdutos): 0));
                setArrayProdutos((prevArray) => [...prevArray, novoProduto]);
            }
            setProduto(null); // Reset Picker
            setQuantidadeProdutos('');
            setDescontoProdutos('');
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
    function ckedProduto() {
        checkedProduto ?
        [setCheckedProduto(!checkedProduto), setArrayProdutos([])] :
        setCheckedProduto(!checkedProduto)
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
    const handleSelectClient = (produto: TProduto) => {
        setProduto(produto); // Seleciona o cliente
        setSearchText(produto.desc_produto); // Atualiza o campo de pesquisa com o nome do cliente
        setFilteredData([]); // Restaura os dados filtrados para mostrar todos novamente
        setDropdownVisible(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            {isLoading ? (
            <View>
                <ActivityIndicator size={'large'} color="#145B91"/>
            </View>
            ) : (
                <ScrollView style={styles.scrollView}>
                        {/* Dados do pagamento */}
                    <Card mode="elevated" style={styles.cardPanel}>
                        <View style={[styles.cardPanelContent, {marginBottom: 10, alignItems: 'center'}]}>
                        <Checkbox
                            color='#145B91'
                            status={checkedProduto ? 'checked' : 'unchecked'}
                            onPress={() => {
                              ckedProduto();
                            }}
                        />
                        <Text>Adicionar produtos</Text>
                        </View>
                        { checkedProduto ?
                        <View style={[styles.cardPanel, {padding:0, overflow: 'visible'}]}>
                            <View style={[styles.cardPanelContent, { justifyContent: 'space-between', marginLeft: 5 }]}>
                                <Text>Produtos</Text>
                                <Text style={{ fontSize: 10, alignSelf: 'flex-start', color: arrayProdutos.length ? 'green' : 'red' }}>obrigatório</Text>
                            </View>
                            <View style={[styles.cardPanelContent,{maxHeight: 56}]}>
                                <View style={{zIndex: 10000, borderWidth: 0, flex: 1}}>
                                    {/* Barra de Pesquisa */}
                                    <TextInput
                                      outlineColor='#145B91'
                                      activeOutlineColor='#145B91'
                                      mode="outlined"
                                      style={styles.input}
                                      label="Pesquisar produtos"
                                      value={searchText}
                                      onChangeText={handleSearch}
                                      onFocus={() => setDropdownVisible(true)}
                                    />
                                </View>
                                <TextInput
                                    outlineColor='#145B91'
                                    activeOutlineColor='#145B91'
                                    mode="outlined"
                                    label="Qtde"
                                    style={{ marginHorizontal: 5, width: 60, backgroundColor: 'white', fontSize: 14, fontFamily: 'Roboto' }}
                                    value={quantidadeProdutos}
                                    keyboardType="numeric"
                                    onChangeText={handleChangeQuantidade}/>
                                <IconButton
                                    style={{ width: 40, alignSelf: 'center' }}
                                    icon="plus-circle"
                                    iconColor='green'
                                    size={40}
                                    onPress={() => adicionarProduto()}
                                    disabled={(produto && quantidadeProdutos) ? false : true} />
                            </View>
                            {arrayProdutos.length ?
                                <View style={[styles.viewCardPedido, {paddingVertical:0, paddingLeft:10, paddingRight:0}]}>
                                <DataTable>
                                    <DataTable.Header>
                                        <DataTable.Title style={{ paddingBottom: 0, paddingTop: 10, flexGrow:1, paddingRight: 45 }}>Produtos</DataTable.Title>
                                        <DataTable.Title numeric style={{ paddingBottom: 0, paddingTop: 10, flexGrow:2, paddingRight: 45 }}>Qtd</DataTable.Title>
                                        {/* <DataTable.Title numeric style={{ justifyContent: 'center', maxWidth: 40 }}>V. unit.</DataTable.Title>
                                        <DataTable.Title numeric style={{ justifyContent: 'center', maxWidth: 35 }}>Desc.</DataTable.Title>
                                        <DataTable.Title numeric style={{ justifyContent: 'center', maxWidth: 50 }}>Total</DataTable.Title> */}
                                    </DataTable.Header>
                                    {arrayProdutos.map((item, index) => (
                                        <View style={{ display: "flex", justifyContent: "space-between", flexDirection: "row", alignItems:'center', borderBottomColor:'rgba(20, 91, 145, 0.5)', borderBottomWidth: 1}}>
                                            <DataTable.Row key={index} style={{paddingHorizontal: 0, flexGrow: 1}}>
                                                <DataTable.Cell style={{ width: 90 }} textStyle={{ fontSize: 11 }}>{item.desc_produto}</DataTable.Cell>
                                                <DataTable.Cell style={{ justifyContent: 'center', maxWidth: 30 }} textStyle={{ fontSize: 11 }}>{Number(item.qtde_produto)}</DataTable.Cell>
                                                {/* <DataTable.Cell style={{ justifyContent: 'center', maxWidth: 40 }} textStyle={{ fontSize: 11 }}>{`R$${Number(item.valor_unit_produto)}`}</DataTable.Cell>
                                                <DataTable.Cell style={{ justifyContent: 'center', maxWidth: 35 }} textStyle={{ fontSize: 11 }}>{`R$${Number(item.desconto_produto)}`}</DataTable.Cell>
                                                <DataTable.Cell style={{ justifyContent: 'center', maxWidth: 50 }} textStyle={{ fontSize: 11 }}>{`R$${Number(item.valor_total_produto) - Number(item.desconto_produto)}`}</DataTable.Cell> */}
                                            </DataTable.Row>
                                            <IconButton
                                                icon="delete"
                                                iconColor="red"
                                                size={25}
                                                onPress={() => removerProduto(index)}
                                                style={{margin: 0}}
                                            />
                                        </View>
                                    ))}
                                </DataTable>
                                </View> : null}
                        </View> : null}
                        {/* Dropdown Contêiner */}
                        {isDropdownVisible && (
                            <View style={styles.dropdownContainer}>
                              <FlatList
                                data={filteredData}
                                keyExtractor={(item) => item.id_produto.toString()}
                                renderItem={({ item }) => (
                                  <TouchableOpacity onPress={() => handleSelectClient(item)}>
                                    <Text style={styles.dropdownItem}>
                                      {item.desc_produto}
                                    </Text>
                                  </TouchableOpacity>
                                )}
                              />
                            </View>
                        )}
                        {/*Nome da despesa, conta bancaria*/}
                        <View style={[styles.cardPanelContent,{justifyContent: 'space-between', zIndex: 1}]}>
                            <View style={{marginBottom: 10, display: "flex", flexDirection: 'column', flexWrap: "nowrap"}}>
                                <Text style={{ fontSize: 10, alignSelf: 'flex-start', color: nomeDespesa ? 'green' : 'red', marginLeft: 5 }}>obrigatório</Text>
                                <TextInput
                                    outlineColor='#145B91'
                                    activeOutlineColor='#145B91'
                                    style={{ marginHorizontal: 5, width: 190, backgroundColor: 'white', fontSize: 14, fontFamily: 'Roboto'}}
                                    value={nomeDespesa}
                                    onChangeText={setNomeDespesa}
                                    mode="outlined"
                                    label="Nome da despesa"
                                />
                            </View>
                            <View style={{marginBottom: 10, display: "flex", flexDirection: 'column', flexWrap: "nowrap", flexShrink:1}}>
                                <Text style={{ fontSize: 10, alignSelf: 'flex-start', color: contaBancaria ? 'green' : 'red', marginLeft: 5 }}>obrigatório</Text>
                                <Picker
                                    dropdownIconColor="#9E9E9E"
                                    style={styles.selectPicker}
                                    selectedValue={contaBancaria?.nome_banco_cad}
                                    onValueChange={(itemValue, itemIndex) => {
                                        const selectedItem = dataContaBancaria[itemIndex - 1];
                                        setContaBancaria(selectedItem || null);
                                    } }>
                                <Picker.Item label='Conta Bancária' value='Conta Bancária' />
                                {dataContaBancaria.map((item) => {
                                    return <Picker.Item label={truncateText(item.nome_banco_cad, 17)} value={item.nome_banco_cad} key={item.id_banco_cad} />;
                                })}
                            </Picker>
                            </View>
                        </View>
                        {/*Centro custo, Forma pagamento*/}
                        <View style={[styles.cardPanelContent, {marginBottom: 10, zIndex: 1}]}>
                            <Picker
                                dropdownIconColor="#9E9E9E"
                                placeholder="Centro de custo"
                                style={[styles.selectPicker, {height: 50, maxWidth: '50%'}]}
                                selectedValue={centroCusto?.desc_centro_custos}
                                onValueChange={(itemValue, itemIndex) => {
                                    const selectedItem = pedidosContext?.centroCusto[itemIndex - 1];
                                    setCentroCusto(selectedItem);
                                }}
                            >
                                <Picker.Item label="Centro de custo" />
                                {pedidosContext?.centroCusto.map((item) => {
                                    return <Picker.Item label={item.desc_centro_custos} value={item.desc_centro_custos} key={item.id_centro_custos} />;
                                })}
                            </Picker>
                            <Picker
                                dropdownIconColor="#9E9E9E"
                                placeholder="Forma de pagamento"
                                style={[styles.selectPicker, {height: 50, maxWidth: '50%'}]}
                                selectedValue={formaPagamento}
                                onValueChange={(itemValue) => { setFormaPagamento(itemValue); } }
                            >
                                <Picker.Item label="Forma de pagamento" />
                                {dataFormaPagamento.map((item) => {
                                    return <Picker.Item label={item} value={item} key={item} />;
                                })}
                            </Picker>
                        </View>
                        {/*Vencimento, data de emissão*/}
                        <View style={[styles.cardPanelContent, {marginBottom: 10, zIndex: 1}]}>
                            <View style={[styles.cardInputs, {marginHorizontal: 5}]}>
                                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems:'center'}}>
                                    <Text>Vencimento</Text>
                                    <Text style={{ fontSize: 10, color: vencimento ? 'green' : 'red', marginLeft: 5 }}>obrigatório</Text>
                                </View>
                                <DatePicker date={vencimento} setDate={setVencimento} />
                            </View>
                            <View style={[styles.cardInputs, {marginHorizontal: 5}]}>
                                <Text>Data de emissão</Text>
                                <DatePicker date={dataEmissao} setDate={setDataEmissao} />
                            </View>
                        </View>
                        {/*Fornecedor, valor*/}
                        <View style={[styles.cardPanelContent, {marginBottom: 10, zIndex: 1}]}>
                            <View style={[styles.cardInputs, {flexShrink: 1, width: '100%', marginHorizontal: 0}]}>
                                <Text style={{ fontSize: 10, alignSelf: 'flex-start', color: fornecedor ? 'green' : 'red', marginLeft: 5}}>obrigatório</Text>
                                <TextInput
                                    outlineColor='#145B91'
                                    activeOutlineColor='#145B91'
                                    mode="outlined"
                                    label="Forncedor"
                                    style={{ marginHorizontal: 5, flexGrow:1, backgroundColor: 'white', fontSize: 14, fontFamily: 'Roboto' }}
                                    value={fornecedor}
                                    onChangeText={setFornecedor}
                                />
                            </View>
                            <View style={[styles.cardInputs, {flexShrink: 1, width: '100%', marginHorizontal: 0}]}>
                                <Text style={{ fontSize: 10, alignSelf: 'flex-start', color: valorBaixa ? 'green' : 'red', marginLeft: 5 }}>obrigatório</Text>
                                <TextInput
                                    outlineColor='#145B91'
                                    activeOutlineColor='#145B91'
                                    mode="outlined"
                                    style={{marginHorizontal: 5, flexShrink:1, backgroundColor: 'white', fontSize: 14, fontFamily: 'Roboto' }}
                                    label="Valor"
                                    value={valorBaixa}
                                    keyboardType="numeric"
                                    onChangeText={handleChangeTextValor}
                                />
                            </View>
                        </View>
                        {/*checkbox pago*/}
                        <View style={[styles.cardPanelContent, {marginBottom: 10, alignItems: 'center', zIndex: 1}]}>
                            <Checkbox
                                color='#145B91'
                                status={checked ? 'checked' : 'unchecked'}
                                onPress={() => {
                                  setChecked(!checked);
                                }}
                            />
                            <Text>Lançar despesa como paga</Text>
                        </View>
                        { checked ?
                        //valor, juros/multa, desconto, taxa, valor pago
                        (<>
                        <View style={[styles.cardPanelContent, {marginBottom: 10}]}>
                            <View style={styles.cardInputs}>
                                <Text>Data de pagamento</Text>
                                <DatePicker date={dataPagamento} setDate={setDataPagamento} />
                            </View>
                            <View style={[styles.cardInputs, {marginHorizontal: 5}]}>
                                <Text style={{ fontSize: 10, alignSelf: 'flex-start', color: valorBaixa ? 'green' : 'red', marginLeft: 5 }}>obrigatório</Text>
                                <TextInput
                                    outlineColor='#145B91'
                                    activeOutlineColor='#145B91'
                                    mode="outlined"
                                    label="Valor da baixa"
                                    style={{ marginHorizontal: 5, flexGrow:1, backgroundColor: 'white', fontSize: 14, fontFamily: 'Roboto' }}
                                    value={valorBaixa}
                                    onChangeText={handleChangeTextValor}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                        <View style={[styles.cardPanelContent, {marginBottom: 10}]}>
                            <TextInput
                                outlineColor='#145B91'
                                    activeOutlineColor='#145B91'
                                    mode="outlined"
                                    label="Juros/multa"
                                    style={{ marginHorizontal: 5, flexGrow:1, backgroundColor: 'white', fontSize: 14, fontFamily: 'Roboto' }}
                                    value={jurosMulta}
                                    onChangeText={handleChangeTextJurosMulta}
                                    keyboardType="numeric"
                                />
                            <TextInput
                                outlineColor='#145B91'
                                    activeOutlineColor='#145B91'
                                    mode="outlined"
                                    label="Desconto"
                                    style={{ marginHorizontal: 5, flexShrink:1, backgroundColor: 'white', fontSize: 14, fontFamily: 'Roboto' }}
                                    value={desconto}
                                    onChangeText={handleChangeTextDesconto}
                                    keyboardType="numeric"
                            />
                        </View>
                        <View style={[styles.cardPanelContent, {marginBottom: 10}]}>
                            <TextInput
                                outlineColor='#145B91'
                                activeOutlineColor='#145B91'
                                mode="outlined"
                                label="Taxa"
                                style={{ flexShrink:1, marginHorizontal: 5, flexGrow:1, backgroundColor: 'white', fontSize: 14, fontFamily: 'Roboto' }}
                                value={taxa}
                                onChangeText={handleChangeTextTaxa}
                                keyboardType="numeric"
                            />
                            <TextInput
                                outlineColor='#145B91'
                                activeOutlineColor='#145B91'
                                mode="outlined"
                                label="Valor pago"
                                style={{flexShrink:1, marginHorizontal: 5, flexGrow:1, backgroundColor: 'white', fontSize: 14, fontFamily: 'Roboto' }}
                                value={String(parseFloat(formatarValor(valorBaixa))
                                    - parseFloat(formatarValor(desconto))
                                    + parseFloat(formatarValor(taxa))
                                    + parseFloat(formatarValor(jurosMulta))
                                    || 0)}
                                disabled
                            />
                        </View>
                        </>) : null}   
                        {/* Observação */}
                        <View style={[styles.cardPanelContent, {marginBottom: 10, flexDirection:'column'}]}>
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
                                    multiline
                                />
                            </View>
                        </View>                         
                    </Card>
                </ScrollView>
                )}
                <View style={styles.footer}>
                    <Button
                        style={{ marginHorizontal: 60, marginVertical:10 }}
                        disabled={!(vencimento && contaBancaria && nomeDespesa && (checked ? (checked&&valorBaixa):valorBaixa)&& fornecedor)}
                        labelStyle={{ fontSize: 15, fontWeight: "600" }}
                        buttonColor='white'
                        textColor="#145B91"
                        mode="contained"
                        onPress={criaNovaDespesa}
                    >
                        Salvar
                    </Button>
                </View>
                <Snackbar
                    style={{backgroundColor: 'green'}}
                    visible={visible}
                    onDismiss={()=>setVisible(false)}
                    duration={1000}
                    >
                    Despesa criada com sucesso.
                </Snackbar>
        </SafeAreaView>
    );
  };

  