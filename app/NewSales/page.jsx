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
} from "@/app/Lib/bdd";
import { Picker } from "@react-native-picker/picker"; // Correctly import Picker
import FactTable from "@/components/FactTable/page";
import { useEffect } from "react";
function Sales() {
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
  const [selectedProductName, setSelectedProductName] = useState(
    products[0].Nom
  );
  const [Facture_ID, setFacture_ID] = useState(1); // Use product name as value
  const [quantity, setQuantity] = useState("");
  const handleSubmit = () => {
    // Handle the text input and picker value here
    console.log("Input Text:", nom);
    console.log("Selected Value:", selectedClient);
    setmodel(false);
  };

  const handleAdd = () => {
    // Find the selected product by its name

    const selectedProduct = products.find(
      (product) => product.Nom === selectedProductName
    );

    // Clone the product and add quantity
    console.log(quantity + selectedProductName);
    if (!selectedProductName) {
      Alert.alert("", "الرجاء إختيار منتج");
    } else {
      if (quantity === "0" || quantity === "") {
        Alert.alert("", "الرجاء إدخال الكمية");
      } else {
        const selected = { ...selectedProduct, Quantite: quantity };
        setRows((prevRows) => [...prevRows, selected]); // Add new row to the existing array
      }
    }
  };
  const deleteRow = (rowIndex) => {
    const updatedRows = rows.filter((_, index) => index !== rowIndex);
    setRows(updatedRows);
  };
  const NewClient = async () => {
    if (!nom || !prenom || !num) {
      Alert.alert("خطأ", "الرجاء ملئ جميع معلومات الزبون الجديد");
      return;
    }
    const r = await addClient(nom, prenom, num);
    console.log("client added" + JSON.stringify(r));
    let client_ID = JSON.stringify(r);
    if (client_ID) {
      setCurrentClient(prenom);
      setCurrentClient_ID(client_ID);
      setmodel(false);
    }
  };
  const selecteClient = () => {
    if (!selectedClient) {
      setCurrentClient_ID(client[0].Client_ID);
      setCurrentClient(client[0].Prenom);
      setmodel(false);
    }
    if (selectedClient) {
      const { Client_ID, Prenom } = selectedClient;
      setCurrentClient_ID(Client_ID);
      console.log("client_ID" + Client_ID);
      setCurrentClient(Prenom);
      setmodel(false);
    }
  };
  const handelSave = async () => {
    const Montant_total = rows.reduce((total, item) => total + item.Sum, 0);
    console.log("rows" + JSON.stringify(rows));
    if (Montant_total === 0) {
      Alert.alert("", "الرجاء ملأ الفاتورة للقيام بعملية التأكيد");
    } else {
      setpaymentAmount(Montant_total + "");
      setVersment_Money(true);
    }
  };
  const handleValider = async () => {
    var plat = 0;
    var valider_Money = true;
    var valider_Plat = true;
    for (let r of rows) {
      console.log(r.Nom);
      const Statu = await getProduitStatusByNom(r.Nom, setStatus);
      console.log("return this ===" + JSON.stringify(Statu.Return));
      if (Statu.Return === "true") {
        plat = plat + parseInt(r.Quantite);
      }
    }
    const Montant_total = rows.reduce((total, item) => total + item.Sum, 0);
    console.log("Montant_total" + Montant_total);
    console.log("CreditPlat=" + plat);
    console.log("Versment_Money=" + paymentAmount);
    console.log("Client_ID=" + CurrentClient_ID);

    if (plat > 0) {
      valider_Plat = false;
    }
    if (Montant_total > paymentAmount) {
      valider_Money = false;
    }
    console.log(valider_Money, valider_Plat);
    const Facture_ID = await addFacture(
      CurrentClient_ID,
      Montant_total,
      valider_Money,
      valider_Plat,
      plat
    );
    console.log("r" + Facture_ID);
    var ids = [];
    for (let r of rows) {
      let plat2 = 0;
      const Statu = await getProduitStatusByNom(r.Nom, setStatus);
      console.log("return this ===" + JSON.stringify(Statu.Return));
      if (Statu.Return === "true") {
        plat2 = plat2 + parseInt(r.Quantite);
        const re = await addFactProd(
          Facture_ID,
          r.Produit_ID,
          r.Quantite,
          r.Prix,
          plat2
        );
        console.log(
          "add factprod" + Facture_ID,
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
      console.log("nes pase add versment");
    } else {
      const ver = await addVersment(Facture_ID, paymentAmount);
      console.log(JSON.stringify(ver));
    }

    setRows([]);
    setVersment_Money(false);
  };

  useEffect(() => {
    if (model) {
      GetAll("client", setclient);
    }
  }, [model]);
  useEffect(() => {
    if (!model) {
      GetAll("produit", setproduct);
      setSelectedProductName(products[0].Nom);
    }
  }, [model]);
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
      <Modal
        animationType="slide"
        transparent={false}
        visible={model}
        onRequestClose={() => setmodel(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>معلومات الزبون</Text>

            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="الاسم"
                onChangeText={setprenom}
                value={prenom}
              />
              <TextInput
                style={styles.input}
                placeholder="اللقب"
                onChangeText={setnom}
                value={nom}
              />
              <TextInput
                style={styles.input}
                placeholder="رقم الهاتف"
                keyboardType="number-pad"
                onChangeText={setnum}
                value={num}
              />
            </View>

            <Button
              onPress={NewClient}
              title="إضافة زبون جديد"
              color="#4CAF50"
            />

            <Picker
              selectedValue={selectedClient} // Select by client_ID
              style={styles.pickerm}
              onValueChange={(itemValue) => setselectedClient(itemValue)} // itemValue will be the object with client_ID and Prenom
            >
              {client.map((option) => (
                <Picker.Item
                  label={option.Prenom + " " + option.Nom}
                  value={option} // Pass an object with client_ID and Prenom
                  key={option.client_ID}
                />
              ))}
            </Picker>

            <Button onPress={selecteClient} title="اختر زبون" color="#2196F3" />
          </View>
        </View>
      </Modal>
      <View>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <Text style={styles.modalTitle}>فاتورة الزبون:{CurrentClient}</Text>
          <TouchableOpacity
            style={{
              width: 45,
              height: 35,
              backgroundColor: "#1E90FF",
              borderRadius: 5,
            }}
            onPress={() => setmodel(true)} // Correctly pass the function
          >
            <Text
              style={{
                marginTop: 5,
                color: "white",
                textAlign: "center",
              }}
            >
              تغيير
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>المنتج</Text>
          <Picker
            selectedValue={selectedProductName}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedProductName(itemValue)}
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between", // Distribute space between elements
    alignItems: "center", // Align items vertically in the center
    marginBottom: 20, // Add space between rows
    paddingHorizontal: 10, // Add horizontal padding
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333", // Darker label color for contrast
    marginRight: 10, // Space between label and input
  },
  picker: {
    flex: 1,
    height: 40,
    backgroundColor: "#f0f0f0", // Light background for the picker
    borderRadius: 5,
    marginHorizontal: 10,
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
});

export default Sales;
