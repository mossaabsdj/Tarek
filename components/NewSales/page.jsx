import React, { useRef, useState } from "react";
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
  GetFacturesVersmentPlat,
  addClient,
  GetFacture_ByID,
  addFacture,
  addFactProd,
  getClientByName,
  getProduitStatusByNom,
  addVersmentPlat,
  addVersment,
  GetClient_FacturesMoney,
  GetFacturesVersment,
} from "@/app/Lib/bdd";
import { Audio } from "expo-av";

import { Picker } from "@react-native-picker/picker"; // Correctly import Picker
import FactTable from "@/components/FactTableupdate/page";
import { useEffect } from "react";
function Sales({ currentclientid, rowsinitial, nomClient, Facture_ID_Delete }) {
  const Thead = ["المجموع", "الكمية", "السعر", "الاسم"];
  const [sound, setSound] = useState();
  const [selectedProduct, setSelectedProduct] = useState();
  const [SelectedproductsPlatNom, setSelectedproductsPlatNom] = useState();
  const [versments, setversments] = useState([]);
  const [VersmentsMoney, setVersmentsMoney] = useState([]);
  const [products, setproduct] = useState([{}]);
  const [products_True, setproduct_True] = useState([]);
  const [Status, setStatus] = useState([{ S: "s" }]);
  const [NbrPlat, setNbrPlat] = useState("0");
  const [client, setclient] = useState([{}]);
  const [nom, setnom] = useState("");
  const [Sbn, setSbn] = useState(false);
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
  const [Facture_ID, setFacture_ID] = useState(0); // Use product name as value
  const [quantity, setQuantity] = useState("");
  const [Facture, setFacture] = useState(""); // Use product name as value
  const [CreditMoney, setCreditMoney] = useState(0);
  const [Ancientcreditmoney1, setAncientcreditmoney1] = useState(0);
  const [Newcreditmoney1, setNewcreditmoney1] = useState(0);
  const [Restcreditmoney1, setRestcreditmoney1] = useState(0);
  const [AncientcreditPlat1, setAncientcreditPlat1] = useState(0);
  const [NewcreditPlat1, setNewcreditPlat1] = useState(0);
  const [RestcreditPlat1, setRestcreditPlat1] = useState(0);
  const [VersmentMoneytofact, setVersmentMoneytofact] = useState(0);
  const [VersmentPlattofact, setVersmentPlattofact] = useState(0);

  const [TotalPlat1, setTotalPlat1] = useState(0);
  const [ready, setready] = useState(false);
  const QuantiteField = useRef();
  useEffect(() => {
    setselectedClient(nomClient);
  }, [nomClient]);
  useEffect(() => {
    console.log("rowsinitial" + rowsinitial);
    setRows(rowsinitial);
  }, [rowsinitial]);
  useEffect(() => {
    setCurrentClient_ID(currentclientid);
  }, [currentclientid]);
  useEffect(() => {
    setFacture_ID(Facture_ID_Delete);
    GetFacture(Facture_ID_Delete);
  }, [Facture_ID_Delete]);

  async function GetFacture(id) {
    const r = await GetFacturesVersment(id);
    var factversment = r.reduce((total, item) => total + item.Somme, 0);
    setVersmentMoneytofact(factversment);
    const r2 = await GetFacturesVersmentPlat(id);

    var creditOmbalagee = "\n";
    for (let i = 0; i < r2.length; i++) {
      const cp = r2[i];

      if (i !== 0) {
        creditOmbalagee += "\n";
      }

      const nom = await getProduiNomby_ID(cp.Produit_ID);
      creditOmbalagee += `${cp.Plat}:${nom.Nom}  `;
    }

    setVersmentPlattofact(creditOmbalagee); // console.log("CreditPlat" + JSON.stringify(CreditPlat));

    // console.log("rrr" + factversment);
    setFacture(r);
  }
  async function playSound() {
    // Load the sound
    const { sound } = await Audio.Sound.createAsync(
      require("@/assets/Add.mp3") // Add your sound file here
    );
    setSound(sound);
    console.log("Playing Sound");
    await sound.playAsync(); // Play the sound
  }
  useEffect(() => {
    if (ready) {
      Alert.alert(
        "تأكيد الفاتورة",
        "هل أنت متأكد من انهاء الفاتورة؟",

        [
          { text: "إلغاء", onPress: () => setready(false), style: "cancel" },
          {
            text: "تأكيد",
            onPress: () => handleValider(),
            style: "destructive",
          },
        ],
        { cancelable: true }
      );
      //  handleValider();
    }
  }, [ready]);

  const updateCredits = (
    ancientCreditMoney,
    newCreditMoney,
    restCreditMoney,
    ancientCreditPlat,
    newCreditPlat,
    restCreditPlat,
    totalPlat,
    B
  ) => {
    setAncientcreditmoney1(ancientCreditMoney);
    setNewcreditmoney1(newCreditMoney);
    setRestcreditmoney1(restCreditMoney);
    setAncientcreditPlat1(ancientCreditPlat);
    setNewcreditPlat1(newCreditPlat);
    setRestcreditPlat1(restCreditPlat);
    setTotalPlat1(totalPlat);
    setready(B);
  };

  const handleAdd = () => {
    if (QuantiteField.current) {
      QuantiteField.current.blur();
    }
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
    playSound();
    setCreditMoney(CreditMoney);
    console.log(rows);
  };

  const deleteRow = (rowIndex) => {
    const updatedRows = rows.filter((_, index) => index !== rowIndex);
    setRows(updatedRows);
  };

  const ShowVersment = async () => {
    const Montant_total = rows.reduce((total, item) => total + item.Sum, 0);
    // console.log("rows" + JSON.stringify(rows));

    setpaymentAmount(Montant_total + "");
    setVersment_Money(true);
  };
  const handleValider = async () => {
    var plat = 0;
    var valider_Money = true;
    var valider_Plat = true;
    const Montant_total = rows.reduce((total, item) => total + item.Sum, 0);
    if (Montant_total > 0) {
      for (let r of rows) {
        //  console.log(rows);
        // console.log(r.Nom);
        const Statu = await getProduitStatusByNom(r.Nom, setStatus);
        //  console.log("return this ===" + JSON.stringify(Statu.Return));
        if (Statu.Return === "true") {
          plat = plat + parseInt(r.Quantite);
        }
      }
      // console.log("Montant_total" + Montant_total);
      // console.log("CreditPlat=" + plat);
      // console.log("Versment_Money=" + paymentAmount);
      // console.log("Client_ID=" + CurrentClient_ID);
      //  console.log(valider_Money, valider_Plat);
      console.log(
        "2" + Ancientcreditmoney1,
        Newcreditmoney1,
        Restcreditmoney1,
        AncientcreditPlat1,
        NewcreditPlat1,
        RestcreditPlat1,
        TotalPlat1
      );
      const Facture_ID = await addFacture(
        CurrentClient_ID,
        Montant_total,
        false,
        false,
        plat,
        Ancientcreditmoney1,
        Newcreditmoney1,
        Restcreditmoney1,
        AncientcreditPlat1,
        NewcreditPlat1,
        RestcreditPlat1,
        TotalPlat1
      );
      // console.log("Facture_ID" + Facture_ID);
      var ids = [];
      for (let r of rows) {
        let plat2 = 0;
        const Statu = await getProduitStatusByNom(r.Nom, setStatus);
        //   console.log("return this ===" + JSON.stringify(Statu.Return));
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
      for (let vp of versments) {
        await addVersmentPlat(Facture_ID, vp.Produit_ID, vp.Plat);
      }
      var factversment = VersmentsMoney.reduce(
        (total, item) => total + item,
        0
      );

      const r = await addVersment(Facture_ID, factversment);
      console.log("r" + JSON.stringify(r));

      setRows([]);
      setSbn(true);
    } else {
      const Facture_ID = await addFacture(
        CurrentClient_ID,
        0,
        false,
        false,
        plat,
        Ancientcreditmoney1,
        Newcreditmoney1,
        Restcreditmoney1,
        AncientcreditPlat1,
        NewcreditPlat1,
        RestcreditPlat1,
        TotalPlat1
      );
      for (let vp of versments) {
        await addVersmentPlat(Facture_ID, vp.Produit_ID, vp.Plat);
      }
      var factversment = VersmentsMoney.reduce(
        (total, item) => total + item,
        0
      );

      const r = await addVersment(Facture_ID, factversment);
      console.log("r" + JSON.stringify(r));

      setRows([]);
      setSbn(true);
      // Alert.alert("الرجاء ملأ الفاتورة");
    }
    setversments([]);
    setVersmentsMoney([]);
    setready(false);
  };
  const addVersment_tolist = async () => {
    if (paymentAmount > 0) {
      //  const ver = await addVersment(Facture_ID, paymentAmount);
      //console.log(JSON.stringify(ver));
      setVersmentsMoney((prevVersmentsMoney) => [
        ...prevVersmentsMoney,
        Number(paymentAmount),
      ]);
      setpaymentAmount(0);
      setVersment_Money(false);
    }
    if (NbrPlat > 0) {
      var nom = await getProduiNomby_ID(selectedProduct);
      var CreditPlat = versments;

      var object = {
        Produit_ID: selectedProduct,
        Plat: Number(NbrPlat),
        Nom: nom.Nom,
      };
      console.log(selectedProduct, NbrPlat, nom.Nom);

      // Find the existing product in the versments array
      const existingProductIndex = CreditPlat.findIndex(
        (item) => item.Produit_ID === selectedProduct // Ensure you access the right property
      );

      if (existingProductIndex !== -1) {
        console.log("yes");
        // If the product exists, update its quantity
        CreditPlat[existingProductIndex].Plat += Number(NbrPlat); // Corrected from Plat to NbrPlat
        setversments([...CreditPlat]); // Update the state with the modified array
      } else {
        console.log("no");
        console.log("object" + JSON.stringify(object));
        // If the product doesn't exist, add the new object
        setversments((prevversments) => [...prevversments, object]);
      }
      setNbrPlat(0);
      setVersment_Money(false);
    }
  };
  const DeleteVersment = async (produitId) => {
    // console.log(produitId + "==" + JSON.stringify(versments));
    const r = versments.filter((product) => product.Produit_ID !== produitId);
    setversments(r);
  };
  const DeleteVersmentMoney = async () => {
    var factversment = VersmentsMoney.reduce(
      (total, item) => total + Number(item),
      0
    );
    const newCreditMoney = Number(CreditMoney) + Number(factversment);
    setCreditMoney(newCreditMoney);
    setVersmentsMoney([0]);
  };
  async function GetNom(id) {
    const r = await getProduiNomby_ID(id);
    const Nom = r.Nom;
    console.log(Nom);

    setSelectedproductsPlatNom(Nom);
  }
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
            onPress: () => addVersment_tolist(),
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
            onPress: () => addVersment_tolist(),
            style: "destructive",
          },
        ],
        { cancelable: true }
      );
    }
  };

  useEffect(() => {
    if (!selectedProduct || selecteClient === 0) {
    } else {
      GetNom(selectedProduct);
    }
  }, [selectedProduct]);

  useEffect(() => {
    if (model) {
      GetAll("client", setclient);
    }
  }, [model]);
  useEffect(() => {
    if (QuantiteField.current) {
      QuantiteField.current.focus();
    }
  }, [selectedProductName]);
  async function GetProducts() {
    if (!model) {
      var result = await GetAll("produit", setproduct);
      if (!result[0]) {
        Alert.alert("لايوجد منتج", " الرجاء اضافة منتج من القائمة=> المنتجات");
      } else {
        var trueProducts = [];
        result.map((r) => {
          if (r.Return === "true") {
            console.log("rrrrrr" + JSON.stringify(r));
            trueProducts.push(r);
          }
        });
        setproduct_True(trueProducts);
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
                {products_True.map((product) => (
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

      <View>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <Text style={styles.modalTitle}>فاتورة الزبون:{selectedClient}</Text>
        </View>
      </View>

      <FactTable
        Thead={Thead}
        rowss={rows}
        Savefunction={handleValider}
        Deletefunction={deleteRow}
        Printfunction={print}
        Facture_ID={Facture_ID}
        client_name={CurrentClient}
        Versments={versments}
        VersmentsMoney={VersmentsMoney}
        functionVersment={ShowVersment}
        DeleteVersment={DeleteVersment}
        DeleteVersmentMoney={DeleteVersmentMoney}
        Client_ID={CurrentClient_ID}
        setcredis={updateCredits}
        sbn={Sbn}
        setsbn={setSbn}
        VersmentMoneyInit={VersmentMoneytofact}
        VersmentPlatInit={VersmentPlattofact}
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
    marginBottom: 0,
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
