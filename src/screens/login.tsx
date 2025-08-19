import { useState } from "react";
import {
  TouchableOpacity,
  Text,
  Image,
  View,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  TextInput,
} from "react-native";
import { LoginScreenProps } from "../types/index";
import { Button } from "react-native-paper";

var { width } = Dimensions.get("window");

export default function Login({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  function handleSignIn() {
    return navigation.navigate("Vendedor");
  }

  return (
    <SafeAreaView style={styles.container}>
      <Image
        resizeMode="contain"
        style={styles.tinyLogo}
        source={require("../../assets/logo-no-background.png")}
      />
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Usuário"
      />
      <TextInput
        style={styles.input}
        value={password}
        placeholder="Senha"
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        style={styles.button}
        buttonColor="#1F88D9"
        mode="contained"
        onPress={handleSignIn}
      >
        Avançar
      </Button>
    </SafeAreaView>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 30,
    gap: 16,
    backgroundColor: "#145B91",
  },
  input: {
    height: 50,
    width: "80%",
    backgroundColor: "#E3E3E3E3",
    borderRadius: 5,
    padding: 16,
    alignSelf: "center",
  },
  button: {
    height: 50,
    borderRadius: 5,
    justifyContent: "center",
    marginHorizontal: 50,
    alignItems: "center",
    backgroundColor: "#1F88D9",
    padding: 10,
  },
  tinyLogo: {
    width: width * 0.5,
    height: 200,
    alignSelf: "center",
  },
});
