import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  ImageBackground,
  I18nManager,
  Alert,
} from "react-native";
import logoutIcon from "@/assets/icons/logout.png";
import FlechIcon from "@/assets/icons/slide-right.png";
import StoreIcon from "@/assets/icons/store.png";
import ProduitIcon from "@/assets/icons/box.png";
import EmployeeIcon from "@/assets/icons/workers.png";
import FactureIcon from "@/assets/icons/invoice.png";
import Clienticon from "@/assets/icons/Client.png";
import Salesicon from "@/assets/icons/Sales.png";
import img from "@/assets/images/icon.png";
import header from "@/assets/images/header.jpg";
import IconExpenses from "@/assets/icons/spending.png";
import Icon from "react-native-vector-icons/FontAwesome";
import Sales from "@/app/NewSales/page";
import Client from "@/app/Client/page";
import Produit from "@/app/Produit/page";
import WelcomPage from "@/components/WelcomPage/page";
import Enployee from "@/app/Employe/page";
import Facture from "@/app/Factures/page";
import Expenses from "@/app/Expenses/page";
const { width: screenWidth } = Dimensions.get("window");

const SliderMenu = () => {
  const [open, setOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(screenWidth * 0.9)).current; // Use 80% of screen width
  const [WelcomPaged, setWelcomPaged] = useState(true);
  const [ExpensesPage, setExpensesPage] = useState(false);
  const [SalesPage, setSales] = useState(false);
  const [EnployeePage, setEnployee] = useState(false);
  const [ClientPage, setClient] = useState(false);
  const [FacturesPage, setFactures] = useState(false);
  const [ProduitPage, setProduit] = useState(false);
  const sliderFunction = () => {
    if (open) {
      Animated.timing(slideAnim, {
        toValue: screenWidth * 0.9, // Move sidebar out of view
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: false,
      }).start();
      setOpen(false);
    } else {
      Animated.timing(slideAnim, {
        toValue: 0, // Slide sidebar into view
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: false,
      }).start();
      setOpen(true);
    }
  };
  const Display_Sales = () => {
    setWelcomPaged(false);
    setSales(true);
    setClient(false);
    setFactures(false);
    setEnployee(false);
    setProduit(false);
    setExpensesPage(false);
    sliderFunction();
  };
  const Display_Enployee = () => {
    setWelcomPaged(false);
    setExpensesPage(false);
    setSales(false);
    setClient(false);
    setFactures(false);
    setEnployee(true);
    setProduit(false);
    sliderFunction();
  };
  const Display_Client = () => {
    setWelcomPaged(false);
    setExpensesPage(false);
    setSales(false);
    setClient(true);
    setFactures(false);
    setEnployee(false);
    setProduit(false);
    sliderFunction();
  };
  const Display_Produit = () => {
    setWelcomPaged(false);
    setExpensesPage(false);

    setSales(false);
    setClient(false);
    setFactures(false);
    setEnployee(false);
    setProduit(true);
    sliderFunction();
  };
  const Display_Factures = () => {
    setWelcomPaged(false);
    setExpensesPage(false);

    setSales(false);
    setClient(false);
    setFactures(true);
    setEnployee(false);
    setProduit(false);
    sliderFunction();
  };
  const Display_WelcomPage = () => {
    setWelcomPaged(true);
    setSales(false);
    setClient(false);
    setFactures(false);
    setEnployee(false);
    setProduit(false);
    setExpensesPage(false);

    sliderFunction();
  };
  const Display_ExpensesPage = () => {
    setWelcomPaged(false);
    setSales(false);
    setClient(false);
    setFactures(false);
    setEnployee(false);
    setProduit(false);
    setExpensesPage(true);
    sliderFunction();
  };

  return (
    <View>
      <View>
        <ImageBackground
          source={header} // Local image or use a URL
          style={styles.background}
        >
          <View style={styles.Firstheader}></View>
        </ImageBackground>

        <View style={[open ? styles.container : styles.containerClosed]}>
          <Animated.View
            style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}
          >
            <View style={styles.header}>
              <View style={styles.imageText}>
                <Image source={StoreIcon} style={styles.image} />
                {open && (
                  <View style={styles.textHeader}>
                    <Text style={styles.name}>حلويات تقليدية</Text>
                    <Text style={styles.profession}>الطاهر</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity onPress={sliderFunction}>
                <Image source={FlechIcon} style={styles.iconFlech} />
              </TouchableOpacity>
            </View>

            <View style={styles.menu}>
              <View style={styles.searchBox}>
                <TextInput style={styles.searchInput} placeholder="Search..." />
              </View>
              <View style={styles.menuLinks}>
                <TouchableOpacity
                  onPress={Display_Sales}
                  style={styles.navLink}
                >
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={styles.navText}>خدمة البيع</Text>
                    <Image source={Salesicon} style={styles.icon} />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={Display_Client}
                  style={styles.navLink}
                >
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={styles.navText}>خدمة الزبائن</Text>
                    <Image source={Clienticon} style={styles.icon} />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={Display_Enployee}
                  style={styles.navLink}
                >
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={styles.navText}>خدمة العمال</Text>
                    <Image source={EmployeeIcon} style={styles.icon} />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={Display_Factures}
                  style={styles.navLink}
                >
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={styles.navText}>الفواتير</Text>
                    <Image source={FactureIcon} style={styles.icon} />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={Display_ExpensesPage}
                  style={styles.navLink}
                >
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={styles.navText}>المصاريف</Text>
                    <Image source={IconExpenses} style={styles.icon} />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={Display_Produit}
                  style={styles.navLink}
                >
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={styles.navText}>المنتجات</Text>
                    <Image source={ProduitIcon} style={styles.icon} />
                  </View>
                </TouchableOpacity>
              </View>
              <View style={styles.bottom}>
                <TouchableOpacity
                  style={styles.bottomLink}
                  onPress={Display_WelcomPage}
                >
                  <Text style={styles.navText}>خروج</Text>
                  <Image source={logoutIcon} style={styles.icon} />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          {!open && (
            <TouchableOpacity
              onPress={sliderFunction}
              style={styles.openButton}
            >
              <Icon name="bars" size={22} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View>
        {WelcomPaged && <WelcomPage functionStart={sliderFunction} />}
        {SalesPage && <Sales />}
        {ClientPage && <Client />}
        {ProduitPage && <Produit />}
        {FacturesPage && <Facture />}
        {EnployeePage && <Enployee />}
        {ExpensesPage && <Expenses />}
      </View>
    </View>
  );
};

export default SliderMenu;

const styles = StyleSheet.create({
  background: {
    justifyContent: "flex-start",
    alignItems: "center",
    height: 50,
  },
  Firstheader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#333",
    height: 51,
    justifyContent: "center",
  },
  containerClosed: {
    position: "absolute",
    zIndex: 10000,

    height: 290,
    flexDirection: "row",
  },

  container: {
    position: "absolute",

    zIndex: 10000,
    height: 990,
    flexDirection: "row",
  },
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: 250,
    backgroundColor: "#F5F5F5",
    padding: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  imageText: {
    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 6,
  },
  textHeader: {
    marginLeft: 10,
  },
  name: {
    color: "black",
    fontWeight: "600",
  },
  profession: {
    color: "black",
  },
  icon: {
    fontSize: 24,
    color: "#fff",
  },
  menu: {
    flex: 1,
  },
  searchBox: {
    backgroundColor: "white",
    borderRadius: 6,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  searchInput: {
    color: "#fff",
    height: 40,
  },
  menuLinks: {
    marginBottom: 20,
  },
  navLink: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: "#87CEFA", // Light blue background
    marginBottom: 10,
    borderRadius: 6, // Rounded corners
    shadowColor: "#000", // Shadow color
    shadowOpacity: 0.4, // Adjust opacity for visibility (0.3 -> 0.4 for stronger effect)
    shadowOffset: { width: 2, height: 4 }, // Increase height offset to make shadow more prominent (2 -> 4)
    shadowRadius: 4, // Add shadow blur for softness (lower values make sharper shadows)
    elevation: 3, // Higher elevation for more prominent shadow (Android specific)
  },

  navText: {
    color: "#000080",
    fontSize: 16,
  },
  bottom: { marginTop: 60 },
  bottomLink: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: "#87CEFA",
    borderRadius: 6,
    color: "000080",
    shadowColor: "#000", // Shadow color
    shadowOpacity: 0.4, // Adjust opacity for visibility (0.3 -> 0.4 for stronger effect)
    shadowOffset: { width: 2, height: 4 }, // Increase height offset to make shadow more prominent (2 -> 4)
    shadowRadius: 4, // Add shadow blur for softness (lower values make sharper shadows)
    elevation: 3, // Higher elevation for more prominent shadow (Android specific)
  },
  openButton: {
    position: "absolute",
    top: 1,
    left: 1,
    zIndex: 1000,
    padding: 10,
    backgroundColor: "#fofof1",
    borderRadius: 8,
  },
  icon: {
    width: 30, // Set width of the icon
    height: 30, // Set height of the icon
  },

  iconFlech: {
    width: 38, // Set width of the icon
    height: 38, // Set height of the icon
  },
});
