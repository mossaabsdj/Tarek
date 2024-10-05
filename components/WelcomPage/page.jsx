import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";

const WelcomePage = ({ functionStart }) => {
  const handleGetStarted = () => {
    Alert.alert("أهلاً بك!", "لقد بدأت رحلتك."); // Display an alert when the button is pressed
  };

  const getCurrentDateInArabic = () => {
    const daysOfWeek = [
      "الأحد",
      "الإثنين",
      "الثلاثاء",
      "الأربعاء",
      "الخميس",
      "الجمعة",
      "السبت",
    ];
    const monthsOfYear = [
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

    const currentDate = new Date();
    const day = daysOfWeek[currentDate.getDay()];
    const date = currentDate.getDate();
    const month = monthsOfYear[currentDate.getMonth()];
    const year = currentDate.getFullYear();

    return `${day}، ${date} ${month} ${year}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>مرحبا بك في تطبيقنا</Text>
      <Text style={styles.description}>
        نحن سعداء بانضمامك إلينا. استعد لتجربة مميزة!
      </Text>
      <Text style={styles.dateText}>{getCurrentDateInArabic()}</Text>
      <TouchableOpacity style={styles.button} onPress={functionStart}>
        <Text style={styles.buttonText}>ابدأ الآن</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f9fc",
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 10,
  },
  dateText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#6200ee",
    padding: 10,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
});

export default WelcomePage;
