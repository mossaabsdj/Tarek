import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import * as SQLite from "expo-sqlite";
import * as FileSystem from "expo-file-system";

import {
  GetAll,
  addProduit,
  updateProduit,
  deleteProduit,
  ScrollView,
  // Import other functions here...
} from "@/app/Lib/bdd";
// Open or create the database named 'tarek'
const db = SQLite.openDatabaseAsync("tarek1.db");

const ExampleComponent = () => {
  const [result, setResult] = useState([]);

  //creation des Table---------------------------
  async function CreatTable() {
    // Create the table if it does not exist
    await (
      await db
    ).execAsync(`
        CREATE TABLE IF NOT EXISTS produit (
          Produit_ID INTEGER PRIMARY KEY AUTOINCREMENT,
          Nom TEXT NOT NULL,
          Prix REAL NOT NULL,
          Return BOOLEAN NOT NULL
        );
      `);
    console.log("Table 'produit' created successfully.");
  }
  const createEmployeeTable = async () => {
    try {
      await (
        await db
      ).execAsync(`
        CREATE TABLE IF NOT EXISTS Employee (
          Employee_ID INTEGER PRIMARY KEY AUTOINCREMENT,
          Nom TEXT NOT NULL,
          Prenom TEXT NOT NULL,
          Num TEXT NOT NULL,
          Salery_Date TEXT NOT NULL
        );
      `);
      console.log("Table 'Employee' created successfully.");
    } catch (error) {
      console.error("Error creating 'Employee' table:", error);
    }
  };
  const createClientTable = async () => {
    try {
      await (
        await db
      ).execAsync(`
        CREATE TABLE IF NOT EXISTS Client (
          Client_ID INTEGER PRIMARY KEY AUTOINCREMENT,
          Nom TEXT NOT NULL,
          Prenom TEXT NOT NULL,
          Num TEXT NOT NULL,
          Date DATE DEFAULT (datetime('now', 'localtime'))
        );
      `);
      console.log("Table 'Client' created successfully.");
    } catch (error) {
      console.error("Error creating 'Client' table:", error);
    }
  };
  const createFactureTable = async () => {
    try {
      await (
        await db
      ).execAsync(`
        CREATE TABLE IF NOT EXISTS facture (
          Facture_ID INTEGER PRIMARY KEY AUTOINCREMENT,
          Client_ID INTEGER,
          Montant_Total REAL NOT NULL,
          Date_Creat DATE DEFAULT (datetime('now', 'localtime')),
          ValiderMoney BOOLEAN NOT NULL DEFAULT 0,
          ValiderPlat BOOLEAN NOT NULL DEFAULT 0,
          Plat INTEGER,
          FOREIGN KEY (Client_ID) REFERENCES Client(Client_ID) ON DELETE CASCADE
        );
      `);
      console.log("Table 'facture' created successfully.");
    } catch (error) {
      console.error("Error creating 'facture' table:", error);
    }
  };
  const createFactProdTable = async () => {
    try {
      await (
        await db
      ).execAsync(`
        CREATE TABLE IF NOT EXISTS FactProd (
          FactProd_ID INTEGER PRIMARY KEY AUTOINCREMENT,
          Facture_ID INTEGER,
          Produit_ID INTEGER,
          Quantite INTEGER NOT NULL,
          PrixVente REAL NOT NULL,
          Plat INTEGER NOT NULL,
          FOREIGN KEY (Facture_ID) REFERENCES facture(Facture_ID) ON DELETE CASCADE,
          FOREIGN KEY (Produit_ID) REFERENCES produit(Produit_ID) ON DELETE CASCADE
        );
      `);
      console.log("Table 'FactProd' created successfully.");
    } catch (error) {
      console.error("Error creating 'FactProd' table:", error);
    }
  };
  const createVersmentTable = async () => {
    try {
      await (
        await db
      ).execAsync(`
        CREATE TABLE IF NOT EXISTS Versment (
          Versment_ID INTEGER PRIMARY KEY AUTOINCREMENT,
          Facture_ID INTEGER,
          Somme REAL NOT NULL,
          Date DATE DEFAULT (datetime('now', 'localtime')),
          FOREIGN KEY (Facture_ID) REFERENCES facture(Facture_ID) ON DELETE CASCADE
        );
      `);
      console.log("Table 'Versment' created successfully.");
    } catch (error) {
      console.error("Error creating 'Versment' table:", error);
    }
  };
  const createCreditEmployeeTable = async () => {
    try {
      await (
        await db
      ).execAsync(`
        CREATE TABLE IF NOT EXISTS Credit_Employee (
          Credit_ID INTEGER PRIMARY KEY AUTOINCREMENT,
          Employee_ID INTEGER,
          Somme REAL NOT NULL,
          Date DATE DEFAULT (datetime('now', 'localtime')),
          FOREIGN KEY (Employee_ID) REFERENCES Employee(Employee_ID) ON DELETE CASCADE
        );
      `);
      console.log("Table 'Credit_Employee' created successfully.");
    } catch (error) {
      console.error("Error creating 'Credit_Employee' table:", error);
    }
  };
  const createVersmentPlatTable = async () => {
    try {
      await (
        await db
      ).execAsync(`
        CREATE TABLE IF NOT EXISTS VersmentPlat (
          VersmentPlat_ID INTEGER PRIMARY KEY AUTOINCREMENT,
          Facture_ID INTEGER,
          Plat INTEGER NOT NULL,
          Date DATE DEFAULT (datetime('now', 'localtime')),
          FOREIGN KEY (Facture_ID) REFERENCES facture(Facture_ID) ON DELETE CASCADE
        );
      `);
      console.log("Table 'VersmentPlat' created successfully.");
    } catch (error) {
      console.error("Error creating 'VersmentPlat' table:", error);
    }
  };

  useEffect(() => {
    //  createEmployeeTable();
    // createClientTable();
    //createFactureTable();
    // createFactProdTable();
    //createVersmentTable();
    //createCreditEmployeeTable();
    //createVersmentPlatTable();
    // addProduit("mosssaab", 20, true);
    // deleteProduit(2);
    // GetAll("Versment", setResult);
    getTableColumns("VersmentPlat", setResult);
    // Call the loadDatabase function
  }, []);
  const dbFile = `${FileSystem.documentDirectory}SQLite/tarek.db`;

  console.log("Database location:", dbFile);

  return (
    <View style={{ height: 600 }}>
      <Text>
        Check the console for database operations:: {JSON.stringify(result)}
      </Text>
    </View>
  );
};

export default ExampleComponent;
