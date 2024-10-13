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
  const [currentcreditmoney, setcurrentcreditmoney] = useState(0);
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
          if (factversment < Fact.Montant_Total) {
            //console.log(factversment + "===" + Fact.Montant_Total);
            creditMoney = creditMoney + (Fact.Montant_Total - factversment);
          }
          //  console.log("creditMoney" + creditMoney);
        }
      }
    }

    const newvalue =
      Number(creditMoney) + Number(subtotal(rows)) - Number(MoneyVersment);
    console.log("newvalue" + subtotal(rows));
    setcurrentcreditmoney(newvalue);
  }
  async function GetTotalCreditPlat() {
    var CreditPlat = [];
    var VersmentPlat = [];
    const Factures = await GetClient_FacturesPlat();
    for (let Fact of Factures) {
      if (Fact) {
        const FactProds = await GetFactures_Factprod(Fact.Facture_ID);
        // console.log("FactProds" + JSON.stringify(FactProds));
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
    console.log(
      "Verment:" +
        JSON.stringify(VersmentPlat) +
        "Credit Plat" +
        JSON.stringify(CreditPlat)
    );
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

    var creditOmbalagee = "\n";
    finalResults.map((cp, i) => {
      if (i === 0) {
      } else {
        creditOmbalagee = creditOmbalagee + "\n";
      }
      creditOmbalagee = creditOmbalagee + cp.Plat + ":" + cp.Produit + "  ";
    });
    setClients((prevClients) =>
      prevClients.map(
        (cl) =>
          cl.Client_ID === Client.Client_ID
            ? {
                ...cl,
                creditOmbalage: creditOmbalagee,
              } // Update creditOmbalage for the selected client
            : cl // Keep other clients unchanged
      )
    );
    // console.log("CreditPlat" + JSON.stringify(CreditPlat));
  }

  useEffect(() => {
    setCurrentClient_ID(Client_ID);
    GetTotalCreditMoney(Client_ID);
  }, [Client_ID]);
  useEffect(() => {
    // console.log(JSON.stringify(Versments));
    setPlatVersment(Versments);
  }, [Versments]);
  useEffect(() => {
    console.log("VersmentsMoney" + VersmentsMoney);
    if (VersmentsMoney != 0) {
      var factversment = VersmentsMoney.reduce(
        (total, item) => total + Number(item),
        0
      );
      console.log("Total" + factversment);

      setMoneyVersment(factversment);
    } else {
      setMoneyVersment(VersmentsMoney);
    }
  }, [VersmentsMoney]);
  useEffect(() => {
    GetTotalCreditMoney(CurrentClient_ID);
  }, [MoneyVersment]);
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
    GetTotalCreditMoney(CurrentClient_ID);
  }, [rows]);
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
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };
  const invoiceSubtotal = subtotal(rows);
  const print = async () => {
    try {
      const htmll = `
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
              font-size: 3em; /* Title smaller for a thermal receipt look */
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
              padding-bottom: 5px;
              margin-right:80px;
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
               margin-bottom: 40px;
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
            .footer {
              margin-top: 10px;
              font-size: 2.5em;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <h1>RECEIPT</h1>
            <div class="header">
             قلب اللوز طاهر
            </div>

            <div class="separator">- - - - - - - - - - - - - - - - - - - - -- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -</div>

            <div class="date-client">
              <div>${new Date().toLocaleDateString("fr-FR")}</div>
              <div>اسم العميل: ${client_name}</div>
            </div>

            <div class="separator"> - - - - - - - - - - - - - - - - - - - -- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -</div>

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

            <div class="separator"> - - - - - - - - - - - - - - - - - - - -- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -</div>

            <div class="total">
              المجموع: ${invoiceSubtotal}.00DA
            </div>

            <div class="separator">- - - - - - - - - - - - - - - - - - - -- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -</div>

            <div class="footer">
              شكراً لتسوقكم!<br />
              زورونا مرة أخرى.
            </div>

            <div class="separator">- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -</div>
          </div>
        </body>
      </html>
    `;

      await Print.printAsync({
        html: htmll,
      });
    } catch (error) {
      console.error("Error printing: ", error);
    }
  };

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

          <Pressable style={styles.iconButton} onPress={print}>
            <Image source={PrintIcon} style={styles.icon} />
          </Pressable>

          <Pressable style={styles.iconButton} onPress={() => Savefunction()}>
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
        <View>
          <Text style={styles.row}>جميع ديون المال:{currentcreditmoney}</Text>

          <Text style={styles.row}>جميع ديون الأطباق:</Text>

          {Versments.map((item, index) => (
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignContent: "center",
              }}
            >
              <Text key={index} style={styles.row}>
                دفعة الأطباق: {item.Nom} - {item.Plat}
              </Text>
              <TouchableOpacity
                onPress={() => DeleteVersment(item.Produit_ID)}
                style={{
                  backgroundColor: "red",
                  display: "flex",
                  flexDirection: "row",
                  alignContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "white",

                    justifyContent: "center",
                  }}
                >
                  حدف
                </Text>
              </TouchableOpacity>
            </View>
          ))}
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignContent: "center",
            }}
          >
            <Text style={styles.row}>دفعة المال: {MoneyVersment}DA</Text>
            <TouchableOpacity
              onPress={() => DeleteVersmentMoney()}
              style={{
                backgroundColor: "red",
                display: "flex",
                flexDirection: "row",
                alignContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "white",

                  justifyContent: "center",
                }}
              >
                حدف
              </Text>
            </TouchableOpacity>
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
});
