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
import Icon from "react-native-vector-icons/FontAwesome"; // Add FontAwesome for arrow icon

import {
  addExpense,
  deleteExpense,
  GetAll,
  GetExpenses_With_Fournisseur,
  addVersment_Four,
  GetSum_Versment_Expenses,
} from "@/app/Lib/bdd";
import * as Print from "expo-print";
import ArabicMonthYearPicker from "./picker";
const ExpensesPage = ({ expense, Back, Fournisseur_ID }) => {
  const [expenses, setExpenses] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisible2, setModalVisible2] = useState(false);
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [ID_Fournisseur, setID_Fournisseur] = useState();
  const [addExpenseModalVisible, setAddExpenseModalVisible] = useState(false);
  const [VersmentModel, setVersmentModel] = useState(false);
  const [VersmentValue, setVersmentValue] = useState();
  const [newExpense, setNewExpense] = useState({
    Description: "",
    Amount: "",
  });
  useState(() => {
    setID_Fournisseur(Fournisseur_ID);
  }, [Fournisseur_ID]);
  const handleConfirm = async (month, year) => {
    setPickerVisible(false);

    try {
      // Function to filter expenses by selected month and year
      const filterExpensesByMonthAndYear = (expenses, month, year) => {
        return expenses.filter((expense) => {
          const expenseDate = new Date(expense.Date);
          const expenseMonth = expenseDate.getMonth() + 1; // JavaScript months are zero-based
          const expenseYear = expenseDate.getFullYear();

          // Compare expense month and year with the provided month and year
          return expenseMonth === month && expenseYear === year;
        });
      };

      // Filter expenses for the selected month and year
      const filteredExpenses = filterExpensesByMonthAndYear(
        expenses,
        month,
        year
      );

      // Calculate the total for the selected month
      const totalForMonth = filteredExpenses.reduce(
        (acc, expense) => acc + expense.Amount,
        0
      );

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
            <tr>
              <td>${year} / ${month.toString().padStart(2, "0")}</td>
              <td>${totalForMonth.toFixed(2)} د.ج</td>
            </tr>
            <tr>
              <td colspan="2" class="expense-title">التفاصيل</td>
            </tr>
            ${filteredExpenses
              .map(
                (expense) => `
                <tr>
                  <td>${expense.Description}</td>
                  <td>${expense.Amount.toFixed(2)} د.ج</td>
                </tr>
              `
              )
              .join("")}
          </table>
        </div>
      </body>
    </html>
  `;

      // Print the formatted expenses for the selected month and year
      await Print.printAsync({
        html: htmlExpenses,
      });
    } catch (error) {
      console.error("Error printing monthly expenses: ", error);
    }
  };
  const handleAddVersment = async () => {
    const id = await addExpense("دفعة", 0, ID_Fournisseur);
    await addVersment_Four(id, VersmentValue);
    setVersmentModel(false);
  };
  useEffect(() => {
    if (!VersmentModel) {
      GetAllExpenses();
    }
  }, [VersmentModel]);
  async function GetAllExpenses() {
    const Expenses = await GetExpenses_With_Fournisseur(ID_Fournisseur);
    for (let ex of Expenses) {
      const Sum = await GetSum_Versment_Expenses(ex.Expense_ID);
      ex.Versment = Sum;
    }
    console.log("All" + JSON.stringify(Expenses));
    setExpenses(Expenses);
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
    if (!newExpense.Description || !newExpense.Amount || !newExpense.Versment) {
      Alert.alert("خطأ", "الرجاء ملء جميع الحقول بشكل صحيح.");
      return;
    }
    console.log(
      "all is:" + ID_Fournisseur,
      newExpense.Description,
      newExpense.Amount
    );
    const Expenses_ID = await addExpense(
      newExpense.Description,
      newExpense.Amount,
      ID_Fournisseur
    );
    console.log("versment" + newExpense.Versment);
    await addVersment_Four(Expenses_ID, newExpense.Versment);

    const r = await GetAllExpenses();
    console.log("R", r);
    setAddExpenseModalVisible(false);
  };

  const renderExpenseItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.text}>الوصف: {item.Description}</Text>
      {item.Amount !== 0 && (
        <Text style={styles.text}>المبلغ: {item.Amount}</Text>
      )}
      <Text style={styles.text}>التاريخ: {item.Date}</Text>
      <Text style={styles.text}>المبلغ المدفوع: {item.Versment}</Text>

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
      <TouchableOpacity style={styles.returnButton} onPress={Back}>
        <Icon name="arrow-right" size={20} color="#fff" />
      </TouchableOpacity>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.totalButton}
          onPress={() => {
            setModalVisible2(true);
          }}
        >
          <Text style={styles.Button2}>إجمالي هذا الشهر</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.totalButton}
          onPress={() => setPickerVisible(true)}
        >
          <Text style={styles.Button2}>طباعة </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.totalButton]}
          onPress={() => setAddExpenseModalVisible(true)}
        >
          <Text style={styles.Button2}>إضافة مصاريف جديدة</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.totalButton}
          onPress={() => setVersmentModel(true)}
        >
          <Text style={styles.Button2}>دفع </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={expenses}
        renderItem={renderExpenseItem}
        keyExtractor={(item) => item.Expense_ID.toString()}
      />

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>إجمالي مصاريف السنة</Text>
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
            <Text style={styles.modalTitle}> إجمالي مصاريف الشهر الحالي</Text>
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
              placeholderTextColor={"black"}
              value={newExpense.Description}
              onChangeText={(text) =>
                setNewExpense({ ...newExpense, Description: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="المبلغ"
              placeholderTextColor={"black"}
              keyboardType="numeric"
              value={newExpense.Amount}
              onChangeText={(text) => {
                setNewExpense({ ...newExpense, Amount: text });
              }}
            />
            <TextInput
              style={styles.input}
              placeholder="المبلغ المدفوع"
              placeholderTextColor={"red"}
              keyboardType="numeric"
              value={newExpense.Versment}
              onChangeText={(text) =>
                setNewExpense({ ...newExpense, Versment: text })
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
      <Modal
        animationType="slide"
        transparent={false}
        visible={VersmentModel}
        onRequestClose={() => setVersmentModel(false)}
      >
        <View style={styles.modalView}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setVersmentModel(false)}
          >
            <Text style={styles.closeButtonText}>خروج</Text>
          </TouchableOpacity>

          <Text style={styles.modalTitle}>اضافة دفعة </Text>
          <TextInput
            style={styles.inputModel}
            placeholder="المبلغ"
            value={VersmentValue}
            keyboardType="numeric"
            onChangeText={setVersmentValue}
          />

          <Button title="تأكيد الدفع" onPress={handleAddVersment} />
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
    height: 700,
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
    marginBottom: 5,
    width: "100%",
  },
  Button2: {
    backgroundColor: "#007bff",
    borderRadius: 5,
    color: "#fff",
    fontWeight: "bold",
    width: 140,
    alignContent: "center",
    textAlign: "center",
  },
  totalButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
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
  returnButton: {
    position: "relative",
    marginBottom: 10,
    backgroundColor: "#28a745", // Green background
    padding: 10,
    width: "40",
    borderRadius: 20,
  },
  modalView: {
    justifyContent: "center",
    height: 200,
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
    marginTop: 100,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  closeButton: {
    position: "absolute",
    zIndex: 1000,
    backgroundColor: "red",
    borderRadius: 5,
    width: 50,
    height: 30,
    top: 0,
    left: 0,
  },
  closeButtonText: {
    textAlign: "center",
    marginTop: 5,
    color: "white",
    fontWeight: "bold",
  },
  inputModel: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    width: "100%",
    textAlign: "left",
  },
});

export default ExpensesPage;
