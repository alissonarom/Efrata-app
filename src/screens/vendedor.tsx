import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { VendedorScreenPorps } from "../types";
import { Button } from "react-native-paper";
import { IUser } from "../types";
import { headers } from "../utils";

var { width } = Dimensions.get("window");

export default function Vendedor({ navigation }: VendedorScreenPorps) {
  const [cpf, setCPF] = useState<string>();
  const [isLoading, setLoading] = useState(false);

  const saveVendedores = (vendedores: IUser) => {
    try {
      localStorage.setItem("vendedores", JSON.stringify(vendedores));
      console.log("Dados salvos com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar no localStorage:", error);
    }
  };

  const getVendedores = async (): Promise<IUser | null> => {
    const cpfLimpo = cpf?.replace(/\D/g, "");
    try {
      setLoading(true);
      const response = await fetch(
        `/api/Pessoas/Pesquisar?cpfcnpj=${cpfLimpo}`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const vendedores = (await response.json()) as IUser[];
      console.log("Dados recebidos da API:", vendedores);

      
        saveVendedores(vendedores[0]);
        return vendedores[0];

    } catch (error) {
      console.error("Erro ao buscar vendedores:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  async function handleSignIn() {
    try {
      const vendedores = await getVendedores();
      console.log("Vendedores filtrados:", vendedores);

      if (vendedores) {
        // Armazena o vendedor selecionado (ex: primeiro da lista)
        localStorage.setItem(
          "vendedorSelecionado",
          JSON.stringify(vendedores)
        );
        return navigation.navigate("Home");
      } else {
        alert("Nenhum vendedor encontrado para este CPF/CNPJ");
      }
    } catch (error) {
      console.error("Erro no login:", error);
      alert("Erro ao realizar login");
    }
  }

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
          <Text style={styles.text}>Insira seu CPF</Text>
          <TextInput
            style={styles.cpfInput}
            placeholder="Digite seu CPF"
            value={cpf}
            onChangeText={(text) => {
              // Remove todos os caracteres não numéricos
              const numericText = text.replace(/[^0-9]/g, "");

              // Aplica a máscara de CPF (XXX.XXX.XXX-XX)
              let formattedText = numericText;
              if (numericText.length > 3) {
                formattedText =
                  numericText.slice(0, 3) + "." + numericText.slice(3);
              }
              if (numericText.length > 6) {
                formattedText =
                  formattedText.slice(0, 7) + "." + formattedText.slice(7);
              }
              if (numericText.length > 9) {
                formattedText =
                  formattedText.slice(0, 11) + "-" + formattedText.slice(11);
              }

              // Limita a 14 caracteres (tamanho do CPF com máscara)
              formattedText = formattedText.slice(0, 14);
              setCPF(formattedText);
            }}
            keyboardType="number-pad"
            maxLength={14} // Tamanho máximo com máscara
          />
          {/* <Picker
          style={styles.selectPicker}
          selectedValue={vendedor?.razao_vendedor}
          onValueChange={(itemValue, itemIndex) => {
            const selectedItem = data[itemIndex - 1];
            setVendedor(selectedItem || null);
        }}>
            <Picker.Item label='Selecione um vendedor' value='Selecione um vendedor' />
          {data.map((item) => {
            return <Picker.Item label={item.razao_vendedor} value={item.razao_vendedor} key={item.id_vendedor} />
          })}
        </Picker> */}
          <Button
            style={styles.button}
            buttonColor="#1F88D9"
            mode="contained"
            onPress={handleSignIn}
          >
            Iniciar
          </Button>
        </>
      )}
    </View>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    padding: 32,
    backgroundColor: "#145B91",
  },
  input: {
    height: 54,
    width: "100%",
    backgroundColor: "#E3E3E3E3",
    borderRadius: 5,
    padding: 16,
  },
  button: {
    height: 50,
    borderRadius: 5,
    justifyContent: "center",
    marginHorizontal: 30,
  },
  text: {
    fontSize: 20,
    color: "white",
    marginVertical: 15,
    textAlign: "center",
  },
  selectPicker: {
    backgroundColor: "white",
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  tinyLogo: {
    width: width * 0.5,
    height: 200,
    alignSelf: "center",
  },
  cpfInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 10,
    backgroundColor: "#fff",
  },
});
