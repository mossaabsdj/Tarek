import {
  Image,
  Text,
  View,
  StyleSheet,
  Platform,
  I18nManager,
  TextInput,
  Alert,
  Button,
} from "react-native";
import Constants from "expo-constants";
import * as Updates from "expo-updates";
import Sales from "../NewSales/page";
import Slider from "@/components/SliderMenu/page";
import { useEffect, useState } from "react";
import Client from "@/app/Client/page";
import * as SQLite from "expo-sqlite";
import Produit from "@/app/Produit/page";

//import Bdd from "@/app/Lib/Bdd";
//const db = SQLite.openDatabaseAsync("tarek5.db");
import {
  creatAll,
  updateApp,
  CreatTableapp,
  insertRow,
  getFirstRow,
  CreatTable,
  createEmployeeTable,
  createClientTable,
  createFactureTable,
  createFactProdTable,
  createVersmentTable,
  createCreditEmployeeTable,
  createVersmentPlatTable,
  createExpensesTable,
  createFournisseurTable,
} from "@/app/Lib/bdd";
import Fournisseur from "@/app/Fournisseur/page";
export default function HomeScreen() {
  const [firstTime, setfirstTime] = useState(true);
  const [app, setapp] = useState(false);
  async function first_time() {
    await CreatTableapp();
    await insertRow("saadsdj123", false);
  }
  async function check() {
    const r = await getFirstRow();
    console.log(JSON.stringify(r.statu));
    if (r.statu === 1) {
      setfirstTime(false);
    }
  }
  useEffect(() => {
    const shouldBeRTL = true;

    if (shouldBeRTL !== I18nManager.isRTL && Platform.OS !== "web") {
      I18nManager.allowRTL(shouldBeRTL);
      I18nManager.forceRTL(shouldBeRTL);
      Updates.reloadAsync();
    }
    first_time();
    check();

    // setfirstTime(false);
    creatAll();
    // const r = GetAll("produit");
    // console.log("ssssss" + JSON.stringify(r));
    //alterFactureTable();
  }, []);

  const [passcode, setPasscode] = useState("");

  const handleConfirm = async () => {
    console.log(passcode);
    if (passcode === "saadsdj123") {
      const r = await updateApp("1", 1);
      console.log(JSON.stringify(r));
      creatAll();
      check();
      Alert.alert("تم التأكيد", `كلمة التشغيل التي أدخلتها `);
    } else {
      Alert.alert("خطأ", "يرجى إدخال كلمة التشغيل.");
    }
  };
  return (
    <View>
      {!firstTime && <Fournisseur />}
      {firstTime && (
        <View style={styles.container}>
          <Text style={styles.label}>
            مرحبا بك في تطبيق مصعب ادخل كلمة التشغيل
          </Text>
          <TextInput
            style={styles.input}
            placeholder="أدخل كلمة التشغيل"
            value={passcode}
            onChangeText={setPasscode}
            secureTextEntry
          />
          <Button title="تأكيد" onPress={handleConfirm} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  label: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
    textAlign: "right", // Align text to the right for RTL languages
  },
});
