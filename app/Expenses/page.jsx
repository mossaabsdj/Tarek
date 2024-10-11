import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from "react-native";
import { addExpense, deleteExpense, GetAll } from "@/app/Lib/bdd";
// Example expense data
const initialExpenses = [
  {
    Expense_ID: 1,
    description: "شراء كتب",
    amount: 200,
    Date: "2024-10-01",
  },
  {
    Expense_ID: 1,
    description: "شراء كتب",
    amount: 200,
    Date: "2024-10-01",
  },
  {
    Expense_ID: 1,
    Description: "شراء كتب",
    Amount: 200,
    Date: "2024-10-01",
  },
  {
    Expense_ID: 1,
    Description: "شراء كتب",
    Amount: 200,
    Date: "2024-10-01",
  },
  {
    Expense_ID: 1,
    description: "شراء كتب",
    amount: 200,
    Date: "2024-10-01",
  },
];

// Expense columns
const expensesColumns = [
  { key: "Description", label: "الوصف" },
  { key: "Amount", label: "المبلغ" },
  { key: "Date", label: "التاريخ" },
];

const ExpensesPage = () => {
  const [expensesa, setExpensesa] = useState([]);

  const [expenses, setExpenses] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [addExpenseModalVisible, setAddExpenseModalVisible] = useState(false);
  const [newExpense, setNewExpense] = useState({
    Description: "",
    Amount: "",
  });
  async function GetAllExpenses() {
    const r = await GetAll("Expenses", setExpenses);
    console.log("All" + JSON.stringify(r));
  }
  // Helper function to extract the month from a date
  const getMonthYear = (date) => {
    const [year, month] = date.split("-").slice(0, 2);
    return `${year}-${month}`;
  };

  // Function to group expenses by month and calculate totals
  const getMonthlyTotals = () => {
    return expenses.reduce((totals, expense) => {
      const monthYear = getMonthYear(expense.Date);
      if (!totals[monthYear]) {
        totals[monthYear] = 0;
      }
      totals[monthYear] += expense.Amount;
      return totals;
    }, {});
  };

  // Function to calculate total for the current month
  const calculateCurrentMonthTotal = () => {
    const currentMonth = getMonthYear(new Date().toISOString().split("T")[0]);
    const monthlyTotals = getMonthlyTotals();
    const currentMonthTotal = monthlyTotals[currentMonth] || 0;
    Alert.alert(
      "إجمالي المصاريف لهذا الشهر",
      `إجمالي المصاريف: ${currentMonthTotal}`
    );
  };

  // Function to handle deletion confirmation
  const confirmDeleteExpense = (id) => {
    console.log(id);

    Alert.alert(
      "تأكيد الحذف",
      "هل انت متأكد من الحذف؟",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف",
          onPress: () => DeleteExpense(id),
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  // Function to delete an expense
  const DeleteExpense = async (id) => {
    console.log(id);
    await deleteExpense(id);
    await GetAllExpenses();
  };

  // Function to add a new expense
  const addNewExpense = async () => {
    console.log(newExpense);
    if (!newExpense.Description || !newExpense.Amount) {
      Alert.alert("خطأ", "الرجاء ملء جميع الحقول بشكل صحيح.");
      return;
    }
    await addExpense(newExpense.Description, newExpense.Amount);
    await GetAllExpenses();
    setAddExpenseModalVisible(false);
  };

  // Render each expense card dynamically based on `expensesColumns`
  const renderExpenseItem = ({ item }) => (
    <View style={styles.card}>
      {expensesColumns.map((column) => (
        <Text key={column.key} style={styles.text}>
          {column.label}: {item[column.key]}
        </Text>
      ))}
      <Button
        title="حذف"
        onPress={() => confirmDeleteExpense(item.Expense_ID)}
        color="#F96080"
      />
    </View>
  );
  useEffect(() => {
    GetAllExpenses();
  }, []);
  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        {/* Button to calculate total for current month */}

        <TouchableOpacity
          style={styles.totalButton}
          onPress={calculateCurrentMonthTotal}
        >
          <Text style={styles.totalButtonText}>إجمالي هذا الشهر</Text>
        </TouchableOpacity>

        {/* Button to show totals for all other months */}
        <TouchableOpacity
          style={[styles.totalButton, { backgroundColor: "#28a745" }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.totalButtonText}>إجمالي المصاريف لكل الأشهر</Text>
        </TouchableOpacity>
      </View>

      {/* Button to add new expense */}
      <TouchableOpacity
        style={[styles.totalButton, { backgroundColor: "#ffc107" }]}
        onPress={() => setAddExpenseModalVisible(true)}
      >
        <Text style={styles.totalButtonText}>إضافة مصاريف جديدة</Text>
      </TouchableOpacity>

      {/* Expense list */}
      <FlatList
        data={expenses}
        renderItem={renderExpenseItem}
        keyExtractor={(item) => item.Expense_ID}
      />

      {/* Modal for displaying totals for all months */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>إجمالي المصاريف لكل الأشهر</Text>
            <ScrollView>
              {Object.entries(getMonthlyTotals()).map(([monthYear, total]) => (
                <Text key={monthYear} style={styles.modalText}>
                  {monthYear}: {total} د.ج
                </Text>
              ))}
            </ScrollView>
            <Button title="إغلاق" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>

      {/* Modal for adding a new expense */}
      <Modal
        visible={addExpenseModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>إضافة مصاريف جديدة</Text>

            <TextInput
              style={styles.input}
              placeholder="الوصف"
              value={newExpense.Description}
              onChangeText={(text) =>
                setNewExpense({ ...newExpense, Description: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="المبلغ"
              keyboardType="numeric"
              value={newExpense.Amount}
              onChangeText={(text) =>
                setNewExpense({ ...newExpense, Amount: text })
              }
            />

            <Button title="إضافة" onPress={addNewExpense} />
            <Button
              title="إلغاء"
              color="red"
              onPress={() => setAddExpenseModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  text: {
    fontSize: 16,
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    width: "100%", // Ensures full width for alignment
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: "#007bff", // Default color for button
    padding: 10, // Reduced padding
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14, // Reduced font size
    fontWeight: "bold",
  },
  totalButton: {
    backgroundColor: "#007bff",
    padding: 10, // Reduced padding for compactness
    borderRadius: 5,
    marginBottom: 20,
    alignItems: "center",
  },
  totalButtonText: {
    color: "#fff",
    fontSize: 16, // Adjusted font size
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginVertical: 5,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
});

export default ExpensesPage;
