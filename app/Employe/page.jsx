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
  Alert,
  Image,
  I18nManager,
} from "react-native";
// Column names
import {
  GetAll,
  addEmployee,
  deleteEmployee,
  deleteCreditEmployee,
  updateEmployee,
  addCreditEmployee,
  GetEmployee_Deduction,
} from "@/app/Lib/bdd";
import EmployeeIcon from "@/assets/icons/workers.png";
import * as Print from "expo-print";
import ArabicMonthYearPicker from "./picker";

const columns = [
  { key: "Nom", label: "الاسم" },
  { key: "Prenom", label: "اللقب" },
  { key: "Num", label: "رقم الهاتف" },
  { key: "Salery_Date", label: "تاريخ الراتب" },
];

// Employee data

const EmployeeConsultation = () => {
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editEmployee, setEditEmployee] = useState(null);
  const [editEmployeeModel, setEditEmployeeModel] = useState(false);
  const [consulterDeductionsModel, setConsulterDeductionsModel] =
    useState(false);
  const [deductions_Employee, setDeductions_Employee] = useState();
  const [isPickerVisible, setPickerVisible] = useState(false);

  const [deductions, setDeductions] = useState([]);
  const [deductionSum, setDeductionSum] = useState("");
  const [deductionDate, setDeductionDate] = useState("");
  const [addEmployeeModel, setAddEmployeeModel] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    Nom: "",
    Prenom: "",
    Num: "",
    Salery_Date: "",
  });
  const arabicMonths = [
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);

    // Get day, month, year, and time components
    const day = date.getDate(); // Day in Arabic
    const month = arabicMonths[date.getMonth()]; // Month in Arabic
    const year = date.getFullYear(); // Year in French
    const options = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true, // Change to false for 24-hour format
    };
    const time = date.toLocaleString("fr-FR", options); // Time in French

    return `${day} ${month} ${year}, ${time}`; // Combine components
  };
  const handleSearch = (query) => {
    setSearchQuery(query);
  };
  const filteredEmployees = employees.filter((employee) => {
    const fullName = `${employee.Nom} ${employee.Prenom}`.toLowerCase(); // Combine Nom and Prenom
    return fullName.includes(searchQuery.toLowerCase()); // Check if it includes the search query
  });

  const handleModifyEmployee = (employee) => {
    setEditEmployee(employee);
    setEditEmployeeModel(true);
  };
  const handleSaveChanges = async () => {
    await updateEmployee(
      editEmployee.Employee_ID,
      editEmployee.Nom,
      editEmployee.Prenom,
      editEmployee.Num,
      editEmployee.Salery_Date
    );
    await GetAllEmployee();
    setEditEmployeeModel(false);
  };
  const handleAddDeduction = async () => {
    if (deductionSum) {
      console.log(deductions_Employee.Employee_ID);
      await addCreditEmployee(deductions_Employee.Employee_ID, deductionSum);
      await GetDudection();
      setDeductionSum("");
    }
  };
  async function Deletded(id) {
    console.log(id);
    await deleteCreditEmployee(id);
    await GetDudection();
  }
  const handleDeleteDeduction = async (id) => {
    Alert.alert(
      "تأكيد الحذف",
      "هل انت متأكد من الحذف؟",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف",
          onPress: () => Deletded(id),
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };
  const handleAddEmployee = async () => {
    if (
      newEmployee.Nom &&
      newEmployee.Prenom &&
      newEmployee.Num &&
      newEmployee.Salery_Date
    ) {
      await addEmployee(
        newEmployee.Nom,
        newEmployee.Prenom,
        newEmployee.Num,
        newEmployee.Salery_Date
      );

      setNewEmployee({
        Nom: "",
        Prenom: "",
        Num: "",
        Salery_Date: "",
      });
      setAddEmployeeModel(false);
      await GetAllEmployee();
    } else {
      Alert.alert("يجب ملأ جميع المعلومات");
    }
  };
  const handleDeleteEmployee = async (id) => {
    await deleteEmployee(id);
    await GetAllEmployee();
  };
  const renderDeductionItem = ({ item }) => (
    <View style={styles.deductionItem}>
      <Text style={styles.deductionText}>
        {`المبلغ: ${item.Somme} - التاريخ: ${formatDate(item.Date)}`}
      </Text>
      <Button
        color="red"
        title="حذف"
        onPress={() => handleDeleteDeduction(item.Credit_ID)}
      />
    </View>
  );
  const renderEmployeeItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>معلومات الموظف</Text>
      {columns.map((column) => (
        <Text style={styles.label} key={column.key}>
          {column.label}: <Text style={styles.value}>{item[column.key]}</Text>
        </Text>
      ))}
      <Button
        title=" اقتطاعات "
        onPress={() => {
          setDeductions_Employee(item); // Reset deductions when opening modal
          setConsulterDeductionsModel(true);
        }}
      />

      <Button title="تعديل" onPress={() => handleModifyEmployee(item)} />
    </View>
  );
  async function GetAllEmployee() {
    await GetAll("Employee", setEmployees);
  }
  useEffect(() => {
    GetAllEmployee();
  }, []);
  async function GetDudection() {
    const r = await GetEmployee_Deduction(deductions_Employee.Employee_ID);
    setDeductions(r);
  }
  async function handleConfirm(month, year) {
    setPickerVisible(false);

    // Fetch all deductions of the employee
    const deductions = await GetEmployee_Deduction(
      deductions_Employee.Employee_ID
    );

    // Filter deductions by the selected month and year
    const filteredDeductions = deductions.filter((item) => {
      const deductionDate = new Date(item.Date); // Convert to Date object
      return (
        deductionDate.getMonth() + 1 === month && // getMonth() is 0-based, so +1
        deductionDate.getFullYear() === year
      );
    });

    // Calculate the total sum of the filtered deductions
    const totalSum = filteredDeductions.reduce(
      (total, item) => total + item.Somme,
      0
    );

    // Employee name
    const Nom = deductions_Employee.Nom;

    // HTML content for printing
    const html = `
    <html>
    <head>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          padding: 40px; 
          direction: rtl;  
          text-align: right; 
          font-size: 40px; 
          border-right: 5px dashed #000;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          text-align: right; 
          margin-top: 20px;
        }
        th, td { 
          padding: 15px; 
          text-align: right;  
          border-bottom: 1px solid #ddd; 
          font-size: 40px;
        }
        th { 
          background-color: #f2f2f2; 
          font-weight: bold;
        }
        h1 { 
          margin-top: 30px; 
          font-size: 50px; 
        }
        h2 { 
          font-size: 45px; 
          margin-bottom: 20px;
        }
      </style>
    </head>
    <body>
      <h1>تقرير الاستقطاعات</h1>
      <h2>اسم الموظف: ${Nom}</h2>
      <table>
        <tr>
          <th>المبلغ</th>
          <th>التاريخ</th>
        </tr>
        ${filteredDeductions
          .map(
            (item) => `
            <tr>
              <td>${item.Somme}.00</td>
              <td>${item.Date}</td>
            </tr>
          `
          )
          .join("")}
      </table>
      <h1>المجموع الكلي: ${totalSum}.00</h1>
    </body>
    </html>
  `;

    // Print the content
    await Print.printAsync({ html });
  }
  useEffect(() => {
    if (consulterDeductionsModel) {
      GetDudection();
    }
  }, [consulterDeductionsModel]);
  return (
    <View style={styles.container}>
      {/* Deductions Modal */}

      <Modal
        animationType="slide"
        transparent={false}
        visible={consulterDeductionsModel}
        onRequestClose={() => setConsulterDeductionsModel(false)}
      >
        <View style={styles.modalView}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setConsulterDeductionsModel(false)}
          >
            <Text style={styles.closeButtonText}>خروج</Text>
          </TouchableOpacity>

          <Text style={styles.modalTitle}>اقتطاعات الموظف</Text>
          <TextInput
            style={styles.input}
            placeholder="المبلغ"
            value={deductionSum}
            keyboardType="numeric"
            onChangeText={setDeductionSum}
          />

          <Button title="إضافة اقتطاع" onPress={handleAddDeduction} />
          <Button
            title="طباعة الاقتطاعات "
            onPress={() => setPickerVisible(true)}
          />

          <FlatList
            data={deductions}
            renderItem={renderDeductionItem}
            keyExtractor={(item) => item.id}
          />
        </View>
      </Modal>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        <Text style={styles.header}>متابعة الموظفين</Text>
        <Image source={EmployeeIcon} style={styles.icon} />
      </View>

      <Button title="إضافة موظف" onPress={() => setAddEmployeeModel(true)} />

      <TextInput
        style={styles.searchInput}
        placeholder="البحث عن الموظف بالاسم و اللقب... "
        value={searchQuery}
        onChangeText={handleSearch}
      />

      <FlatList
        data={filteredEmployees}
        renderItem={renderEmployeeItem}
        keyExtractor={(item) => item.id}
      />

      {/* Modal for Editing Employee */}
      {editEmployeeModel && (
        <Modal
          animationType="slide"
          transparent={false}
          visible={editEmployeeModel}
          onRequestClose={() => setEditEmployeeModel(false)}
        >
          <View style={styles.modalView}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setEditEmployeeModel(false)}
            >
              <Text style={styles.closeButtonText}>خروج</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>تعديل معلومات الموظف</Text>

            <TextInput
              style={styles.input}
              value={editEmployee.Nom}
              onChangeText={(text) =>
                setEditEmployee({ ...editEmployee, Nom: text })
              }
              placeholder="اسم"
            />
            <TextInput
              style={styles.input}
              value={editEmployee.Prenom}
              onChangeText={(text) =>
                setEditEmployee({ ...editEmployee, Prenom: text })
              }
              placeholder="لقب"
            />
            <TextInput
              style={styles.input}
              value={editEmployee.Num}
              keyboardType="numeric"
              onChangeText={(text) =>
                setEditEmployee({ ...editEmployee, Num: text })
              }
              placeholder="رقم الهاتف"
            />
            <TextInput
              style={styles.input}
              value={editEmployee.Salery_Date} // Simple text input for date
              onChangeText={(text) =>
                setEditEmployee({ ...editEmployee, Salery_Date: text })
              }
              placeholder="تاريخ الراتب"
            />

            <Button title="حفظ" onPress={handleSaveChanges} />
          </View>
        </Modal>
      )}
      {/* Modal for adding Employee */}
      {addEmployeeModel && (
        <Modal
          animationType="slide"
          transparent={false}
          visible={addEmployeeModel}
          onRequestClose={() => setAddEmployeeModel(false)}
        >
          <View style={styles.modalView}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setAddEmployeeModel(false)}
            >
              <Text style={styles.closeButtonText}>خروج</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>اضافة موظف</Text>

            <TextInput
              style={styles.input}
              value={newEmployee.Nom}
              onChangeText={(text) =>
                setNewEmployee({ ...newEmployee, Nom: text })
              }
              placeholder="اسم"
            />
            <TextInput
              style={styles.input}
              value={newEmployee.Prenom}
              onChangeText={(text) =>
                setNewEmployee({ ...newEmployee, Prenom: text })
              }
              placeholder="لقب"
            />
            <TextInput
              style={styles.input}
              value={newEmployee.Num}
              keyboardType="numeric"
              onChangeText={(text) =>
                setNewEmployee({ ...newEmployee, Num: text })
              }
              placeholder="رقم الهاتف"
            />
            <TextInput
              style={styles.input}
              value={newEmployee.Salery_Date}
              onChangeText={(text) =>
                setNewEmployee({ ...newEmployee, Salery_Date: text })
              }
              placeholder="تاريخ الراتب"
            />

            <Button title="إضافة" onPress={handleAddEmployee} />
          </View>
        </Modal>
      )}
      <ArabicMonthYearPicker
        isVisible={isPickerVisible}
        onClose={() => setPickerVisible(false)}
        onConfirm={handleConfirm}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    height: 700,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  card: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
  },
  title: {
    alignSelf: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  label: {
    marginVertical: 5,
  },
  value: {
    fontWeight: "normal",
  },
  modalView: {
    height: 700,
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    width: "100%",
  },
  closeButton: {
    position: "absolute",
    zIndex: 1000,
    backgroundColor: "red",
    borderRadius: 5,
    width: 50,
    height: 30,
    top: 0,
    left: 0,
  },
  closeButtonText: {
    textAlign: "center",
    marginTop: 5,
    color: "white",
    fontWeight: "bold",
  },
  deductionItem: {
    marginTop: 20,
    flexDirection: "column",
    justifyContent: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  deductionText: {
    fontSize: 16,
  },
  icon: {
    width: 30, // Set width of the icon
    height: 30, // Set height of the icon
  },
});

export default EmployeeConsultation;
