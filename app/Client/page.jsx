import {
  addVersment,
  addVersmentPlat,
  deleteClient,
  deleteVersment,
  deleteVersmentPlat2,
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
  GetClient_Factures,
  getClientNameBy_ID,
} from "@/app/Lib/bdd";
import ArabicMonthYearPicker from "./picker";

import { useEffect, useState } from "react";
import {
  I18nManager,
  Image,
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
import Clienticon from "@/assets/icons/Client.png";
import Deleteicon from "@/assets/icons/delete.png";
import loopIcon from "@/assets/icons/search1.png";
import editIcon from "@/assets/icons/edit.png";

import { Picker } from "@react-native-picker/picker"; // Correctly import Picker
import { useStoreRootState } from "expo-router/build/global-state/router-store";
import * as Print from "expo-print";
// Column names
const columns = [
  { key: "Nom", label: "الاسم واللقب" },
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
  const [produit_True, setproduit_true] = useState([{}]);
  const [selectedProduct, setSelectedProduct] = useState(
    produit_True[0].Produit_ID
  );
  const [facturesplat, setFacturesplat] = useState(initialFactures);
  const [factures, setFactures] = useState(initialFactures);
  const [factures_To_Print, setfactures_To_Print] = useState([]);

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
  const [isPickerVisible, setPickerVisible] = useState(false);
  function filterFacturesByMonthAndYear(factures, month, year) {
    return factures.filter((facture) => {
      const factureDate = new Date(facture.Date_Creat);
      const factureMonth = factureDate.getMonth() + 1; // Months are zero-based in JavaScript
      const factureYear = factureDate.getFullYear();

      // Compare facture month and year with the provided month and year
      return factureMonth === month && factureYear === year;
    });
  }
  const handleConfirm = async (month, year) => {
    // console.log(`Selected Month: ${month}, Selected Year: ${year}`);
    setPickerVisible(false);
    const filteredFactures = filterFacturesByMonthAndYear(
      factures_To_Print,
      month,
      year
    ); // For October 2024
    if (!filteredFactures[0]) {
      Alert.alert("لاتوجد فواتير ");
    } else {
      console.log("rrrrrr" + JSON.stringify(filteredFactures));

      Alert.alert(
        "تنبيه", // Alert title
        "اختر خيارًا للمتابعة", // Alert message
        [
          {
            text: "الأطباق", // First button title
            onPress: () => printFacturesPlat(filteredFactures),
          },
          {
            text: "المال", // Second button title
            onPress: () => printFacturesMoney(filteredFactures),
          },
        ],
        { cancelable: true }
      );
      //   await printFacturesMoney(filteredFactures);
    }
  };
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
  async function printFacturesMoney(factures) {
    // Initialize total amount variable
    let totalMontant = 0;
    var r = await getClientNameBy_ID(factures[0].Client_ID);
    var FullName = r[0].Nom + " " + r[0].Prenom;
    // Create HTML content to format the factures for printing in Arabic (RTL)    border-right: 15px dashed #000;

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
  <h1 style="font-size: 49px;">تتفاصيل فواتير الشهر: </h1>
  <h1 style="font-size: 49px;">${FullName}</h1>
</div>


        <table>
          <tr>
            <td colspan="6">------------------------------------------------------------------------------------------------------</td>
          </tr>
          <tr>
            <th>الرقم</th>
            <th>التاريخ</th>
            <th>الدين السابق (النقود)</th>
            <th>المجموع  (النقود)</th>
              <th>الدفعات  (النقود)</th>
            <th>الرصيد المتبقي (النقود)</th>
          </tr>
          <tr>
            <td colspan="6">------------------------------------------------------------------------------------------------------</td>
          </tr>
  `;

    // Add rows for each facture and sum up the total amounts
    factures.forEach((facture) => {
      const {
        Facture_ID,
        Date_Creat,
        Montant_Total, // Make sure Montant_Total is included
        ancientCreditMoney,
        restCreditMoney,
        ancientCreditPlat,
        Versment_Plat,
        restCreditPlat,
        totalPlat,
        newCreditMoney,
        Total_Versment,
      } = facture;

      // Add the actual data row
      htmlContent += `
      <tr>
        <td>${Facture_ID}.0</td>
        <td>${Date_Creat}</td>
        <td>${ancientCreditMoney}</td>
        <td>${Montant_Total}</td>
      <td>${Total_Versment}</td>
        <td>${restCreditMoney}</td>
      </tr>
      <tr>
        <td colspan="6">------------------------------------------------------------------------------------------------------</td>
      </tr>
    `;

      // Accumulate the total for Montant_Total
      totalMontant += Montant_Total || 0; // Ensure that if Montant_Total is undefined, 0 is added
    });

    // Add the total montant at the end of the table
    htmlContent += `
    <tr>
  <td colspan="6" style="text-align: center; font-weight: bold; font-size: 48px;">المجموع الإجمالي للنقود: ${totalMontant}</td>
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
  async function printFacturesPlat(factures) {
    // Initialize total amount variable
    let totalMontant = 0;
    var r = await getClientNameBy_ID(factures[0].Client_ID);
    var FullName = r[0].Nom + " " + r[0].Prenom;
    // Create HTML content to format the factures for printing in Arabic (RTL)
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
  <h1 style="font-size: 49px;">تتفاصيل فواتير الشهر: </h1>
  <h1 style="font-size: 49px;">${FullName}</h1>
</div>


        <table>
          <tr>
            <td colspan="6">------------------------------------------------------------------------------------------------------</td>
          </tr>
          <tr>
            <th>الرقم</th>
            <th>التاريخ</th>
            <th> الدين السابق (الطبق)</th>
            <th>المجموع  (الطبق)</th>
            <th>الدفعات  (الطبق)</th>
            <th>الرصيد المتبقي (الطبق)</th>
          </tr>
          <tr>
            <td colspan="6">------------------------------------------------------------------------------------------------------</td>
          </tr>
  `;

    // Add rows for each facture and sum up the total amounts
    factures.forEach((facture) => {
      const {
        Facture_ID,
        Date_Creat,
        Montant_Total, // Make sure Montant_Total is included
        ancientCreditMoney,
        restCreditMoney,
        ancientCreditPlat,
        Versment_Plat,
        restCreditPlat,
        totalPlat,
      } = facture;
      var creditOmbalagee = "";
      if (Versment_Plat) {
        Versment_Plat.map((cp, i) => {
          if (i === 0) {
          } else {
            creditOmbalagee = creditOmbalagee + "\n";
          }
          creditOmbalagee = creditOmbalagee + cp.Plat + ":" + cp.Produit + "  ";
        });
      }
      // Add the actual data row
      htmlContent += `
      <tr>
        <td>${Facture_ID}.0</td>
        <td>${Date_Creat}</td>
        <td>${ancientCreditPlat}</td>
        <td>${totalPlat}</td>
         <td>${creditOmbalagee}</td>
        <td>${restCreditPlat}</td>
      </tr>
      <tr>
        <td colspan="6">------------------------------------------------------------------------------------------------------</td>
      </tr>
    `;

      // Accumulate the total for Montant_Total
      totalMontant += Montant_Total || 0; // Ensure that if Montant_Total is undefined, 0 is added
    });

    // Add the total montant at the end of the table
    htmlContent += `
    <tr>
  <td colspan="6" style="text-align: center; font-weight: bold; font-size: 48px;">المجموع الإجمالي للنقود: ${totalMontant}</td>
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

  async function Object_To_Print(Client) {
    // console.log(factures);
    const id = Client.Client_ID;
    const Factures = await GetClient_Factures(id);

    // Process each facture
    for (let fact of Factures) {
      let RestFacture = 0;
      let Arrayversment = [];
      let Total_Versment = 0;

      // Get payments (versments) for each facture
      const versments = await GetFacturesVersment(fact.Facture_ID);
      if (versments && versments.length > 0) {
        for (let ver of versments) {
          let somme = parseInt(ver.Somme, 10) || 0; // Ensure somme is a number, default to 0
          Arrayversment.push(somme);
        }
        Total_Versment = Arrayversment.reduce((total, item) => total + item, 0);
      }
      fact.Total_Versment = Total_Versment;
    }

    // Process total plat for each facture
    for (let Fact of Factures) {
      let CreditPlat = [];
      let creditOmbalagee = "";

      if (Fact) {
        const FactProds = await GetFactures_Factprod(Fact.Facture_ID);

        for (let fp of FactProds) {
          let nom = await getProduiNomby_ID(fp.Produit_ID);
          if (nom) {
            // Create or update product object in CreditPlat
            const existingProduct = CreditPlat.find(
              (item) => item.Produit === nom.Nom
            );
            if (existingProduct) {
              existingProduct.Plat += fp.Plat; // Update the Plat amount
            } else {
              CreditPlat.push({ Produit: nom.Nom, Plat: fp.Plat });
            }
          }
        }

        // Construct the creditOmbalagee string
        creditOmbalagee = CreditPlat.map(
          (cp) => `${cp.Plat}: {${cp.Produit}}`
        ).join("\n");

        console.log(creditOmbalagee);
        Fact.Total_Plat = creditOmbalagee; // Assign the constructed string
      }
    }
    //Process Total Plat Versment-----------------------
    for (let Fact of Factures) {
      var VersmentPlat = [];

      if (Fact) {
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
      if (VersmentPlat[0]) {
        Fact.Versment_Plat = VersmentPlat;
      } else {
        Fact.Versment_Plat = 0;
      }
    }
    setfactures_To_Print(Factures);
    // await printFactures(Factures);
    setPickerVisible(true);

    // console.log(Factures);
  }

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
    const fullName = `${client.Nom} ${client.Prenom}`.toLowerCase(); // Combine Nom and Prenom
    return fullName.includes(searchQuery.toLowerCase()); // Check if it includes the search query
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
    Alert.alert(
      "تأكيد الحذف", // Title of the alert
      "هل أنت متأكد أنك تريد حذف هذا العميل؟", // Message asking for confirmation
      [
        {
          text: "إلغاء", // Cancel button text
          style: "cancel",
        },
        {
          text: "تأكيد", // Confirm button text
          onPress: async () => {
            await deleteClient(client.Client_ID); // Delete client when confirmed
            await GetTotalCreditMoney(); // Update total credit money
            await GetTotalCreditPlat(); // Update total credit plat
          },
        },
      ],
      { cancelable: false } // Prevent closing the dialog by tapping outside
    );
  };
  const handelAddVersment = async () => {
    console.log(selectedFacture, paymentAmount);
    addVersment(selectedFacture, paymentAmount);
    setVersment_Money(false);
    GetFacturesMoney(editClient);
    // VersmentFacture();
  };
  const handelAddVersmentPlat = async () => {
    console.log(selectedFacture, selectedProduct, NbrPlat);
    if (!NbrPlat) {
      Alert.alert("الرجاء ادخال عدد الأطباق");
    } else if (!selectedProduct) {
      Alert.alert("الرجاء اختيار نوع الأطباق");
    } else {
      await addVersmentPlat(selectedFacture, selectedProduct, NbrPlat);
      setVersment_Plat(false);
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

    await deleteVersmentPlat2(versmentPlat.VersmentPlat_ID);
    await VersmentFacturePlat();
  }
  async function VersmentFacture() {
    const r = await GetFacturesVersment(selectedFacture);
    console.log(r);
    setVersment(r);
  }
  async function VersmentFacturePlat() {
    const r = await GetFacturesVersmentPlat(selectedFacture);

    setVersmentPlat(r);
  }
  const DeleteVersment = async (versment) => {
    console.log(versment.Versment_ID);
    deleteVersment(versment.Versment_ID);
    VersmentFacture();
  };
  const renderClientItem = ({ item }) => (
    <View style={styles.CardClient}>
      <Text style={styles.title}>معلومات الزبون</Text>

      <TouchableOpacity style={styles.delete} onPress={() => Delete(item)}>
        <Image source={Deleteicon} style={styles.deleteicon} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.edit}
        onPress={() => handleModifyClient(item)}
      >
        <Image source={editIcon} style={styles.deleteicon} />
      </TouchableOpacity>
      <Text style={styles.label} key={columns[0].key}>
        {columns[0].label}:{" "}
        <Text style={styles.value}>{item.Nom + " " + item.Prenom}</Text>
      </Text>

      <Text style={styles.label} key={columns[2].key}>
        {columns[2].label}: <Text style={styles.value}>{item.Num}</Text>
      </Text>
      <View style={styles.CardClientValues}>
        <View>
          <Text style={styles.label} key={columns[4].key}>
            {columns[4].label}:
          </Text>
          <Text style={styles.value}>{item.creditOmbalage}</Text>
        </View>
        <View style={styles.infoCredit}>
          <Text style={styles.TotalMoneyLabel} key={columns[3].key}>
            {columns[3].label}
          </Text>

          <Text style={styles.TotalMoney}>{item.creditMoney + " DA"}</Text>
        </View>
      </View>

      {/* Button container to align buttons in a grid at the bottom */}
      <View style={styles.buttonContainer}>
        <Button
          title=" متابعة ديون الاطباق "
          onPress={() => handlePlatCredit(item)}
        />
        <Button title="طباعة " onPress={() => Object_To_Print(item)} />
        <Button
          title="متابعة ديون المال"
          onPress={() => GetFacturesMoney(item)}
        />
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
          <Text style={styles.value}>{versmentPlat.Nom}</Text>
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
        الدين القديم :
        <Text style={styles.value}> {item.ancientCreditMoney}DA </Text>
      </Text>
      <Text style={styles.label}>
        اٍجمالي المبلع :
        <Text style={styles.value}> {item.Montant_Total}DA </Text>
      </Text>
      <Text style={styles.label}>
        الباقي: <Text style={styles.value}>{item.restCreditMoney}DA</Text>
      </Text>
      <Text style={styles.label}>
        التاريخ: <Text style={styles.value}>{formatDate(item.Date_Creat)}</Text>
      </Text>
      <Button
        title="الدفعات"
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
        الدين السابق :
        <Text style={styles.value}>{"\n" + item.ancientCreditPlat} </Text>
      </Text>
      <Text style={styles.label}>
        اٍجمالي الأطباق :
        <Text style={styles.value}>{"\n" + item.totalPlat} </Text>
      </Text>
      <Text style={styles.label}>
        باقي الاطباق:
        <Text style={styles.value}>{"\n" + item.restCreditPlat}</Text>
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
      var VersmentPlat = [];
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
  }
  async function GetTotalCreditMoney() {
    const clientss = await GetAll("Client", setClients);
    for (let Client of clientss) {
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
            creditOmbalagee = creditOmbalagee + "\n";
          }
          creditOmbalagee =
            creditOmbalagee + cp.Plat + ":" + "{" + cp.Produit + "}  ";
        });
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
  async function GetProduct() {
    var result = await GetAll("produit", setproduit);

    var trueProducts = [];
    result.map((r) => {
      if (r.Return === "true") {
        console.log("rrrrrr" + JSON.stringify(r));
        trueProducts.push(r);
      }
    });
    setproduit_true(trueProducts);
    console.log("products[0].Nom" + JSON.stringify(trueProducts[0]));
    // setSelectedProduct(trueProducts[0].Nom);
  }
  useEffect(() => {
    const shouldBeRTL = true;

    if (shouldBeRTL !== I18nManager.isRTL && Platform.OS !== "web") {
      I18nManager.allowRTL(shouldBeRTL);
      I18nManager.forceRTL(shouldBeRTL);
      Updates.reloadAsync();
    }
  }, []);
  useEffect(() => {
    if (Versment_Plat) {
      GetProduct(); //  console.log("selectedFacture" + selectedFacture);
      VersmentFacturePlat();
    }
    if (!Versment_Plat) {
      handlePlatCredit(editClient);
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
          <View
            style={{
              marginBottom: 10,
              height: 50,
              borderRadius: 10,
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignContent: "center",
              alignItems: "center",
            }}
          >
            <View style={styles.headerdiv}>
              <Text style={styles.header}>متابعة الزبائن </Text>
              <Image source={Clienticon} style={styles.icon} />
            </View>
          </View>
          {/* Search Input */}
          <View style={styles.searchInput}>
            <TextInput
              placeholder="البحث عن الزبون بالاسم و اللقب...."
              value={searchQuery}
              onChangeText={handleSearch}
            />
            <Image source={loopIcon} style={styles.iconloop} />
          </View>

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
              keyExtractor={(item) => item.Facture_ID}
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
                <Picker.Item
                  key={0}
                  label={"اختر نوع الطبق"}
                  value={0} // Use product name as value
                />
                {produit_True.map((product) => (
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
      <ArabicMonthYearPicker
        isVisible={isPickerVisible}
        onClose={() => setPickerVisible(false)}
        onConfirm={handleConfirm}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    height: 570,
    backgroundColor: "#F0F8FF",
  },

  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "black",
  },
  headerdiv: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 60,
    width: 200,
    backgroundColor: "#F0F8FF", // Light blue background
    borderRadius: 20,
    marginBottom: 8,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dark transparent background
  },
  searchInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderRadius: 6,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    height: 50,
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
  CardClient: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.2, // Adjust this for shadow visibility
    shadowOffset: { width: 0, height: 2 }, // Offset for a balanced shadow effect
    shadowRadius: 6, // Spread of the shadow
    elevation: 4, // Elevation for Android
  },

  CardClientValues: {
    flexDirection: "row", // Aligns columns horizontally
    flexWrap: "wrap", // Ensures rows wrap into multiple lines
    justifyContent: "space-between", // Adds space between columns
  },
  infoCredit: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignSelf: "flex-end",
    width: 100,
    height: 50,
    borderRadius: 10,
    backgroundColor: "#F08080",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  TotalMoneyLabel: {
    fontSize: 10,
    color: "white",
    fontWeight: "bold",
  },
  TotalMoney: {
    alignSelf: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  TotalPlat: {
    alignSelf: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
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
    fontSize: 22,
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
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  delete: {
    position: "absolute",
    top: 5,
    left: 5,
  },
  edit: {
    position: "absolute",
    top: 5,
    right: 5,
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
    display: "flex",
    justifyContent: "center",
    width: 280,
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
  icon: {
    width: 30, // Set width of the icon
    height: 30, // Set height of the icon
  },
  deleteicon: {
    width: 25, // Set width of the icon
    height: 25, // Set height of the icon
  },
  iconmoney: {
    width: 20, // Set width of the icon
    height: 20, // Set height of the icon
  },
  iconloop: {
    width: 20, // Set width of the icon
    height: 20, // Set height of the icon
    zIndex: 1000,
  },
});

export default ClientConsultation;
