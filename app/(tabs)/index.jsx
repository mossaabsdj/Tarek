import {
  Image,
  Text,
  View,
  StyleSheet,
  Platform,
  I18nManager,
} from "react-native";
import Sales from "../NewSales/page";
import Slider from "@/components/SliderMenu/page";
import { useEffect } from "react";
import Client from "@/app/Client/page";
import Produit from "@/app/Produit/page";
import Bdd from "@/app/Lib/Bdd";

export default function HomeScreen() {
  useEffect(() => {
    if (!I18nManager.isRTL) {
      I18nManager.forceRTL(true);
      I18nManager.allowRTL(true);
    }
  }, []);
  return (
    <View>
      <Slider />
    </View>
  );
}

const styles = StyleSheet.create({});
