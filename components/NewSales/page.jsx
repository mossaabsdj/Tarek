import React, { useState } from "react";
import {
  View,
  Text,
  I18nManager,
  StyleSheet,
  TextInput,
  Button,
  Modal,
  TouchableOpacity,
  Pressable,
  Alert,
} from "react-native";
import {
  GetAll,
  addClient,
  addFacture,
  addFactProd,
  addVersment,
  getProduitStatusByNom,
  deleteFacture,
} from "@/app/Lib/bdd";
import { Picker } from "@react-native-picker/picker"; // Correctly import Picker
import FactTable from "@/components/FactTableupdate/page";
import { useEffect } from "react";
function Sales({ Facture_ID_Delete, rowsinitial, currentclientid, nomClient }) {
  const Thead = ["المجموع", "الكمية", "السعر", "الاسم"];

  const [products, setproduct] = useState([{}]);
  const [Status, setStatus] = useState([{ S: "s" }]);

  const [client, setclient] = useState([{}]);
  const [nom, setnom] = useState("");
  const [prenom, setprenom] = useState("");
  const [num, setnum] = useState("");
  const [selectedClient, setselectedClient] = useState();
  const [CurrentClient, setCurrentClient] = useState();
  const [CurrentClient_ID, setCurrentClient_ID] = useState();
  const [model, setmodel] = useState(true);
  const [Versment_Money, setVersment_Money] = useState(false);
  const [paymentAmount, setpaymentAmount] = useState();
  const [rows, setRows] = useState([]);
  const [selectedProductName, setSelectedProductName] = useState();
  const [Facture_ID, setFacture_ID] = useState(1); // Use product name as value
  const [Old_Facture_ID, setOld_Facture_ID] = useState(); // Use product name as value

  const [quantity, setQuantity] = useState("");
  useEffect(() => {
    console.log("Old_Facture_ID" + Facture_ID_Delete);

    setOld_Facture_ID(Facture_ID_Delete);
  }, [Facture_ID_Delete]);
  useEffect(() => {
    setRows(rowsinitial);
  }, [rowsinitial]);
  useEffect(() => {
    setCurrentClient(nomClient);
  }, [nomClient]);
  useEffect(() => {
    setCurrentClient_ID(currentclientid);
  }, [currentclientid]);
  const handleAdd = () => {
    // Find the selected product by its name
    const selectedProduct = products.find(
      (product) => product.Nom === selectedProductName
    );

    console.log(quantity + selectedProductName); // Debugging log

    if (!selectedProductName) {
      Alert.alert("", "الرجاء إختيار منتج"); // Alert for no product selected
      return; // Exit function early
    }

    if (quantity === "0" || quantity === "") {
      Alert.alert("", "الرجاء إدخال الكمية"); // Alert for empty or zero quantity
      return; // Exit function early
    }

    // Check if the product already exists in the rows
    const existingProductIndex = rows.findIndex(
      (item) => item.Nom === selectedProductName
    );

    if (existingProductIndex !== -1) {
      // If the product exists, update the quantity
      const updatedRows = [...rows]; // Create a shallow copy of rows
      updatedRows[existingProductIndex].Quantite += Number(quantity); // Increment the quantity (ensure quantity is a number)
      setRows(updatedRows); // Update state with the new rows
    } else {
      // If the product does not exist, create a new entry
      const selected = { ...selectedProduct, Quantite: Number(quantity) }; // Ensure quantity is a number
      setRows((prevRows) => [...prevRows, selected]); // Add new row to the existing array
    }
    console.log(rows);
  };

  const deleteRow = (rowIndex) => {
    const updatedRows = rows.filter((_, index) => index !== rowIndex);
    setRows(updatedRows);
  };

  const handelSave = async () => {
    const Montant_total = rows.reduce((total, item) => total + item.Sum, 0);
    // console.log("rows" + JSON.stringify(rows));
    if (Montant_total === 0) {
      Alert.alert("", "الرجاء ملأ الفاتورة للقيام بعملية التأكيد");
    } else {
      setpaymentAmount(Montant_total + "");
      setVersment_Money(true);
    }
  };
  const handleValider = async () => {
    await deleteFacture(Old_Facture_ID);
    var plat = 0;
    var valider_Money = true;
    var valider_Plat = true;
    for (let r of rows) {
      // console.log(rows);
      // console.log(r.Nom);
      const Statu = await getProduitStatusByNom(r.Nom, setStatus);
      ///  console.log("return this ===" + JSON.stringify(Statu.Return));
      if (Statu.Return === "true") {
        plat = plat + parseInt(r.Quantite);
      }
    }
    const Montant_total = rows.reduce((total, item) => total + item.Sum, 0);
    //console.log("Montant_total" + Montant_total);
    //console.log("CreditPlat=" + plat);
    //console.log("Versment_Money=" + paymentAmount);
    //console.log("Client_ID=" + CurrentClient_ID);

    if (plat > 0) {
      valider_Plat = false;
    }
    if (Montant_total > paymentAmount) {
      valider_Money = false;
    }
    //console.log(valider_Money, valider_Plat);
    const Facture_ID = await addFacture(
      CurrentClient_ID,
      Montant_total,
      valider_Money,
      valider_Plat,
      plat
    );
    // console.log("r" + Facture_ID);
    var ids = [];
    for (let r of rows) {
      let plat2 = 0;
      const Statu = await getProduitStatusByNom(r.Nom, setStatus);
      // console.log("return this ===" + JSON.stringify(Statu.Return));
      if (Statu.Return === "true") {
        plat2 = plat2 + parseInt(r.Quantite);
        const re = await addFactProd(
          Facture_ID,
          r.Produit_ID,
          r.Quantite,
          r.Prix,
          plat2
        );

        ids.push(re);
      }
    }
    console.log(ids);
    if (paymentAmount === "" || paymentAmount === 0) {
      //console.log("nes pase add versment");
    } else {
      // console.log("paymentAmount" + paymentAmount);
      const ver = await addVersment(Facture_ID, paymentAmount);
      // console.log(JSON.stringify(ver));
    }

    setRows([]);
    setVersment_Money(false);
  };

  useEffect(() => {
    if (model) {
      GetAll("client", setclient);
    }
  }, [model]);
  async function GetProducts() {
    var result = await GetAll("produit", setproduct);
    if (!result[0]) {
      Alert.alert("لايوجد منتج", " الرجاء اضافة منتج من القائمة=> المنتجات");
    } else {
      console.log("products[0].Nom" + JSON.stringify(result[0]));
      setSelectedProductName(result[0].Nom);
    }
  }
  useEffect(() => {
    GetProducts();
  }, []);
  useEffect(() => {
    if (!I18nManager.isRTL) {
      I18nManager.forceRTL(true);
      I18nManager.allowRTL(true);
    }
  }, []);

  return (
    <View>
      {/* Modal for Editing Vesment_Money */}
      {Versment_Money && (
        <Modal
          animationType="slide"
          transparent={true} // Make the modal background transparent
          visible={Versment_Money}
          onRequestClose={() => setVersment_Money(false)}
        >
          <View style={styles.modalBackgroundVersment}>
            <View style={styles.modalViewVersment}>
              <TextInput
                style={styles.inputversment}
                keyboardType="numeric"
                placeholder="ادخل قيمة الدفع"
                value={paymentAmount}
                onChangeText={setpaymentAmount}
              />

              <Button title="تأكيد الدفع" onPress={handleValider} />
              <Button
                title="الغاء"
                onPress={() => setVersment_Money(false)}
                color="red"
              />
            </View>
          </View>
        </Modal>
      )}

      <View>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <Text style={styles.modalTitle}>فاتورة الزبون:{CurrentClient}</Text>
        </View>

        <View style={styles.rowfist}>
          <Picker
            selectedValue={selectedProductName}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedProductName(itemValue)}
            itemStyle={styles.pickeritem}
          >
            {products.map((product) => (
              <Picker.Item
                key={product.Nom}
                label={product.Nom}
                value={product.Nom} // Use product name as value
              />
            ))}
          </Picker>

          <Text style={styles.label}>الكمية</Text>
          <TextInput
            keyboardType="number-pad"
            style={styles.input}
            value={quantity}
            onChangeText={setQuantity}
          />

          <Button title="إضافة" onPress={handleAdd} />
        </View>
      </View>

      <FactTable
        Thead={Thead}
        rowss={rows}
        Savefunction={handelSave}
        Deletefunction={deleteRow}
        Printfunction={print}
        Facture_ID={Facture_ID}
        client_name={CurrentClient}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerText: {
    fontSize: 60,
    textAlign: "center",
    marginBottom: 20,
    color: "#333", // Darker color for better contrast
  },
  rowfist: {
    flexDirection: "row", // Align elements horizontally
    alignItems: "center", // Vertically align elements
    justifyContent: "space-between", // Space elements evenly
    marginVertical: 10, // Add some vertical spacing
    padding: 10,
    backgroundColor: "#f5f5f5", // Background color for the row
    borderRadius: 20, // Rounded corners for the row
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between", // Distribute space between elements
    alignItems: "center", // Align items vertically in the center
    marginBottom: 20, // Add space between rows
    paddingHorizontal: 10, // Add horizontal padding
  },
  label: {
    flex: 1,
    fontSize: 16,
    textAlign: "center", // Align the label text in the center
    marginRight: 10,
  },
  picker: {
    flex: 3, // Let the picker take up more space
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#000", // Black border for the picker
    marginRight: 10, // Add space between picker and other elements
  },
  pickerm: {
    flex: 1,
    maxHeight: 20,
    backgroundColor: "#f0f0f0", // Light background for the picker
    borderRadius: 5,
    marginHorizontal: 10,
  },
  inputversment: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "#ccc", // Light border
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10, // Add padding for better usability
    backgroundColor: "#f9f9f9", // Light background color
    textAlign: "center", // Center text in input
  },
  button: {
    backgroundColor: "#4CAF50", // Green button color
    borderRadius: 5,
    padding: 10,
    marginVertical: 10, // Space above and below button
  },
  buttonText: {
    color: "#fff", // White text color
    fontSize: 16,
    textAlign: "center",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Darken background
  },
  modalContainer: {
    height: 300,
    width: "90%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  modalDescription: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalInput: {
    flex: 1,
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginHorizontal: 5,
  },
  modalViewVersment: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: 300,
    height: 250,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  modalBackgroundVersment: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dark transparent background
  },
  pickeritem: {},
});

export default Sales;