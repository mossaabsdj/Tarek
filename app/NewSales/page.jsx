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
  getProduiNomby_ID,
  GetAll,
  addClient,
  addFacture,
  addFactProd,
  addVersment,
  getClientByName,
  getProduitStatusByNom,
  addVersmentPlat,
} from "@/app/Lib/bdd";
import { Picker } from "@react-native-picker/picker"; // Correctly import Picker
import FactTable from "@/components/FactTable/page";
import { useEffect } from "react";
function Sales() {
  const Thead = ["المجموع", "الكمية", "السعر", "الاسم"];

  const [selectedProduct, setSelectedProduct] = useState();
  const [SelectedproductsPlatNom, setSelectedproductsPlatNom] = useState();

  const [products, setproduct] = useState([]);
  const [Status, setStatus] = useState([{ S: "s" }]);
  const [NbrPlat, setNbrPlat] = useState("0");
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
  const NewClient = async () => {
    if (!nom || !prenom || !num) {
      Alert.alert("خطأ", "الرجاء ملئ جميع معلومات الزبون الجديد");
      return;
    }
    const check = await getClientByName(nom, prenom);
    if (check && check[0].Client_ID) {
      Alert.alert("تنبيه!", "الزبون " + nom + " " + prenom + " موجود  ");
    } else {
      console.log("check" + JSON.stringify(check));
      const r = await addClient(nom, prenom, num);
      console.log("client added" + JSON.stringify(r));
      let client_ID = JSON.stringify(r);
      if (client_ID) {
        setCurrentClient(prenom);
        setCurrentClient_ID(client_ID);
        setmodel(false);
      }
    }
  };
  const selecteClient = () => {
    if (!client[0]) {
      Alert.alert("الرجاء ادخال زبون جديد");
    } else {
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
      console.log(rows);
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

    console.log("paymentAmount" + paymentAmount);
    if (paymentAmount > 0) {
      const ver = await addVersment(Facture_ID, paymentAmount);
      console.log(JSON.stringify(ver));
    }
    if (NbrPlat > 0) {
      await addVersmentPlat(Facture_ID, selectedProduct, NbrPlat);
    }

    setRows([]);
    setVersment_Money(false);
  };
  async function GetNom(id) {
    const r = await getProduiNomby_ID(id);
    const Nom = r.Nom;
    console.log(Nom);

    setSelectedproductsPlatNom(Nom);
  }
  useEffect(() => {
    if (!selectedProduct || selecteClient === 0) {
    } else {
      GetNom(selectedProduct);
    }
  }, [selectedProduct]);
  const handleVersments = () => {
    console.log("selected" + selectedProduct);
    if (NbrPlat === "0") {
      Alert.alert(
        "تأكيد الدفع",
        "المبلغ:" + paymentAmount + "عدد الأطباق" + NbrPlat + " ",

        [
          { text: "إلغاء", style: "cancel" },
          {
            text: "تأكيد",
            onPress: () => handleValider(),
            style: "destructive",
          },
        ],
        { cancelable: true }
      );
    } else if (!selectedProduct || selecteClient === 0) {
      Alert.alert("الرجاء اختبار نوع الطبق ", "او ارجاع عدد الأطباق 0");
    } else {
      Alert.alert(
        "تأكيد الدفع",
        "المبلغ:" +
          paymentAmount +
          "عدد الأطباق" +
          NbrPlat +
          " " +
          SelectedproductsPlatNom,
        [
          { text: "إلغاء", style: "cancel" },
          {
            text: "تأكيد",
            onPress: () => handleValider(),
            style: "destructive",
          },
        ],
        { cancelable: true }
      );
    }
  };

  useEffect(() => {
    if (model) {
      GetAll("client", setclient);
    }
  }, [model]);
  async function GetProducts() {
    if (!model) {
      var result = await GetAll("produit", setproduct);
      if (!result[0]) {
        Alert.alert("لايوجد منتج", " الرجاء اضافة منتج من القائمة=> المنتجات");
      } else {
        console.log("products[0].Nom" + JSON.stringify(result[0]));
        setSelectedProductName(result[0].Nom);
      }
    }
  }
  useEffect(() => {
    GetProducts();
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
            <View style={styles.modalContainerr}>
              <Text style={styles.modalTitle}>المبلغ</Text>
              <TextInput
                style={styles.inputversment}
                keyboardType="numeric"
                placeholder="ادخل قيمة الدفع"
                value={paymentAmount}
                onChangeText={setpaymentAmount}
              />
              <Text style={styles.modalTitle}>الأطباق</Text>

              <Picker
                selectedValue={selectedProduct}
                style={styles.pickerV}
                onValueChange={(itemValue) => setSelectedProduct(itemValue)}
              >
                <Picker.Item
                  key={0}
                  label={"اختر نوع الطبق"}
                  value={0} // Use product name as value
                />
                {products.map((product) => (
                  <Picker.Item
                    key={product.Nom}
                    label={product.Nom}
                    value={product.Produit_ID} // Use product name as value
                  />
                ))}
              </Picker>

              <TextInput
                style={styles.inputversment}
                keyboardType="numeric"
                placeholder="عدد الأطباق...."
                value={NbrPlat}
                onChangeText={setNbrPlat}
              />

              <View style={styles.buttonContainer}>
                <Button title="تأكيد الدفع" onPress={handleVersments} />
                <Button
                  title="الغاء"
                  onPress={() => setVersment_Money(false)}
                  color="red"
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
      <Modal animationType="slide" transparent={false} visible={model}>
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
            <View style={styles.NewClient}></View>

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

          <TextInput
            placeholder="الكمية"
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
    justifyContent: "space-around", // Space elements evenly
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

  pickerm: {
    marginVertical: 10,
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
    marginLeft: 5,
    borderColor: "#ccc", // Light border
    borderWidth: 1,
    borderRadius: 5,
    marginRight: 10,
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
    height: "90%",
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
  pickeritem: {
    fontSize: 1, // Smaller font size for picker items
    height: 30, // Adjust height for items
  },
  picker: {
    flex: 3, // Let the picker take up more space
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "black",
    marginRight: 10,
  },
  NewClient: {
    marginTop: 10,
    backgroundColor: "black",
    width: "100%",
    height: 2,
    borderRadius: 20,
  },
  modalContainerr: {
    height: "400", // Adjust height according to content
    width: "90%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
    alignItems: "center", // Center align items in modal
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333", // Dark color for better contrast
  },
  pickerV: {
    backgroundColor: "white",
    width: 200,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between", // Space out buttons evenly
    marginTop: 20, // Space above buttons
    width: "100%", // Full width for buttons
  },
});

export default Sales;
