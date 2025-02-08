import * as SQLite from "expo-sqlite";
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
// Open or create the database named 'tarek'
const db = SQLite.openDatabaseAsync("tarek14.db");

async function creatAll(params) {
  try {
    const dbInstance = await db;

    // Set journal mode to WAL before any transaction or table creation
    await dbInstance.execAsync(`PRAGMA journal_mode = WAL;`);
    console.log("Journal mode set to WAL.");

    // Await each table creation function to ensure they execute in sequence
    await CreatTable();
    await createExpensesTable();
    await createEmployeeTable();
    await createClientTable();
    await createFactureTable();
    await createFactProdTable();
    await createVersmentTable();
    await createCreditEmployeeTable();
    await createVersmentPlatTable();
    await createFournisseurTable();
    await migrateExpensesTable();
    await createVersment_FournisseurTable();

    console.log("All tables created successfully.");
  } catch (error) {
    console.error("Error during database initialization:", error);
  }
}

//creation des Table---------------------------
async function CreatTableapp() {
  try {
    const dbInstance = await db;

    // Set journal mode to WAL before creating the table
    await dbInstance.execAsync(`PRAGMA journal_mode = WAL;`);
    console.log("Journal mode set to WAL.");

    // Create the table if it does not exist
    await dbInstance.execAsync(`
      CREATE TABLE IF NOT EXISTS app (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT NOT NULL,
        statu BOOLEAN NOT NULL
      );
    `);
    console.log("Table 'app' created successfully.");
  } catch (error) {
    console.error("Error creating 'app' table:", error);
  }
}

