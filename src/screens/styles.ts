import { StyleSheet, StatusBar } from "react-native"

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
    backgroundColor: 'E0E1E5',
    justifyContent: 'space-between'
  },
  scrollView: {
    padding: 10
  },
  text: {
    fontSize: 42,
  },
  h5: {
    color: "#145B91",
    fontSize: 16,
    fontFamily: "Roboto",
    fontWeight: "600"
    },
  h4: {
    color: "#323232",
    fontSize: 16,
    fontFamily: "Roboto"
  },
  h3: {
    color: "#145B91",
    fontSize: 16,
    fontFamily: "Roboto",
    fontWeight: "600"
  },
  footer: {
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 20,
    backgroundColor: "#145B91",
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    borderTopWidth:2,
    borderTopColor: "#145B91",
    
    
  },
  subFooter: {
    display: "flex",
    flexDirection: "row",
    fontSize: 18,
    fontFamily: "Roboto",
    justifyContent: "space-between",
  },
  textFooter: {
    fontWeight: '600',
    color: 'white'
  },

  cardPanel:{
    backgroundColor: "white",
    marginBottom: 10,
    padding: 10
  },
  cardPanelContent: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "nowrap",
  },
  title: {
    color: "#145B91"
  },
  cardResumo: {
    backgroundColor: 'white',
    
    minWidth: '50%'
  },
  cardInputs: {
    backgroundColor: 'white',
    marginHorizontal: 5,
    flexShrink: 1,
    fontSize: 16,
    fontFamily: "Roboto",
  },
  selectPicker: {
    flexGrow: 1,
    backgroundColor: 'white',
    borderColor: '#145B91',
    height: 'auto',
    marginHorizontal: 5,
    marginTop: 6,
    borderRadius: 4,
  },
  daysCount: {
    color: 'red',
    marginStart: 10,
    fontSize: 12,
    padding: 2,
    height: '100%'
  },
  cardContentFinance: {
    display: "flex",
    justifyContent: "flex-start",
    flexDirection: "row",
    alignItems: 'center'
  },
  viewCardPedido: {
    backgroundColor: 'white',
    display:"flex",
    justifyContent: "space-between",
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginBottom: 1
  },
  resumo: {
    backgroundColor: '#145B91',
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginBottom: 1
  },
  resumoTexts: {
    fontWeight: '600',
    color: '#DFDDDD'
  },
  resumoView: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  tableTitlePagamento: {
    justifyContent: 'center',
  }

  })