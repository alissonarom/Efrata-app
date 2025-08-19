import { useEffect, useState, useContext } from "react";
import { View, Text, ScrollView } from "react-native";
import {
  FinanceiroScreenPorps,
  Liquidado,
  RootStackParamList,
  Status_pedido,
  TContaReceber,
  TParcelas,
  TCentrosCusto,
} from "../../types";
import {
  ActivityIndicator,
  Button,
  Card,
  DataTable,
  Divider,
  List,
  Snackbar,
  TextInput,
} from "react-native-paper";
import { styles } from "../styles";
import { SafeAreaView } from "react-native";
import { PedidosContext } from "../../utils/PedidoContext";
import { useRoute, RouteProp } from "@react-navigation/native";
import DatePicker from "../../components/datePicker";
import { Picker } from "@react-native-picker/picker";
import { dataFormaPagamento, formatarValor } from "../../utils";
import { headers } from "../../utils";
import React from "react";

const Financeiro: React.FC<FinanceiroScreenPorps> = () => {
  const route = useRoute<RouteProp<RootStackParamList, "Pedido">>();
  const { cliente, vendedor } = route.params;

  const pedidosContext = useContext(PedidosContext);
  const [checked, setChecked] = useState(false);
  const [checkedNota, setCheckedNota] = useState(false);
  const [contasBancarias, setContasBancarias] = useState<any[]>([]);
  const [tipoConta, setTipoConta] = useState("");
  const [dataPagamento, setDataPagamento] = useState(new Date());
  const [dataPagamentoContaReceber, setDataPagamentoContaReceber] = useState(
    new Date()
  );
  const [valorPago, setValorPago] = useState("");
  const [valorPagoConteReceber, setValorPagoConteReceber] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("");
  const [formaPagamentoContaReceber, setFormaPagamentoContaReceber] =
    useState("");
  const [isLoading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [erroValores, setErroValores] = useState(false);
  const [dataDespesas, setDataDespesas] = useState("");
  const [erroContas, setErroContas] = useState(false);
  const [centroCusto, setCentroCusto] = useState<TCentrosCusto>();

  const states: any = {
    "Em Aberto": { icon: "minus-circle-outline", color: "#145B91" },
    "Em Andamento": { icon: "refresh-circle", color: "orange" },
    Cancelado: { icon: "close-circle-outline", color: "red" },
    Atendido: { icon: "check-circle-outline", color: "green" },
  };

  useEffect(() => {
    if (pedidosContext) {
      pedidosContext?.atualizarPedidos(cliente.id_cliente, vendedor.ID);
      pedidosContext?.atualizarOrcamentos(cliente.id_cliente, vendedor.ID);
      pedidosContext?.atualizarContasReceber(cliente.id_cliente);
      pedidosContext.atualizarCentroCusto();
    }
    getDespesas();
    getContasBancárias();
  }, []);

  const cancelPagamento = () => {
    setChecked(false);
    setCheckedNota(false);
    setFormaPagamento("");
    setFormaPagamentoContaReceber("");
    setValorPago("");
    setValorPagoConteReceber("");
    setDataPagamento(new Date());
    setDataPagamentoContaReceber(new Date());
  };

  const getDespesas = async () => {
    try {
      const response = await fetch("/api/contas-pagar", {
        method: "GET",
        headers,
      });

      const json = await response.json();

      const despesasFiltradas = json.data.filter(
        (pedido: any) => pedido.n_documento_pag === vendedor.ID
      );

      const somaTotal = despesasFiltradas.reduce(
        (acc: number, despesa: any) => {
          return acc + parseFloat(despesa.valor_pago); // Certifique-se de que valor_pag é um número
        },
        0
      );

      // Define a soma total no estado
      setDataDespesas(somaTotal);
    } catch (error) {
      console.error("Erro:", error);
    }
    // setDataProdutos(dataProdutoMock);
  };

  const getContasBancárias = async () => {
    try {
      const response = await fetch("/api/contas-bancarias", {
        method: "GET",
        headers,
      });

      const json = await response.json();

      // Define a soma total no estado
      setContasBancarias(json.data);
    } catch (error) {
      console.error("Erro:", error);
    }
  };

  const putContaReceber = async (
    totalNota: string,
    idPedido: number,
    parcelas: TParcelas[]
  ) => {
    const valor =
      parseFloat(totalNota) - calcularTotalParcelasNumerico(parcelas);
    const valorArredondado = valor.toFixed(2); // Arredonda para 2 casas decimais
    const valorNotaCalculado: boolean =
      valorArredondado === parseFloat(valorPago).toFixed(2); // Arredonda valorPago também

    try {
      // Busca todas as contas a receber
      const response = await fetch("/api/contas-receber", {
        method: "GET",
        headers,
      });

      const json = await response.json();

      // Filtra pelo número do pedido
      const conta = json.data.find(
        (conta: TContaReceber) => conta.n_documento_rec === String(idPedido)
      );

      if (!conta) {
        throw new Error(
          "Conta a receber não encontrada para o pedido informado."
        );
      }

      // Incrementa o novo pagamento parcial no array de `parciais` existente
      const novasParciais = conta.parciais;

      // Atualiza a conta a receber com as novas parciais
      const contaReceberAtualizada = {
        parciais: novasParciais,
        liquidado_rec: valorNotaCalculado ? Liquidado.Não : Liquidado.Sim,
        valor_pago: valorPago,
        data_pagamento: new Date(dataPagamento).toISOString().split("T")[0],
        obs_pagamento: valorNotaCalculado
          ? "Pagamento final"
          : "Pagamento Parcial",
        forma_pagamento: formaPagamento,
      };

      // Atualiza a conta a receber filtrada
      const ContaReceberResponse = await fetch(
        `/api/contas-receber/${conta.id_conta_rec}`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify(contaReceberAtualizada),
        }
      );

      if (!ContaReceberResponse.ok) {
        throw new Error("Erro ao atualizar Conta Receber");
      }
    } catch (error) {
      console.error("Erro ao buscar ou atualizar contas a receber:", error);
    }
  };

  const putContaReceberOnly = async (
    valorRec: string,
    valorPago: string,
    valorPagoregistrado: string,
    idConta: number
  ) => {
    const valor = parseFloat(valorPago) + parseFloat(valorPagoregistrado);
    const valorQuitado: boolean = valor === parseFloat(valorRec); // Arredonda valorPago também
    const pagamentoExcedido: boolean = valor > parseFloat(valorRec);

    if (pagamentoExcedido) {
      setLoading(false); // Desativa o loading
      setErroValores(true);
      // Aqui você pode querer usar um estado para controlar a mensagem
      console.warn("Valor maior que saldo devedor");
      return;
    }

    try {
      // Atualiza a conta a receber com as novas parciais
      const contaReceberAtualizada = {
        liquidado_rec: valorQuitado ? Liquidado.Sim : Liquidado.Não,
        valor_pago: valor.toFixed(2),
        data_pagamento: new Date(dataPagamentoContaReceber)
          .toISOString()
          .split("T")[0],
        obs_pagamento: `Valor Pago anterior era: ${valorPagoregistrado} na data ${new Date(dataPagamentoContaReceber).toISOString().split("T")[0]}\nNovo pagamento de: ${valorPagoregistrado} na data ${new Date(dataPagamentoContaReceber).toISOString().split("T")[0]}`,
        forma_pagamento: formaPagamentoContaReceber,
        id_centro_custos: centroCusto?.id_centro_custos,
        centro_custos_rec: centroCusto?.desc_centro_custos,
      };

      const ContaReceberResponse = await fetch(
        `/api/contas-receber/${idConta}`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify(contaReceberAtualizada),
        }
      );

      if (!ContaReceberResponse.ok) {
        throw (
          new Error("Erro ao atualizar Conta Receber"),
          setErroContas(true)
        );
      }
      pedidosContext?.atualizarContasReceber(cliente.id_cliente);
      setVisible(true);
    } catch (error) {
      console.error("Erro ao buscar ou atualizar contas a receber:", error);
      setErroContas(true);
    }
  };

  const putParcelasPedido = async (
    idPedido: number,
    totalNota: string,
    parcelas: TParcelas[]
  ) => {
    const valor =
      parseFloat(totalNota) - calcularTotalParcelasNumerico(parcelas);
    const valorArredondado = valor.toFixed(2); // Arredonda para 2 casas decimais
    const valorNotaCalculado: boolean =
      valorArredondado === parseFloat(valorPago).toFixed(2); // Arredonda valorPago também

    formatarValorParaReal(calcularTotalParcelasNumerico(parcelas));

    const novaParcela = {
      data_parcela: new Date(dataPagamento).toISOString().split("T")[0],
      valor_parcela: valorPago,
      forma_pagamento: formaPagamentoContaReceber,
      observacoes_parcela: valorNotaCalculado
        ? `Pagamento final - Tipo de conta: ${tipoConta}`
        : `Pagamento parcial - Tipo de conta: ${tipoConta}`,
      conta_liquidada: 1,
      valor_pago: valorPago,
      data_pagamento: new Date(dataPagamento).toISOString().split("T")[0],
    };

    const pedidoAlterado = [...parcelas, novaParcela];

    try {
      const pedidoResponse = await fetch(`/api/pedidos/${idPedido}/parcelas`, {
        method: "POST",
        headers,
        body: JSON.stringify(pedidoAlterado),
      });

      if (!pedidoResponse.ok) {
        throw new Error("Erro ao atualizar o pedido");
      }
      const pedidoAtualizadoResponse = await pedidoResponse.json();
    } catch (error) {
      console.error("Erro ao criar contas a pagar:", error);
    }
    if (valorNotaCalculado) {
      try {
        const pedidoResponse = await fetch(`/api/pedidos/${idPedido}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({
            obs_interno_pedido: "Pedido pago no App",
            status_pedido: Status_pedido.Atendido,
          }),
        });

        if (!pedidoResponse.ok) {
          throw new Error("Erro ao atualizar o pedido");
        }
        const pedidoAtualizadoResponse = await pedidoResponse.json();
      } catch (error) {
        console.error("Erro ao criar contas a pagar:", error);
      }
    }
  };

  const atualizaPedido = async (
    idPedido: number,
    totalNota: string,
    parcelas: TParcelas[] | string
  ) => {
    setLoading(true); // Inicia o loading

    if (typeof parcelas === "string") {
      parcelas = [];
    }

    const valor =
      parseFloat(totalNota) - calcularTotalParcelasNumerico(parcelas);

    if (parseFloat(valorPago) > valor) {
      setLoading(false); // Desativa o loading
      // Aqui você pode querer usar um estado para controlar a mensagem
      setErroValores(true);
      console.warn("Valor maior que saldo devedor");
      return; // Sai da função sem executar o restante
    }

    try {
      // Chama as duas funções em sequência
      await putParcelasPedido(idPedido, totalNota, parcelas);
      await putContaReceber(totalNota, idPedido, parcelas);

      // Após o sucesso de ambas as operações
      setTimeout(() => {
        setVisible(true);
        cancelPagamento();
      }, 1000);

      setChecked(false);
      setCheckedNota(false);
      setFormaPagamento("");
      setValorPago("");
      setDataPagamento(new Date());

      // Se houver contexto de pedidos, atualiza os pedidos
      if (pedidosContext) {
        pedidosContext.atualizarPedidos(cliente.id_cliente, vendedor.ID);
      }
    } catch (error) {
      console.error("Erro ao atualizar pedido ou conta a receber:", error);
    } finally {
      setLoading(false); // Desativa o loading em caso de erro
    }
  };

  const handleChangeTextValorPago = (texto: any) => {
    const valorFormatado = formatarValor(texto);
    setValorPagoConteReceber(valorFormatado);
  };

  function calcularTotalParcelasNumerico(
    parcelas: TParcelas[] | string
  ): number {
    if (!Array.isArray(parcelas) || parcelas.length === 0) {
      return 0;
    }

    return parcelas.reduce((acc: number, parcela: TParcelas) => {
      return acc + parseFloat(parcela.valor_parcela);
    }, 0);
  }

  function formatarValorParaReal(valor: number): string {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={[styles.scrollView, { marginTop: 20 }]}>
        <View
          style={{
            backgroundColor: "#145B91",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around",
            paddingVertical: 5,
          }}
        >
          <View>
            <Text style={{ fontWeight: "600", color: "white" }}>Cliente</Text>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{ color: "white", maxWidth: 150 }}
            >
              {cliente.razao_cliente}
            </Text>
          </View>
          <View>
            <Text style={{ fontWeight: "600", color: "white" }}>Vendedor</Text>
            {/* <Text numberOfLines={1} ellipsizeMode="tail" style={{ color: 'white', maxWidth: 150 }}>{vendedor.razao_vendedor}</Text> */}
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{ color: "white", maxWidth: 150 }}
            >
              {vendedor.NomeFantasia}
            </Text>
          </View>
        </View>
        <View style={{ alignSelf: "center" }}>
          <View style={{ display: "flex", justifyContent: "space-between" }}>
            <Text
              style={{
                color: "#145B91",
                fontWeight: "500",
                fontSize: 18,
                marginVertical: 10,
              }}
            >
              Minhas despesas
            </Text>
            <Card
              style={{ backgroundColor: "#FAEBEB", justifyContent: "center" }}
            >
              <Card.Content style={{ alignItems: "center" }}>
                <Text
                  style={{ color: "#f01a1a", fontWeight: "600", fontSize: 16 }}
                >{`R$ ${dataDespesas}`}</Text>
                <Text
                  style={{ color: "back", fontWeight: "500", fontSize: 12 }}
                >
                  Essa semana
                </Text>
              </Card.Content>
            </Card>
          </View>
        </View>
        {pedidosContext?.isLoading ? (
          <View style={{ height: "50%" }}>
            <ActivityIndicator size={"large"} color="#145B91" />
          </View>
        ) : (
          <>
            {pedidosContext?.pedidos.length ? (
              <List.Section>
                <List.Accordion
                  title="Pedidos"
                  style={{ backgroundColor: "#145B91" }}
                  titleStyle={{ color: "white" }}
                  right={(props) => (
                    <List.Icon {...props} icon="chevron-down" color="white" />
                  )}
                  left={(props) => (
                    <List.Icon {...props} icon="card-multiple" color="white" />
                  )}
                >
                  {pedidosContext.pedidos.map((item, index) => (
                    <>
                      <List.Accordion
                        key={index}
                        title={item.status_pedido}
                        style={{
                          backgroundColor: "white",
                          paddingVertical: 0,
                          paddingLeft: 0,
                        }}
                        description={item.data_pedido}
                        titleStyle={{ color: "#145B91", fontWeight: "600" }}
                        left={(props) => (
                          <List.Icon
                            {...props}
                            icon={states[item.status_pedido].icon}
                            color={states[item.status_pedido].color}
                          />
                        )}
                        right={(props) => (
                          <View
                            style={{ display: "flex", flexDirection: "row" }}
                          >
                            <Text>
                              R${" "}
                              {parseFloat(item.valor_total_nota) -
                                calcularTotalParcelasNumerico(item.parcelas)}
                            </Text>
                            <List.Icon
                              {...props}
                              icon="chevron-down"
                              color={states[item.status_pedido].color}
                            />
                          </View>
                        )}
                      >
                        <View style={styles.viewCardPedido}>
                          <View style={{ flexShrink: 1 }}>
                            <View
                              style={{ display: "flex", flexDirection: "row" }}
                            >
                              <Text style={{ fontWeight: "600" }}>
                                Cliente:{" "}
                              </Text>
                              <Text
                                numberOfLines={1}
                                ellipsizeMode="tail"
                                style={{ maxWidth: 170 }}
                              >
                                {item.nome_cliente}
                              </Text>
                            </View>
                            <View
                              style={{ display: "flex", flexDirection: "row" }}
                            >
                              <Text style={{ fontWeight: "600" }}>
                                Vendedor{" "}
                              </Text>
                              <Text
                                numberOfLines={1}
                                ellipsizeMode="tail"
                                style={{ maxWidth: 170 }}
                              >
                                {item.vendedor_pedido}
                              </Text>
                            </View>
                          </View>
                          <View
                            style={{ display: "flex", flexDirection: "row" }}
                          >
                            <Text style={{ fontWeight: "600" }}>
                              Nº Pedido:{" "}
                            </Text>
                            <Text>{item.id_pedido}</Text>
                          </View>
                        </View>
                        <View
                          style={[styles.viewCardPedido, { marginBottom: 0 }]}
                        >
                          {Array.isArray(item.produtos) &&
                          item.produtos.length > 0 ? (
                            <DataTable>
                              <DataTable.Header>
                                <DataTable.Title
                                  style={{ paddingBottom: 0 }}
                                  textStyle={{ color: "#145B91" }}
                                >
                                  Produtos
                                </DataTable.Title>
                                <DataTable.Title
                                  style={{
                                    justifyContent: "center",
                                    maxWidth: 30,
                                    paddingBottom: 0,
                                  }}
                                  textStyle={{ color: "#145B91" }}
                                >
                                  Qtd
                                </DataTable.Title>
                                <DataTable.Title
                                  style={{
                                    justifyContent: "center",
                                    maxWidth: 40,
                                    paddingBottom: 0,
                                  }}
                                  textStyle={{ color: "#145B91" }}
                                >
                                  V. unit.
                                </DataTable.Title>
                                <DataTable.Title
                                  style={{
                                    justifyContent: "center",
                                    maxWidth: 40,
                                    paddingBottom: 0,
                                  }}
                                  textStyle={{ color: "#145B91" }}
                                >
                                  Custo
                                </DataTable.Title>
                                <DataTable.Title
                                  style={{
                                    justifyContent: "center",
                                    maxWidth: 40,
                                    paddingBottom: 0,
                                  }}
                                  textStyle={{ color: "#145B91" }}
                                >
                                  Desc.
                                </DataTable.Title>
                                <DataTable.Title
                                  style={{
                                    justifyContent: "center",
                                    maxWidth: 60,
                                    paddingBottom: 0,
                                  }}
                                  textStyle={{ color: "#145B91" }}
                                >
                                  Total
                                </DataTable.Title>
                              </DataTable.Header>
                              {item.produtos.slice().map((produtos, index) => (
                                <DataTable.Row key={produtos.id_produto}>
                                  <DataTable.Cell textStyle={{ fontSize: 10 }}>
                                    {produtos.desc_produto}
                                  </DataTable.Cell>
                                  <DataTable.Cell
                                    style={{
                                      justifyContent: "center",
                                      maxWidth: 30,
                                    }}
                                    textStyle={{ fontSize: 10 }}
                                  >
                                    {Number(produtos.qtde_produto)}
                                  </DataTable.Cell>
                                  <DataTable.Cell
                                    style={{
                                      justifyContent: "center",
                                      maxWidth: 40,
                                    }}
                                    textStyle={{ fontSize: 10 }}
                                  >{`R$ ${Number(produtos.valor_unit_produto)}`}</DataTable.Cell>
                                  <DataTable.Cell
                                    style={{
                                      justifyContent: "center",
                                      maxWidth: 40,
                                    }}
                                    textStyle={{ fontSize: 10 }}
                                  >{`R$ ${Number(produtos.valor_custo_produto)}`}</DataTable.Cell>
                                  <DataTable.Cell
                                    style={{
                                      justifyContent: "center",
                                      maxWidth: 40,
                                    }}
                                    textStyle={{ fontSize: 10 }}
                                  >{`R$ ${Number(produtos.desconto_produto)}`}</DataTable.Cell>
                                  <DataTable.Cell
                                    style={{
                                      justifyContent: "center",
                                      maxWidth: 60,
                                    }}
                                    textStyle={{ fontSize: 10 }}
                                  >{`R$ ${Number(produtos.valor_total_produto) - Number(produtos.desconto_produto)}`}</DataTable.Cell>
                                </DataTable.Row>
                              ))}
                            </DataTable>
                          ) : (
                            <Text>{String(item.produtos)}</Text>
                          )}
                        </View>
                        <View style={styles.viewCardPedido}>
                          {Array.isArray(item.parcelas) &&
                          item.parcelas.length > 0 ? (
                            <DataTable>
                              <DataTable.Header>
                                <DataTable.Title
                                  style={{ paddingBottom: 0, maxWidth: 50 }}
                                  textStyle={{ color: "#145B91" }}
                                >
                                  Pagamentos
                                </DataTable.Title>
                                <DataTable.Title
                                  style={{
                                    justifyContent: "center",
                                    maxWidth: 70,
                                    paddingBottom: 0,
                                  }}
                                  textStyle={{ color: "#145B91" }}
                                >
                                  Data
                                </DataTable.Title>
                                <DataTable.Title
                                  style={{
                                    justifyContent: "center",
                                    maxWidth: 70,
                                    paddingBottom: 0,
                                  }}
                                  textStyle={{ color: "#145B91" }}
                                >
                                  Valor
                                </DataTable.Title>
                                <DataTable.Title
                                  style={{
                                    justifyContent: "center",
                                    maxWidth: 90,
                                    paddingBottom: 0,
                                  }}
                                  textStyle={{ color: "#145B91" }}
                                >
                                  Forma pgto
                                </DataTable.Title>
                                <DataTable.Title
                                  style={{
                                    justifyContent: "center",
                                    maxWidth: 60,
                                    paddingBottom: 0,
                                  }}
                                  textStyle={{ color: "#145B91" }}
                                >
                                  Liquidada
                                </DataTable.Title>
                              </DataTable.Header>
                              {item.parcelas.slice().map((parcelas, index) => (
                                <DataTable.Row key={index}>
                                  <DataTable.Cell
                                    style={{ width: 30 }}
                                    textStyle={{ fontSize: 10 }}
                                  >
                                    {index + 1}
                                  </DataTable.Cell>
                                  <DataTable.Cell
                                    style={{
                                      justifyContent: "center",
                                      maxWidth: 70,
                                    }}
                                    textStyle={{ fontSize: 10 }}
                                  >
                                    {parcelas.data_parcela}
                                  </DataTable.Cell>
                                  <DataTable.Cell
                                    style={{
                                      justifyContent: "center",
                                      maxWidth: 70,
                                    }}
                                    textStyle={{ fontSize: 10 }}
                                  >{`R$ ${Number(parcelas.valor_parcela)}`}</DataTable.Cell>
                                  <DataTable.Cell
                                    style={{
                                      justifyContent: "center",
                                      maxWidth: 90,
                                    }}
                                    textStyle={{ fontSize: 10 }}
                                  >
                                    {parcelas.forma_pagamento}
                                  </DataTable.Cell>
                                  <DataTable.Cell
                                    style={{
                                      justifyContent: "center",
                                      maxWidth: 60,
                                    }}
                                    textStyle={{ fontSize: 10 }}
                                  >
                                    Sim
                                  </DataTable.Cell>
                                </DataTable.Row>
                              ))}
                            </DataTable>
                          ) : (
                            <Text
                              style={{
                                justifyContent: "center",
                                marginVertical: 10,
                              }}
                            >
                              Nenhum pagamento parcial para o pedido!
                            </Text>
                          )}
                        </View>
                        {checked ? (
                          <>
                            <View
                              style={[
                                styles.cardPanelContent,
                                {
                                  marginBottom: 10,
                                  backgroundColor: "white",
                                  paddingVertical: 10,
                                  marginTop: -1,
                                },
                              ]}
                            >
                              <View style={styles.cardInputs}>
                                <Text>Data de pagamento</Text>
                                <DatePicker
                                  date={dataPagamento}
                                  setDate={setDataPagamento}
                                />
                              </View>
                              <View
                                style={[
                                  styles.cardInputs,
                                  { justifyContent: "space-between" },
                                ]}
                              >
                                <Text>Valor pago</Text>
                                <TextInput
                                  outlineColor="#145B91"
                                  activeOutlineColor="#145B91"
                                  mode="outlined"
                                  label="Valor pago"
                                  style={{
                                    flexShrink: 1,
                                    backgroundColor: "white",
                                    fontSize: 14,
                                    fontFamily: "Roboto",
                                  }}
                                  value={valorPago}
                                  onChangeText={handleChangeTextValorPago}
                                  keyboardType="numeric"
                                />
                              </View>
                            </View>
                            <View
                              style={[
                                styles.cardPanelContent,
                                {
                                  marginBottom: 10,
                                  backgroundColor: "white",
                                  paddingVertical: 10,
                                  justifyContent: "space-between",
                                  marginTop: -15,
                                },
                              ]}
                            >
                              <View
                                style={[styles.cardInputs, { flexGrow: 1 }]}
                              >
                                <Text>Forma de pagamento</Text>
                                <Picker
                                  dropdownIconColor="#9E9E9E"
                                  placeholder="Forma de pagamento"
                                  style={[
                                    styles.selectPicker,
                                    { height: 50, marginHorizontal: 0 },
                                  ]}
                                  selectedValue={formaPagamento}
                                  onValueChange={(itemValue) => {
                                    setFormaPagamento(itemValue);
                                  }}
                                >
                                  <Picker.Item label="Forma de pagamento" />
                                  {dataFormaPagamento.map((item) => {
                                    return (
                                      <Picker.Item
                                        label={item}
                                        value={item}
                                        key={item}
                                      />
                                    );
                                  })}
                                </Picker>
                              </View>
                              <View
                                style={[styles.cardInputs, { flexGrow: 1 }]}
                              >
                                <Text>Tipo de conta</Text>
                                <Picker
                                  dropdownIconColor="#9E9E9E"
                                  placeholder="Tipo de conta"
                                  style={[
                                    styles.selectPicker,
                                    { height: 50, marginHorizontal: 0 },
                                  ]}
                                  selectedValue={tipoConta}
                                  onValueChange={(itemValue) => {
                                    setTipoConta(itemValue);
                                  }}
                                >
                                  <Picker.Item label="Tipo de conta" />
                                  {contasBancarias.map((item) => {
                                    return (
                                      <Picker.Item
                                        label={item.nome_banco_cad}
                                        value={item.nome_banco_cad}
                                        key={item.id_banco_cad}
                                      />
                                    );
                                  })}
                                </Picker>
                              </View>
                            </View>
                          </>
                        ) : null}
                        {/*footer*/}
                        <View style={styles.footer}>
                          <View style={styles.subFooter}>
                            <Text style={styles.textFooter}>
                              Total em Produto
                            </Text>
                            <Text style={styles.textFooter}>
                              R$ {item.valor_total_produtos}
                            </Text>
                          </View>
                          <View style={styles.subFooter}>
                            <Text style={styles.textFooter}>Desconto</Text>
                            <Text
                              style={{ color: "#ff9090", fontWeight: "600" }}
                            >
                              -R$ {item.desconto_pedido}
                            </Text>
                          </View>
                          <View style={styles.subFooter}>
                            <Text style={styles.textFooter}>Valor Pago</Text>
                            <Text
                              style={{ color: "#5aed5a", fontWeight: "600" }}
                            >
                              {formatarValorParaReal(
                                calcularTotalParcelasNumerico(item.parcelas)
                              )}
                            </Text>
                          </View>
                          <View
                            style={[styles.subFooter, { marginBottom: 10 }]}
                          >
                            <Text style={[styles.textFooter, { fontSize: 21 }]}>
                              Total
                            </Text>
                            <Text style={[styles.textFooter, { fontSize: 21 }]}>
                              R${" "}
                              {parseFloat(item.valor_total_produtos) -
                                parseFloat(item.desconto_pedido) -
                                calcularTotalParcelasNumerico(item.parcelas)}
                            </Text>
                          </View>
                          <View style={styles.cardPanelContent}>
                            <Button
                              style={{ flexGrow: 1 }}
                              labelStyle={{ fontSize: 15, fontWeight: "600" }}
                              buttonColor="white"
                              textColor="#145B91"
                              mode="contained"
                              onPress={() =>
                                checked
                                  ? atualizaPedido(
                                      item.id_ped,
                                      item.valor_total_nota,
                                      item.parcelas
                                    )
                                  : setChecked(!checked)
                              }
                              disabled={
                                checked &&
                                !(dataPagamento && valorPago && formaPagamento)
                              }
                              loading={isLoading}
                            >
                              {checked ? "Finalizar" : "Pagar"}
                            </Button>
                            <Button
                              style={{ flexGrow: 1 }}
                              labelStyle={{ fontSize: 15, fontWeight: "600" }}
                              buttonColor="white"
                              textColor="#145B91"
                              mode="contained"
                              onPress={() => cancelPagamento()}
                              disabled={!checked}
                            >
                              Cancelar
                            </Button>
                          </View>
                        </View>
                      </List.Accordion>
                      <Divider
                        style={{
                          marginVertical: 5,
                          backgroundColor: "transparent",
                        }}
                      />
                    </>
                  ))}
                </List.Accordion>
              </List.Section>
            ) : (
              <Text
                style={{
                  fontWeight: "600",
                  height: "50%",
                  alignSelf: "center",
                  color: "grey",
                  fontSize: 20,
                }}
              >
                Não há pedidos em aberto
              </Text>
            )}
            {pedidosContext?.orcamentos.length ? (
              <List.Section>
                <List.Accordion
                  title="Orçamentos"
                  style={{ backgroundColor: "#145B91" }}
                  titleStyle={{ color: "white" }}
                  right={(props) => (
                    <List.Icon {...props} icon="chevron-down" color="white" />
                  )}
                  left={(props) => (
                    <List.Icon {...props} icon="card-text" color="white" />
                  )}
                >
                  {pedidosContext.orcamentos.map((item, index) => (
                    <>
                      <List.Accordion
                        key={index}
                        title={item.data_pedido}
                        style={{
                          backgroundColor: "white",
                          paddingVertical: 0,
                          paddingLeft: 0,
                        }}
                        titleStyle={{ color: "#145B91", fontWeight: "600" }}
                        left={(props) => (
                          <List.Icon
                            {...props}
                            icon={states[item.status_pedido].icon}
                            color={states[item.status_pedido].color}
                          />
                        )}
                        right={(props) => (
                          <View
                            style={{ display: "flex", flexDirection: "row" }}
                          >
                            <Text>R$ {item.valor_total_nota}</Text>
                            <List.Icon
                              {...props}
                              icon="chevron-down"
                              color={states[item.status_pedido].color}
                            />
                          </View>
                        )}
                      >
                        <View style={styles.viewCardPedido}>
                          <View>
                            <View
                              style={{ display: "flex", flexDirection: "row" }}
                            >
                              <Text style={{ fontWeight: "600" }}>
                                Cliente:{" "}
                              </Text>
                              <Text
                                numberOfLines={1}
                                ellipsizeMode="tail"
                                style={{ maxWidth: 170 }}
                              >
                                {item.nome_cliente}
                              </Text>
                            </View>
                            <View
                              style={{ display: "flex", flexDirection: "row" }}
                            >
                              <Text style={{ fontWeight: "600" }}>
                                Vendedor{" "}
                              </Text>
                              <Text
                                numberOfLines={1}
                                ellipsizeMode="tail"
                                style={{ maxWidth: 170 }}
                              >
                                {item.vendedor_pedido}
                              </Text>
                            </View>
                          </View>
                          <View
                            style={{ display: "flex", flexDirection: "row" }}
                          >
                            <Text style={{ fontWeight: "600" }}>
                              Nº Pedido:{" "}
                            </Text>
                            <Text>{item.id_pedido}</Text>
                          </View>
                        </View>
                        <View style={styles.viewCardPedido}>
                          {Array.isArray(item.produtos) &&
                          item.produtos.length > 0 ? (
                            <DataTable>
                              <DataTable.Header>
                                <DataTable.Title
                                  style={{ paddingBottom: 0 }}
                                  textStyle={{ color: "#145B91" }}
                                >
                                  Produtos
                                </DataTable.Title>
                                <DataTable.Title
                                  style={{
                                    justifyContent: "center",
                                    maxWidth: 30,
                                    paddingBottom: 0,
                                  }}
                                  textStyle={{ color: "#145B91" }}
                                >
                                  Qtd
                                </DataTable.Title>
                                <DataTable.Title
                                  style={{
                                    justifyContent: "center",
                                    maxWidth: 40,
                                    paddingBottom: 0,
                                  }}
                                  textStyle={{ color: "#145B91" }}
                                >
                                  V. unit.
                                </DataTable.Title>
                                <DataTable.Title
                                  style={{
                                    justifyContent: "center",
                                    maxWidth: 40,
                                    paddingBottom: 0,
                                  }}
                                  textStyle={{ color: "#145B91" }}
                                >
                                  Custo
                                </DataTable.Title>
                                <DataTable.Title
                                  style={{
                                    justifyContent: "center",
                                    maxWidth: 40,
                                    paddingBottom: 0,
                                  }}
                                  textStyle={{ color: "#145B91" }}
                                >
                                  Desc.
                                </DataTable.Title>
                                <DataTable.Title
                                  style={{
                                    justifyContent: "center",
                                    maxWidth: 60,
                                    paddingBottom: 0,
                                  }}
                                  textStyle={{ color: "#145B91" }}
                                >
                                  Total
                                </DataTable.Title>
                              </DataTable.Header>
                              {item.produtos.slice().map((produtos, index) => (
                                <DataTable.Row key={produtos.id_produto}>
                                  <DataTable.Cell textStyle={{ fontSize: 10 }}>
                                    {produtos.desc_produto}
                                  </DataTable.Cell>
                                  <DataTable.Cell
                                    style={{
                                      justifyContent: "center",
                                      maxWidth: 30,
                                    }}
                                    textStyle={{ fontSize: 10 }}
                                  >
                                    {Number(produtos.qtde_produto)}
                                  </DataTable.Cell>
                                  <DataTable.Cell
                                    style={{
                                      justifyContent: "center",
                                      maxWidth: 40,
                                    }}
                                    textStyle={{ fontSize: 10 }}
                                  >{`R$ ${Number(produtos.valor_unit_produto)}`}</DataTable.Cell>
                                  <DataTable.Cell
                                    style={{
                                      justifyContent: "center",
                                      maxWidth: 40,
                                    }}
                                    textStyle={{ fontSize: 10 }}
                                  >{`R$ ${Number(produtos.valor_custo_produto)}`}</DataTable.Cell>
                                  <DataTable.Cell
                                    style={{
                                      justifyContent: "center",
                                      maxWidth: 40,
                                    }}
                                    textStyle={{ fontSize: 10 }}
                                  >{`R$ ${Number(produtos.valor_desconto)}`}</DataTable.Cell>
                                  <DataTable.Cell
                                    style={{
                                      justifyContent: "center",
                                      maxWidth: 60,
                                    }}
                                    textStyle={{ fontSize: 10 }}
                                  >{`R$ ${Number(produtos.valor_total_produto) - Number(produtos.valor_desconto)}`}</DataTable.Cell>
                                </DataTable.Row>
                              ))}
                            </DataTable>
                          ) : (
                            <Text>{String(item.produtos)}</Text>
                          )}
                        </View>
                        <View style={styles.viewCardPedido}>
                          {Array.isArray(item.parcelas) &&
                          item.parcelas.length > 0 ? (
                            <DataTable>
                              <DataTable.Header>
                                <DataTable.Title
                                  style={{ paddingBottom: 0, maxWidth: 50 }}
                                  textStyle={{ color: "#145B91" }}
                                >
                                  Parcelas
                                </DataTable.Title>
                                <DataTable.Title
                                  style={{
                                    justifyContent: "center",
                                    maxWidth: 70,
                                    paddingBottom: 0,
                                  }}
                                  textStyle={{ color: "#145B91" }}
                                >
                                  Data
                                </DataTable.Title>
                                <DataTable.Title
                                  style={{
                                    justifyContent: "center",
                                    maxWidth: 70,
                                    paddingBottom: 0,
                                  }}
                                  textStyle={{ color: "#145B91" }}
                                >
                                  Valor
                                </DataTable.Title>
                                <DataTable.Title
                                  style={{
                                    justifyContent: "center",
                                    maxWidth: 90,
                                    paddingBottom: 0,
                                  }}
                                  textStyle={{ color: "#145B91" }}
                                >
                                  Forma pgto
                                </DataTable.Title>
                                <DataTable.Title
                                  style={{
                                    justifyContent: "center",
                                    maxWidth: 60,
                                    paddingBottom: 0,
                                  }}
                                  textStyle={{ color: "#145B91" }}
                                >
                                  Liquidada
                                </DataTable.Title>
                              </DataTable.Header>
                              {item.parcelas.slice().map((parcelas, index) => (
                                <DataTable.Row key={index}>
                                  <DataTable.Cell
                                    style={{ width: 30 }}
                                    textStyle={{ fontSize: 10 }}
                                  >
                                    {index + 1}
                                  </DataTable.Cell>
                                  <DataTable.Cell
                                    style={{
                                      justifyContent: "center",
                                      maxWidth: 70,
                                    }}
                                    textStyle={{ fontSize: 10 }}
                                  >
                                    {parcelas.data_parcela}
                                  </DataTable.Cell>
                                  <DataTable.Cell
                                    style={{
                                      justifyContent: "center",
                                      maxWidth: 70,
                                    }}
                                    textStyle={{ fontSize: 10 }}
                                  >{`R$ ${Number(parcelas.valor_parcela)}`}</DataTable.Cell>
                                  <DataTable.Cell
                                    style={{
                                      justifyContent: "center",
                                      maxWidth: 90,
                                    }}
                                    textStyle={{ fontSize: 10 }}
                                  >
                                    {parcelas.forma_pagamento}
                                  </DataTable.Cell>
                                  <DataTable.Cell
                                    style={{
                                      justifyContent: "center",
                                      maxWidth: 60,
                                    }}
                                    textStyle={{ fontSize: 10 }}
                                  >
                                    {parcelas.conta_liquidada
                                      ? parcelas.conta_liquidada
                                      : "Nao"}
                                  </DataTable.Cell>
                                </DataTable.Row>
                              ))}
                            </DataTable>
                          ) : (
                            <Text>{String(item.parcelas)}</Text>
                          )}
                        </View>
                        <View style={styles.footer}>
                          <View style={styles.subFooter}>
                            <Text style={styles.textFooter}>
                              Total em Produto
                            </Text>
                            <Text style={styles.textFooter}>
                              R$ {item.valor_total_produtos}
                            </Text>
                          </View>
                          <View style={styles.subFooter}>
                            <Text style={styles.textFooter}>Desconto</Text>
                            <Text
                              style={{ color: "#ff9090", fontWeight: "600" }}
                            >
                              -R$ {item.desconto_pedido}
                            </Text>
                          </View>
                          <View
                            style={[styles.subFooter, { marginBottom: 10 }]}
                          >
                            <Text style={[styles.textFooter, { fontSize: 21 }]}>
                              Total
                            </Text>
                            <Text style={[styles.textFooter, { fontSize: 21 }]}>
                              R$ {item.valor_total_nota}
                            </Text>
                          </View>
                        </View>
                      </List.Accordion>
                      <Divider
                        style={{
                          marginVertical: 5,
                          backgroundColor: "transparent",
                        }}
                      />
                    </>
                  ))}
                </List.Accordion>
              </List.Section>
            ) : (
              <Text
                style={{
                  fontWeight: "600",
                  height: "50%",
                  alignSelf: "center",
                  color: "grey",
                  fontSize: 20,
                }}
              >
                Não há orçamentos
              </Text>
            )}
            {pedidosContext?.contas.length ? (
              <List.Section>
                <List.Accordion
                  title="Contas a Receber"
                  style={{ backgroundColor: "#145B91" }}
                  titleStyle={{ color: "white" }}
                  right={(props) => (
                    <List.Icon {...props} icon="chevron-down" color="white" />
                  )}
                  left={(props) => (
                    <List.Icon {...props} icon="card-text" color="white" />
                  )}
                >
                  {pedidosContext.contas.map((item: any, index: number) => (
                    <List.Accordion
                      key={index}
                      title={item.nome_conta}
                      style={{
                        backgroundColor: "#fff",
                        paddingVertical: 0,
                        paddingLeft: 0,
                        marginTop: 10,
                      }}
                      titleStyle={{ color: "#145B91", fontWeight: "600" }}
                      left={(props) => (
                        <List.Icon
                          {...props}
                          icon="minus-circle-outline"
                          color="#145B91"
                        />
                      )}
                      right={(props) => (
                        <View style={{ display: "flex", flexDirection: "row" }}>
                          <Text>{item.data_emissao}</Text>
                          <List.Icon
                            {...props}
                            icon="chevron-down"
                            color="#145B91"
                          />
                        </View>
                      )}
                    >
                      <View
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          padding: 0,
                          backgroundColor: "white",
                          alignSelf: "center",
                          width: "100%",
                          justifyContent: "space-around",
                        }}
                      >
                        <View
                          style={[
                            styles.viewCardPedido,
                            { paddingHorizontal: 0 },
                          ]}
                        >
                          <View style={{ alignSelf: "center" }}>
                            <View
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <Card
                                style={{
                                  backgroundColor: "#d0e0e3",
                                  justifyContent: "center",
                                }}
                              >
                                <Card.Content style={{ alignItems: "center" }}>
                                  <Text
                                    style={{
                                      color: "#145B91",
                                      fontWeight: "600",
                                      fontSize: 16,
                                    }}
                                  >{`R$ ${item.valor_rec}`}</Text>
                                  <Text
                                    style={{ fontWeight: "500", fontSize: 12 }}
                                  >
                                    Valor da nota
                                  </Text>
                                </Card.Content>
                              </Card>
                            </View>
                          </View>
                        </View>
                        <View
                          style={[
                            styles.viewCardPedido,
                            { paddingHorizontal: 0 },
                          ]}
                        >
                          <View style={{ alignSelf: "center" }}>
                            <View
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <Card
                                style={{
                                  backgroundColor: "#d9ead3",
                                  justifyContent: "center",
                                }}
                              >
                                <Card.Content style={{ alignItems: "center" }}>
                                  <Text
                                    style={{
                                      color: "#38761d",
                                      fontWeight: "600",
                                      fontSize: 16,
                                    }}
                                  >{`R$ ${item.valor_pago}`}</Text>
                                  <Text
                                    style={{ fontWeight: "500", fontSize: 12 }}
                                  >
                                    Valor pago
                                  </Text>
                                </Card.Content>
                              </Card>
                            </View>
                          </View>
                        </View>
                        <View
                          style={[
                            styles.viewCardPedido,
                            { paddingHorizontal: 0 },
                          ]}
                        >
                          <View style={{ alignSelf: "center" }}>
                            <View
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <Card
                                style={{
                                  backgroundColor: "#FAEBEB",
                                  justifyContent: "center",
                                }}
                              >
                                <Card.Content style={{ alignItems: "center" }}>
                                  <Text
                                    style={{
                                      color: "#f01a1a",
                                      fontWeight: "600",
                                      fontSize: 16,
                                    }}
                                  >{`R$ ${(parseFloat(item.valor_rec) - parseFloat(item.valor_pago)).toFixed(2)}`}</Text>
                                  <Text
                                    style={{ fontWeight: "500", fontSize: 12 }}
                                  >
                                    Em aberto
                                  </Text>
                                </Card.Content>
                              </Card>
                            </View>
                          </View>
                        </View>
                      </View>
                      {checkedNota ? (
                        <>
                          <View
                            style={[
                              styles.cardPanelContent,
                              {
                                marginBottom: 10,
                                backgroundColor: "white",
                                paddingVertical: 10,
                                marginTop: -1,
                              },
                            ]}
                          >
                            <View style={styles.cardInputs}>
                              <Text>Data de pagamento</Text>
                              <DatePicker
                                date={dataPagamentoContaReceber}
                                setDate={setDataPagamentoContaReceber}
                              />
                            </View>
                            <View
                              style={[
                                styles.cardInputs,
                                { justifyContent: "space-between" },
                              ]}
                            >
                              <Text>Valor pago</Text>
                              <TextInput
                                outlineColor="#145B91"
                                activeOutlineColor="#145B91"
                                mode="outlined"
                                label="Valor pago"
                                style={{
                                  flexShrink: 1,
                                  backgroundColor: "white",
                                  fontSize: 14,
                                  fontFamily: "Roboto",
                                }}
                                value={valorPagoConteReceber}
                                onChangeText={handleChangeTextValorPago}
                                keyboardType="numeric"
                              />
                            </View>
                          </View>
                          <View
                            style={[
                              styles.cardPanelContent,
                              {
                                marginBottom: 10,
                                backgroundColor: "white",
                                paddingVertical: 10,
                                justifyContent: "space-between",
                                marginTop: -15,
                              },
                            ]}
                          >
                            <View style={[styles.cardInputs, { flexGrow: 1 }]}>
                              <Text>Forma de pagamento</Text>
                              <Picker
                                dropdownIconColor="#9E9E9E"
                                placeholder="Forma de pagamento"
                                style={[
                                  styles.selectPicker,
                                  { height: 50, marginHorizontal: 0 },
                                ]}
                                selectedValue={formaPagamentoContaReceber}
                                onValueChange={(itemValue) => {
                                  setFormaPagamentoContaReceber(itemValue);
                                }}
                              >
                                <Picker.Item label="Forma de pagamento" />
                                {dataFormaPagamento.map((item) => {
                                  return (
                                    <Picker.Item
                                      label={item}
                                      value={item}
                                      key={item}
                                    />
                                  );
                                })}
                              </Picker>
                            </View>
                            <View style={[styles.cardInputs, { flexGrow: 1 }]}>
                              <Text>Tipo de conta</Text>
                              <Picker
                                dropdownIconColor="#9E9E9E"
                                placeholder="Tipo de conta"
                                style={[
                                  styles.selectPicker,
                                  { height: 50, marginHorizontal: 0 },
                                ]}
                                selectedValue={tipoConta}
                                onValueChange={(itemValue) => {
                                  setTipoConta(itemValue);
                                }}
                              >
                                <Picker.Item label="Tipo de conta" />
                                {contasBancarias.map((item) => {
                                  return (
                                    <Picker.Item
                                      label={item.nome_banco_cad}
                                      value={item.nome_banco_cad}
                                      key={item.id_banco_cad}
                                    />
                                  );
                                })}
                              </Picker>
                            </View>
                          </View>
                          <View
                            style={[
                              styles.cardPanelContent,
                              {
                                marginBottom: 10,
                                backgroundColor: "white",
                                paddingVertical: 10,
                                justifyContent: "space-between",
                                marginTop: -15,
                              },
                            ]}
                          >
                            <View style={[styles.cardInputs, { flexGrow: 1 }]}>
                              <Text>Centro de custo</Text>
                              <Picker
                                dropdownIconColor="#9E9E9E"
                                placeholder="Centro de custo"
                                style={[
                                  styles.selectPicker,
                                  { height: 50, marginHorizontal: 0 },
                                ]}
                                selectedValue={centroCusto?.desc_centro_custos}
                                onValueChange={(itemValue, itemIndex) => {
                                  const selectedItem =
                                    pedidosContext.centroCusto[itemIndex - 1];
                                  setCentroCusto(selectedItem || null);
                                }}
                              >
                                <Picker.Item label="Centro de custo" />
                                {pedidosContext.centroCusto.map((item) => {
                                  return (
                                    <Picker.Item
                                      label={item.desc_centro_custos}
                                      value={item.desc_centro_custos}
                                      key={item.id_centro_custos}
                                    />
                                  );
                                })}
                              </Picker>
                            </View>
                          </View>
                        </>
                      ) : null}
                      <View style={[styles.footer, { paddingLeft: 20 }]}>
                        <View style={styles.cardPanelContent}>
                          <Button
                            style={{ flexGrow: 1 }}
                            labelStyle={{ fontSize: 15, fontWeight: "600" }}
                            buttonColor="white"
                            textColor="#145B91"
                            mode="contained"
                            onPress={() =>
                              checkedNota
                                ? putContaReceberOnly(
                                    item.valor_rec,
                                    valorPagoConteReceber,
                                    item.valor_pago,
                                    item.id_conta_rec
                                  )
                                : setCheckedNota(true)
                            }
                            disabled={
                              checkedNota &&
                              !(
                                dataPagamentoContaReceber &&
                                valorPagoConteReceber &&
                                formaPagamentoContaReceber
                              )
                            }
                            loading={isLoading}
                          >
                            {checkedNota ? "Finalizar" : "Pagar"}
                          </Button>
                          <Button
                            style={{ flexGrow: 1 }}
                            labelStyle={{ fontSize: 15, fontWeight: "600" }}
                            buttonColor="white"
                            textColor="#145B91"
                            mode="contained"
                            onPress={() => cancelPagamento()}
                            disabled={!checkedNota}
                          >
                            Cancelar
                          </Button>
                        </View>
                      </View>
                    </List.Accordion>
                  ))}
                </List.Accordion>
              </List.Section>
            ) : (
              <Text
                style={{
                  fontWeight: "600",
                  height: "50%",
                  alignSelf: "center",
                  color: "grey",
                  fontSize: 20,
                }}
              >
                Não há contas em aberto
              </Text>
            )}
          </>
        )}
      </ScrollView>
      <Snackbar
        style={{ backgroundColor: "green" }}
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={1000}
      >
        <Text style={{ color: "white" }}>Pagamento feito com sucesso!</Text>
      </Snackbar>
      <Snackbar
        style={{ backgroundColor: "red" }}
        visible={erroValores}
        onDismiss={() => setErroValores(false)}
        duration={2000}
      >
        <Text style={{ color: "white" }}>Valor maior que saldo devedor</Text>
      </Snackbar>
      <Snackbar
        style={{ backgroundColor: "red" }}
        visible={erroContas}
        onDismiss={() => setErroContas(false)}
        duration={2000}
      >
        <Text style={{ color: "white" }}>
          Houve um erro interno, tente novamente!
        </Text>
      </Snackbar>
    </SafeAreaView>
  );
};

export default Financeiro;
