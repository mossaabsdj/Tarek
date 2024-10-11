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
} from "react-native";
import { useRef } from "react";
import * as Print from "expo-print";
import PrintIcon from "@/assets/icons/printer1.png";
import VaiderIcon from "@/assets/icons/validation.png";

import FactureIcon from "@/assets/icons/invoice.png";

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
}) {
  const scrollViewRef = useRef();
  var NewThead = ["Sum", "Quantite", "Prix", "Nom"];
  const [rows, setRows] = useState(rowss);
  const [editCell, setEditCell] = useState({ rowIndex: null, colName: null });
  const inputRefs = useRef({}); // Ref to store input references
  const [facture_id, setfacture_id] = useState();
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
            style={{
              display: "flex",
              justifyContent: "center",
              alignContent: "center",
              backgroundColor: "white",
              borderColor: "#b5e2ff",
              borderWidth: 2.5,
              borderRadius: 10,
              width: 50,
              height: 35,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 5,
              },
              shadowOpacity: 0.3,
              shadowRadius: 10,
              // Android elevation property
              elevation: 5,
            }}
            onPress={() => Savefunction()}
          >
            <Image source={VaiderIcon} style={styles.icon} />
          </Pressable>
          <Pressable
            style={{
              display: "flex",
              justifyContent: "center",
              alignContent: "center",
              backgroundColor: "white",
              borderColor: "#b5e2ff",
              borderWidth: 2.5,
              borderRadius: 10,
              width: 50,
              height: 35,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 5,
              },
              shadowOpacity: 0.3,
              shadowRadius: 10,
              // Android elevation property
              elevation: 5,
            }}
            onPress={print}
          >
            <Image source={PrintIcon} style={styles.icon} />
          </Pressable>
        </View>
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
        <View style={styles.row}>
          <Text style={styles.rowTotal} colSpan={3}>
            {invoiceSubtotal} DA
          </Text>
          <Text style={styles.rowTotal} colSpan={3}>
            المبلغ الإجمالي
          </Text>
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
    // borderRadius: "20px",
    borderColor: "black",
    borderRadius: 20,

    borderWidth: 1,
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)", // Use boxShadow for shadow effects
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
  details: {
    fontSize: 18,
    fontWeight: "bold",
    color: "whitesmoke",
  },
  library: {
    color: "whitesmoke",
  },
  row: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    padding: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  rowTotal: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    padding: 20,
    fontWeight: "bold",
    fontSize: 24,
    borderBottomColor: "#ccc",
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
    width: 60,
    textAlign: "center",
  },
  buttonDelete: {
    alignSelf: "center",
    alignContent: "center",
    justifyContent: "center",
    borderRadius: 3,
    backgroundColor: "red",
    height: 40,
    width: 40,
  },
  DeleteButtonText: {
    alignSelf: "center",
    color: "white",
  },
  printButton: {
    backgroundColor: "dodgerblue",
    padding: 10,
    borderRadius: 5,
    fontWeight: "bold",
  },
  printButtonText: {
    fontSize: 18,

    color: "whitesmoke",
    fontWeight: "bold",
  },
  icon: {
    alignSelf: "center",
    justifyContent: "center",
    alignContent: "center",
    width: 30, // Set width of the icon
    height: 30, // Set height of the icon
  },
});
