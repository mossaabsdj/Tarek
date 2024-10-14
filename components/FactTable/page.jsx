import React, { useState, useEffect } from "react";
import {
  Image,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  View,
  I18nManager,
  Touchable,
  TouchableOpacity,
  Button,
} from "react-native";
import { useRef } from "react";
import * as Print from "expo-print";
import PrintIcon from "@/assets/icons/printer1.png";
import VaiderIcon from "@/assets/icons/validation.png";
import VersmentIcon from "@/assets/icons/Versment.png";
import FactureIcon from "@/assets/icons/invoice.png";
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
  GetClient_FacturesMoney,
  GetFacturesVersment,
  GetFacturesVersmentPlat,
  GetClient_FacturesPlat,
  GetFactures_Factprod,
} from "@/app/Lib/bdd";
function ccyFormat(num) {
  return `${num.toFixed(2)}`;
}

function priceRow(qty, unit) {
  return qty * unit;
}

function subtotal(items) {
  return items.reduce((total, item) => total + item.Sum, 0);
}

export default function SpanningTable({
  rowss,
  Thead,
  Deletefunction,
  Savefunction,
  Facture_ID,
  client_name,
  Versments,
  VersmentsMoney,
  functionVersment,
  DeleteVersment,
  DeleteVersmentMoney,
  Client_ID,
  setcredis,
}) {
  const scrollViewRef = useRef();
  var NewThead = ["Sum", "Quantite", "Prix", "Nom"];
  const [rows, setRows] = useState(rowss);
  const [MoneyVersment, setMoneyVersment] = useState([]);
  const [PlatVersment, setPlatVersment] = useState([]);
  const [editCell, setEditCell] = useState({ rowIndex: null, colName: null });
  const inputRefs = useRef({}); // Ref to store input references
  const [facture_id, setfacture_id] = useState();
  const [CurrentClient_ID, setCurrentClient_ID] = useState(0);
  const [Ancientcreditmoney, setAncientcreditmoney] = useState(0);
  const [Newcreditmoney, setNewcreditmoney] = useState(0);
  const [Restcreditmoney, setRestcreditmoney] = useState(0);
  const [TotalPlatObject, setTotalPlatObject] = useState([]);
  const [TotalPlat, setTotalPlat] = useState(0);

  const [AncientcreditPlat_Object, setAncientcreditPlat_Object] = useState([]);
  const [AncientcreditPlat, setAncientcreditPlat] = useState(0);
  const [NewcreditPlat, setNewcreditPlat] = useState(0);
  const [NewcreditPlatObject, setNewcreditPlatObject] = useState([]);

  const [RestcreditPlat, setRestcreditPlat] = useState(0);
  const [Status, setStatus] = useState([{ S: "s" }]);

  async function GetTotalCreditMoney(id) {
    var creditMoney = 0;
    const Factures = await GetClient_FacturesMoney(id);
    for (let Fact of Factures) {
      var Arrayversment = [];

      if (Fact) {
        const versment = await GetFacturesVersment(Fact.Facture_ID);
        // console.log("versment" + JSON.stringify(versment));
        if (versment) {
          for (let ver of versment) {
            // console.log("versment" + JSON.stringify(versment));
            Arrayversment.push(ver.Somme);
          }
          var factversment = Arrayversment.reduce(
            (total, item) => total + item,
            0
          );
          //  console.log("All Facture Versment" + factversment);
          //console.log(factversment + "===" + Fact.Montant_Total);
          creditMoney = creditMoney + (Fact.Montant_Total - factversment);

          //  console.log("creditMoney" + creditMoney);
        }
      }
    }

    setAncientcreditmoney(creditMoney);
  }
  async function GetTotalCreditPlat(id) {
    var CreditPlat = [];
    var VersmentPlat = [];
    const Factures = await GetClient_FacturesPlat(id);
    for (let Fact of Factures) {
      if (Fact) {
        const FactProds = await GetFactures_Factprod(Fact.Facture_ID);
        // console.log("FactProds" + JSON.stringify(Factures));
        for (let fp of FactProds) {
          var nom = await getProduiNomby_ID(fp.Produit_ID);
          if (nom) {
            var object = { Produit: nom.Nom, Plat: fp.Plat };
            const existingProduct = CreditPlat.find(
              (item) => item.Produit === nom.Nom
            ); // Check if the product exists
            if (existingProduct) {
              existingProduct.Plat += fp.Plat;
            } else {
              CreditPlat.push(object);
            }
          }
        }
      }
      const Versments = await GetFacturesVersmentPlat(Fact.Facture_ID);
      if (Versments) {
        for (let vers of Versments) {
          var nom = await getProduiNomby_ID(vers.Produit_ID);
          if (nom) {
            var object = { Produit: nom.Nom, Plat: vers.Plat };
            const existingProduct = VersmentPlat.find(
              (item) => item.Produit === nom.Nom
            ); // Check if the product exists
            if (existingProduct) {
              existingProduct.Plat += vers.Plat;
            } else {
              VersmentPlat.push(object);
            }
          }
        }
      }
    }

    // Function to find the Plat value of a specific product
    const findPlatValue = (array, productName) => {
      const product = array.find((item) => item.Produit === productName);
      return product ? product.Plat : 0; // Return 0 if product not found
    };

    // Final result array
    const finalResults = [];

    // Calculate the difference for each product in CreditPlat
    CreditPlat.forEach((credit) => {
      const productName = credit.Produit;
      const creditPlat = credit.Plat;
      const versementPlat = findPlatValue(VersmentPlat, productName);

      // Calculate the difference
      const difference = creditPlat - versementPlat;

      // Push the result into the final array
      finalResults.push({
        Produit: productName,
        Plat: difference,
        vrsment: versementPlat,
        credit: creditPlat,
      });
    });
    setAncientcreditPlat_Object(finalResults);
    console.log("finalResults" + JSON.stringify(finalResults));
    var creditOmbalagee = "\n";
    finalResults.map((cp, i) => {
      if (i === 0) {
      } else {
        creditOmbalagee = creditOmbalagee + "\n";
      }
      creditOmbalagee = creditOmbalagee + cp.Plat + ":" + cp.Produit + "  ";
    });
    setAncientcreditPlat(creditOmbalagee);
    // console.log("CreditPlat" + JSON.stringify(CreditPlat));
  }
  async function GetFacturTotalPlat() {
    var Total_Plat = [];
    for (let r of rows) {
      let plat2 = 0;
      const Statu = await getProduitStatusByNom(r.Nom, setStatus);
      //   console.log("return this ===" + JSON.stringify(Statu.Return));
      if (Statu.Return === "true") {
        var object = { Produit: r.Nom, Plat: parseInt(r.Quantite) };
      }
      Total_Plat.push(object);
    }
    setTotalPlatObject(Total_Plat);
    console.log("current==" + JSON.stringify(Total_Plat));
  }
  useEffect(() => {
    setCurrentClient_ID(Client_ID);
    GetTotalCreditMoney(Client_ID);
    GetTotalCreditPlat(Client_ID);
  }, [Client_ID]);
  useEffect(() => {
    // console.log(JSON.stringify(Versments));
    setPlatVersment(Versments);
  }, [Versments]);
  useEffect(() => {
    if (VersmentsMoney != 0) {
      var factversment = VersmentsMoney.reduce(
        (total, item) => total + Number(item),
        0
      );

      setMoneyVersment(factversment);
    } else {
      setMoneyVersment(VersmentsMoney);
    }
  }, [VersmentsMoney]);
  useEffect(() => {}, [MoneyVersment]);
  useEffect(() => {
    const updatedRows = rowss.map((object) => {
      object.Sum = object.Prix_Achat
        ? priceRow(object.Quantite, object.Prix_Achat)
        : priceRow(object.Quantite, object.Prix);
      return object;
    });
    setRows(updatedRows);

    scrollToBottom();
  }, [rowss]);
  useEffect(() => {
    setfacture_id(Facture_ID);
  }, [Facture_ID]);
  useEffect(() => {
    setRestcreditmoney(Newcreditmoney - MoneyVersment);
  }, [Newcreditmoney, MoneyVersment]);
  useEffect(() => {
    setNewcreditmoney(Ancientcreditmoney + subtotal(rows));
    GetFacturTotalPlat();
  }, [rows]);
  useEffect(() => {
    const newobject = AncientcreditPlat_Object.map((obj) => ({ ...obj }));
    newobject.map((m) => {
      delete m.vrsment;
      delete m.credit;
    });

    setTotalPlat(JSON.stringify(TotalPlatObject));
    TotalPlatObject.map((tp) => {
      const existingProductIndex = newobject.findIndex(
        (item) => item.Produit === tp.Produit
      );

      // Ensure newobject is an array and initialize it if necessary
      if (!Array.isArray(newobject)) {
        newobject = [];
      }

      if (existingProductIndex !== -1) {
        // Ensure newobject[existingProductIndex] exists before accessing .Plat
        if (!newobject[existingProductIndex]) {
          newobject[existingProductIndex] = { Produit: tp.Produit, Plat: 0 }; // Initialize the product object
        }

        console.log(
          "traitment-----" +
            newobject[existingProductIndex].Plat +
            "---" +
            Number(tp.Plat)
        );
        newobject[existingProductIndex].Plat += Number(tp.Plat);
      } else {
        newobject.push({ Produit: tp.Produit, Plat: tp.Plat });
      }
    });

    setNewcreditPlatObject(newobject);
    var creditOmbalagee = "\n";
    newobject.map((cp, i) => {
      if (i === 0) {
      } else {
        creditOmbalagee = creditOmbalagee + "\n";
      }
      creditOmbalagee = creditOmbalagee + cp.Plat + ":" + cp.Produit + "  ";
    });
    setNewcreditPlat(creditOmbalagee);

    // Check if the product already exists in the rows
  }, [TotalPlatObject]);
  useEffect(() => {
    const newobject = NewcreditPlatObject.map((obj) => ({ ...obj }));
    if (!PlatVersment[0]) {
      console.log;
      setRestcreditPlat(NewcreditPlat);
    } else {
      PlatVersment.map((tp) => {
        const existingProductIndex = newobject.findIndex(
          (item) => item.Produit === tp.Nom
        );

        // Ensure newobject is an array and initialize it if necessary
        if (!Array.isArray(newobject)) {
          newobject = [];
        }

        if (existingProductIndex !== -1) {
          // Ensure newobject[existingProductIndex] exists before accessing .Plat
          if (!newobject[existingProductIndex]) {
            newobject[existingProductIndex] = { Produit: tp.Nom, Plat: 0 }; // Initialize the product object
          }

          console.log(
            "traitment-----" +
              newobject[existingProductIndex].Plat +
              "---" +
              Number(tp.Plat)
          );
          newobject[existingProductIndex].Plat -= Number(tp.Plat);
        } else {
          newobject.push({ Produit: tp.Nom, Plat: tp.Plat });
        }
      });

      // setRestcreditPlat(newobject);
      var creditOmbalagee = "\n";
      newobject.map((cp, i) => {
        if (i === 0) {
        } else {
          creditOmbalagee = creditOmbalagee + "\n";
        }
        creditOmbalagee = creditOmbalagee + cp.Plat + ":" + cp.Produit + "  ";
      });
      setRestcreditPlat(creditOmbalagee);
    }

    // Check if the product already exists in the rows
  }, [PlatVersment, NewcreditPlat]);

  const handleInputChange = (rowIndex, colName, value) => {
    const updatedRows = [...rows];
    const row = updatedRows[rowIndex];

    if (isNaN(value) || value < 0) {
      if (colName === "Quantite") {
        row.Quantite = 0;
      } else if (colName === "Prix_Achat") {
        row.Prix_Achat = 0;
      } else if (colName === "Prix") {
        row.Prix = 0;
      }
    } else {
      if (colName === "Quantite") {
        row.Quantite = value;
      } else if (colName === "Prix_Achat") {
        row.Prix_Achat = value;
      } else if (colName === "Prix") {
        row.Prix = value;
      }
    }

    row.Sum = priceRow(row.Quantite, row.Prix_Achat || row.Prix);

    setRows(updatedRows);
  };

  const handleCellClick = (rowIndex, colName) => {
    setEditCell({ rowIndex, colName });
  };

  const handleBlur = () => {
    setEditCell({ rowIndex: null, colName: null });
  };

  const deleteRow = (rowIndex) => {
    setcurrentcreditmoney(Number(currentcreditmoney) - rows[rowIndex].Sum);
    const updatedRows = rows.filter((_, index) => index !== rowIndex);
    setRows(updatedRows);
  };
  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      //   scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };
  const invoiceSubtotal = subtotal(rows);
  const printFacture = async () => {
    try {
      await printCredit();
      const htmlFacture = `
      <html>
        <head>
          <style>
            body {
              font-family: 'Tahoma', 'Arial', sans-serif;
              margin: 0;
              padding: 0;
              direction: rtl;
            }
            .ticket {
              width: 100%;
              padding: 0;
              box-sizing: border-box;
            }
            h1 {
              font-size: 3em; 
              text-align: center;
              margin-bottom: 10px;
            }
            .header {
              font-size: 2.5em;
              margin-bottom: 10px;
              text-align: center;
              padding-bottom: 5px;
            }
            .separator {
              text-align: center;
              font-size: 2em;
              margin: 10px 0;
            }
            .date-client {
              font-size: 2.5em;
              margin-bottom: 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 0 10px;
            }
            .items {
              font-size: 2em;
              margin-bottom: 0px;
              text-align: right;
              padding: 0 10px;
            }
            .item {
              padding: 5px 0;
              display: flex;
              justify-content: space-between;
            }
            .item span {
              text-align: center;
              font-size: 1.4em;
              width: 20%;
            }
            .total {
              font-weight: bold;
              font-size: 4em;
              padding-top: 10px;
              margin-top: 10px;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="header">قلب اللوز طاهر</div>

            <div class="date-client">
              <div>${new Date().toLocaleDateString("fr-FR")}</div>
              <div>اسم العميل: ${client_name}</div>
            </div>

            <div class="separator">- - - - - - - - - - - - - - - - - - - - - -</div>

            <div class="items">
              <div class="item">
                <span>الرقم</span>
                <span>المنتج</span>
                <span>السعر</span>
                <span>الكمية</span>
                <span>المجموع</span>
              </div>
              ${rows
                .map(
                  (row, index) => `
                    <div class="item">
                      <span>${index + 1}</span>
                      <span>${row.Nom}</span>
                      <span>${row.Prix}DA</span>
                      <span>${row.Quantite}</span>
                      <span>${row.Sum}DA</span>
                    </div>
                  `
                )
                .join("")}
            </div>

            <div class="separator">- - - - - - - - - - - - - - - - - - - - - -</div>

            <div class="total">المجموع: ${invoiceSubtotal}.00DA</div>
          </div>
        </body>
      </html>
    `;

      await Print.printAsync({
        html: htmlFacture,
      });
    } catch (error) {
      console.error("Error printing facture: ", error);
    }
  };

  const printCredit = async () => {
    try {
      const htmlCredit = `
      <html>
        <head>
          <style>
            body {
              font-family: Tahoma, Arial, sans-serif;
              margin: 0;
              padding: 0;
              direction: rtl;
            }
            .credits {
              font-size: 1.8em;
              text-align: right;
              padding: 0 10px;
            }
            table {
              width: 100%;
              font-size: 1.3em;
              border-collapse: collapse;
              border: 1px dashed #000;
            }
            td, th {
              padding: 5px;
              border-bottom: 1px dashed #000;
            }
            .credit-title {
              font-weight: bold;
              font-size: 1.5em;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="credits">
            <table>
              ${[
                {
                  title: "الديون السابقة",
                  items: [
                    { label: "المال", value: `${Ancientcreditmoney} DA` },
                    { label: "الأطباق", value: AncientcreditPlat },
                  ],
                },
                {
                  title: "الديون الجديدة",
                  items: [
                    { label: "المال", value: `${Newcreditmoney} DA` },
                    { label: "الأطباق", value: NewcreditPlat },
                  ],
                },
                {
                  title: "الدفعات",
                  items: [
                    { label: "المال", value: `${MoneyVersment} DA` },
                    ...Versments.map((item) => ({
                      label: "الأطباق",
                      value: `${item.Nom} = ${item.Plat}`,
                    })),
                  ],
                },
                {
                  title: "الباقي",
                  items: [
                    { label: "المال", value: `${Restcreditmoney} DA` },
                    { label: "الأطباق", value: RestcreditPlat },
                  ],
                },
              ]
                .map(
                  (section) => `
                  <tr class="credit-section">
                    <th colspan="2" class="credit-title">${section.title}</th>
                  </tr>
                  ${section.items
                    .map(
                      (item) => `
                      <tr>
                        <th>${item.label}</th>
                        <td>${item.value}</td>
                      </tr>
                    `
                    )
                    .join("")}
                `
                )
                .join("")}
            </table>
          </div>
        </body>
      </html>
    `;

      await Print.printAsync({
        html: htmlCredit,
      });
    } catch (error) {
      console.error("Error printing credit: ", error);
    }
  };
  async function SaveAll() {
    console.log(
      "1" + Ancientcreditmoney,
      Newcreditmoney,
      Restcreditmoney,
      AncientcreditPlat,
      NewcreditPlat,
      RestcreditPlat,
      TotalPlat
    );
    setcredis(
      Ancientcreditmoney,
      Newcreditmoney,
      Restcreditmoney,
      AncientcreditPlat,
      NewcreditPlat,
      RestcreditPlat,
      TotalPlat,
      true
    );

    // await Savefunction();

    setPlatVersment([]);
    setMoneyVersment([]);
    setNewcreditmoney(0);
    setNewcreditPlat(0);
    await GetTotalCreditMoney(CurrentClient_ID);
    await GetTotalCreditPlat(CurrentClient_ID);
  }
  useEffect(() => {
    if (!I18nManager.isRTL) {
      I18nManager.forceRTL(true);
      I18nManager.allowRTL(true);
    }
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.table} ref={scrollViewRef}>
        <View style={styles.head}>
          <Pressable
            style={styles.iconButton}
            onPress={() => functionVersment()}
          >
            <Image source={VersmentIcon} style={styles.icon} />
          </Pressable>

          <Pressable style={styles.iconButton} onPress={printFacture}>
            <Image source={PrintIcon} style={styles.icon} />
          </Pressable>

          <Pressable style={styles.iconButton} onPress={() => SaveAll()}>
            <Image source={VaiderIcon} style={styles.icon} />
          </Pressable>
        </View>

        {/* Table Headers */}
        <View style={styles.row}>
          <Text style={styles.headerCell}>الإجراء</Text>
          {Thead.map((th, i) => (
            <Text key={i} style={styles.headerCell}>
              {th}
            </Text>
          ))}
          <Text>الرقم</Text>
        </View>
        {rows.map((row, N) => (
          <View key={row.id || N} style={styles.row}>
            <Pressable
              style={styles.buttonDelete}
              onPress={() => Deletefunction(N)}
            >
              <Text style={styles.DeleteButtonText}>حذف</Text>
            </Pressable>
            {NewThead.map((th, i) => (
              <Pressable
                key={i}
                style={styles.cell}
                onPress={() => handleCellClick(N, th)}
              >
                {editCell.rowIndex === N && editCell.colName === th ? (
                  <TextInput
                    value={String(row[th])}
                    onChangeText={(text) =>
                      handleInputChange(N, th, parseFloat(text))
                    }
                    onBlur={handleBlur}
                    style={styles.input}
                  />
                ) : (
                  <Text>{row[th]}</Text>
                )}
              </Pressable>
            ))}

            <Text>{N + 1}</Text>
          </View>
        ))}

        {/* Total Calculations */}

        <View style={styles.row}>
          <Text style={styles.rowTotal}>
            مجموع الفاتورة: {subtotal(rowss)}DA
          </Text>
        </View>
        <View style={styles.footerSection}>
          {/* Total Calculations */}

          {/* Row for Ancien Credit */}
          <View style={styles.rowHeader}>
            <Text style={styles.rowHeaderText}>الديون السابقة</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.cell}>المال : {Ancientcreditmoney}</Text>
            <Text style={styles.cell}> الأطباق : {AncientcreditPlat}</Text>
          </View>

          {/* Row for New Credit */}
          <View style={styles.rowHeader}>
            <Text style={styles.rowHeaderText}>الديون الجديدة</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.cell}> المال :{Newcreditmoney}</Text>
            <Text style={styles.cell}> الأطباق :{NewcreditPlat}</Text>
          </View>

          {/* Row for Versment */}
          <View style={styles.rowHeader}>
            <Text style={styles.rowHeaderText}>الدفعات</Text>
          </View>
          <View style={styles.row}>
            <TouchableOpacity
              onPress={() => DeleteVersmentMoney()}
              style={styles.buttonDelete2}
            >
              <Text style={styles.DeleteButtonText}>حذف</Text>
            </TouchableOpacity>
            <Text style={styles.cell}> المال: {MoneyVersment}DA</Text>
          </View>

          {Versments.map((item, index) => (
            <View key={index} style={styles.row}>
              <TouchableOpacity
                onPress={() => DeleteVersment(item.Produit_ID)}
                style={styles.buttonDelete2}
              >
                <Text style={styles.DeleteButtonText}>حذف</Text>
              </TouchableOpacity>
              <Text style={styles.cell}>
                الأطباق: {item.Nom} - {item.Plat}
              </Text>
            </View>
          ))}

          {/* Row for Rest */}
          <View style={styles.rowHeader}>
            <Text style={styles.rowHeaderText}>الباقي</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.cell}> المال: {Restcreditmoney}</Text>
            <Text style={styles.cell}> الأطباق: {RestcreditPlat}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 0,
    borderRadius: 20,
  },
  table: {
    margin: 20,
    borderColor: "black",
    borderRadius: 20,
    borderWidth: 1,
    height: 500,
  },
  head: {
    backgroundColor: "dodgerblue",
    padding: 10,
    borderTopEndRadius: 20,
    borderTopStartRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  row: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignContent: "center",
    alignItems: "center",
    padding: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  rowTotal: {
    fontWeight: "bold",
    fontSize: 24,
    padding: 20,
  },
  headerCell: {
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  cell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "gray",
    height: 30,
    width: 100,
    textAlign: "center",
    margin: 5,
  },
  buttonDelete: {
    backgroundColor: "red",
    height: 40,
    width: 40,
    alignContent: "center",
    justifyContent: "center",
  },
  DeleteButtonText: {
    color: "white",
    textAlign: "center",
    justifyContent: "center",
  },
  iconButton: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderColor: "#b5e2ff",
    borderWidth: 2.5,
    borderRadius: 10,
    width: 50,
    height: 35,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  icon: {
    width: 30,
    height: 30,
  },
  inputLabel: {
    fontWeight: "bold",
    marginRight: 10, // Adjust spacing as needed
    alignSelf: "center", // Center the label vertically
  },
  footerSection: {
    marginTop: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
    paddingTop: 10,
  },
  rowHeader: {
    backgroundColor: "#f0f0f0", // Light gray for header background

    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  rowHeaderText: {
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
    color: "#333",
    padding: 5,
  },
  rowTotal: {
    fontWeight: "bold",
    fontSize: 24,
    paddingVertical: 15,
    paddingHorizontal: 20,
    textAlign: "center",
  },
  cell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
    fontSize: 13,
  },
  buttonDelete2: {
    backgroundColor: "red",
    padding: 8,
    borderRadius: 5,
    marginLeft: 10,
    alignItems: "center",
  },
  DeleteButtonText2: {
    color: "white",
    fontWeight: "bold",
  },
});
