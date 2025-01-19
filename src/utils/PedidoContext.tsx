// PedidosContext.tsx
import React, { createContext, useState, ReactNode } from 'react';
import { TPedido, TParcelas, TProdutoPedido, TOrcamentoResponse, TCentrosCusto, TContaReceber } from "../types";
import { headers } from "../utils"

interface PedidosContextProps {
  pedidos: TPedido[];
  atualizarPedidos: (cliente: number, vendedor: number) => void;
  orcamentos: TOrcamentoResponse[];
  atualizarOrcamentos: (cliente: number, vendedor: number) => void;
  isLoading: boolean;
  atualizarContasReceber: (cliente: number)=>void;
  contas: TContaReceber[];
  atualizarCentroCusto: ()=>void;
  centroCusto: TCentrosCusto[];
}

export const PedidosContext = createContext<PedidosContextProps | undefined>(undefined);

export const PedidosProvider = ({ children }: { children: ReactNode }) => {
  const [pedidos, setPedidos] = useState<TPedido[]>([]);
  const [contas, setContas] = useState<TContaReceber[]>([]);
  const [orcamentos, setOrcamentos] = useState<TOrcamentoResponse[]>([]);
  const [centroCusto, setCentroCusto] = useState<TCentrosCusto[]>([]);
  const [isLoading, setLoading] = useState(false);

  const atualizarPedidos = async (cliente: number, vendedor: number) => {
      setLoading(true)
        let allpedidos: TPedido[] = [];
        let offset = 0;
        const limit = 250;
    try {
      let hasMore = true;

      while (hasMore) {
        const response = await fetch(`/api/pedidos?offset=${offset}&limit=${limit}`, {
          method: 'GET',
          headers,
        });
  
        const json = await response.json();
        
        // Adicionar clientes da página atual ao array total
        allpedidos = [...allpedidos, ...json.data];
  
        // Verificar se há mais clientes para buscar
        const { total, offset: currentOffset, total_count } = json.paging;
        offset = currentOffset + total_count;
  
        // Se o total de clientes obtidos for igual ao total disponível, parar a busca
        hasMore = allpedidos.length < total;
      }
      
      const pedidosFiltrados = allpedidos.filter((pedido: any) => 
        pedido.vendedor_pedido_id === vendedor && pedido.id_cliente === cliente && pedido.status_pedido === "Em Aberto" && pedido.lixeira === "Nao"
      );

      const pedidosComDetalhes = await Promise.all(
        pedidosFiltrados.map(async (pedido: any) => {
          // Buscar produtos do pedido
          const produtosResponse = await fetch(`/api/pedidos/${pedido.id_ped}/produtos`, {
            method: 'GET',
            headers,
          });
          const produtosJson = await produtosResponse.json();
          const produtos: TProdutoPedido[] = produtosJson.data;

          // Buscar parcelas do pedido
          const parcelasResponse = await fetch(`/api/pedidos/${pedido.id_ped}/parcelas`, {
            method: 'GET',
            headers,
          });
          const parcelasJson = await parcelasResponse.json();
          const parcelas: TParcelas[] = parcelasJson.data;

          // Retornar o pedido com os produtos e parcelas
          return {
            ...pedido,
            produtos,
            parcelas,
          };
        })
      );

      // Atualizar o estado com os pedidos detalhados
      setLoading(false)
      setPedidos(pedidosComDetalhes);
    } catch (error) {
      console.error('Erro:', error);
    }
  };
  
  const atualizarOrcamentos = async (cliente: number, vendedor: number) => {
    try {
      const response = await fetch('/api/orcamentos', {
        method: 'GET',
        headers,
      });
      
      const json = await response.json();
      
      const orcamentosFiltrados = json.data.filter((orcamento: any) => 
        orcamento.vendedor_pedido_id === vendedor && orcamento.id_cliente === cliente && orcamento.status_pedido === "Em Aberto" && orcamento.lixeira === "Nao"
      );
      
      const orcamentosComDetalhes = await Promise.all(
        orcamentosFiltrados.map(async (orcamento: any) => {
          // Buscar produtos do pedido
          const produtosResponse = await fetch(`/api/orcamentos/${orcamento.id_orcamento}/produtos`, {
            method: 'GET',
            headers,
          });
          const produtosJson = await produtosResponse.json();
          const produtos: TProdutoPedido[] = produtosJson.data;

          // Buscar parcelas do pedido
          const parcelasResponse = await fetch(`/api/orcamentos/${orcamento.id_orcamento}/parcelas`, {
            method: 'GET',
            headers,
          });
          const parcelasJson = await parcelasResponse.json();
          const parcelas: TParcelas[] = parcelasJson.data;
          
          // Retornar o pedido com os produtos e parcelas
          return {
            ...orcamento,
            produtos,
            parcelas,
          };
        })
      );

      // Atualizar o estado com os pedidos detalhados
      setOrcamentos(orcamentosComDetalhes);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const atualizarContasReceber = async (cliente: number) => {
    setLoading(true)
      let allContasReceber: TContaReceber[] = [];
      let offset = 0;
      const limit = 250;
  try {
    let hasMore = true;

    while (hasMore) {
      const response = await fetch(`/api/contas-receber?offset=${offset}&limit=${limit}`, {
        method: 'GET',
        headers,
      });

      const json = await response.json();
      
      // Adicionar clientes da página atual ao array total
      allContasReceber = [...allContasReceber, ...json.data];

      // Verificar se há mais clientes para buscar
      const { total, offset: currentOffset, total_count } = json.paging;
      offset = currentOffset + total_count;

      // Se o total de clientes obtidos for igual ao total disponível, parar a busca
      hasMore = allContasReceber.length < total;
    }
    
    const contasFiltradas = allContasReceber.filter((conta: any) => 
      conta.id_cliente === cliente && conta.liquidado_rec === "Nao" && conta.lixeira === "Nao"
    );

    setLoading(false)
    setContas(contasFiltradas);
  } catch (error) {
    console.error('Erro:', error);
  }
  };

  const atualizarCentroCusto = async () => {
    setLoading(true)
      let allCentroCusto: TCentrosCusto[] = [];
      let offset = 0;
      const limit = 250;
  try {
    let hasMore = true;

    while (hasMore) {
          const response = await fetch('/api/centros-custo', {
            method: 'GET',
            headers,
          });

      const json = await response.json();
      
      // Adicionar clientes da página atual ao array total
      allCentroCusto = [...allCentroCusto, ...json.data];

      // Verificar se há mais clientes para buscar
      const { total, offset: currentOffset, total_count } = json.paging;
      offset = currentOffset + total_count;

      // Se o total de clientes obtidos for igual ao total disponível, parar a busca
      hasMore = allCentroCusto.length < total;
    }

    setCentroCusto(allCentroCusto); // Define com os dados recebidos
    setLoading(false)
    }
  catch (error) {
    console.error('Erro:', error);
  }
  };

  return (
    <PedidosContext.Provider value={{ pedidos, atualizarPedidos, orcamentos, atualizarOrcamentos, isLoading, atualizarContasReceber, contas, atualizarCentroCusto, centroCusto  }}>
      {children}
    </PedidosContext.Provider>
  );
};
