import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Financeiro from "./tabs//Financeiro";
import NovoPedido from "./tabs/NovoPedido";
import { RootStackParamList } from "../types/index";
import { useRoute, RouteProp } from "@react-navigation/native";
import { dataClientes, dataVendedor } from "../Mocks/produtoMock";

const Tab = createMaterialTopTabNavigator<RootStackParamList>();

export default function Tabs() {
  const route = useRoute<RouteProp<RootStackParamList, "Painel">>();
  const { cliente, vendedor } = route.params; // Aqui você acessa o parâmetro 'cliente'
  // const cliente = dataClientes[1];  // Acessa o parâmetro 'cliente'
  //   const vendedor = dataVendedor[1];  // Acessa o parâmetro 'cliente'

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Pedido"
        component={NovoPedido}
        initialParams={{ cliente, vendedor }}
      />
      <Tab.Screen
        name="Financeiro"
        component={Financeiro}
        initialParams={{ cliente, vendedor }}
      />
    </Tab.Navigator>
  );
}
