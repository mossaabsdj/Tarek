import {
  addVersment,
  addVersmentPlat,
  deleteClient,
  deleteVersment,
  deleteVersmentPlat,
  GetAll,
  GetClient_FacturesMoney,
  GetClient_FacturesPlat,
  GetFactures_Factprod,
  GetFacturesVersment,
  GetFacturesVersmentPlat,
  getProduiNomby_ID,
  updateClient,
  updateFactureValiderMoney,
  updateFactureValiderPlat,
  updateFactProdPlatDecrement,
  updateFactProdPlatIncrement,
} from "@/app/Lib/bdd";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Picker } from "@react-native-picker/picker"; // Correctly import Picker
import { useStoreRootState } from "expo-router/build/global-state/router-store";

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
    Facture_ID: "1",
    montantTotal: 500,
    reste: 200,
    date: "2024-09-30",
  },
  {
    Facture_ID: "2",
    montantTotal: 300,
    reste: 50,
    date: "2024-09-28",
  },
  {
    Facture_ID: "3",
    montantTotal: 700,
    reste: 350,
    date: "2024-09-25",
  },
];
const initialFactures_Plat = [
  {
    Facture_ID: "1",
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
  const [Versment, setVersment] = useState([]);
  const [VersmentPlat, setVersmentPlat] = useState([]);
  const [produit, setproduit] = useState([
    { Nom: "قلب اللوز 60/80", Prix: 25, Produit_ID: 1, Return: "true" },
    { Nom: "قلب اللوز 50/30", Prix: 30, Produit_ID: 2, Return: "true" },
  ]);
  const [selectedProduct, setSelectedProduct] = useState(produit[0].Produit_ID);

  const [facturesplat, setFacturesplat] = useState(initialFactures);
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
  const arabicMonths = [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);

    // Get day, month, year, and time components
    const day = date.getDate(); // Day in Arabic
    const month = arabicMonths[date.getMonth()]; // Month in Arabic
    const year = date.getFullYear(); // Year in French
    const options = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true, // Change to false for 24-hour format
    };
    const time = date.toLocaleString("fr-FR", options); // Time in French

    return `${day} ${month} ${year}, ${time}`; // Combine components
  };
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
    return String(Fact.Facture_ID)
      .toLowerCase()
      .includes(SearchQuery_Fact.toLowerCase());
  });
  const filteredFactPlat = facturesplat.filter((Fact) => {
    return String(Fact.Facture_ID)
      .toLowerCase()
      .includes(SearchQuery_Fact.toLowerCase());
  });
  const handleModifyClient = (client) => {
    setEditClient(client);
    seteditClientmodel(true);
  };
  const handleSaveChanges = async () => {
    console.log(
      editClient.Client_ID,
      editClient.Nom,
      editClient.Prenom,
      editClient.Num
    );
    await updateClient(
      editClient.Client_ID,
      editClient.Nom,
      editClient.Prenom,
      editClient.Num
    );
    await GetAll("client", setClients);
    GetTotalCreditMoney();
    GetTotalCreditPlat();
    seteditClientmodel(false);
  };
  const Delete = async (client) => {
    await deleteClient(client.Client_ID);
    await GetAll("Client", setClients);
  };

  const handelAddVersment = async () => {
    console.log(selectedFacture, paymentAmount);
    addVersment(selectedFacture, paymentAmount);
    setVersment_Money(false);
    GetFacturesMoney(editClient);
    // VersmentFacture();
  };
  const handelAddVersmentPlat = async () => {
    console.log(produit, selectedFacture, selectedProduct, NbrPlat);
    const r = await updateFactProdPlatDecrement(
      selectedFacture,
      selectedProduct,
      NbrPlat
    );
    console.log(JSON.stringify(r));
    if (r.changes > 0) {
      await addVersmentPlat(selectedFacture, selectedProduct, NbrPlat);
      setVersment_Plat(false);
    } else {
      Alert.alert("لقد  ارجعت عدد اكبر من الدين");
    }
    // VersmentFacturePlat();
    handlePlatCredit(editClient);
  };
  async function DeleteVersment_Plat(versmentPlat) {
    console.log(
      versmentPlat.Facture_ID,
      versmentPlat.Produit_ID,
      versmentPlat.Plat,
      versmentPlat.VersmentPlat_ID
    );
    await updateFactProdPlatIncrement(
      versmentPlat.Facture_ID,
      versmentPlat.Produit_ID,
      versmentPlat.Plat
    );
    await deleteVersmentPlat(1);
    await updateFactureValiderPlat(versmentPlat.Facture_ID, 0);
    await VersmentFacturePlat();
  }
  async function VersmentFacture() {
    const r = await GetFacturesVersment(selectedFacture);
    console.log(r);
    setVersment(r);
  }
  async function VersmentFacturePlat() {
    const r = await GetFacturesVersmentPlat(selectedFacture);
    //console.log("xxxxxxxx" + JSON.stringify(r));

    console.log("xxxxx" + JSON.stringify(r));
    setVersmentPlat(r);
  }
  const DeleteVersment = async (versment) => {
    console.log(versment.Versment_ID);
    deleteVersment(versment.Versment_ID);
    updateFactureValiderMoney(versment.Facture_ID, 0);
    VersmentFacture();
  };
  const renderClientItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>معلومات الزبون</Text>
      {columns.map((column) => (
        <Text style={styles.label} key={item.Client_ID + column.key}>
          {column.label}: <Text style={styles.value}>{item[column.key]}</Text>
        </Text>
      ))}

      {/* Button container to align buttons in a grid at the bottom */}
      <View style={styles.buttonContainer}>
        <Button
          title="متابعة ديون المال"
          onPress={() => GetFacturesMoney(item)}
        />
        <Button
          title="متابعة ديون الاطباق"
          onPress={() => handlePlatCredit(item)}
        />
        <Button title="تعديل" onPress={() => handleModifyClient(item)} />
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => Delete(item)}
        >
          <Text style={styles.deleteButtonText}>حدف الزبون</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderVersment = ({ item: versment }) => (
    <View style={styles.versmentContainer}>
      <Text style={styles.title}>تفاصيل الدفع</Text>
      <View key={versment.Versment_ID} style={styles.versmentItem}>
        <Text style={styles.label}>
          تاريخ الدفع:
          <Text style={styles.value}>{formatDate(versment.Date)}</Text>
        </Text>
        <Text style={styles.label}>
          مبلغ الدفع: <Text style={styles.value}>{versment.Somme}</Text>
        </Text>
        {/* Button to delete payment */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => DeleteVersment(versment)}
        >
          <Text style={styles.deleteButtonText}>حدف الدفع</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  async function GetProduitNom(id) {
    const r = await getProduiNomby_ID(id);
    var nom = "";
    if (r.Nom) {
      nom = r.Nom;
    }

    return nom;
  }
  const renderVersmentPlat = ({ item: versmentPlat }) => (
    <View style={styles.versmentContainer}>
      <Text style={styles.title}>تفاصيل الدفع</Text>
      <View key={versmentPlat.VersmentPlat_ID} style={styles.versmentItem}>
        <Text style={styles.label}>
          تاريخ الارجاع:
          <Text style={styles.value}>{formatDate(versmentPlat.Date)}</Text>
        </Text>
        <Text style={styles.label}>
          عدد الاطباق:
          <Text style={styles.value}>{versmentPlat.Plat}</Text>
        </Text>
        <Text style={styles.label}>
          نوع الطبق:
          <Text style={styles.value}>{versmentPlat.Produit_ID}</Text>
        </Text>
        {/* Button to delete payment */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => DeleteVersment_Plat(versmentPlat)}
        >
          <Text style={styles.deleteButtonText}>حدف الدفع</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFactureItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.label}>
        رقم الفاتورة: <Text style={styles.value}>{item.Facture_ID}</Text>
      </Text>
      <Text style={styles.label}>
        اٍجمالي المبلع :
        <Text style={styles.value}> {item.Montant_Total}DA </Text>
      </Text>
      <Text style={styles.label}>
        الباقي: <Text style={styles.value}>{item.Reste}DA</Text>
      </Text>
      <Text style={styles.label}>
        التاريخ: <Text style={styles.value}>{formatDate(item.Date_Creat)}</Text>
      </Text>
      <Button
        title="دفع"
        onPress={() =>
          setVersment_Money(true) + setselectedFacture(item.Facture_ID)
        }
      />
    </View>
  );
  const renderFactureItemfor_Plat = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.label}>
        رقم الفاتورة: <Text style={styles.value}>{item.Facture_ID}</Text>
      </Text>
      <Text style={styles.label}>
        اٍجمالي الأطباق :<Text style={styles.value}>{item.Plat} </Text>
      </Text>
      <Text style={styles.label}>
        باقي الاطباق: <Text style={styles.value}>{item.reste} طبق</Text>
      </Text>
      <Text style={styles.label}>
        التاريخ: <Text style={styles.value}>{formatDate(item.Date_Creat)}</Text>
      </Text>
      <Button
        title="  ارجاع أطباق"
        onPress={() =>
          setVersment_Plat(true) + setselectedFacture(item.Facture_ID)
        }
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
          const versment = await GetFacturesVersment(Fact.Facture_ID);
          // console.log("versment" + JSON.stringify(versment));
          if (versment) {
            for (let ver of versment) {
              //  console.log();
              Arrayversment.push(ver.Somme);
            }
            var factversment = Arrayversment.reduce(
              (total, item) => total + item,
              0
            );
            if (factversment < Fact.Montant_Total) {
              //console.log(factversment + "===" + Fact.Montant_Total);
              creditMoney = creditMoney + (Fact.Montant_Total - factversment);
            }
            // console.log("creditMoney" + creditMoney);
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
  async function GetFacturesMoney(client) {
    const factures = await GetClient_FacturesMoney(client.Client_ID);
    setFactures(factures);
    for (let Fact of factures) {
      var RestFacture = 0;
      var Arrayversment = [];
      const versment = await GetFacturesVersment(Fact.Facture_ID);
      if (versment) {
        for (let ver of versment) {
          var somme = parseInt(ver.Somme, 10);
          if (ver.Somme === "") {
            somme = 0;
          }

          Arrayversment.push(somme);
        }
        var factversment = Arrayversment.reduce(
          (total, item) => total + item,
          0
        );

        if (factversment < Fact.Montant_Total) {
          RestFacture = Fact.Montant_Total - factversment;
        } else if (
          factversment === Fact.Montant_Total ||
          factversment > Fact.Montant_Total
        ) {
          const r = await updateFactureValiderMoney(Fact.Facture_ID, 1);
        }
      }
      setFactures((prevFactures) =>
        prevFactures.map(
          (cl) =>
            cl.Facture_ID === Fact.Facture_ID
              ? {
                  ...cl,
                  Reste: RestFacture,
                } // Update creditOmbalage for the selected client
              : cl // Keep other clients unchanged
        )
      );
    }

    setEditClient(client);
    setMoneyCredit(true);
  }
  const handlePlatCredit = async (client) => {
    const factures = await GetClient_FacturesPlat(client.Client_ID);
    // console.log(factures);

    setFacturesplat(factures);
    for (let Fact of factures) {
      var CreditPlat = [];
      var creditOmbalagee = "";
      if (Fact) {
        const FactProds = await GetFactures_Factprod(Fact.Facture_ID);
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

        CreditPlat.map((cp, i) => {
          if (i === 0) {
          } else {
            creditOmbalagee = creditOmbalagee + "و";
          }
          creditOmbalagee =
            creditOmbalagee + cp.Plat + ":" + "{" + cp.Produit + "}  ";
        });
      }

      if (creditOmbalagee === "") {
        const r = await updateFactureValiderPlat(Fact.Facture_ID, 1);
      }
      setFacturesplat((prevFactures) =>
        prevFactures.map(
          (cl) =>
            cl.Facture_ID === Fact.Facture_ID
              ? {
                  ...cl,
                  reste: creditOmbalagee,
                } // Update creditOmbalage for the selected client
              : cl // Keep other clients unchanged
        )
      );
    }

    setEditClient(client);
    setPlatCredit(true);
  };
  const DeleteVersmentPlat = (VersmentPlat) => {
    console.log(VersmentPlat.Versment_ID);
    deleteVersmentPlat(VersmentPlat.Versment_ID);
    updateFactureValiderPlat(VersmentPlat.Facture_ID, 0);
    VersmentFacturePlat();
  };

  useEffect(() => {
    if (Versment_Plat) {
      GetAll("produit", setproduit);
      //  console.log("selectedFacture" + selectedFacture);
      VersmentFacturePlat();
    }
  }, [Versment_Plat]);

  useEffect(() => {
    if (Versment_Money) {
      VersmentFacture();
    }
    if (!Versment_Money) {
      GetFacturesMoney(editClient);
    }
  }, [Versment_Money]);

  useEffect(() => {
    if (!MoneyCredit) {
      GetTotalCreditMoney();
      // GetTotalCreditPlat();
    }
    if (!PlatCredit) {
      //GetTotalCreditMoney();
      GetTotalCreditPlat();
    }
  }, [MoneyCredit, PlatCredit]);

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
            keyExtractor={(item) => item.Client_ID}
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
                value={editClient.Nom}
                onChangeText={(text) =>
                  setEditClient({ ...editClient, Nom: text })
                }
                placeholder="Name"
              />
              <TextInput
                style={styles.input}
                value={editClient.Prenom}
                onChangeText={(text) =>
                  setEditClient({ ...editClient, Prenom: text })
                }
                placeholder="Surname"
              />
              <TextInput
                style={styles.input}
                value={editClient.Num}
                onChangeText={(text) =>
                  setEditClient({ ...editClient, Num: text })
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
              فواتير الزبون:
              {editClient.Nom}
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
              keyExtractor={(item) => item.Facture_ID}
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
              data={filteredFactPlat}
              renderItem={renderFactureItemfor_Plat}
              keyExtractor={(item) => item.id}
            />
          </View>
        </Modal>
      )}
      {/* Modal for Editing Vesment_Money */}
      {Versment_Money && (
        <View>
          <Modal
            animationType="slide"
            transparent={true} // Make the modal background transparent
            visible={Versment_Money}
            onRequestClose={() => setVersment_Money(false)}
          >
            <View style={styles.modalBackground}>
              <View style={styles.modalViewVersment}>
                <View
                  style={{
                    position: "absolute",
                    width: 60,
                    top: 0,
                    zIndex: 100,

                    borderRadius: 10,
                  }}
                >
                  <Button
                    title="خروج"
                    onPress={() => setVersment_Money(false)}
                    color="red"
                  />
                </View>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="ادخل قيمة الدفع"
                  value={paymentAmount}
                  onChangeText={setpaymentAmount}
                />

                <Button title="تأكيد الدفع" onPress={handelAddVersment} />

                <FlatList
                  data={Versment}
                  renderItem={renderVersment}
                  keyExtractor={(item) => item.Versment_ID}
                />
              </View>
            </View>
          </Modal>
        </View>
      )}
      {Versment_Plat && (
        <Modal
          animationType="slide"
          transparent={true} // Make the modal background transparent
          visible={Versment_Plat}
          onRequestClose={() => setVersment_Plat(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalViewVersment}>
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  width: 60,
                  borderRadius: 10,
                }}
              >
                <Button
                  title="خروج"
                  onPress={() => setVersment_Plat(false)}
                  color="red"
                />
              </View>
              <Text style={styles.modalTitle}>
                ارجاع للفاتورة ذات الرقم:{selectedFacture}
              </Text>
              <Picker
                selectedValue={selectedProduct}
                style={styles.picker}
                onValueChange={(itemValue) => setSelectedProduct(itemValue)}
                itemStyle={styles.pickeritem}
              >
                {produit.map((product) => (
                  <Picker.Item
                    key={product.Nom}
                    label={product.Nom}
                    value={product.Produit_ID} // Use product name as value
                  />
                ))}
              </Picker>
              <TextInput
                style={styles.inputv}
                keyboardType="numeric"
                placeholder="ادخل عدد الأطباق "
                value={NbrPlat}
                onChangeText={setNbrPlat}
              />

              <Button title="تأكيد الارجاع" onPress={handelAddVersmentPlat} />

              <FlatList
                data={VersmentPlat}
                renderItem={renderVersmentPlat}
                keyExtractor={(item) => item.VersmentPlat_ID}
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
  modalViewVersment: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    width: "100%",
    height: "100%",
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
    height: 720,
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
    marginTop: 20,
  },
  inputv: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    marginTop: 20,
  },
  card: {
    padding: 20,
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    elevation: 2,
    position: "relative",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  value: {
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap", // Allows buttons to wrap onto the next row if necessary
    justifyContent: "space-between", // Distribute buttons evenly
    marginTop: 10,
  },
  deleteButton: {
    marginTop: 10,

    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
    flex: 1, // Takes up space in the row
    marginLeft: 5,
  },
  deleteButtonText: {
    color: "white",
    textAlign: "center",
  },

  versmentContainer: {
    padding: 20,
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
  },

  versmentItem: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 10,
  },
  deleteButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  deleteButtonText: {
    color: "white",
    textAlign: "center",
  },
  addButtonContainer: {
    marginTop: 20,
  },
});

export default ClientConsultation;
