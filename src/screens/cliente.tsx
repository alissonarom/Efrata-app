import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TextInput,
  Text,
} from "react-native";
import { ClienteScreenProps, RootStackParamList } from "../types";
import { Picker } from "@react-native-picker/picker";
import { Button } from "react-native-paper";
import { TClienteResponse } from "../types";
import { useRoute, RouteProp } from "@react-navigation/native";
import { headers } from "../utils";

var { width } = Dimensions.get("window");

export default function Cliente({ navigation }: ClienteScreenProps) {
  const [client, setClient] = useState<TClienteResponse>();
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState<TClienteResponse[]>([]);
  const route = useRoute<RouteProp<RootStackParamList, "Cliente">>();
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState<TClienteResponse[]>([]);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const { vendedor } = route.params || {};

  function changeVendedor() {
    return navigation.navigate("Vendedor");
  }

  const handleSearch = (text: string) => {
    setSearchText(text);
    // Filtra os dados conforme o texto digitado
    if (text === "") {
      setFilteredData([]); // Se o campo de busca estiver vazio, não exibe resultados
    } else {
      setDropdownVisible(true);
      const filtered = data.filter((item) =>
        item.razao_cliente.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredData(filtered);
    }
  };

  const handleSelectClient = (cliente: TClienteResponse) => {
    setClient(cliente); // Seleciona o cliente
    setSearchText(cliente.razao_cliente); // Atualiza o campo de pesquisa com o nome do cliente
    setFilteredData([]); // Restaura os dados filtrados para mostrar todos novamente
    setDropdownVisible(false);
  };

  const getClientes = async () => {
    setLoading(true);

    let allClientes: TClienteResponse[] = [];
    let offset = 0;
    const limit = 250; // Definindo um limite de 50 clientes por página (ajustável conforme necessidade)

    try {
      let hasMore = true;

      // Continuar enquanto houver mais páginas
      while (hasMore) {
        const response = await fetch(
          `/api/clientes?offset=${offset}&limit=${limit}`,
          {
            method: "GET",
            headers,
          }
        );

        const json = await response.json();

        // Adicionar clientes da página atual ao array total
        allClientes = [...allClientes, ...json.data];

        // Verificar se há mais clientes para buscar
        const { total, offset: currentOffset, total_count } = json.paging;
        offset = currentOffset + total_count;

        // Se o total de clientes obtidos for igual ao total disponível, parar a busca
        hasMore = allClientes.length < total;
      }

      // Filtrar clientes que têm o vendedor_cliente_id igual ao id_vendedor
      // let clientesFiltrados = allClientes.filter((cliente) => cliente.vendedor_cliente_id === vendedor.id_vendedor);

      // Ordenar clientes filtrados em ordem alfabética (por nome do cliente)
      const clientesFiltrados = allClientes.sort((a, b) =>
        a.razao_cliente.localeCompare(b.razao_cliente)
      );

      setData(clientesFiltrados); // Definir o estado apenas com os clientes filtrados
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  function handleSignIn() {
    if (client) {
      return navigation.navigate("Painel", {
        vendedor: vendedor,
        cliente: client,
      });
    }
  }

  useEffect(() => {
    getClientes();
  }, []);

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <>
          <Image
            resizeMode="contain"
            style={styles.tinyLogo}
            source={require("../../assets/logo-no-background.png")}
          />
          <Text style={styles.text}>
            Olá {vendedor ? vendedor.razao_vendedor.split(" ")[0] : ""}!
          </Text>
          <Text style={styles.text}>Selecione um cliente</Text>

          <View style={{ zIndex: 10000 }}>
            {/* Barra de Pesquisa */}
            <TextInput
              style={styles.input}
              placeholder="Digite o nome do cliente"
              value={searchText}
              onChangeText={handleSearch}
              onFocus={() => setDropdownVisible(true)}
            />

            {/* Dropdown Contêiner */}
            {isDropdownVisible && (
              <View style={styles.dropdownContainer}>
                <FlatList
                  data={filteredData}
                  keyExtractor={(item) => item.id_cliente.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleSelectClient(item)}>
                      <Text style={styles.dropdownItem}>
                        {item.razao_cliente}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
          </View>

          <Button
            style={styles.button}
            buttonColor="#1F88D9"
            mode="contained"
            onPress={handleSignIn}
          >
            Avançar
          </Button>
          <Button
            style={styles.button}
            textColor="white"
            mode="text"
            onPress={changeVendedor}
          >
            Trocar de vendedor
          </Button>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    padding: 32,
    backgroundColor: "#145B91",
  },
  input: {
    height: 54,
    width: "100%",
    backgroundColor: "white",
    borderRadius: 5,
    padding: 16,
  },
  dropdownContainer: {
    position: "absolute",
    top: 55, // Ajuste conforme necessário para alinhar com o input
    left: 0,
    right: 0,
    maxHeight: "470%",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    zIndex: 1000,
  },
  dropdownItem: {
    padding: 10,
    fontSize: 14,
  },
  button: {
    height: 50,
    borderRadius: 5,
    justifyContent: "center",
    marginHorizontal: 20,
    marginVertical: 10,
  },
  text: {
    fontSize: 20,
    color: "white",
    marginVertical: 15,
    textAlign: "center",
  },
  tinyLogo: {
    width: "50%",
    height: 200,
    alignSelf: "center",
  },
});
