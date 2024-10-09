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
} from "react-native";
import FactTable from "@/components/FactTable/page";
import NewSales from "@/components/NewSales/page";
import {
  GetFacturesWithClientName,
  deleteFacture,
  Get_ALL_Factures_Factprod,
} from "@/app/Lib/bdd";
// Column names
const columns = [
  { key: "client_nom", label: "اسم العميل" },
  { key: "Montant_Total", label: "المبلغ الكلي" },
  { key: "ValiderMoney", label: "ديون المال" },
  { key: "ValiderPlat", label: "ديون الأطباق" },
  { key: "Date_Creat", label: "التاريخ" },
];

// Invoice data
const initialInvoices = [
  {
    Facture_ID: "1",
    client_nom: "علي محمد",
    Montant_Total: "1000",
    ValiderMoney: "مدفوع",
    ValiderPlat: "مدفوع",
    Date_Creat: "2024-09-30",
  },
  {
    Facture_ID: "2",
    client_nom: "علي محمد",
    Montant_Total: "1000",
    ValiderMoney: "مدفوع",
    ValiderPlat: "مدفوع",
    Date_Creat: "2024-09-30",
  },
  {
    Facture_ID: "3",
    client_nom: "علي محمد",
    Montant_Total: "1000",
    ValiderMoney: "مدفوع",
    ValiderPlat: "مدفوع",
    Date_Creat: "2024-09-30",
  },
];

const InvoiceConsultation = () => {
  const Thead = ["المجموع", "الكمية", "السعر", "الاسم"];

  const [invoices, setInvoices] = useState(initialInvoices);
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
    return invoice.client_nom.toLowerCase().includes(searchQuery.toLowerCase());
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
    await deleteFacture(id);
    await GetAllfunction();
  };
  const ConsulterFacture = async (Facture) => {
    setConsulterFacture_Model(true);
    setEditInvoice(Facture);
    const all = await Get_ALL_Factures_Factprod(Facture.Facture_ID);
    console.log("editinovice" + JSON.stringify(editInvoice));

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
      <Text style={styles.header}>متابعة الفواتير</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="...البحث عن الفاتورة بالاسم"
        value={searchQuery}
        onChangeText={handleSearch}
      />
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

      <FlatList
        data={filteredInvoices}
        renderItem={renderInvoiceItem}
        keyExtractor={(item) => item.Facture_ID}
      />

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
            marginBottom: 200,
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
    marginBottom: 20,
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
});

export default InvoiceConsultation;
