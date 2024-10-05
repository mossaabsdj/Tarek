import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Button,
  Modal,
  TouchableOpacity,
} from "react-native";
import {
  GetAll,
  addProduit,
  updateProduit,
  deleteProduit,
} from "@/app/Lib/bdd";

// Column names
const columns = [
  { key: "Nom", label: "الاسم" },
  { key: "Prix", label: "السعر" },
  { key: "Return", label: "نوع" },
];

// Initial product data
const initialProduit = [
  {
    Produit_ID: "1",
    Nom: "قلب اللوز",
    Prix: 100,
    Return: "return",
  },
  {
    Produit_ID: "2",
    Nom: "قلب اللوز",
    Prix: 200,
    Return: "return",
  },
];

const ClientConsultation = () => {
  const [produit, setProduit] = useState(initialProduit);
  const [searchQuery, setSearchQuery] = useState("");
  const [editProduit, setEditProduit] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // New state for determining the modal type

  const handleSearch = (query) => {
    setSearchQuery(query);
  };
  useEffect(() => {
    GetAll("produit", setProduit);
  }, []);

  const filteredProduits = produit.filter((prod) =>
    prod.Nom.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleModifyProduit = (prod) => {
    setEditProduit(prod);
    setIsEditing(true); // Set editing mode
    setModalVisible(true);
  };

  const handleSaveChanges = () => {
    console.log(
      editProduit.produitId,
      editProduit.Nom,
      editProduit.Prix,
      editProduit.Return
    );
    updateProduit(
      editProduit.Produit_ID,
      editProduit.Nom,
      editProduit.Prix,
      editProduit.Return
    );
    GetAll("produit", setProduit);

    setModalVisible(false);
  };

  const handleAddProduit = () => {
    setEditProduit({ name: "", Prix: "", Type: "" });
    setIsEditing(false); // Set to adding mode
    setModalVisible(true);
  };

  const handleSaveNewProduit = () => {
    console.log(editProduit);
    const r = addProduit(editProduit.Nom, editProduit.Prix, editProduit.Return);
    console.log(r);
    GetAll("produit", setProduit);

    setModalVisible(false);
  };

  const handleDeleteProduit = (id) => {
    deleteProduit(id);
    GetAll("produit", setProduit);
  };

  const renderProduitItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>معلومات المنتج</Text>
      {columns.map((column) => (
        <Text style={styles.label} key={item.Produit_ID + column.key}>
          {column.label}: <Text style={styles.value}>{item[column.key]}</Text>
        </Text>
      ))}
      <Button title="تعديل" onPress={() => handleModifyProduit(item)} />
      <Button
        title="حدف"
        onPress={() => handleDeleteProduit(item.Produit_ID)}
      />
    </View>
  );

  const renderModalContent = () => (
    <View style={styles.modalView}>
      <TouchableOpacity
        style={{
          backgroundColor: "red",
          zIndex: 1000,
          padding: 10,
          borderRadius: 5,
          position: "absolute",
        }}
        onPress={() => setModalVisible(false)} // Correctly pass the function
      >
        <Text style={{ color: "white", textAlign: "center" }}>خروج</Text>
      </TouchableOpacity>
      <Text style={styles.modalTitle}>
        {isEditing ? "تعديل معلومات المنتج" : "إضافة منتج"}
      </Text>
      <TextInput
        style={styles.input}
        value={editProduit?.Nom}
        onChangeText={(text) => setEditProduit({ ...editProduit, Nom: text })}
        placeholder="الاسم"
      />
      <TextInput
        style={styles.input}
        value={String(editProduit?.Prix)}
        keyboardType="numeric"
        onChangeText={(text) =>
          setEditProduit({ ...editProduit, Prix: Number(text) })
        }
        placeholder="السعر"
      />
      <TextInput
        style={styles.input}
        value={editProduit?.Return}
        onChangeText={(text) =>
          setEditProduit({ ...editProduit, Return: text })
        }
        placeholder="النوع"
      />
      <Button
        title={isEditing ? "حفظ" : "إضافة"}
        onPress={isEditing ? handleSaveChanges : handleSaveNewProduit}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>متابعة المنتجات</Text>
      <Button title="إضافة منتج" onPress={handleAddProduit} />

      <TextInput
        style={styles.searchInput}
        placeholder="...البحث عن المنتج بالاسم"
        value={searchQuery}
        onChangeText={handleSearch}
      />

      <FlatList
        data={filteredProduits}
        renderItem={renderProduitItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }} // Add padding if needed
      />

      {/* Modal for Editing or Adding Product */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        {renderModalContent()}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f5f5f5",
    height: 700,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  searchInput: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  value: {
    fontWeight: "bold",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
    position: "absolute",
    top: 10,
    left: 10,
  },
  closeButtonText: {
    color: "white",
    textAlign: "center",
  },
});

export default ClientConsultation;
