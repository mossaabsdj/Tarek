import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Button,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import {
  GetAll,
  GetClient_FacturesPlat,
  GetFactures_Factprod,
  getProduiNomby_ID,
  GetClient_FacturesMoney,
  GetFacturesVersment,
} from "@/app/Lib/bdd";
// Column names
const columns = [
  { key: "Nom", label: "اللقب" },
  { key: "Prenom", label: "الاسم" },
  { key: "Num", label: "رقم الهاتف " },
  { key: "creditMoney", label: " دين المال" },
  { key: "creditOmbalage", label: " دين الاطباق" },
];

// Client data
const initialClients = [
  {
    id: "1",
    Nom: "ساعد جاب الله",
    prenam: "مصعب",
    num: "123456789",
    creditMoney: 100,
    creditOmbalage: 50,
  },
  {
    id: "2",
    Nom: "ساعد جاب الله",
    prenam: "عثمان",
    num: "987654321",
    creditMoney: 200,
    creditOmbalage: 100,
  },
];
const initialFactures = [
  {
    id: "1",
    montantTotal: 500,
    reste: 200,
    date: "2024-09-30",
  },
  {
    id: "2",
    montantTotal: 300,
    reste: 50,
    date: "2024-09-28",
  },
  {
    id: "3",
    montantTotal: 700,
    reste: 350,
    date: "2024-09-25",
  },
];
const initialFactures_Plat = [
  {
    id: "1",
    montantTotal: 500,
    reste: 20,
    date: "2024-09-30",
  },
  {
    id: "2",
    montantTotal: 300,
    reste: 50,
    date: "2024-09-28",
  },
  {
    id: "3",
    montantTotal: 700,
    reste: 350,
    date: "2024-09-25",
  },
];