async function insertRow(code, statu) {
  try {
    await (
      await db
    ).runAsync(`INSERT INTO app (code, statu) VALUES (?, ?);`, [code, statu]);
    console.log(
      `Row with code: ${code} and statu: ${statu} added successfully.`
    );
  } catch (error) {
    console.error("Error inserting row:", error);
  }
}
async function getFirstRow() {
  try {
    const firstRow = await (await db).getFirstAsync(`SELECT * FROM app ;`);
    if (firstRow) {
      console.log("First row:", firstRow);
    } else {
      console.log("No rows found in the 'app' table.");
    }
    return firstRow;
  } catch (error) {
    console.error("Error fetching the first row:", error);
  }
}
async function updateApp(id, statu) {
  try {
    const dbInstance = await db;

    // Start a transaction
    // await dbInstance.execAsync("BEGIN TRANSACTION;");

    // Update the entry with the given id
    const result = await dbInstance.runAsync(
      `UPDATE app SET statu = ? WHERE id = ?`,
      [statu, id]
    );

    // Commit the transaction if update was successful
    // await dbInstance.execAsync("COMMIT;");

    console.log(`App entry with ID ${id} updated successfully.`);

    return result;
  } catch (error) {
    console.error("Error updating app entry:", error);

    // Rollback the transaction in case of an error
    // await (await db).execAsync("ROLLBACK;");
  }
}

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
const createFournisseurTable = async () => {
  try {
    await (
      await db
    ).execAsync(`
        CREATE TABLE IF NOT EXISTS Fournisseur (
          Fournisseur_ID INTEGER PRIMARY KEY AUTOINCREMENT,
          Nom TEXT NOT NULL,
          Prenom TEXT NOT NULL,
          Num TEXT NOT NULL
        );
      `);
    console.log("Table 'Fournisseur' created successfully.");
  } catch (error) {
    console.error("Error creating 'Fournisseur' table:", error);
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
          ancientCreditMoney TEXT,
          newCreditMoney TEXT,
          restCreditMoney TEXT,
          ancientCreditPlat TEXT,
          newCreditPlat TEXT,
          restCreditPlat TEXT,
          totalPlat TEXT,
          FOREIGN KEY (Client_ID) REFERENCES Client(Client_ID) ON DELETE CASCADE
        );
      `);
    console.log("Table 'facture' created successfully.");
  } catch (error) {
    console.error("Error creating 'facture' table:", error);
  }
};

const alterFactureTable = async () => {
  try {
    await (
      await db
    ).execAsync(`
      ALTER TABLE facture ADD COLUMN ValiderMoney BOOLEAN NOT NULL DEFAULT 0;
      ALTER TABLE facture ADD COLUMN ValiderPlat BOOLEAN NOT NULL DEFAULT 0;
      ALTER TABLE facture ADD COLUMN Plat INTEGER;
    `);
    console.log("Columns added to 'facture' table successfully.");
  } catch (error) {
    console.error("Error altering 'facture' table:", error);
  }
};
const createExpensesTable = async () => {
  try {
    const dbInstance = await db;

    // Create the table if it does not exist
    await dbInstance.execAsync(`
      CREATE TABLE IF NOT EXISTS Expenses (
        Expense_ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Description TEXT NOT NULL,
        Amount REAL NOT NULL,
        Date DATE DEFAULT (datetime('now', 'localtime'))
      );
    `);

    // Check if 'resttopayee' column exists
    const result = await dbInstance.getAllSync(`
      PRAGMA table_info(Expenses);
    `);

    const columnExists = result.some((col) => col.name === "rest_to_payee");

    // Add the column if it does not exist
    if (!columnExists) {
      await dbInstance.execAsync(`
        ALTER TABLE Expenses ADD COLUMN rest_to_payee REAL DEFAULT 0;
      `);
      console.log("Column 'resttopayee' added successfully.");
    }

    console.log("Table 'Expenses' checked/created successfully.");
  } catch (error) {
    console.error("Error creating/updating 'Expenses' table:", error);
  }
};

const createVersment_FournisseurTable = async () => {
  try {
    await (
      await db
    ).execAsync(`
        CREATE TABLE IF NOT EXISTS Versment_Four (
          Versment_Four_ID INTEGER PRIMARY KEY AUTOINCREMENT,
          Expense_ID INTEGER,
          Somme REAL NOT NULL,
          Date DATE DEFAULT (datetime('now', 'localtime')),
          FOREIGN KEY (Expense_ID) REFERENCES Expenses(Expense_ID) ON DELETE CASCADE
        );
      `);
    console.log("Table 'Versment' created successfully.");
  } catch (error) {
    console.error("Error creating 'Versment' table:", error);
  }
};

const migrateExpensesTable = async () => {
  try {
    const dbInstance = await db;

    // Check if the column already exists
    const result = await dbInstance.getAllSync(`
      PRAGMA table_info(Expenses);
    `);

    const columnExists = result.some(
      (column) => column.name === "Fournisseur_ID"
    );

    if (columnExists) {
      console.log(
        "Migration skipped: 'Fournisseur_ID' already exists in 'Expenses'."
      );
      return; // Exit function early if column already exists
    }

    await dbInstance.execAsync("PRAGMA foreign_keys = OFF;"); // Disable foreign key checks

    await dbInstance.execAsync(`
      CREATE TABLE IF NOT EXISTS Expenses_New (
        Expense_ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Description TEXT NOT NULL,
        Amount REAL NOT NULL,
        Date DATE DEFAULT (datetime('now', 'localtime')),
        Fournisseur_ID INTEGER,
        FOREIGN KEY (Fournisseur_ID) REFERENCES Fournisseur(Fournisseur_ID) ON DELETE SET NULL
      );
    `);

    await dbInstance.execAsync(`
      INSERT INTO Expenses_New (Expense_ID, Description, Amount, Date)
      SELECT Expense_ID, Description, Amount, Date FROM Expenses;
    `);

    await dbInstance.execAsync(`
      DROP TABLE Expenses;
    `);

    await dbInstance.execAsync(`
      ALTER TABLE Expenses_New RENAME TO Expenses;
    `);

    await dbInstance.execAsync("PRAGMA foreign_keys = ON;"); // Re-enable foreign key checks

    console.log(
      "Table 'Expenses' migrated successfully with Fournisseur_ID as a foreign key."
    );
  } catch (error) {
    console.error("Error migrating 'Expenses' table:", error);
  }
};
const dropExpensesTable = async () => {
  try {
    const dbInstance = await db;

    // Ensure all transactions are committed before dropping the table
    await dbInstance.execAsync("PRAGMA foreign_keys = OFF;");
    await dbInstance.execAsync("PRAGMA busy_timeout = 5000;"); // Wait up to 5s if DB is locked
    await dbInstance.execAsync("VACUUM;"); // Free up the database and close open transactions

    // Drop the table
    await dbInstance.execAsync("DROP TABLE IF EXISTS Expenses;");

    await dbInstance.execAsync("PRAGMA foreign_keys = ON;"); // Re-enable foreign keys

    console.log("Table 'Expenses' dropped successfully.");
  } catch (error) {
    console.error("Error dropping 'Expenses' table:", error);
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
        Produit_ID INTEGER,
        Plat INTEGER NOT NULL,
        Date DATE DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (Facture_ID) REFERENCES facture(Facture_ID) ON DELETE CASCADE,
        FOREIGN KEY (Produit_ID) REFERENCES produit(Produit_ID) ON DELETE CASCADE
      );
    `);
    console.log("Table 'VersmentPlat' created successfully.");
  } catch (error) {
    console.error("Error creating 'VersmentPlat' table:", error);
  }
};
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

