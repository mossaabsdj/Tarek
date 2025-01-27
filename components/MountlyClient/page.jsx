import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome"; // Add FontAwesome for arrow icon
import {
  GetMontantTotalByClient,
  GetFacturesVersment,
  GetClient_FacturesMoney,
} from "@/app/Lib/bdd";
const Page = ({ handleReturn, Date }) => {
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Replace fetch with a hardcoded clients array
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

  const filteredClients = clients.filter((client) =>
    client.Nom.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.returnButton} onPress={handleReturn}>
        <Icon name="arrow-right" size={20} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.title}>أسماء العملاء وإجمالي المشتريات</Text>

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
              <Button
                title="طباعة"
                onPress={() => handlePrint(client.name)}
                color="#007BFF"
              />
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
});

export default Page;