const ClientConsultation = () => {
  const [factures, setFactures] = useState(initialFactures);
  const [clients, setClients] = useState(initialClients);
  const [searchQuery, setSearchQuery] = useState("");
  const [SearchQuery_Fact, setSearchQuery_Fact] = useState("");
  const [selectedFacture, setselectedFacture] = useState("");
  const [ConsulterClient, setConsulterClient] = useState(true);
  const [editClient, setEditClient] = useState(null);
  const [editClientmodel, seteditClientmodel] = useState(false);
  const [MoneyCredit, setMoneyCredit] = useState(false);
  const [PlatCredit, setPlatCredit] = useState(null);
  const [Versment_Money, setVersment_Money] = useState(false);
  const [paymentAmount, setpaymentAmount] = useState(0);
  const [Versment_Plat, setVersment_Plat] = useState(false);
  const [NbrPlat, setNbrPlat] = useState(0);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const filteredClients = clients.filter((client) => {
    //console.log(client);
    return client.Nom.toLowerCase().includes(searchQuery.toLowerCase());
  });
  const handleSearch_Fact = (query) => {
    setSearchQuery_Fact(query);
  };
  const filteredFact = factures.filter((Fact) => {
    return Fact.id.toLowerCase().includes(SearchQuery_Fact.toLowerCase());
  });
  const handleModifyClient = (client) => {
    setEditClient(client);
    seteditClientmodel(true);
  };
  const handleMoneyCredit = (client) => {
    setEditClient(client);
    setMoneyCredit(true);
  };
  const handlePlatCredit = (client) => {
    setEditClient(client);
    setPlatCredit(true);
  };

  const handleSaveChanges = () => {
    setClients((prevClients) =>
      prevClients.map((client) =>
        client.id === editClient.id ? editClient : client
      )
    );
    seteditClientmodel(false);
  };

  const renderClientItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>معلومات الزبون</Text>
      {columns.map((column) => (
        <Text style={styles.label} key={column.key}>
          {column.label}: <Text style={styles.value}>{item[column.key]}</Text>
        </Text>
      ))}
      <Button
        title="متابعة ديون المال"
        onPress={() => handleMoneyCredit(item)}
      />
      <Button
        title="متابعة ديون الاطباق"
        onPress={() => handlePlatCredit(item)}
      />
      <Button title="تعديل" onPress={() => handleModifyClient(item)} />
    </View>
  );
  const renderFactureItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.label}>
        رقم الفاتورة: <Text style={styles.value}>{item.id}</Text>
      </Text>
      <Text style={styles.label}>
        اٍجمالي المبلع :{" "}
        <Text style={styles.value}>{item.montantTotal} DA</Text>
      </Text>
      <Text style={styles.label}>
        الباقي: <Text style={styles.value}>{item.reste} DA</Text>
      </Text>
      <Text style={styles.label}>
        التاريخ: <Text style={styles.value}>{item.date}</Text>
      </Text>
      <Button
        title="دفع"
        onPress={() => setVersment_Money(true) + setselectedFacture(item.id)}
      />
    </View>
  );
  const renderFactureItemfor_Plat = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.label}>
        رقم الفاتورة: <Text style={styles.value}>{item.id}</Text>
      </Text>
      <Text style={styles.label}>
        اٍجمالي المبلع :<Text style={styles.value}>{item.montantTotal} DA</Text>
      </Text>
      <Text style={styles.label}>
        باقي الاطباق: <Text style={styles.value}>{item.reste} طبق</Text>
      </Text>
      <Text style={styles.label}>
        التاريخ: <Text style={styles.value}>{item.date}</Text>
      </Text>
      <Button
        title="  ارجاع أطباق"
        onPress={() => setVersment_Plat(true) + setselectedFacture(item.id)}
      />
    </View>
  );
  async function GetTotalCreditPlat() {
    const clientss = await GetAll("Client", setClients);
    for (let Client of clientss) {
      var CreditPlat = [];

      const Factures = await GetClient_FacturesPlat(Client.Client_ID);
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
      }
      var creditOmbalagee = "";
      CreditPlat.map((cp, i) => {
        if (i === 0) {
        } else {
          creditOmbalagee = creditOmbalagee + "و";
        }
        creditOmbalagee =
          creditOmbalagee + cp.Plat + ":" + "{" + cp.Produit + "}  ";
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
  }

  async function GetTotalCreditMoney() {
    const clientss = await GetAll("Client", setClients);
    for (let Client of clientss) {
      var creditMoney = 0;
      var Arrayversment = [];

      const Factures = await GetClient_FacturesMoney(Client.Client_ID);
      for (let Fact of Factures) {
        if (Fact) {
          console.log("facture" + Fact.Facture_ID);
          const versment = await GetFacturesVersment(Fact.Facture_ID);
          console.log("versment" + JSON.stringify(versment));
          // console.log("FactProds" + JSON.stringify(FactProds));
          if (versment) {
            for (let ver of versment) {
              Arrayversment.push(ver.Somme);
            }
            var factversment = Arrayversment.reduce(
              (total, item) => total + item,
              0
            );
            if (factversment < Fact.Montant_Total) {
              creditMoney = creditMoney + (Fact.Montant_Total - factversment);
            }
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
  useEffect(() => {
    GetTotalCreditPlat();
    GetTotalCreditMoney();
  }, []);
  return (
    <View style={styles.container}>
      {ConsulterClient && (
        <View>
          <Text style={styles.header}>متابعة الزبائن </Text>
          {/* Search Input */}
          <TextInput
            style={styles.searchInput}
            placeholder="...البحث عن الزبون بالاسم"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {/* Client List */}
          <FlatList
            data={filteredClients}
            renderItem={renderClientItem}
            keyExtractor={(item) => item.id}
          />
        </View>
      )}

      {/* Modal for Editing Client */}
      {editClientmodel && (
        <Modal
          animationType="slide"
          transparent={false}
          visible={editClientmodel}
          onRequestClose={() => seteditClientmodel(false)}
        >
          <View>
            <View style={styles.modalView}>
              <TouchableOpacity
                style={{
                  backgroundColor: "red",
                  padding: 10,
                  borderRadius: 5,
                  position: "absolute",
                }}
                onPress={() => seteditClientmodel(false)} // Correctly pass the function
              >
                <Text style={{ color: "white", textAlign: "center" }}>
                  خروج
                </Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}> تعديل معلومات الزبون</Text>

              <TextInput
                style={styles.input}
                value={editClient.name}
                onChangeText={(text) =>
                  setEditClient({ ...editClient, name: text })
                }
                placeholder="Name"
              />
              <TextInput
                style={styles.input}
                value={editClient.prenam}
                onChangeText={(text) =>
                  setEditClient({ ...editClient, prenam: text })
                }
                placeholder="Surname"
              />
              <TextInput
                style={styles.input}
                value={editClient.num}
                onChangeText={(text) =>
                  setEditClient({ ...editClient, num: text })
                }
                placeholder="Phone Number"
              />
              <TextInput
                style={styles.input}
                value={String(editClient.creditMoney)}
                keyboardType="numeric"
                onChangeText={(text) =>
                  setEditClient({ ...editClient, creditMoney: Number(text) })
                }
                placeholder="Credit Money"
              />
              <TextInput
                style={styles.input}
                value={String(editClient.creditOmbalage)}
                keyboardType="numeric"
                onChangeText={(text) =>
                  setEditClient({ ...editClient, creditOmbalage: Number(text) })
                }
                placeholder="Credit Packaging"
              />

              <Button title="حفظ" onPress={handleSaveChanges} />
            </View>
          </View>
        </Modal>
      )}

      {/* Modal for Editing money credit */}

      {MoneyCredit && (
        <Modal
          animationType="slide"
          transparent={false}
          visible={MoneyCredit}
          onRequestClose={() => setMoneyCredit(false)}
        >
          <View style={styles.modalView}>
            <TouchableOpacity
              style={{
                backgroundColor: "red",
                zIndex: 1000,
                padding: 10,
                borderRadius: 5,
                position: "absolute",
              }}
              onPress={() => setMoneyCredit(false)} // Correctly pass the function
            >
              <Text style={{ color: "white", textAlign: "center" }}>خروج</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editClient.name} :فواتير الزبون
            </Text>
            <TextInput
              style={styles.searchInput}
              placeholder="...البحث عن الفاتورة بالرقم "
              value={SearchQuery_Fact}
              onChangeText={handleSearch_Fact}
            />
            <FlatList
              data={filteredFact}
              renderItem={renderFactureItem}
              keyExtractor={(item) => item.id}
            />
          </View>
        </Modal>
      )}
      {/* Modal for Editing Plat credit */}
      {PlatCredit && (
        <Modal
          animationType="slide"
          transparent={false}
          visible={PlatCredit}
          onRequestClose={() => setPlatCredit(false)}
        >
          <View style={styles.modalView}>
            <TouchableOpacity
              style={{
                backgroundColor: "red",
                zIndex: 1000,
                padding: 10,
                borderRadius: 5,
                alignContent: "center",

                position: "absolute",
              }}
              onPress={() => setPlatCredit(false)} // Correctly pass the function
            >
              <Text style={{ color: "white", textAlign: "center" }}>خروج</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              فواتير الزبون {editClient.name}
            </Text>
            <TextInput
              style={styles.searchInput}
              placeholder="...البحث عن الفاتورة بالرقم "
              value={SearchQuery_Fact}
              onChangeText={handleSearch_Fact}
            />

            <FlatList
              data={filteredFact}
              renderItem={renderFactureItemfor_Plat}
              keyExtractor={(item) => item.id}
            />
          </View>
        </Modal>
      )}
      {/* Modal for Editing Vesment_Money */}
      {Versment_Money && (
        <Modal
          animationType="slide"
          transparent={true} // Make the modal background transparent
          visible={Versment_Money}
          onRequestClose={() => setVersment_Money(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalView}>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="ادخل قيمة الدفع"
                value={paymentAmount}
                onChangeText={setpaymentAmount}
              />

              <Button title="تأكيد الدفع" />
              <Button
                title="الغاء"
                onPress={() => setVersment_Money(false)}
                color="red"
              />
            </View>
          </View>
        </Modal>
      )}
      {Versment_Plat && (
        <Modal
          animationType="slide"
          transparent={true} // Make the modal background transparent
          visible={Versment_Plat}
          onRequestClose={() => setVersment_Plat(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>
                ارجاع للفاتورة ذات الرقم:{selectedFacture}
              </Text>

              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="ادخل عدد الأطباق "
                value={NbrPlat}
                onChangeText={setNbrPlat}
              />

              <Button title="تأكيد الارجاع" />
              <Button
                title="الغاء"
                onPress={() => setVersment_Plat(false)}
                color="red"
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f5f5f5",
    height: 600,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dark transparent background
  },
  searchInput: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  value: {
    fontWeight: "bold",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
});

export default ClientConsultation;