async function GetClient_Factures(id) {
  try {
    // Prepare the SQL statement
    const statement = await (
      await db
    ).prepareAsync("SELECT * FROM facture WHERE Client_ID = $id ");

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
async function GetFacture_ByID(id) {
  try {
    // Prepare the SQL statement
    const statement = await (
      await db
    ).prepareAsync("SELECT * FROM facture WHERE Facture_ID = $id ");

    // Execute the statement with the product name
    const result = await statement.executeAsync({ $id: id });
    const r = result.getAllAsync();
    return r;
    // Finalize the statement to release resources
    // await statement.finalize();
  } catch (error) {
    console.error("Error fetching product status:", error);
  }
}
async function GetEmployee_Deduction(id) {
  try {
    // Prepare the SQL statement
    const statement = await (
      await db
    ).prepareAsync("SELECT * FROM Credit_Employee WHERE Employee_ID = $id ");

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
async function GetExpenses_With_Fournisseur(id) {
  try {
    // Prepare the SQL statement
    const statement = await (
      await db
    ).prepareAsync("SELECT * FROM Expenses WHERE Fournisseur_ID = $id ");

    // Execute the statement with the product name
    const result = await statement.executeAsync({ $id: id });
    const r = result.getAllAsync();
    return r;
    // Finalize the statement to release resources
    await statement.finalize();
  } catch (error) {
    console.error("Error fetching Expeses status:", error);
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
    // Prepare the SQL statement with JOIN to fetch the product name
    const statement = await (
      await db
    ).prepareAsync(`
      SELECT vp.*, p.nom 
      FROM VersmentPlat vp
      JOIN produit p ON vp.Produit_ID = p.Produit_ID
      WHERE vp.Facture_ID = $id
    `);

    // Execute the statement with the given id
    const result = await statement.executeAsync({ $id: id });
    const versmentPlatArray = await result.getAllAsync(); // Get all results

    // Finalize the statement to release resources
    //  await statement.finalizeAsync();

    return versmentPlatArray; // Return the modified result with 'nom'
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
async function Get_ALL_Factures_Factprod(id) {
  try {
    // Prepare the SQL statement with JOIN to fetch the product name
    const statement = await (
      await db
    ).prepareAsync(`
      SELECT fp.*, p.Nom AS Nom, fp.PrixVente AS Prix
      FROM FactProd fp
      JOIN Produit p ON fp.Produit_ID = p.Produit_ID 
      WHERE fp.Facture_ID = $id
    `);

    // Execute the statement with the provided id
    const result = await statement.executeAsync({ $id: id });
    const r = await result.getAllAsync(); // Get all results

    // Finalize the statement to release resources
    // await statement.finalize();

    return r; // Return the result
  } catch (error) {
    console.error("Error fetching product status:", error);
    return null; // Return null or handle error as needed
  }
}

async function GetFacturesWithClientName() {
  try {
    // Prepare the SQL statement with JOIN to fetch client name and prenom
    const statement = await (
      await db
    ).prepareAsync(`
      SELECT f.*, c.Nom AS client_nom, c.Prenom AS client_prenom
      FROM Facture f
      JOIN client c ON f.Client_ID = c.Client_ID
    `);

    // Execute the statement and get the results
    const result = await statement.executeAsync();
    const facturesArray = await result.getAllAsync(); // Get all results

    console.log("facturesArray", facturesArray);

    // Finalize the statement to release resources if necessary
    // await statement.finalizeAsync();

    return facturesArray; // Return the results with 'client_nom' and 'client_prenom'
  } catch (error) {
    console.error("Error fetching facture with client name and prenom:", error);
  }
}
const getClientByName = async (nom, prenom) => {
  try {
    const dbInstance = await db; // Await the database instance

    // Prepare the SQL query with placeholders
    const statement = await dbInstance.prepareAsync(`
      SELECT * FROM Client
      WHERE Nom = ? AND Prenom = ?;
    `);

    // Execute the prepared statement with the provided parameters
    const r = await statement.executeAsync([nom, prenom]);

    // Retrieve all results using getAllAsync
    const result = await r.getAllAsync();

    // Check if any clients were found
    if (result.length > 0) {
      //  console.log("Clients found:", result);
      return result; // Return the array of found clients
    } else {
      // console.log("No clients found with the provided name.");
      return null; // Return null if no clients are found
    }
  } catch (error) {
    console.error("Error fetching clients by name:", error);
    throw error; // Rethrow the error for handling outside
  }
};
const getClientNameBy_ID = async (id) => {
  try {
    const dbInstance = await db; // Await the database instance

    // Prepare the SQL query with placeholders
    const statement = await dbInstance.prepareAsync(`
      SELECT * FROM Client
      WHERE Client_ID = ? ;
    `);

    // Execute the prepared statement with the provided parameters
    const r = await statement.executeAsync([id]);

    // Retrieve all results using getAllAsync
    const result = await r.getAllAsync();

    // Check if any clients were found
    if (result.length > 0) {
      //  console.log("Clients found:", result);
      return result; // Return the array of found clients
    } else {
      // console.log("No clients found with the provided name.");
      return null; // Return null if no clients are found
    }
  } catch (error) {
    console.error("Error fetching clients by name:", error);
    throw error; // Rethrow the error for handling outside
  }
};

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
const getClientById = async (clientId) => {
  try {
    const result = await (
      await db
    ).getAllAsync(`SELECT Nom, Prenom FROM Client WHERE Client_ID = ?`, [
      clientId,
    ]);

    if (result) {
      console.log(`Client found: ${result.Nom} ${result.Prenom}`);
      return result;
    } else {
      console.log(`No client found with ID: ${clientId}`);
      return null;
    }
  } catch (error) {
    console.error("Error retrieving client:", error);
  }
};

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
//--Fournisseur------------------------------------------------------
// Add a new fournisseur
const addFournisseur = async (Nom, Prenom, Num) => {
  try {
    const dbConnection = await db;
    await dbConnection.runAsync(
      `INSERT INTO Fournisseur (Nom, Prenom, Num) VALUES (?, ?, ?)`,
      [Nom, Prenom, Num]
    );
    console.log("Fournisseur added successfully.");
  } catch (error) {
    console.error("Error adding fournisseur:", error);
  }
};

// Delete a fournisseur by Fournisseur_ID
const deleteFournisseur = async (Fournisseur_ID) => {
  try {
    const dbConnection = await db;
    await dbConnection.runAsync(
      `DELETE FROM Fournisseur WHERE Fournisseur_ID = ?`,
      [Fournisseur_ID]
    );
    console.log(`Fournisseur with ID ${Fournisseur_ID} deleted successfully.`);
  } catch (error) {
    console.error(
      `Error deleting fournisseur with ID ${Fournisseur_ID}:`,
      error
    );
  }
};

// Update a fournisseur's details
const updateFournisseur = async (Fournisseur_ID, Nom, Prenom, Num) => {
  try {
    const dbConnection = await db;
    await dbConnection.runAsync(
      `UPDATE Fournisseur SET Nom = ?, Prenom = ?, Num = ? WHERE Fournisseur_ID = ?`,
      [Nom, Prenom, Num, Fournisseur_ID]
    );
    console.log(`Fournisseur with ID ${Fournisseur_ID} updated successfully.`);
  } catch (error) {
    console.error(
      `Error updating fournisseur with ID ${Fournisseur_ID}:`,
      error
    );
  }
};

//---------------------------------------------------------
//--Facture------------------------------------------------------
const addFacture = async (
  clientId,
  montantTotal,
  validerMoney,
  validerPlat,
  plat,
  ancientCreditMoney,
  newCreditMoney,
  restCreditMoney,
  ancientCreditPlat,
  newCreditPlat,
  restCreditPlat,
  totalPlat
) => {
  try {
    const r = await (
      await db
    ).runAsync(
      `
      INSERT INTO facture (
        Client_ID, Montant_Total, Date_Creat, ValiderMoney, ValiderPlat, Plat, 
        ancientCreditMoney, newCreditMoney, restCreditMoney, 
        ancientCreditPlat, newCreditPlat, restCreditPlat, totalPlat
      )
      VALUES (?, ?, datetime('now', 'localtime'), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `,
      clientId,
      montantTotal,
      validerMoney,
      validerPlat,
      plat,
      ancientCreditMoney,
      newCreditMoney,
      restCreditMoney,
      ancientCreditPlat,
      newCreditPlat,
      restCreditPlat,
      totalPlat
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
const getLastFactureId = async () => {
  try {
    // Prepare the SQL statement
    const statement = await (
      await db
    ).prepareAsync(`
      SELECT Facture_ID FROM facture ORDER BY Facture_ID DESC LIMIT 1;
    `);

    // Execute the prepared statement
    const r = await statement.executeAsync();
    const result = await r.getAllAsync();

    // Finalize the statement
    // await statement.finalize();

    // Check if there is a result
    if (result.length > 0) {
      const lastFactureId = result[0].Facture_ID;
      console.log("Last Facture_ID:", lastFactureId);
      return lastFactureId;
    } else {
      console.log("No factures found.");
      return null;
    }
  } catch (error) {
    console.error("Error retrieving last Facture_ID:", error);
    return null;
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
const updateFactProdPlatDecrement = async (
  factureId,
  produitId,
  decrementValue
) => {
  try {
    // Check if the decrement value is valid
    if (decrementValue <= 0) {
      console.error("Error: 'decrementValue' must be greater than 0.");
      return;
    }

    // Update the plat by decrementing it for the first matching entry
    const r = await (
      await db
    ).runAsync(
      `
      UPDATE FactProd
      SET Plat = Plat - ?
      WHERE FactProd_ID = (
        SELECT FactProd_ID
        FROM FactProd
        WHERE Facture_ID = ? AND Produit_ID = ? AND Plat >= ?
        LIMIT 1
      );
    `,
      decrementValue,
      factureId,
      produitId,
      decrementValue // Ensuring we don't go below zero
    );

    // Check if any rows were changed
    if (r.changes > 0) {
      console.log("FactProd plat decremented successfully.");
    } else {
      console.log(
        "No changes were made; either no matching entry found or Plat is too low."
      );
    }

    return r; // Return the result for further use if needed
  } catch (error) {
    console.error("Error updating FactProd plat:", error);
  }
};

const updateFactProdPlatIncrement = async (
  factureId,
  produitId,
  incrementValue
) => {
  try {
    // Check if the increment value is valid
    if (incrementValue <= 0) {
      console.error("Error: 'incrementValue' must be greater than 0.");
      return;
    }

    // Update the plat by incrementing it for the first matching entry
    const r = await (
      await db
    ).runAsync(
      `
      UPDATE FactProd
      SET Plat = Plat + ?
      WHERE FactProd_ID = (
        SELECT FactProd_ID
        FROM FactProd
        WHERE Facture_ID = ? AND Produit_ID = ?
        LIMIT 1
      );
    `,
      incrementValue,
      factureId,
      produitId
    );

    // Check if any rows were changed
    if (r.changes > 0) {
      console.log("FactProd plat incremented successfully.");
    } else {
      console.log("No changes were made; no matching entry found.");
    }

    return r; // Return the result for further use if needed
  } catch (error) {
    console.error("Error updating FactProd plat:", error);
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
//--VersmentPlat ------------------------------------------------------
const addVersmentPlat = async (Facture_ID, Produit_ID, Plat) => {
  if (Plat == null) {
    console.error("Error: 'Plat' cannot be null or undefined.");
    return;
  }
  if (Facture_ID == null) {
    console.error("Error: 'Facture_ID' cannot be null or undefined.");
    return;
  }
  if (Produit_ID == null) {
    console.error("Error: 'Produit_ID' cannot be null or undefined.");
    return;
  }

  try {
    await (
      await db
    ).execAsync(`
      INSERT INTO VersmentPlat (Facture_ID, Produit_ID, Plat)
      VALUES (${Facture_ID}, ${Produit_ID}, ${Plat});
    `);
    console.log("VersmentPlat entry added successfully.");
  } catch (error) {
    console.error("Error adding VersmentPlat entry:", error.message);
    console.error("Stack Trace:", error.stack);
  }
};

const updateVersmentPlat = async (
  VersmentPlat_ID,
  Facture_ID,
  Produit_ID,
  Plat
) => {
  try {
    await (
      await db
    ).execAsync(
      `
      UPDATE VersmentPlat
      SET Facture_ID = ?, Produit_ID = ?, Plat = ?
      WHERE VersmentPlat_ID = ?;
      `,
      [Facture_ID, Produit_ID, Plat, VersmentPlat_ID]
    );
    console.log("VersmentPlat entry updated successfully.");
  } catch (error) {
    console.error("Error updating VersmentPlat entry:", error);
  }
};

const deleteVersmentPlat2 = async (VersmentPlat_ID) => {
  console.log("Deleting VersmentPlat entry with ID:", VersmentPlat_ID);
  try {
    const dbInstance = await db; // Ensure the database connection is ready
    const result = await dbInstance.runAsync(
      `
      DELETE FROM VersmentPlat
      WHERE VersmentPlat_ID = ?;
      `,
      [VersmentPlat_ID] // Use '?' as a placeholder for the VersmentPlat_ID
    );
    if (result.changes > 0) {
      console.log(
        "VersmentPlat entry deleted successfully." + JSON.stringify(result)
      );
    } else {
      console.log("No entry found with the given VersmentPlat_ID.");
    }
  } catch (error) {
    console.error("Error deleting Versmentlat entry:", error);
  }
};
//expenses Table----------------------------------------
// Expenses Table----------------------------------------
const addExpense = async (description, amount, Fournisseur_ID) => {
  if (!description || description.trim() === "") {
    console.error("Error: 'Description' cannot be null, undefined, or empty.");
    return null;
  }
  if (amount == null || isNaN(amount)) {
    console.error("Error: 'Amount' must be a valid number.");
    return null;
  }

  try {
    const dbInstance = await db;

    // Insert the new expense
    await dbInstance.execAsync(`
      INSERT INTO Expenses (Description, Amount, Fournisseur_ID) 
      VALUES ('${description}', ${amount}, ${Fournisseur_ID});
    `);

    // Fetch the last inserted row ID
    const result = await dbInstance.getAllSync(
      `SELECT last_insert_rowid() AS Expense_ID;`
    );

    console.log("Expense added successfully with ID:", result[0].Expense_ID);
    return result[0].Expense_ID;
  } catch (error) {
    console.error("Error adding expense:", error.message);
    return null;
  }
};

const deleteExpense = async (expenseId) => {
  try {
    await (
      await db
    ).runAsync(
      `
      DELETE FROM Expenses 
      WHERE Expense_ID = ?;
    `,
      [expenseId]
    );
    console.log("Expense deleted successfully.");
  } catch (error) {
    console.error("Error deleting expense:", error);
  }
};
//VersmentFour-------------------------------------------------------

// Add a new Versment_Four entry
const addVersment_Four = async (expenseId, somme) => {
  const dbInstance = await db;

  try {
    await dbInstance.execAsync(`
      INSERT INTO Versment_Four (Expense_ID, Somme, Date) 
      VALUES (${expenseId}, ${somme}, datetime('now', 'localtime'))
    `);
    console.log("Versment added successfully.");
  } catch (error) {
    console.error("Error adding Versment:", error);
  }
};

// Delete a Versment_Four entry by ID
const deleteVersment_Four = async (versmentId) => {
  const dbInstance = await db;

  try {
    await dbInstance.execAsync(`
      DELETE FROM Versment_Four WHERE Versment_Four_ID = ${versmentId}
    `);
    console.log("Versment deleted successfully.");
  } catch (error) {
    console.error("Error deleting Versment:", error);
  }
};

// Update a Versment_Four entry (Somme) by ID
const updateVersment_Four = async (versmentId, newSomme) => {
  const dbInstance = await db;

  try {
    await dbInstance.execAsync(`
      UPDATE Versment_Four 
      SET Somme = ${newSomme}, Date = datetime('now', 'localtime') 
      WHERE Versment_Four_ID = ${versmentId}
    `);
    console.log("Versment updated successfully.");
  } catch (error) {
    console.error("Error updating Versment:", error);
  }
};

//------------------------------------------------------------------------
const GetSumSalesMounthly = async (date) => {
  try {
    const dbInstance = await db; // Await the database instance

    // Prepare the SQL query to sum up Montant_Total for the given month and year
    const statement = await dbInstance.prepareAsync(
      "SELECT SUM(Montant_Total) AS TotalMontant FROM facture WHERE strftime('%Y-%m', Date_Creat) = strftime('%Y-%m', ?)"
    );

    // Execute the prepared statement with the provided parameter
    const r = await statement.executeAsync([date]);

    // Retrieve the result using getAllAsync
    const result = await r.getAllAsync();

    return result; // Return the sum or 0 if no data
  } catch (error) {
    console.error("Error fetching montant total by month and year:", error);
    throw error;
  }
};

const GetSumDeductionMounthly = async (date) => {
  try {
    const dbInstance = await db;

    // Prepare the SQL query to sum up Somme for the given month and year
    const statement = await dbInstance.prepareAsync(
      "SELECT SUM(Somme) AS TotalCredit FROM Credit_Employee WHERE strftime('%Y-%m', Date) = strftime('%Y-%m', ?)"
    );

    // Execute the prepared statement with the provided parameter
    const r = await statement.executeAsync([date]);

    // Retrieve the result using getAllAsync
    const result = await r.getAllAsync();

    // Return the sum if available, otherwise return 0
    if (result.length > 0) {
      return result[0].TotalCredit || 0;
    } else {
      return 0;
    }
  } catch (error) {
    console.error("Error fetching credit sum by month and year:", error);
    throw error;
  }
};

const GetSumExpensesMounthly = async (date) => {
  try {
    const dbInstance = await db;

    // Prepare the SQL query to sum up Amount for the given month and year
    const statement = await dbInstance.prepareAsync(
      "SELECT SUM(Amount) AS TotalAmount FROM Expenses WHERE strftime('%Y-%m', Date) = strftime('%Y-%m', ?)"
    );

    // Execute the prepared statement with the provided parameter
    const r = await statement.executeAsync([date]);

    // Retrieve the result using getAllAsync
    const result = await r.getAllAsync();

    // Return the sum if available, otherwise return 0
    if (result.length > 0) {
      return result[0].TotalAmount || 0;
    } else {
      return 0;
    }
  } catch (error) {
    console.error("Error fetching expenses sum by month and year:", error);
    throw error;
  }
};

async function GetDeductionsSumByEmployee(date) {
  try {
    const dbInstance = await db;

    // Updated SQL query to filter by month and year
    const statement = await dbInstance.prepareAsync(
      `SELECT e.Employee_ID, e.Nom, e.Prenom, SUM(c.Somme) AS TotalDeduction
       FROM Credit_Employee c
       JOIN Employee e ON e.Employee_ID = c.Employee_ID
       WHERE strftime('%Y-%m', c.Date) = strftime('%Y-%m', ?)
       GROUP BY e.Employee_ID`
    );

    // Pass the date parameter (formatted as YYYY-MM) to the query
    const r = await statement.executeAsync([date]);

    // Retrieve all results
    const results = await r.getAllAsync();

    return results; // Return an array of deductions by employee
  } catch (error) {
    console.error("Error fetching deductions sum by employee:", error);
    throw error;
  }
}

async function GetMontantTotalByClient(date) {
  try {
    const dbInstance = await db;

    // Updated SQL query to filter by month and year
    const statement = await dbInstance.prepareAsync(
      `SELECT c.Nom, c.Prenom, f.Client_ID, SUM(f.Montant_Total) AS TotalMontant
       FROM facture f
       JOIN Client c ON c.Client_ID = f.Client_ID
       WHERE strftime('%Y-%m', f.Date_Creat) = strftime('%Y-%m', ?)
       GROUP BY f.Client_ID`
    );

    // Passing the date parameter (formatted as YYYY-MM) to the query
    const r = await statement.executeAsync([date]);

    const results = await r.getAllAsync();

    return results; // Returns an array of clients with their total amounts
  } catch (error) {
    console.error("Error fetching montant total by client:", error);
    throw error;
  }
}
async function GetExpensesByMounth(date) {
  try {
    const dbInstance = await db;

    // Updated SQL query to filter by month and year
    const statement = await dbInstance.prepareAsync(
      `SELECT Amount, Description, DATE(Date) as Date
   FROM Expenses
   WHERE strftime('%Y-%m', Date) = strftime('%Y-%m', ?)`
    );

    // Passing the date parameter (formatted as YYYY-MM) to the query
    const r = await statement.executeAsync([date]);

    const results = await r.getAllAsync();

    return results; // Returns an array of clients with their total amounts
  } catch (error) {
    console.error("Error fetching montant total by client:", error);
    throw error;
  }
}
async function GetExpensesSumByFournisseur(date) {
  try {
    const dbInstance = await db;

    // SQL query to get the total expenses per Fournisseur by month and year
    const statement = await dbInstance.prepareAsync(
      `SELECT f.Fournisseur_ID, f.Nom,f.Prenom, SUM(e.Amount) AS TotalExpenses
       FROM Expenses e
       JOIN Fournisseur f ON f.Fournisseur_ID = e.Fournisseur_ID
       WHERE strftime('%Y-%m', e.Date) = strftime('%Y-%m', ?)
       GROUP BY f.Fournisseur_ID`
    );

    // Pass the date parameter (formatted as YYYY-MM) to the query
    const r = await statement.executeAsync([date]);

    // Retrieve all results
    const results = await r.getAllAsync();

    return results; // Return an array of total expenses per fournisseur
  } catch (error) {
    console.error("Error fetching expenses sum by fournisseur:", error);
    throw error;
  }
}

const GetSumExpenses_By_Fournisseur = async (Fournisseur_ID) => {
  try {
    const dbInstance = await db;

    // Prepare the SQL query to sum up Amount for the given month and year
    const statement = await dbInstance.prepareAsync(
      "SELECT SUM(Amount) AS TotalAmount FROM Expenses WHERE Fournisseur_ID = ?"
    );

    // Execute the prepared statement with the provided parameter
    const r = await statement.executeAsync([Fournisseur_ID]);

    // Retrieve the result using getAllAsync
    const result = await r.getAllAsync();

    // Return the sum if available, otherwise return 0
    if (result.length > 0) {
      return result[0].TotalAmount || 0;
    } else {
      return 0;
    }
  } catch (error) {
    console.error("Error fetching expenses sum by Fournisseur:", error);
    throw error;
  }
};
const GetSum_Versment_Expenses = async (Expense_ID) => {
  try {
    const dbInstance = await db;

    // Prepare the SQL query to sum up Amount for the given month and year
    const statement = await dbInstance.prepareAsync(
      "SELECT SUM(Somme) AS TotalAmount FROM Versment_Four WHERE Expense_ID = ?"
    );

    // Execute the prepared statement with the provided parameter
    const r = await statement.executeAsync([Expense_ID]);

    // Retrieve the result using getAllAsync
    const result = await r.getAllAsync();

    // Return the sum if available, otherwise return 0
    if (result.length > 0) {
      return result[0].TotalAmount || 0;
    } else {
      return 0;
    }
  } catch (error) {
    console.error("Error fetching  sum Versment:", error);
    throw error;
  }
};
async function GetAllExpensesWithFournisseurNom() {
  try {
    const dbInstance = await db;

    // Updated SQL query to filter by month and year
    const statement = await dbInstance.prepareAsync(
      `SELECT e.Description, e.Amount, e.Fournisseur_ID,f.Nom,f.Prenom,e.Date,e.Expense_ID
       FROM Expenses e
       JOIN Fournisseur f ON f.Fournisseur_ID = e.Fournisseur_ID
       `
    );

    // Pass the date parameter (formatted as YYYY-MM) to the query
    const r = await statement.executeAsync();

    // Retrieve all results
    const results = await r.getAllAsync();

    return results; // Return an array of deductions by employee
  } catch (error) {
    console.error("Error fetching All Expenses", error);
    throw error;
  }
}
async function a() {
  const r = await GetSumDeductionMounthly();
  console.log(JSON.stringify(r));
}
//a();
//--------------------------------------------------------------
module.exports = {
  GetExpensesSumByFournisseur,
  GetSumExpenses_By_Fournisseur,
  GetAllExpensesWithFournisseurNom,
  GetSumExpenses_By_Fournisseur,
  GetSum_Versment_Expenses,
  GetExpenses_With_Fournisseur,
  GetExpensesByMounth,
  GetMontantTotalByClient,
  GetDeductionsSumByEmployee,
  GetSumSalesMounthly,
  GetSumDeductionMounthly,
  GetSumExpensesMounthly,
  GetAll,
  //Versment Fournisseur
  addVersment_Four,
  deleteVersment_Four,
  updateVersment_Four,

  // produt table methods
  addProduit,
  updateProduit,
  deleteProduit,
  //Fournisseur table methods
  addFournisseur,
  updateFournisseur,
  deleteFournisseur,
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
  deleteVersmentPlat2,
  //Expenses
  addExpense,
  deleteExpense,
  //--------------
  getProduitStatusByNom,
  GetClient_FacturesPlat,
  GetFactures_Factprod,
  getProduiNomby_ID,
  GetClient_FacturesMoney,
  GetFacturesVersment,
  GetFacturesVersmentPlat,
  updateFactureValiderPlat,
  updateFactProdPlatIncrement,
  updateFactProdPlatDecrement,
  CreatTable,
  createEmployeeTable,
  createClientTable,
  createFactureTable,
  createFactProdTable,
  createVersmentTable,
  createCreditEmployeeTable,
  createVersmentPlatTable,
  CreatTableapp,
  insertRow,
  getFirstRow,
  updateApp,
  creatAll,
  GetFacturesWithClientName,
  Get_ALL_Factures_Factprod,
  getClientByName,

  GetClient_Factures,
  GetEmployee_Deduction,
  getLastFactureId,
  getClientNameBy_ID,
  getClientById,
  GetFacture_ByID,
};
