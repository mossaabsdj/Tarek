import React, { useState, useEffect } from "react";
import {
  Image,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ImageBackground,
  I18nManager,
} from "react-native";
import * as Updates from "expo-updates"; // Import expo-updatesimport Stats from "@/app/Stats/page";
import appicon from "@/assets/icons/app.png";
import Stats from "@/app/Stats/page";
import welcompageImage from "@/assets/images/welcom.jpg";
const WelcomePage = ({ functionStart }) => {
  const [StatsPage, setStatsPage] = useState(false);
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
    <View>
      {StatsPage ? (
        <Stats />
      ) : (
        <ImageBackground
          source={welcompageImage} // Local image or use a URL
          style={styles.background}
        >
          <View style={styles.container}>
            <Text style={styles.welcomeText}>مرحبا بك في تطبيقنا</Text>
            <Text style={styles.description}>
              نحن سعداء بانضمامك إلينا. استعد لتجربة مميزة!
            </Text>
            <Text style={styles.dateText}>{getCurrentDateInArabic()}</Text>
            <TouchableOpacity style={styles.button} onPress={functionStart}>
              <Text style={styles.buttonText}>ابدأ الآن</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                setStatsPage(true);
              }}
            >
              <Text style={styles.buttonText}> حسابات</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    justifyContent: "flex-start",
    alignItems: "center",
    height: 700,
  },
  container: {
    marginTop: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f9fc",
    padding: 20,
    borderRadius: 20,
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
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignContent: "center",
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#00BFFF",
    padding: 10,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
  icon: {
    marginTop: 100,
    marginBottom: 100,
    width: 300, // Set width of the icon
    height: 300, // Set height of the icon
  },
});

export default WelcomePage;
