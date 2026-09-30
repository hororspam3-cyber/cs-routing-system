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

app.listen(PORT, "0.0.0.0", () => {

console.log("CS Routing System berjalan di port " + PORT);

});
