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
import { GetDeductionsSumByEmployee } from "@/app/Lib/bdd";
const Page = ({ handleReturn, Date }) => {
  const [Employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Replace fetch with a hardcoded clients array
  useEffect(() => {
    const r = GetEmployee(Date);
  }, []);
  async function GetEmployee(date) {
    const r = await GetDeductionsSumByEmployee(date);
    setEmployees(r);

    console.log(JSON.stringify(r));
  }
  const handlePrint = (clientName) => {
    alert(`تم إرسال بيانات ${clientName} للطباعة`);
    // Add actual print functionality if needed
  };

  const filteredEmployees = Employees?.filter((Employee) =>
    Employee.Nom.toLowerCase().includes(searchQuery.toLowerCase())
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

      {filteredEmployees.length > 0 ? (
        <View style={styles.cardsContainer}>
          {filteredEmployees.map((Employee, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.cardTitle}>
                {Employee.Nom + " " + Employee.Prenom}
              </Text>
              <Text style={styles.cardText}>
                إجمالي الاقتطاعات: {Employee.TotalDeduction}DA
              </Text>
              <Button
                title="طباعة"
                onPress={() => handlePrint(Employee.Nom)}
                color="#007BFF"
              />
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.noDataText}>لا توجد بيانات</Text>
      )}
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
    backgroundColor: "#28a745", // Green background
    padding: 10,
    width: "40",
    borderRadius: 20,
    marginBottom: 5,
  },
});

export default Page;
