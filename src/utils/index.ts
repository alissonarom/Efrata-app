import { ISession } from "../types";

export const truncateText = (text: string, maxLength: number) => {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + "...";
  }
  return text;
};

export const dataFormaPagamento = [
  "Dinheiro",
  "PIX",
  "Cheque",
  "Permuta",
  "Cartão de Crédito",
  "Cartão de Débito",
  "Boleto",
  "Transferência",
  "Doc",
  "Ted",
  "Depósito Identificado",
  "Depósito em C/C",
  "Duplicata Mercantil",
  "Faturado",
  "Faturar",
  "Débito Automático",
  "Lotérica",
  "Banco",
  "DDA",
  "Pagamento online",
  "BNDES",
  "Outros",
  "DP Descontada",
  "CH Descontado",
  "Vale Alimentação",
  "Vale Refeição",
  "Vale Presente",
  "Vale Combustível",
];

export const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // meses começam em 0
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatarValor = (valor: string) => {
  // Remove tudo que não seja número
  let valorNumerico = valor.replace(/\D/g, "");

  // Converte para formato de moeda (mantendo a vírgula como separador de centavos)
  const valorFormatado = (Number(valorNumerico) / 100).toFixed(2);

  return valorFormatado; // Retorna uma string formatada com 2 casas decimais
};

export const headers = {
  accept: "text/plain",
  "Authorization-Token":
    "23474484fb8c32b15b988dbf91caebbe15c0cefdb99e5b004ca767214262ecf348f463ef7d72b2a2f879f5db7a75369ae5df9ac85bd83b64509ab338a25e40b636ebfdf5eace6f7c7df9cd221f3002589223442f82d3e8a7a47d4bb7ae087a3efe041f2bd5ec0cedc7b9b283476a14aec5a9fbd0839c265b7d1b2b318c4bd71f",
  User: "alissonmorais.br@gmail.com",
  App: "API1",
};

export const getUserFromLocalStorage = (): ISession | null => {
  try {
    const token = localStorage.getItem("token");
    const userERPString = localStorage.getItem("userERP");
    const userBanco = localStorage.getItem("userId");

    if (!token || !userERPString || !userBanco) {
      return null;
    }

    return {
      token: token,
      userId: userBanco,
      userERP: JSON.parse(userERPString),
    };
  } catch (error) {
    console.error("Erro ao recuperar dados do usuário:", error);
    return null;
  }
};