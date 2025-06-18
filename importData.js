const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const backendDir = path.join(__dirname, 'tastybites_backend');

// Create tastybites_backend directory if it doesn't exist
if (!fs.existsSync(backendDir)) {
  fs.mkdirSync(backendDir);
}

const dbPath = path.join(backendDir, 'tastybites.db');
const jsonPath = path.join(__dirname, 'db.json');

// Read and parse JSON data
const rawData = fs.readFileSync(jsonPath, 'utf8');
const data = JSON.parse(rawData);

// Open (or create) SQLite database
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Create customers table
  db.run(`CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    firstName TEXT,
    surname TEXT,
    middleName TEXT,
    dob TEXT,
    homeAddress TEXT,
    registrationDate TEXT,
    devFlag BOOLEAN
  )`);

  // Create orders table
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customerId TEXT,
    orderDate TEXT,
    menuItem TEXT,
    instructions TEXT,
    paymentMethod TEXT,
    reservationDate TEXT
  )`);

  // Prepare insert statements
  const insertCustomer = db.prepare(`INSERT OR REPLACE INTO customers VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
  const insertOrder = db.prepare(`INSERT OR REPLACE INTO orders VALUES (?, ?, ?, ?, ?, ?, ?)`);

  // Insert customers
  data.customers.forEach(c => {
    insertCustomer.run(
      c.id || null,
      c.firstName || null,
      c.surname || null,
      c.middleName || null,
      c.dob || null,
      c.homeAddress || null,
      c.registrationDate || null,
      c.devFlag ? 1 : 0
    );
  });

  // Insert orders
  data.orders.forEach(o => {
    insertOrder.run(
      o.id || null,
      o.customerId || null,
      o.orderDate || null,
      o.menuItem || null,
      o.instructions || null,
      o.paymentMethod || null,
      o.reservationDate || null
    );
  });

  // Finalize statements
  insertCustomer.finalize();
  insertOrder.finalize();
});

db.close(() => {
  console.log('Database created and populated successfully at:', dbPath);
});
