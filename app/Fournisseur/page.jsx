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
  Alert,
  Image,
  I18nManager,
} from "react-native";
// Column names
import {
  deleteExpense,
  GetAll,
  addFournisseur,
  updateFournisseur,
  deleteFournisseur,
  GetExpenses_With_Fournisseur,
} from "@/app/Lib/bdd";
import ExpensesPage from "../Expenses/page";
import FournisseurIcon from "@/assets/icons/Fournisseur.png"; // Icon for fournisseur
import * as Print from "expo-print";
import ArabicMonthYearPicker from "./picker";

const columns = [
  { key: "Nom", label: "الاسم" },
  { key: "Prenom", label: "اللقب" },
  { key: "Num", label: "رقم الهاتف" },
];

// Employee data
const FournisseurConsultation = () => {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFournisseurs, setFilteredFournisseurs] =
    useState(fournisseurs);
  const [Expenses, setExpenses] = useState("");
  const [DisplayExpensesPage, setDisplayExpensesPage] = useState(false);
  const [addFournisseurModel, setAddFournisseurModel] = useState(false);
  const [editFournisseurModel, setEditFournisseurModel] = useState(false);
  const [newFournisseur, setNewFournisseur] = useState({
    Nom: "",
    Prenom: "",
    Num: "",
    Credit: "", // Added Credit field
  });
  const [editFournisseur, setEditFournisseur] = useState(null);
  const [Fournisseur_ID, setFournisseurs_Id] = useState();

  async function GetFournisseurs() {
    const r = await GetAll("Fournisseur", setFournisseurs);
    setFilteredFournisseurs(r);
    console.log("fournisseurs" + JSON.stringify(r));
    // setFournisseurs(r);
  }
  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = fournisseurs.filter((fournisseur) => {
      const fullName = `${fournisseur.Nom} ${fournisseur.Prenom}`.toLowerCase();
      return fullName.includes(text.toLowerCase());
    });
    setFilteredFournisseurs(filtered);
  };

  const handleConsulterExpenses = async (id) => {
    setFournisseurs_Id(id);
    const r = await GetExpenses_With_Fournisseur(id);
    setExpenses(r);
    setDisplayExpensesPage(true);
  };

  async function handleDelete(id) {
    Alert.alert("تأكيد الحذف", "هل أنت متأكد من حذف هذا البائع؟", [
      {
        text: "إلغاء",
        style: "cancel",
      },
      {
        text: "حذف",
        onPress: async () => {
          await deleteFournisseur(id);
          await GetFournisseurs();
        },
        style: "destructive",
      },
    ]);
  }
  const confirmDeleteExpense = (id) => {
    Alert.alert(
      "تأكيد الحذف",
      "هل انت متأكد من الحذف؟",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف",
          onPress: async () => await deleteExpense(id),
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  const renderFournisseurItem = ({ item }) => {
    return (
      <View style={styles.card}>
        <Text style={styles.label}>اسم البائع: </Text>
        <Text style={styles.value}>{item.Nom}</Text>
        <Text style={styles.label}>لقب البائع: </Text>
        <Text style={styles.value}>{item.Prenom}</Text>
        <Text style={styles.label}> رقم: </Text>
        <Text style={styles.value}>{item.Num}</Text>
        <Button
          title="عرض"
          onPress={() => handleConsulterExpenses(item.Fournisseur_ID)}
        />
        <Button
          title="تعديل"
          onPress={() => {
            setEditFournisseur(item);
            setEditFournisseurModel(true);
          }}
        />
        <Button
          title="حذف"
          color="red"
          onPress={() => handleDelete(item.Fournisseur_ID)}
        />
      </View>
    );
  };
  const renderExpenseItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.text}>الوصف: {item.Description}</Text>
      <Text style={styles.text}>المبلغ: {item.Amount}</Text>
      <Text style={styles.text}>التاريخ: {item.Date}</Text>
      <Button
        title="حذف"
        onPress={() => confirmDeleteExpense(item.Expense_ID)}
        color="#F96080"
      />
    </View>
  );

  const handleAddFournisseur = async () => {
    if (!newFournisseur.Nom || !newFournisseur.Prenom || !newFournisseur.Num) {
      return Alert.alert("خطأ", "برجى ملأ جميع الحقول");
    }
    await addFournisseur(
      newFournisseur.Nom,
      newFournisseur.Prenom,
      newFournisseur.Num
    );
    await GetFournisseurs();
    setAddFournisseurModel(false);
  };

  const handleSaveChanges = async () => {
    if (
      !editFournisseur.Nom ||
      !editFournisseur.Prenom ||
      !editFournisseur.Num
    ) {
      return Alert.alert("حطأ", "يرجى ملأ جميع الحقول");
    }
    updateFournisseur(
      editFournisseur.Fournisseur_ID,
      editFournisseur.Nom,
      editFournisseur.Prenom,
      editFournisseur.Num
    );
    await GetFournisseurs();
    setEditFournisseurModel(false);
  };

  const handleShowReport = async (fournisseur) => {
    const { Nom, totalSum, filteredDeductions } = fournisseur;

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    };

    const html = `
  <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        table, th, td {
          border: 1px solid black;
        }
        th, td {
          padding: 10px;
          text-align: center;
        }
        h1, h2 {
          text-align: center;
        }
        .note {
          font-size: 30px;
          margin-top: 30px;
        }
      </style>
    </head>
    <body>
      <h1>تقارير البائع</h1>
      <h2>بائع: ${Nom}</h2>
      <p>المجموع: ${totalSum}</p>
      <p>باقي الدفع: ${fournisseur.Credit}</p> {/* Added remaining credit */}
      <table>
        <thead>
          <tr>
            <th>المبلغ</th>
            <th>التاريخ</th>
          </tr>
        </thead>
        <tbody>
          ${filteredDeductions
            .map(
              (item) => `
              <tr>
                <td>${item.Somme}</td>
                <td>${formatDate(item.Date)}</td>
              </tr>
            `
            )
            .join("")}
        </tbody>
      </table>
      <p class="note">تاريخ التقرير: ${new Date().toLocaleDateString()}</p>
    </body>
  </html>
  `;

    await Print.printAsync({ html });
  };
  useEffect(() => {
    console.log("im here");
    GetFournisseurs();
  }, []);
  return (
    <View style={styles.container}>
      {!DisplayExpensesPage && (
        <View>
          <View style={styles.header}>
            <Text style={styles.title}>إدارة الموردين</Text>
            <Image source={FournisseurIcon} style={styles.icon} />
          </View>
          <Button
            title="إضافة بائع"
            onPress={() => setAddFournisseurModel(true)}
          />

          <TextInput
            style={styles.searchInput}
            placeholder="ابحث عن بائع"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          <FlatList
            data={filteredFournisseurs}
            keyExtractor={(item) => item.Fournisseur_ID.toString()}
            renderItem={renderFournisseurItem}
          />
        </View>
      )}

      {DisplayExpensesPage && (
        <ExpensesPage
          expense={Expenses}
          Back={() => {
            setDisplayExpensesPage(false);
          }}
          Fournisseur_ID={Fournisseur_ID}
        />
      )}

      <Modal visible={editFournisseurModel} animationType="slide">
        <View style={styles.modalContainer}>
          <Text>تعديل البائع</Text>
          <TextInput
            style={styles.input}
            value={editFournisseur?.Nom}
            onChangeText={(text) =>
              setEditFournisseur({ ...editFournisseur, Nom: text })
            }
          />
          <TextInput
            style={styles.input}
            value={editFournisseur?.Prenom}
            onChangeText={(text) =>
              setEditFournisseur({ ...editFournisseur, Prenom: text })
            }
          />
          <TextInput
            style={styles.input}
            value={editFournisseur?.Num}
            onChangeText={(text) =>
              setEditFournisseur({ ...editFournisseur, Num: text })
            }
          />

          <Button title="حفظ التغييرات" onPress={handleSaveChanges} />
          <Button
            title="إلغاء"
            onPress={() => setEditFournisseurModel(false)}
          />
        </View>
      </Modal>

      <Modal visible={addFournisseurModel} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.label}>إضافة بائع</Text>
          <TextInput
            style={styles.input}
            placeholder="اللقب"
            value={newFournisseur.Nom}
            onChangeText={(text) =>
              setNewFournisseur({ ...newFournisseur, Nom: text })
            }
          />
          <TextInput
            style={styles.input}
            placeholder="الاسم"
            value={newFournisseur.Prenom}
            onChangeText={(text) =>
              setNewFournisseur({ ...newFournisseur, Prenom: text })
            }
          />
          <TextInput
            style={styles.input}
            placeholder="رقم الهاتف"
            value={newFournisseur.Num}
            onChangeText={(text) =>
              setNewFournisseur({ ...newFournisseur, Num: text })
            }
            keyboardType="numeric"
          />

          <Button title="إضافة" onPress={handleAddFournisseur} />
          <Button title="إلغاء" onPress={() => setAddFournisseurModel(false)} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  icon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  searchInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 20,
    borderRadius: 8,
  },
  card: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    marginBottom: 20,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  label: {
    fontWeight: "bold",
  },
  value: {
    marginBottom: 10,
  },
  modalContainer: {
    margin: 20,
    marginTop: 60,
    justifyContent: "center",
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
});

export default FournisseurConsultation;
