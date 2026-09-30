const express = require("express");

const path = require("path");

const { Pool } = require("pg");

const app = express();

const PORT = process.env.PORT || 10000;

const pool = new Pool({

connectionString: process.env.DATABASE_URL,

ssl: { rejectUnauthorized: false }

});

app.use(express.json());

app.use(express.static(path.join(__dirname)));

async function initDatabase() {

try {

await pool.query("CREATE TABLE IF NOT EXISTS cs (id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, phone VARCHAR(30) NOT NULL UNIQUE, status VARCHAR(20) NOT NULL DEFAULT 'OFFLINE', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");

await pool.query("CREATE TABLE IF NOT EXISTS customers (id SERIAL PRIMARY KEY, phone VARCHAR(30) NOT NULL UNIQUE, cs_id INTEGER REFERENCES cs(id), chat_status VARCHAR(20) NOT NULL DEFAULT 'TIDAK ADA CHAT', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");

console.log("Database tables siap.");

} catch (error) {

console.error("Gagal membuat tabel:", error);

}

}

app.get("/", (req, res) => {

res.sendFile(path.join(__dirname, "index.html"));

});

app.get("/api/test-db", async (req, res) => {

try {

const result = await pool.query("SELECT NOW() AS waktu");

res.json({

success: true,

message: "Database berhasil terhubung",

waktu: result.rows[0].waktu

});

} catch (error) {

console.error(error);

res.status(500).json({

success: false,

message: "Database gagal terhubung"

});

}

});

app.get("/api/cs", async (req, res) => {

try {

const result = await pool.query("SELECT * FROM cs ORDER BY id ASC");

res.json(result.rows);

} catch (error) {

console.error(error);

res.status(500).json({ error: "Gagal mengambil data CS" });

}

});

app.listen(PORT, "0.0.0.0", async () => {

console.log("CS Routing System berjalan di port " + PORT);

await initDatabase();

});
