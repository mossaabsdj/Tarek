import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  I18nManager,
} from "react-native";
import {
  GetSumSalesMounthly,
  GetSumDeductionMounthly,
  GetSumExpensesMounthly,
} from "@/app/Lib/bdd";
import * as Updates from "expo-updates";

import { Picker } from "@react-native-picker/picker"; // Correctly import Picker
import SalesDetails from "@/components/MountlyClient/page";
import DeductionDetails from "@/components/MountlyDeductions/page";
import ExpensesDetails from "@/components/MountlyExpenses/page";
const StatsPage = () => {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [TotalSales, setTotalSales] = useState("");
  const [TotalDeduction, setTotalDeduction] = useState("");
  const [TotalExpenses, setTotalExpenses] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);
  const [DisplaySalesDetails, setDisplaySalesDetails] = useState(false);
  const [DisplayDeductionDetails, setDisplayDedctionDetails] = useState(false);
  const [DisplayExpensesDetails, setDisplayExpensesDetails] = useState(false);
  const [Current_Date, setCurrent_Date] = useState();
  const months = [
    "جانفي",
    "فيفري",
    "مارس",
    "أفريل",
    "ماي",
    "جوان",
    "جويلية",
    "أوت",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];

  const years = Array.from(
    { length: 50 },
    (_, i) => `${new Date().getFullYear() - i}`
  );

  // Function to format the selected month and year
  const formatDate = (month, year) => {
    const monthIndex = months.indexOf(month) + 1; // Get the month index (1-based)
    const formattedMonth = monthIndex < 10 ? `0${monthIndex}` : monthIndex; // Add leading zero if necessary
    return `${year}-${formattedMonth}-01`; // Return the first day of the selected month
  };

  const handleSelectDate = () => {
    const selectedDate = formatDate(selectedMonth, selectedYear); // Format the date
    console.log("Selected Date: ", selectedDate);
    setCurrent_Date(selectedDate);
    // Fetch stats with the selected month and year
    GetStats(selectedDate);
    setModalVisible(false); // Close the modal
  };

  const GetStats = async (date) => {
    const sales = await GetSumSalesMounthly(date);
    console.log("Sales Data: ", sales);
    setTotalSales(sales);

    // Fetch deductions and expenses
    GetSumDeductionMounthly(date).then((D) => setTotalDeduction(D));
    GetSumExpensesMounthly(date).then((E) => setTotalExpenses(E));
  };
  useEffect(() => {
    const date = new Date();

    // Format the date as YYYY-MM-DD
    const formattedDate = date.toISOString().split("T")[0];
    setCurrent_Date(formattedDate);
    console.log("formattedDate" + formattedDate);
    GetStats(formattedDate);
  }, []);
  function Return() {
    setDisplayDedctionDetails(false);
    setDisplaySalesDetails(false);
    setDisplayExpensesDetails(false);
  }

  function GetMounth(d) {
    if (d) {
      var t = d.split("-");
      return months[parseInt(t[1] - 1)] + " " + t[0];
    }
  }
  return (
    <>
      {!DisplaySalesDetails &&
      !DisplayExpensesDetails &&
      !DisplayDeductionDetails ? (
        <View style={styles.container}>
          <Text style={styles.Date}>{GetMounth(Current_Date)}</Text>

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.buttonText}>تحديد التاريخ</Text>
          </TouchableOpacity>
          {/* Display Total Stats */}
          <View style={styles.cards}>
            {/* Card for إجمالي المبيعات */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>إجمالي المبيعات</Text>
              <Text style={styles.cardValue}>
                {TotalSales[0]?.TotalMontant + "DA" || 0 + "DA"}
              </Text>
              <TouchableOpacity
                style={styles.detailsButton}
                onPress={() => {
                  setDisplaySalesDetails(true);
                }}
              >
                <Text style={styles.buttonText}>تفاصيل</Text>
              </TouchableOpacity>
            </View>

            {/* Card for إجمالي الاقتطاعات */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>إجمالي الاقتطاعات</Text>
              <Text style={styles.cardValue}>{TotalDeduction}DA</Text>
              <TouchableOpacity
                style={styles.detailsButton}
                onPress={() => {
                  setDisplayDedctionDetails(true);
                }}
              >
                <Text style={styles.buttonText}>تفاصيل</Text>
              </TouchableOpacity>
            </View>

            {/* Card for إجمالي المصاريف */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>إجمالي المشتريات</Text>
              <Text style={styles.cardValue}>{TotalExpenses}DA</Text>
              <TouchableOpacity
                style={styles.detailsButton}
                onPress={() => {
                  setDisplayExpensesDetails(true);
                }}
              >
                <Text style={styles.buttonText}>تفاصيل</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Button to open Modal */}

          {/* Modal to Select Month and Year */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                {/* Month Picker */}
                <Text style={styles.label}>اختر الشهر:</Text>
                <Picker
                  selectedValue={selectedMonth}
                  onValueChange={(itemValue) => setSelectedMonth(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="اختر الشهر" value="" />
                  {months.map((month, index) => (
                    <Picker.Item key={index} label={month} value={month} />
                  ))}
                </Picker>

                {/* Year Picker */}
                <Text style={styles.label}>اختر السنة:</Text>
                <Picker
                  selectedValue={selectedYear}
                  onValueChange={(itemValue) => setSelectedYear(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="اختر السنة" value="" />
                  {years.map((year, index) => (
                    <Picker.Item key={index} label={year} value={year} />
                  ))}
                </Picker>

                {/* Confirm Button */}
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleSelectDate}
                >
                  <Text style={styles.buttonText}>تأكيد</Text>
                </TouchableOpacity>

                {/* Cancel Button */}
                <TouchableOpacity
                  style={[styles.confirmButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.buttonText}>إلغاء</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      ) : null}
      {DisplayExpensesDetails && (
        <ExpensesDetails handleReturn={Return} Date={Current_Date} />
      )}
      {DisplayDeductionDetails && (
        <DeductionDetails handleReturn={Return} Date={Current_Date} />
      )}
      {DisplaySalesDetails && (
        <SalesDetails handleReturn={Return} Date={Current_Date} />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "white",
  },
  cards: {
    marginTop: 20,
  },
  detailsButton: {
    marginTop: 10,
    backgroundColor: "#007BFF",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },

  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    textAlign: "left",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "left",
  },
  Date: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  cardValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4caf50",
    marginBottom: 15,
    textAlign: "left",
  },
  dateButton: {
    backgroundColor: "#28a745",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
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
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
  picker: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    height: 60,
    marginBottom: 20,
  },
  confirmButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: "#dc3545",
  },
});

export default StatsPage;
