import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Image,
} from "react-native";
import * as Print from "expo-print";

import Icon from "react-native-vector-icons/FontAwesome"; // Add FontAwesome for arrow icon
import {
  GetMontantTotalByClient,
  GetFacturesVersment,
  GetClient_FacturesMoney,
} from "@/app/Lib/bdd";
import PrintIcon from "@/assets/icons/printer1.png";

const Page = ({ handleReturn, Date }) => {
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const months = [
    "جانفي",
    "فيفري",
    "مارس",
    "أفريل",
    "ماي",
    "جوان",
    "جويلية",
    "أوت",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];
  async function GetClients(Date) {
    const r = await GetMontantTotalByClient(Date);
    setClients(r);
    console.log(JSON.stringify(r));
    await GetTotalCreditMoney(r);
  }
  useEffect(() => {
    GetClients(Date);
  }, []);
  useEffect(() => {}, []);
  const handlePrint = (clientName) => {
    alert(`تم إرسال بيانات ${clientName} للطباعة`);
    // Add actual print functionality if needed
  };
  async function PrintClients() {
    // Initialize total amount variable
    let All_Montant = 0;
    // Create HTML content to format the factures for printing in Arabic (RTL)    border-right: 15px dashed #000;
    const mounth = GetMounth(Date);
    let htmlContent = `
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <style>
            body { 
              font-family: 'Arial', sans-serif; 
              margin: 20px;
              text-align: right; 
              font-size: 18px; /* Increased font size */
  
              }
            table { 
              width: 100%; 
              margin-top: 20px; 
              direction: rtl; 
              font-size: 5px; /* Increased font size for table */
            }
            th, td { 
              padding: 12px; /* Increased padding */
              text-align: right; 
              font-size: 32px; /* Increased font size for table */
            }
            th { 
              background-color: #f2f2f2; 
            }
          </style>
        </head>
        <body>
         <div style="display: flex; justify-content: space-between; flex-direction: row;">
    <h1 style="font-size: 45px;">تفاصيل المشتريات لشهر ${mounth} </h1>
  </div>
  
  
          <table>
            <tr>
              <td colspan="3">-----------------------------------------------------------------</td>
            </tr>
            <tr>
              <th>الاسم الكامل</th>
              <th>اجمالي المشتربات</th>        
              <th>اجمالي الديون</th>
            </tr>
            <tr>
              <td colspan="3">-----------------------------------------------------------------</td>
            </tr>
    `;

    // Add rows for each facture and sum up the total amounts
    clients.forEach((client) => {
      const { Nom, Prenom, TotalMontant, creditMoney } = client;

      // Add the actual data row
      htmlContent += `
        <tr>
          <td>${Nom + " " + Prenom}</td>
          <td>${TotalMontant}DA</td>
          <td>${creditMoney}DA</td>
        
        </tr>
        <tr>
              <td colspan="3">-----------------------------------------------------------------</td>
        </tr>
      `;

      // Accumulate the total for Montant_Total
      All_Montant += TotalMontant || 0; // Ensure that if Montant_Total is undefined, 0 is added
    });

    // Add the total montant at the end of the table
    htmlContent += `
      <tr>
    <td colspan="3" style="text-align: center; font-weight: bold; font-size: 48px;">المجموع الإجمالي للمشتريات: ${All_Montant}DA</td>
  </tr>
      `;

    // Close HTML content
    htmlContent += `
          </table>
        </body>
      </html>
    `;

    // Use expo-print to print the content
    try {
      await Print.printAsync({
        html: htmlContent,
      });
    } catch (error) {
      console.error("Print failed:", error);
    }
  }

  const filteredClients = clients.filter((client) => {
    const fullName = `${client.Nom} ${client.Prenom}`.toLowerCase(); // Combine Nom and Prenom
    return fullName.includes(searchQuery.toLowerCase()); // Check if it includes the search query
  });

  async function GetTotalCreditMoney(r) {
    for (let Client of r) {
      var creditMoney = 0;

      const Factures = await GetClient_FacturesMoney(Client.Client_ID);
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

            console.log(factversment + "===" + Fact.Montant_Total);
            creditMoney = creditMoney + (Fact.Montant_Total - factversment);

            //  console.log("creditMoney" + creditMoney);
          }
        }
      }

      setClients((prevClients) =>
        prevClients.map(
          (cl) =>
            cl.Client_ID === Client.Client_ID
              ? {
                  ...cl,
                  creditMoney: creditMoney,
                } // Update creditOmbalage for the selected client
              : cl // Keep other clients unchanged
        )
      );
      // console.log("CreditPlat" + JSON.stringify(CreditPlat));
    }
  }
  function GetMounth(d) {
    if (d) {
      var t = d.split("-");
      console.log(t);
      return months[parseInt(t[1] - 1)] + " " + t[0];
    }
  }
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <TouchableOpacity style={styles.returnButton} onPress={handleReturn}>
          <Icon name="arrow-right" size={20} color="#fff" />
        </TouchableOpacity>
        <Pressable style={styles.iconButton} onPress={PrintClients}>
          <Image source={PrintIcon} style={styles.icon} />
        </Pressable>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="ابحث عن عميل..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {filteredClients.length > 0 ? (
        <View style={styles.cardsContainer}>
          {filteredClients.map((client, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.cardTitle}>
                {client.Nom + " " + client.Prenom}
              </Text>
              <Text style={styles.cardText}>
                إجمالي المشتريات: {client.TotalMontant}DA
              </Text>
              <Text style={styles.cardText}>
                {" "}
                إجمالي ديون: {client.creditMoney}DA
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.noDataText}>لا توجد بيانات</Text>
      )}

      {/* Return Button */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F5F5F5",
    flexGrow: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "left",
  },
  searchInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 16,
    paddingHorizontal: 10,
    fontSize: 16,
    textAlign: "right",
  },
  cardsContainer: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "left",
  },
  cardText: {
    textAlign: "left",
    fontSize: 16,
    color: "#555",
    marginBottom: 4,
  },
  noDataText: {
    textAlign: "center",
    marginVertical: 16,
    color: "#999",
  },
  returnButton: {
    position: "relative",

    backgroundColor: "#28a745", // Green background
    padding: 10,
    width: "40",
    borderRadius: 20,
  },
  iconButton: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderColor: "#b5e2ff",
    borderWidth: 2.5,
    borderRadius: 10,
    width: 60,
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
});

export default Page;
