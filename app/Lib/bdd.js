import * as SQLite from "expo-sqlite";
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
// Open or create the database named 'tarek'
const db = SQLite.openDatabaseAsync("tarek1.db");

//--GetAll------------------------------------------
async function GetAll(TableName, f) {
  const queryResult = await (
    await db
  ).getAllAsync("SELECT * FROM " + TableName + ";");
  // console.log("Query Result:", queryResult);
  f(queryResult);
  return queryResult;
  // Process the results to extract data
}

async function getProduitStatusByNom(nom, set) {
  try {
    // Prepare the SQL statement
    const statement = await (
      await db
    ).prepareAsync("SELECT Return FROM produit WHERE Nom = $nom");

    // Execute the statement with the product name
    const result = await statement.executeAsync({ $nom: nom });
    const r = result.getFirstAsync();
    set(r); // Update state with the return status
    return r;
    // Finalize the statement to release resources
    await statement.finalize();
  } catch (error) {
    console.error("Error fetching product status:", error);
  }
}
async function getProduiNomby_ID(id) {
  try {
    // Prepare the SQL statement
    const statement = await (
      await db
    ).prepareAsync("SELECT Nom FROM produit WHERE Produit_ID = $id");

    // Execute the statement with the product name
    const result = await statement.executeAsync({ $id: id });
    const r = result.getFirstAsync();
    return r;
    // Finalize the statement to release resources
    await statement.finalize();
  } catch (error) {
    console.error("Error fetching product status:", error);
  }
}
async function GetClient_FacturesPlat(id) {
  try {
    // Prepare the SQL statement
    const statement = await (
      await db
    ).prepareAsync(
      "SELECT * FROM facture WHERE Client_ID = $id AND  ValiderPlat = 0 "
    );

    // Execute the statement with the product name
    const result = await statement.executeAsync({ $id: id });
    const r = result.getAllAsync();
    return r;
    // Finalize the statement to release resources
    await statement.finalize();
  } catch (error) {
    console.error("Error fetching product status:", error);
  }
}
async function GetClient_FacturesMoney(id) {
  try {
    // Prepare the SQL statement
    const statement = await (
      await db
    ).prepareAsync(
      "SELECT * FROM facture WHERE Client_ID = $id AND  ValiderMoney = 0 "
    );

    // Execute the statement with the product name
    const result = await statement.executeAsync({ $id: id });
    const r = result.getAllAsync();
    return r;
    // Finalize the statement to release resources
    await statement.finalize();
  } catch (error) {
    console.error("Error fetching product status:", error);
  }
}
async function GetFacturesVersment(id) {
  try {
    // Prepare the SQL statement
    const statement = await (
      await db
    ).prepareAsync("SELECT * FROM Versment WHERE Facture_ID = $id ");

    // Execute the statement with the product name
    const result = await statement.executeAsync({ $id: id });
    const r = result.getAllAsync();
    return r;
    // Finalize the statement to release resources
    await statement.finalize();
  } catch (error) {
    console.error("Error fetching product status:", error);
  }
}
async function GetFacturesVersmentPlat(id) {
  try {
    // Prepare the SQL statement
    const statement = await (
      await db
    ).prepareAsync("SELECT * FROM VersmentPlat WHERE Facture_ID = $id ");

    // Execute the statement with the product name
    const result = await statement.executeAsync({ $id: id });
    const r = result.getAllAsync();
    return r;
    // Finalize the statement to release resources
    await statement.finalize();
  } catch (error) {
    console.error("Error fetching product status:", error);
  }
}

async function GetFactures_Factprod(id) {
  try {
    // Prepare the SQL statement
    const statement = await (
      await db
    ).prepareAsync(
      "SELECT * FROM FactProd WHERE Facture_ID = $id AND  Plat > 0 "
    );

    // Execute the statement with the product name
    const result = await statement.executeAsync({ $id: id });
    const r = result.getAllAsync();
    return r;
    // Finalize the statement to release resources
    await statement.finalize();
  } catch (error) {
    console.error("Error fetching product status:", error);
  }
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
    return r.lastInsertRowId;
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
    const r = await (
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
    return r.lastInsertRowId;
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
const updateFactureValiderMoney = async (
  factureId,

  validerMoney
) => {
  try {
    await (
      await db
    ).runAsync(
      `
      UPDATE facture
      SET  ValiderMoney = ?
      WHERE Facture_ID = ?;
    `,

      validerMoney,

      factureId
    );
    console.log("Facture updated successfully.");
  } catch (error) {
    console.error("Error updating facture:", error);
  }
};
const updateFactureValiderPlat = async (
  factureId,

  validerPlat
) => {
  try {
    await (
      await db
    ).runAsync(
      `
      UPDATE facture
      SET  ValiderPlat = ?
      WHERE Facture_ID = ?;
    `,

      validerPlat,

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
    const r = await (
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
    return r.lastInsertRowId;

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
    const r = await (
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
    return r;
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
const addVersmentPlat = async (Facture_ID, Plat) => {
  try {
    await (
      await db
    ).execAsync(`
      INSERT INTO VersmentPlat (Facture_ID, Plat)
      VALUES (${Facture_ID}, ${Plat});
    `);
    console.log("VersmentPlat entry added successfully.");
  } catch (error) {
    console.error("Error adding VersmentPlat entry:", error);
  }
};

const updateVersmentPlat = async (VersmentPlat_ID, Facture_ID, Plat) => {
  try {
    await (
      await db
    ).execAsync(`
      UPDATE VersmentPlat
      SET Facture_ID = ${Facture_ID}, Plat = ${Plat}
      WHERE VersmentPlat_ID = ${VersmentPlat_ID};
    `);
    console.log("VersmentPlat entry updated successfully.");
  } catch (error) {
    console.error("Error updating VersmentPlat entry:", error);
  }
};

const deleteVersmentPlat = async (VersmentPlat_ID) => {
  try {
    await (
      await db
    ).execAsync(`
      DELETE FROM VersmentPlat
      WHERE VersmentPlat_ID = ${VersmentPlat_ID};
    `);
    console.log("VersmentPlat entry deleted successfully.");
  } catch (error) {
    console.error("Error deleting VersmentPlat entry:", error);
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
  updateFactureValiderMoney,
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
  //-----
  getProduitStatusByNom,
  GetClient_FacturesPlat,
  GetFactures_Factprod,
  getProduiNomby_ID,
  GetClient_FacturesMoney,
  GetFacturesVersment,
  GetFacturesVersmentPlat,
  updateFactureValiderPlat,
};
