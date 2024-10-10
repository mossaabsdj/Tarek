import React, { useRef, useState } from "react";
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
} from "react-native";
import StoreIcon from "@/assets/icons/store.png";
import ProduitIcon from "@/assets/icons/box.png";
import EmployeeIcon from "@/assets/icons/workers.png";
import FactureIcon from "@/assets/icons/invoice.png";
import Clienticon from "@/assets/icons/Client.png";
import Salesicon from "@/assets/icons/Sales.png";
import img from "@/assets/images/icon.png";
import Icon from "react-native-vector-icons/FontAwesome";
import Sales from "@/app/NewSales/page";
import Client from "@/app/Client/page";
import Produit from "@/app/Produit/page";
import WelcomPage from "@/components/WelcomPage/page";
import Enployee from "@/app/Employe/page";
import Facture from "@/app/Factures/page";

const { width: screenWidth } = Dimensions.get("window");

const SliderMenu = () => {
  const [open, setOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(screenWidth * 0.9)).current;
  const [WelcomPaged, setWelcomPaged] = useState(true);

  const [SalesPage, setSales] = useState(false);
  const [EnployeePage, setEnployee] = useState(false);
  const [ClientPage, setClient] = useState(false);
  const [FacturesPage, setFactures] = useState(false);
  const [ProduitPage, setProduit] = useState(false);

  const sliderFunction = () => {
    if (open) {
      Animated.timing(slideAnim, {
        toValue: screenWidth * 0.9,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: false,
      }).start();
      setOpen(false);
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
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
    sliderFunction();
  };

  const Display_Enployee = () => {
    setWelcomPaged(false);
    setSales(false);
    setClient(false);
    setFactures(false);
    setEnployee(true);
    setProduit(false);
    sliderFunction();
  };

  const Display_Client = () => {
    setWelcomPaged(false);
    setSales(false);
    setClient(true);
    setFactures(false);
    setEnployee(false);
    setProduit(false);
    sliderFunction();
  };

  const Display_Produit = () => {
    setWelcomPaged(false);
    setSales(false);
    setClient(false);
    setFactures(false);
    setEnployee(false);
    setProduit(true);
    sliderFunction();
  };

  const Display_Factures = () => {
    setWelcomPaged(false);
    setSales(false);
    setClient(false);
    setFactures(true);
    setEnployee(false);
    setProduit(false);
    sliderFunction();
  };

  return (
    <View>
      <View>
        <View style={styles.Firstheader}>
          <Text></Text>
        </View>
        <View style={[open ? styles.container : styles.containerClosed]}>
          <Animated.View
            style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}
          >
            <View style={styles.header}>
              <View style={styles.imageText}>
                <Image source={StoreIcon} style={styles.image} />
                {open && (
                  <View style={styles.textHeader}>
                    <Text style={styles.name}>محل</Text>
                    <Text style={styles.profession}>طارق</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity onPress={sliderFunction}>
                <Text style={styles.icon}>{open ? ">" : "<"}</Text>
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
                <TouchableOpacity style={styles.bottomLink}>
                  <Text style={styles.navText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          {!open && (
            <TouchableOpacity
              onPress={sliderFunction}
              style={styles.openButton}
            >
              <Icon name="bars" size={18} color="white" />
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
      </View>
    </View>
  );
};

export default SliderMenu;

const styles = StyleSheet.create({
  Firstheader: {
    marginTop: 1,
    marginBottom: 5,
    backgroundColor: "#333", // White background
    height: 51,
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
    backgroundColor: "#F5F5F5", // Light gray for sidebar
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
    color: "#333", // Dark color for name
    fontWeight: "600",
  },
  profession: {
    color: "#555", // Darker gray for profession
  },
  icon: {
    fontSize: 24,
    color: "#333", // Dark color for icons
  },
  menu: {
    flex: 1,
  },
  searchBox: {
    backgroundColor: "#EAEAEA", // Light gray for search box
    borderRadius: 6,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  searchInput: {
    color: "#333", // Dark color for input text
    height: 40,
  },
  menuLinks: {
    flexGrow: 1,
  },
  navLink: {
    paddingVertical: 10,
  },
  navText: {
    fontSize: 16,
    color: "#333", // Dark color for nav text
  },
  bottom: {
    position: "absolute",
    bottom: 10,
    left: 15,
    right: 15,
  },
  bottomLink: {
    paddingVertical: 10,
  },
  openButton: {
    position: "absolute",
    left: 10,
    top: 10,
    zIndex: 100,
    backgroundColor: "#333", // Dark color for open button
    borderRadius: 30,
    padding: 10,
  },
  icon: {
    width: 30, // Set width of the icon
    height: 30, // Set height of the icon
  },
});
