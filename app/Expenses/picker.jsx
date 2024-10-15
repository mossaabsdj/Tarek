import React, { useState } from "react";
import { Modal, View, Text, Button, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker"; // Correctly import Picker

const ArabicMonthYearPicker = ({ isVisible, onClose, onConfirm }) => {
  // Arabic month names starting with جانفي, فيفري, etc.
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

  // Years (you can customize the range)
  const years = Array.from(
    { length: 50 },
    (_, index) => new Date().getFullYear() - index
  );

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Default to current month
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Default to current year

  return (
    <Modal visible={isVisible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.pickerContainer}>
          <Text style={styles.title}>اختر الشهر والسنة</Text>

          <View style={styles.pickerWrapper}>
            {/* Month Picker */}
            <Picker
              selectedValue={selectedMonth}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedMonth(itemValue)}
            >
              {months.map((month, index) => (
                <Picker.Item key={index} label={month} value={index + 1} />
              ))}
            </Picker>

            {/* Year Picker */}
            <Picker
              selectedValue={selectedYear}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedYear(itemValue)}
            >
              {years.map((year, index) => (
                <Picker.Item key={index} label={year.toString()} value={year} />
              ))}
            </Picker>
          </View>

          {/* Confirm and Cancel Buttons */}
          <View style={styles.buttonWrapper}>
            <Button
              title="تأكيد"
              onPress={() => onConfirm(selectedMonth, selectedYear)}
            />
            <Button title="إلغاء" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  pickerContainer: {
    width: "80%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  pickerWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  picker: {
    width: 150,
    height: 50,
  },
  buttonWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
});

export default ArabicMonthYearPicker;
