import React, { useState, useEffect } from "react";
import {
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
          direction: rtl; /* Right-to-left for Arabic */
        }
       .ticket {
  width: 100%; /* Adjust this based on your printer's width */
  padding: 0;
  box-sizing: border-box;
}
        h1 {
          font-size: 5em; /* Further increased font size for the title */
          text-align: center;
          margin-bottom: 20px;
        }
        .header {
          font-size: 4em; /* Further increased font size for invoice number */
          margin-bottom: 15px;
          text-align: center;
        }
        .date-client {
          font-size: 3.5em; /* Further increased font size for date and client name */
          margin-bottom: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .items {
          font-size: 3em; /* Further increased font size for item details */
          margin-bottom: 30px;
          text-align: right; /* Align item details to the right */
        }
        .item {
          border-bottom: 1px dashed #ccc;
          padding: 10px 0;
          display: flex;
          justify-content: space-between;
        }
        .item span {
          width: 20%; /* Adjust width for proper alignment */
          text-align: center;
        }
        .total {
          font-weight: bold;
          font-size: 4em; /* Further increased font size for total */
          border-top: 2px dashed #000;
          padding-top: 15px;
          margin-top: 20px;
          text-align: center;
        }
        .footer {
          margin-top: 40px;
          font-size: 3em; /* Further increased font size for footer */
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="ticket">
        <div class="header">
          رقم الفاتورة: ${facture_id}
        </div>
        <div class="date-client">
          <div>التاريخ: ${new Date().toLocaleDateString("fr-FR")}</div>
          <div>اسم العميل: ${client_name}</div>
        </div>
        <div class="items">
          <div class="item">
            <span>الرقم</span>
            <span>الاسم</span>
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
                  <span>${row.Prix}DA </span>
                  <span>${row.Quantite}</span>
                  <span>${row.Sum}DA</span>
                </div>
              `
            )
            .join("")}
        </div>
        <div class="total">
          المجموع:${invoiceSubtotal}DA
        </div>
        <div class="footer">
          شكراً لتسوقكم!<br />
          زورونا مرة أخرى.
        </div>
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
      <ScrollView style={styles.table}>
        <View style={styles.head}>
          <Pressable onPress={() => Savefunction()}>
            <Text style={styles.details}>تأكيد</Text>
          </Pressable>
          <Text style={styles.library}>طارق</Text>
          <Pressable onPress={print}>
            <Text style={styles.printButtonText}>طباعة</Text>
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
});
