import React, { useState } from "react";
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
// Column names
const columns = [
  { key: "name", label: "الاسم" },
  { key: "surname", label: "اللقب" },
  { key: "num", label: "رقم الهاتف" },
  { key: "salary", label: "تاريخ الراتب" },
];

// Employee data
const initialEmployees = [
  {
    id: "1",
    name: "ساعد جاب الله",
    surname: "مصعب",
    num: "123456789",
    salary: 1000,
  },
  {
    id: "2",
    name: "ساعد جاب الله",
    surname: "عثمان",
    num: "987654321",
    salary: 1200,
  },
  {
    id: "3",
    name: "ساعد جاب الله",
    surname: "ياسين",
    num: "456789123",
    salary: 1100,
  },
];

const EmployeeConsultation = () => {
  const [employees, setEmployees] = useState(initialEmployees);
  const [searchQuery, setSearchQuery] = useState("");
  const [editEmployee, setEditEmployee] = useState(null);
  const [editEmployeeModel, setEditEmployeeModel] = useState(false);

  const [consulterDeductionsModel, setConsulterDeductionsModel] =
    useState(false);
  const [deductions, setDeductions] = useState([]);
  const [deductionSum, setDeductionSum] = useState("");
  const [deductionDate, setDeductionDate] = useState("");
  const [addEmployeeModel, setAddEmployeeModel] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    surname: "",
    num: "",
    salary: "",
  });
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const filteredEmployees = employees.filter((employee) => {
    return employee.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleModifyEmployee = (employee) => {
    setEditEmployee(employee);
    setEditEmployeeModel(true);
  };

  const handleSaveChanges = () => {
    console.log(editEmployee);
    setEmployees((prevEmployees) =>
      prevEmployees.map((employee) =>
        employee.id === editEmployee.id ? editEmployee : employee
      )
    );
    setEditEmployeeModel(false);
  };

  const handleAddDeduction = () => {
    if (deductionSum) {
      const newDeduction = {
        id: Math.random().toString(),
        sum: deductionSum,
        date: deductionDate, // Store the deduction date
      };
      setDeductions((prev) => [...prev, newDeduction]);
      setDeductionSum("");
      setDeductionDate("");
    }
  };

  const handleDeleteDeduction = (id) => {
    setDeductions((prev) => prev.filter((deduction) => deduction.id !== id));
  };
  const handleAddEmployee = () => {
    if (
      newEmployee.name &&
      newEmployee.surname &&
      newEmployee.num &&
      newEmployee.salary
    ) {
      const employeeToAdd = {
        id: Math.random().toString(),
        name: newEmployee.name,
        surname: newEmployee.surname,
        num: newEmployee.num,
        salary: newEmployee.salary,
      };
      setEmployees((prev) => [...prev, employeeToAdd]);
      setNewEmployee({
        name: "",
        surname: "",
        num: "",
        salary: "",
      });
      setAddEmployeeModel(false);
    }
  };
  const handleDeleteEmployee = (id) => {
    setEmployees((prev) => prev.filter((employee) => employee.id !== id));
  };

  const renderDeductionItem = ({ item }) => (
    <View style={styles.deductionItem}>
      <Text style={styles.deductionText}>
        {`المبلغ: ${item.sum} - التاريخ: ${item.date}`}
      </Text>
      <Button title="حذف" onPress={() => handleDeleteDeduction(item.id)} />
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
          setDeductions([]); // Reset deductions when opening modal
          setConsulterDeductionsModel(true);
        }}
      />
      <Button title="تعديل" onPress={() => handleModifyEmployee(item)} />
      <Button title="حذف" onPress={() => handleDeleteEmployee(item.id)} />
    </View>
  );

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
          <TextInput
            style={styles.input}
            value={deductionDate} // Simple text input for date
            onChangeText={(text) => setDeductionDate(text)}
            placeholder="تاريخ الراتب"
          />
          <Button title="إضافة اقتطاع" onPress={handleAddDeduction} />
          <FlatList
            data={deductions}
            renderItem={renderDeductionItem}
            keyExtractor={(item) => item.id}
          />
        </View>
      </Modal>

      <Text style={styles.header}>متابعة الموظفين</Text>
      <Button title="إضافة موظف" onPress={() => setAddEmployeeModel(true)} />

      <TextInput
        style={styles.searchInput}
        placeholder="...البحث عن الموظف بالاسم"
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
              value={editEmployee.name}
              onChangeText={(text) =>
                setEditEmployee({ ...editEmployee, name: text })
              }
              placeholder="اسم"
            />
            <TextInput
              style={styles.input}
              value={editEmployee.surname}
              onChangeText={(text) =>
                setEditEmployee({ ...editEmployee, surname: text })
              }
              placeholder="لقب"
            />
            <TextInput
              style={styles.input}
              value={editEmployee.num}
              keyboardType="numeric"
              onChangeText={(text) =>
                setEditEmployee({ ...editEmployee, num: text })
              }
              placeholder="رقم الهاتف"
            />
            <TextInput
              style={styles.input}
              value={editEmployee.salary} // Simple text input for date
              onChangeText={(text) =>
                setEditEmployee({ ...editEmployee, salary: text })
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
              value={newEmployee.name}
              onChangeText={(text) =>
                setNewEmployee({ ...newEmployee, name: text })
              }
              placeholder="اسم"
            />
            <TextInput
              style={styles.input}
              value={newEmployee.surname}
              onChangeText={(text) =>
                setNewEmployee({ ...newEmployee, surname: text })
              }
              placeholder="لقب"
            />
            <TextInput
              style={styles.input}
              value={newEmployee.num}
              keyboardType="numeric"
              onChangeText={(text) =>
                setNewEmployee({ ...newEmployee, num: text })
              }
              placeholder="رقم الهاتف"
            />
            <TextInput
              style={styles.input}
              value={newEmployee.salary}
              onChangeText={(text) =>
                setNewEmployee({ ...newEmployee, salary: text })
              }
              placeholder="تاريخ الراتب"
            />

            <Button title="إضافة" onPress={handleAddEmployee} />
          </View>
        </Modal>
      )}
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
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 5,
  },
  deductionText: {
    fontSize: 16,
  },
});

export default EmployeeConsultation;
