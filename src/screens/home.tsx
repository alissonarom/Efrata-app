import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { HomeScreenProps, RootStackParamList } from "../types";
import { Avatar, Card } from "react-native-paper";
import { useRoute, RouteProp } from "@react-navigation/native";
import { getUserFromLocalStorage } from "../utils";

export default function Home({ navigation }: HomeScreenProps) {
  const route = useRoute<RouteProp<RootStackParamList, "Home">>();
  const vendedor = getUserFromLocalStorage();

  function handleDespesasScreen() {
    if (vendedor) {
      return navigation.navigate("Despesas", { vendedor: vendedor });
    }
  }

  function goCliente() {
    return navigation.navigate("Cliente", { vendedor: vendedor });
  }

  function goBaixa() {
    return navigation.navigate("Baixa", { vendedor: vendedor });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Olá {vendedor?.userERP.NomeFantasia ? vendedor.userERP.NomeFantasia.split(" ")[0] : ""}!
      </Text>
      <View style={styles.container}>
        <Card
          onPress={() => {
            goCliente();
          }}
          mode="contained"
          style={{ backgroundColor: "white", marginVertical: 10 }}
        >
          <Card.Title
            title="Iniciar venda"
            titleVariant={"titleMedium"}
            leftStyle={{ backgroundColor: "white" }}
            titleStyle={{ color: "#145B91" }}
            left={(props) => (
              <Avatar.Icon
                {...props}
                icon="account-check"
                style={{ backgroundColor: "#145B91" }}
                color="white"
              />
            )}
          />
        </Card>
        <Card
          onPress={() => {
            handleDespesasScreen();
          }}
          mode="contained"
          style={{ backgroundColor: "white", marginVertical: 10 }}
        >
          <Card.Title
            title="Lançar despesas"
            titleVariant={"titleMedium"}
            leftStyle={{ backgroundColor: "white" }}
            titleStyle={{ color: "#145B91" }}
            left={(props) => (
              <Avatar.Icon
                {...props}
                icon="account-arrow-down"
                style={{ backgroundColor: "#145B91" }}
                color="white"
              />
            )}
          />
        </Card>
        <Card
          onPress={() => {
            goBaixa();
          }}
          mode="contained"
          style={{ backgroundColor: "white", marginVertical: 10 }}
        >
          <Card.Title
            title="Confirmar entrega"
            titleVariant={"titleMedium"}
            leftStyle={{ backgroundColor: "white" }}
            titleStyle={{ color: "#145B91" }}
            left={(props) => (
              <Avatar.Icon
                {...props}
                icon="file-document-edit"
                style={{ backgroundColor: "#145B91" }}
                color="white"
              />
            )}
          />
        </Card>
      </View>
    </View>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 32,
    backgroundColor: "#145B91",
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
});
