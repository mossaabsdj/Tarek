import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TextInput,
  Button,
  Modal,
  Alert,
  TouchableOpacity,
} from "react-native";
import FactTable from "@/components/FactTable/page";
import NewSales from "@/components/NewSales/page";
import {
  GetFacturesWithClientName,
  deleteFacture,
  Get_ALL_Factures_Factprod,
} from "@/app/Lib/bdd";
import FactureIcon from "@/assets/icons/invoice.png";

// Column names
const columns = [
  { key: "client_nom", label: "اسم العميل" },
  { key: "Montant_Total", label: "المبلغ الكلي" },
  { key: "newCreditMoney", label: "ديون المال" },
  { key: "newCreditPlat", label: "ديون الأطباق" },
  { key: "Date_Creat", label: "التاريخ" },
];

// Invoice data

const InvoiceConsultation = () => {
  const Thead = ["المجموع", "الكمية", "السعر", "الاسم"];
  const [invoices, setInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editInvoice, setEditInvoice] = useState(null);
  const [rows, setrows] = useState([]);
  const [editInvoiceModel, setEditInvoiceModel] = useState(false);
  const [addInvoiceModel, setAddInvoiceModel] = useState(false);
  const [ConsulterFacture_Model, setConsulterFacture_Model] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    clientName: "",
    totalAmount: "",
    status: "",
    date: "",
  });
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

  const filteredInvoices = invoices.filter((invoice) => {
    const fullName =
      `${invoice.client_nom} ${invoice.client_prenom}`.toLowerCase(); // Combine client_nom and client_prenom
    return fullName.includes(searchQuery.toLowerCase()); // Check if the searchQuery matches the full name
  });

  const handleSaveChanges = () => {
    setInvoices((prevInvoices) =>
      prevInvoices.map((invoice) =>
        invoice.Facture_ID === editInvoice.Facture_ID ? editInvoice : invoice
      )
    );
    setEditInvoiceModel(false);
  };

  const handleDeleteInvoice = async (id) => {
    Alert.alert(
      "تأكيد الحذف", // Title of the alert
      "هل أنت متأكد أنك تريد حذف الفاتورة؟", // Message of the alert
      [
        {
          text: "إلغاء", // Cancel button text
          style: "cancel",
        },
        {
          text: "تأكيد", // Confirm button text
          onPress: async () => {
            await deleteFacture(id); // Call delete function if confirmed
            await GetAllfunction(); // Refresh or get updated data
          },
        },
      ],
      { cancelable: false } // Prevent closing the dialog by tapping outside
    );
  };

  const ConsulterFacture = async (Facture) => {
    setConsulterFacture_Model(true);
    setEditInvoice(Facture);
    const all = await Get_ALL_Factures_Factprod(Facture.Facture_ID);
    console.log("editinovice=============" + JSON.stringify(all));

    setrows(all);
  };

  const renderInvoiceItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>معلومات الفاتورة:{item.Facture_ID}</Text>
      {columns.map((column) =>
        column.key === "Date_Creat" ? (
          <Text style={styles.label} key={column.key}>
            {column.label}:
            <Text style={styles.value}>{formatDate(item[column.key])}</Text>
          </Text>
        ) : column.key === "client_nom" ? (
          <Text style={styles.label} key={column.key}>
            {column.label}:{" "}
            <Text style={styles.value}>
              {item[column.key] + " " + item.client_prenom}
            </Text>
          </Text>
        ) : (
          <Text style={styles.label} key={column.key}>
            {column.label}: <Text style={styles.value}>{item[column.key]}</Text>
          </Text>
        )
      )}
      <Button title="عرض" onPress={() => ConsulterFacture(item)} />
      <Button
        title="حذف"
        onPress={() => handleDeleteInvoice(item.Facture_ID)}
      />
    </View>
  );
  async function GetAllfunction() {
    const Factures = await GetFacturesWithClientName();
    const processedFactures = Factures.map((fact) => {
      return {
        ...fact, // Spread the original facture properties
        ValiderMoney: fact.ValiderMoney === 1 ? "مدفوع" : "غير مدفوع", // "مدفوع" if ValiderMoney is 1, else "غير مدفوع"
        ValiderPlat: fact.ValiderPlat === 1 ? "مدفوع" : "غير مدفوع", // "مدفوع" if ValiderPlat is 1, else "غير مدفوع"
      };
    });
    processedFactures.sort((a, b) => b.Facture_ID - a.Facture_ID);

    setInvoices(processedFactures);
  }
  const deleteRow = (rowIndex) => {
    const updatedRows = rows.filter((_, index) => index !== rowIndex);
    setrows(updatedRows);
  };
  const handelSave = async () => {
    const Montant_total = rows.reduce((total, item) => total + item.Sum, 0);
    console.log("rows" + JSON.stringify(rows));
    if (Montant_total === 0) {
      Alert.alert("", "الرجاء ملأ الفاتورة للقيام بعملية التأكيد");
    } else {
      setpaymentAmount(Montant_total + "");
      setVersment_Money(true);
    }
  };
  useEffect(() => {
    if (!ConsulterFacture_Model) {
      GetAllfunction();
    }
  }, [ConsulterFacture_Model]);
  return (
    <View style={styles.container}>
      {!ConsulterFacture_Model && (
        <>
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
            <Text style={styles.header}>متابعة الفواتير</Text>
            <Image source={FactureIcon} style={styles.icon} />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="...البحث عن الفاتورة بالاسم"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          <FlatList
            data={filteredInvoices}
            renderItem={renderInvoiceItem}
            keyExtractor={(item) => item.Facture_ID}
          />
        </>
      )}

      {/* Modal for Editing Invoice */}
      {editInvoiceModel && (
        <Modal
          animationType="slide"
          transparent={false}
          visible={editInvoiceModel}
          onRequestClose={() => setEditInvoiceModel(false)}
        >
          <View style={styles.modalView}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setEditInvoiceModel(false)}
            >
              <Text style={styles.closeButtonText}>خروج</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>تعديل معلومات الفاتورة</Text>

            <TextInput
              style={styles.input}
              value={editInvoice.clientName}
              onChangeText={(text) =>
                setEditInvoice({ ...editInvoice, clientName: text })
              }
              placeholder="اسم العميل"
            />
            <TextInput
              style={styles.input}
              value={editInvoice.totalAmount}
              keyboardType="numeric"
              onChangeText={(text) =>
                setEditInvoice({ ...editInvoice, totalAmount: text })
              }
              placeholder="المبلغ الكلي"
            />
            <TextInput
              style={styles.input}
              value={editInvoice.status}
              onChangeText={(text) =>
                setEditInvoice({ ...editInvoice, status: text })
              }
              placeholder="الحالة"
            />
            <TextInput
              style={styles.input}
              value={editInvoice.date}
              placeholder="التاريخ"
            />

            <Button title="حفظ" onPress={handleSaveChanges} />
          </View>
        </Modal>
      )}
      {/*consulter Facture*/}
      {ConsulterFacture_Model && (
        <View
          style={{
            borderColor: "black",
            borderRadius: 10,
            borderWidth: 2,
            marginTop: 20,
          }}
        >
          <NewSales
            currentclientid={editInvoice.Client_ID}
            rowsinitial={rows}
            nomClient={editInvoice.client_nom}
            Facture_ID_Delete={editInvoice.Facture_ID}
          />
        </View>
      )}
      {ConsulterFacture_Model && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: "0%",
            zIndex: 1000,
            width: 60,
            borderRadius: 20,
          }}
        >
          <Button
            title="رجوع"
            onPress={() => setConsulterFacture_Model(false)}
            color="green"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 700,
    padding: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  card: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  label: {
    marginVertical: 5,
  },
  value: {
    fontWeight: "normal",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    width: "100%",
  },
  closeButton: {
    position: "absolute",
    zIndex: 1000,
    backgroundColor: "red",
    borderRadius: 5,
    width: 100,
    alignItems: "center",
    padding: 10,
  },
  closeButtonText: {
    color: "white",
  },
  icon: {
    width: 30, // Set width of the icon
    height: 30, // Set height of the icon
  },
});

export default InvoiceConsultation;
