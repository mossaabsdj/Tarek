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
import * as Print from "expo-print";
import ArabicMonthYearPicker from "./picker";
const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisible2, setModalVisible2] = useState(false);
  const [isPickerVisible, setPickerVisible] = useState(false);

  const [addExpenseModalVisible, setAddExpenseModalVisible] = useState(false);
  const [newExpense, setNewExpense] = useState({
    Description: "",
    Amount: "",
  });
  const handleConfirm = async (month, year) => {
    setPickerVisible(false);

    try {
      // Function to format month and year
      const getMonthYear = (date) => {
        const [year, month] = date.split("-").slice(0, 2);
        return `${year}-${month}`; // Returns "YYYY-MM"
      };

      // Group expenses by month
      const monthlyTotals = expenses.reduce((acc, expense) => {
        const monthYear = getMonthYear(expense.Date);
        if (!acc[monthYear]) {
          acc[monthYear] = { total: 0, details: [] };
        }
        acc[monthYear].total += expense.Amount;
        acc[monthYear].details.push(expense);
        return acc;
      }, {});

      // Generate HTML for printing expenses
      const htmlExpenses = `
      <html>
        <head>
          <style>
            body {
              font-family: Tahoma, Arial, sans-serif;
              margin: 0;
              padding: 0;
              direction: rtl;
                 border-right: 3px dashed #000;
                

            }
            .expenses {
              font-size: 1.8em;
              text-align: right;
              padding: 0 10px;
            }
            table {
              margin-right: 40px;
              width: 100%;
              font-size: 1.3em;
              border-collapse: collapse;
              border: 1px dashed #000;
            }
            td, th {
              padding: 5px;
              border-bottom: 1px dashed #000;
              text-align: center;
            }
            .expense-title {
              font-weight: bold;
              font-size: 1.5em;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="expenses">
            <table>
              <tr>
                <th>الشهر والسنة</th>
                <th>الإجمالي (د.ج)</th>
              </tr>
              ${Object.entries(monthlyTotals)
                .map(
                  ([monthYear, { total, details }]) => `
                    <tr>
                      <td>${monthYear.replace("-", " / ")}</td>
                      <td>${total.toFixed(2)} د.ج</td>
                    </tr>
                    <tr>
                      <td colspan="2" class="expense-title">التفاصيل</td>
                    </tr>
                    ${details
                      .map(
                        (expense) => `
                        <tr>
                          <td>${expense.Description}</td>
                          <td>${expense.Amount.toFixed(2)} د.ج</td>
                        </tr>
                      `
                      )
                      .join("")}
                  `
                )
                .join("")}
            </table>
          </div>
        </body>
      </html>
    `;

      // Print the formatted expenses
      await Print.printAsync({
        html: htmlExpenses,
      });
    } catch (error) {
      console.error("Error printing monthly expenses: ", error);
    }
  };

  async function GetAllExpenses() {
    const r = await GetAll("Expenses", setExpenses);
    console.log("All" + JSON.stringify(r));
  }

  const getMonthYear = (date) => {
    const [year, month] = date.split("-").slice(0, 2);
    return `${year}-${month}`;
  };

  const getMonthlyTotals = () => {
    const totals = expenses.reduce((acc, expense) => {
      const monthYear = getMonthYear(expense.Date);
      if (!acc[monthYear]) {
        acc[monthYear] = { total: 0, details: [] }; // Store total and details
      }
      acc[monthYear].total += expense.Amount;
      acc[monthYear].details.push(expense);
      return acc;
    }, {});
    return totals;
  };

  const calculateCurrentMonthTotal = () => {
    const currentMonth = getMonthYear(new Date().toISOString().split("T")[0]);
    const monthlyTotals = getMonthlyTotals();
    const currentMonthTotal = monthlyTotals[currentMonth]
      ? monthlyTotals[currentMonth].total
      : 0;
    setModalVisible2(true);
  };

  const confirmDeleteExpense = (id) => {
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

  const DeleteExpense = async (id) => {
    await deleteExpense(id);
    await GetAllExpenses();
  };

  const addNewExpense = async () => {
    if (!newExpense.Description || !newExpense.Amount) {
      Alert.alert("خطأ", "الرجاء ملء جميع الحقول بشكل صحيح.");
      return;
    }
    await addExpense(newExpense.Description, newExpense.Amount);
    await GetAllExpenses();
    setAddExpenseModalVisible(false);
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

  useEffect(() => {
    GetAllExpenses();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.totalButton}
          onPress={() => {
            setModalVisible2(true);
          }}
        >
          <Text style={styles.totalButtonText}>إجمالي هذا الشهر</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.totalButton, { backgroundColor: "#28a745" }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.totalButtonText}>إجمالي المصاريف لكل الأشهر</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.totalButton}
        onPress={() => setPickerVisible(true)}
      >
        <Text style={styles.totalButtonText}>طباعة </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.totalButton, { backgroundColor: "#ffc107" }]}
        onPress={() => setAddExpenseModalVisible(true)}
      >
        <Text style={styles.totalButtonText}>إضافة مصاريف جديدة</Text>
      </TouchableOpacity>

      <FlatList
        data={expenses}
        renderItem={renderExpenseItem}
        keyExtractor={(item) => item.Expense_ID.toString()}
      />

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>إجمالي المصاريف لكل الأشهر</Text>
            <ScrollView>
              {Object.entries(getMonthlyTotals()).map(
                ([monthYear, { total, details }]) => (
                  <View key={monthYear} style={styles.monthContainer}>
                    <Text style={styles.modalText}>
                      {monthYear}: {total} د.ج
                    </Text>
                    {details.map((expense, index) => (
                      <Text key={index} style={styles.modalDetailText}>
                        - {expense.Description}: {expense.Amount} د.ج
                      </Text>
                    ))}
                  </View>
                )
              )}
            </ScrollView>
            <Button title="إغلاق" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
      <Modal visible={modalVisible2} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>إجمالي المصاريف لكل الأشهر</Text>
            <ScrollView>
              {Object.entries(getMonthlyTotals()).map(
                ([monthYear, { total, details }]) => (
                  <View key={monthYear} style={styles.monthContainer}>
                    <Text style={styles.modalText}>
                      {monthYear}: {total} د.ج
                    </Text>
                    {details.map((expense, index) => (
                      <Text key={index} style={styles.modalDetailText}>
                        - {expense.Description}: {expense.Amount} د.ج
                      </Text>
                    ))}
                    {/* Add a line break after each month's details for better readability */}
                    <View style={styles.separator} />
                  </View>
                )
              )}
            </ScrollView>
            <Button title="إغلاق" onPress={() => setModalVisible2(false)} />
          </View>
        </View>
      </Modal>

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
    width: "100%",
  },
  totalButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    alignItems: "center",
  },
  totalButtonText: {
    color: "#fff",
    fontSize: 16,
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
  monthContainer: {
    marginBottom: 10,
  },
  modalDetailText: {
    fontSize: 14,
    marginLeft: 10,
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
