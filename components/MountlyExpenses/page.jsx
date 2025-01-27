import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome"; // Add FontAwesome for arrow icon

const Page = ({ handleReturn }) => {
  const [Expenses, setُExpenses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Replace fetch with a hardcoded clients array
  useEffect(() => {
    const clientsData = [
      { name: "أحمد", totalPurchases: 1500, debt: 300 },
      { name: "سارة", totalPurchases: 2500, debt: 100 },
      { name: "محمد", totalPurchases: 1200, debt: 500 },
      { name: "ليلى", totalPurchases: 3000, debt: 800 },
      { name: "يوسف", totalPurchases: 1800, debt: 200 },
    ];
    setُExpenses(clientsData);
  }, []);

  const handlePrint = (clientName) => {
    alert(`تم إرسال بيانات ${clientName} للطباعة`);
    // Add actual print functionality if needed
  };

  const filteredExpenses = Expenses.filter((expenses) =>
    expenses.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.returnButton} onPress={handleReturn}>
        <Icon name="arrow-right" size={20} color="#fff" />
      </TouchableOpacity>

      <TextInput
        style={styles.searchInput}
        placeholder="ابحث عن عميل..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {filteredExpenses.length > 0 ? (
        <View style={styles.cardsContainer}>
          {filteredExpenses.map((expenses, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.cardTitle}>{expenses.name}</Text>
              <Text style={styles.cardText}>
                المبلغ: {expenses.totalPurchases} د.إ
              </Text>
              <Text style={styles.cardText}>التاريخ: {expenses.Date} د.إ</Text>
              <Button
                title="طباعة"
                onPress={() => handlePrint(Expenses.name)}
                color="#007BFF"
              />
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.noDataText}>لا توجد بيانات</Text>
      )}

      {/* Return Button */}
      <Button title="رجوع" onPress={handleReturn} color="#FF6347" />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F5F5F5",
    flexGrow: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "left",
  },
  searchInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 16,
    paddingHorizontal: 10,
    fontSize: 16,
    textAlign: "right",
  },
  cardsContainer: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "left",
  },
  cardText: {
    textAlign: "left",
    fontSize: 16,
    color: "#555",
    marginBottom: 4,
  },
  noDataText: {
    textAlign: "center",
    marginVertical: 16,
    color: "#999",
  },
  returnButton: {
    position: "relative",
    marginBottom: 5,
    backgroundColor: "#28a745", // Green background
    padding: 10,
    width: "40",
    borderRadius: 20,
  },
});

export default Page;
