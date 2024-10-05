import * as SQLite from "expo-sqlite";

// Open or create the database named 'tarek'
const db = SQLite.openDatabaseAsync("tarek.db");
//--GetAll------------------------------------------
async function GetAll(TableName, f) {
  const queryResult = await (
    await db
  ).getAllAsync("SELECT * FROM " + TableName + ";");
  console.log("Query Result:", queryResult);
  f(queryResult);
  // Process the results to extract data
}
//--Produit---------------------------------------------------
const addProduit = async (nom, prix, returnValue) => {
  try {
    const r = await (
      await db
    ).runAsync(
      `
      INSERT INTO produit (Nom, Prix, Return)
      VALUES (?, ?, ?);
    `,
      nom,
      prix,
      returnValue
    );
    console.log("Produit added successfully.");
  } catch (error) {
    console.error("Error adding produit:", error);
  }
};
const updateProduit = async (produitId, nom, prix, returnValue) => {
  try {
    await (
      await db
    ).runAsync(
      `
      UPDATE produit
      SET Nom = ?, Prix = ?, Return = ?
      WHERE Produit_ID = ?;
    `,
      nom,
      prix,
      returnValue,
      produitId
    );
    console.log("Produit updated successfully.");
  } catch (error) {
    console.error("Error updating produit:", error);
  }
};
const deleteProduit = async (produitId) => {
  try {
    await (
      await db
    ).runAsync(
      `
      DELETE FROM produit
      WHERE Produit_ID = ?;
    `,
      produitId
    );
    console.log("Produit deleted successfully.");
  } catch (error) {
    console.error("Error deleting produit:", error);
  }
};
//---------------------------------------------------------
//--Employee------------------------------------------------------

const addEmployee = async (nom, prenom, num, saleryDate) => {
  try {
    await (
      await db
    ).runAsync(
      `
      INSERT INTO Employee (Nom, Prenom, Num, Salery_Date)
      VALUES (?, ?, ?, ?);
    `,
      nom,
      prenom,
      num,
      saleryDate
    );
    console.log("Employee added successfully.");
  } catch (error) {
    console.error("Error adding employee:", error);
  }
};
const updateEmployee = async (employeeId, nom, prenom, num, saleryDate) => {
  try {
    await (
      await db
    ).runAsync(
      `
      UPDATE Employee
      SET Nom = ?, Prenom = ?, Num = ?, Salery_Date = ?
      WHERE Employee_ID = ?;
    `,
      nom,
      prenom,
      num,
      saleryDate,
      employeeId
    );
    console.log("Employee updated successfully.");
  } catch (error) {
    console.error("Error updating employee:", error);
  }
};
const deleteEmployee = async (employeeId) => {
  try {
    await (
      await db
    ).runAsync(
      `
      DELETE FROM Employee
      WHERE Employee_ID = ?;
    `,
      employeeId
    );
    console.log("Employee deleted successfully.");
  } catch (error) {
    console.error("Error deleting employee:", error);
  }
};
//---------------------------------------------------------
//--Client------------------------------------------------------
const addClient = async (nom, prenom, num) => {
  try {
    const r = await (
      await db
    ).runAsync(
      `
      INSERT INTO Client (Nom, Prenom, Num, Date)
      VALUES (?, ?, ?, datetime('now', 'localtime'));
    `,
      nom,
      prenom,
      num
    );
    console.log("Client added successfully." + r.lastInsertRowId);
  } catch (error) {
    console.error("Error adding client:", error);
  }
};
const updateClient = async (clientId, nom, prenom, num) => {
  try {
    await (
      await db
    ).runAsync(
      `
      UPDATE Client
      SET Nom = ?, Prenom = ?, Num = ?
      WHERE Client_ID = ?;
    `,
      nom,
      prenom,
      num,
      clientId
    );
    console.log("Client updated successfully.");
  } catch (error) {
    console.error("Error updating client:", error);
  }
};
const deleteClient = async (clientId) => {
  try {
    await (
      await db
    ).runAsync(
      `
      DELETE FROM Client
      WHERE Client_ID = ?;
    `,
      clientId
    );
    console.log("Client deleted successfully.");
  } catch (error) {
    console.error("Error deleting client:", error);
  }
};
//---------------------------------------------------------
//--Facture------------------------------------------------------
const addFacture = async (
  clientId,
  montantTotal,
  validerMoney,
  validerPlat,
  plat
) => {
  try {
    await (
      await db
    ).runAsync(
      `
      INSERT INTO facture (Client_ID, Montant_Total, Date_Creat, ValiderMoney, ValiderPlat, Plat)
      VALUES (?, ?, datetime('now', 'localtime'), ?, ?, ?);
    `,
      clientId,
      montantTotal,
      validerMoney,
      validerPlat,
      plat
    );
    console.log("Facture added successfully.");
  } catch (error) {
    console.error("Error adding facture:", error);
  }
};
const updateFacture = async (
  factureId,
  clientId,
  montantTotal,
  validerMoney,
  validerPlat,
  plat
) => {
  try {
    await (
      await db
    ).runAsync(
      `
      UPDATE facture
      SET Client_ID = ?, Montant_Total = ?, ValiderMoney = ?, ValiderPlat = ?, Plat = ?
      WHERE Facture_ID = ?;
    `,
      clientId,
      montantTotal,
      validerMoney,
      validerPlat,
      plat,
      factureId
    );
    console.log("Facture updated successfully.");
  } catch (error) {
    console.error("Error updating facture:", error);
  }
};
const deleteFacture = async (factureId) => {
  try {
    await (
      await db
    ).runAsync(
      `
      DELETE FROM facture
      WHERE Facture_ID = ?;
    `,
      factureId
    );
    console.log("Facture deleted successfully.");
  } catch (error) {
    console.error("Error deleting facture:", error);
  }
};
//---------------------------------------------------------
//--FactProd------------------------------------------------------
const addFactProd = async (factureId, produitId, quantite, prixVente, plat) => {
  try {
    await (
      await db
    ).runAsync(
      `
      INSERT INTO FactProd (Facture_ID, Produit_ID, Quantite, PrixVente, Plat)
      VALUES (?, ?, ?, ?, ?);
    `,
      factureId,
      produitId,
      quantite,
      prixVente,
      plat
    );
    console.log("FactProd entry added successfully.");
  } catch (error) {
    console.error("Error adding FactProd entry:", error);
  }
};
const updateFactProd = async (
  factProdId,
  factureId,
  produitId,
  quantite,
  prixVente,
  plat
) => {
  try {
    await (
      await db
    ).runAsync(
      `
      UPDATE FactProd
      SET Facture_ID = ?, Produit_ID = ?, Quantite = ?, PrixVente = ?, Plat = ?
      WHERE FactProd_ID = ?;
    `,
      factureId,
      produitId,
      quantite,
      prixVente,
      plat,
      factProdId
    );
    console.log("FactProd entry updated successfully.");
  } catch (error) {
    console.error("Error updating FactProd entry:", error);
  }
};
const deleteFactProd = async (factProdId) => {
  try {
    await (
      await db
    ).runAsync(
      `
      DELETE FROM FactProd
      WHERE FactProd_ID = ?;
    `,
      factProdId
    );
    console.log("FactProd entry deleted successfully.");
  } catch (error) {
    console.error("Error deleting FactProd entry:", error);
  }
};
//---------------------------------------------------------
//--Versment ------------------------------------------------------
const addVersment = async (factureId, somme) => {
  try {
    await (
      await db
    ).runAsync(
      `
      INSERT INTO Versment (Facture_ID, Somme, Date)
      VALUES (?, ?, datetime('now', 'localtime'));
    `,
      factureId,
      somme
    );
    console.log("Versment added successfully.");
  } catch (error) {
    console.error("Error adding Versment:", error);
  }
};
const updateVersment = async (versmentId, factureId, somme) => {
  try {
    await (
      await db
    ).runAsync(
      `
      UPDATE Versment
      SET Facture_ID = ?, Somme = ?
      WHERE Versment_ID = ?;
    `,
      factureId,
      somme,
      versmentId
    );
    console.log("Versment updated successfully.");
  } catch (error) {
    console.error("Error updating Versment:", error);
  }
};
const deleteVersment = async (versmentId) => {
  try {
    await (
      await db
    ).runAsync(
      `
      DELETE FROM Versment
      WHERE Versment_ID = ?;
    `,
      versmentId
    );
    console.log("Versment deleted successfully.");
  } catch (error) {
    console.error("Error deleting Versment:", error);
  }
};
//---------------------------------------------------------
//--Credit_Employee ------------------------------------------------------
const addCreditEmployee = async (employeeId, somme) => {
  try {
    await (
      await db
    ).runAsync(
      `
      INSERT INTO Credit_Employee (Employee_ID, Somme, Date)
      VALUES (?, ?, datetime('now', 'localtime'));
    `,
      employeeId,
      somme
    );
    console.log("Credit_Employee added successfully.");
  } catch (error) {
    console.error("Error adding Credit_Employee:", error);
  }
};
const updateCreditEmployee = async (creditId, employeeId, somme) => {
  try {
    await (
      await db
    ).runAsync(
      `
      UPDATE Credit_Employee
      SET Employee_ID = ?, Somme = ?
      WHERE Credit_ID = ?;
    `,
      employeeId,
      somme,
      creditId
    );
    console.log("Credit_Employee updated successfully.");
  } catch (error) {
    console.error("Error updating Credit_Employee:", error);
  }
};
const deleteCreditEmployee = async (creditId) => {
  try {
    await (
      await db
    ).runAsync(
      `
      DELETE FROM Credit_Employee
      WHERE Credit_ID = ?;
    `,
      creditId
    );
    console.log("Credit_Employee deleted successfully.");
  } catch (error) {
    console.error("Error deleting Credit_Employee:", error);
  }
};
//---------------------------------------------------------
//--VersmentPlat ------------------------------------------------------
const addVersmentPlat = async (platId, somme) => {
  try {
    await (
      await db
    ).runAsync(
      `
      INSERT INTO VersmentPlat (Plat_ID, Somme, Date)
      VALUES (?, ?, datetime('now', 'localtime'));
    `,
      platId,
      somme
    );
    console.log("VersmentPlat added successfully.");
  } catch (error) {
    console.error("Error adding VersmentPlat:", error);
  }
};
const updateVersmentPlat = async (versmentPlatId, platId, somme) => {
  try {
    await (
      await db
    ).runAsync(
      `
      UPDATE VersmentPlat
      SET Plat_ID = ?, Somme = ?
      WHERE VersmentPlat_ID = ?;
    `,
      platId,
      somme,
      versmentPlatId
    );
    console.log("VersmentPlat updated successfully.");
  } catch (error) {
    console.error("Error updating VersmentPlat:", error);
  }
};
const deleteVersmentPlat = async (versmentPlatId) => {
  try {
    await (
      await db
    ).runAsync(
      `
      DELETE FROM VersmentPlat
      WHERE VersmentPlat_ID = ?;
    `,
      versmentPlatId
    );
    console.log("VersmentPlat deleted successfully.");
  } catch (error) {
    console.error("Error deleting VersmentPlat:", error);
  }
};
//--------------------------------------------------------------
module.exports = {
  GetAll,
  // produit table methods
  addProduit,
  updateProduit,
  deleteProduit,

  // Employee table methods
  addEmployee,
  updateEmployee,
  deleteEmployee,

  // Client table methods
  addClient,
  updateClient,
  deleteClient,

  // Facture table methods
  addFacture,
  updateFacture,
  deleteFacture,

  // FactProd table methods
  addFactProd,
  updateFactProd,
  deleteFactProd,

  // Versment table methods
  addVersment,
  updateVersment,
  deleteVersment,

  // Credit_Employee table methods
  addCreditEmployee,
  updateCreditEmployee,
  deleteCreditEmployee,

  // VersmentPlat table methods
  addVersmentPlat,
  updateVersmentPlat,
  deleteVersmentPlat,
};
