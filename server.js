const express = require("express");

const path = require("path");

const { Pool } = require("pg");

const app = express();

const PORT = process.env.PORT || 10000;

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

app.use(express.json());

app.use(express.static(path.join(__dirname)));

async function initDatabase() {

try {

await pool.query("CREATE TABLE IF NOT EXISTS cs (id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, phone VARCHAR(30) NOT NULL UNIQUE, status VARCHAR(20) NOT NULL DEFAULT 'OFFLINE', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");

await pool.query("ALTER TABLE cs ADD COLUMN IF NOT EXISTS whatsapp_verified BOOLEAN NOT NULL DEFAULT FALSE");

await pool.query("CREATE TABLE IF NOT EXISTS customers (id SERIAL PRIMARY KEY, phone VARCHAR(30) NOT NULL UNIQUE, cs_id INTEGER REFERENCES cs(id), chat_status VARCHAR(20) NOT NULL DEFAULT 'TIDAK ADA CHAT', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");

await pool.query("CREATE TABLE IF NOT EXISTS whatsapp_accounts (id SERIAL PRIMARY KEY, cs_id INTEGER NOT NULL REFERENCES cs(id) ON DELETE CASCADE, phone VARCHAR(30) NOT NULL UNIQUE, status VARCHAR(20) NOT NULL DEFAULT 'OFFLINE', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");

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

res.json({ success: true, message: "Database berhasil terhubung", waktu: result.rows[0].waktu });

} catch (error) {

console.error(error);

res.status(500).json({ success: false, message: "Database gagal terhubung" });

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

app.post("/api/cs", async (req, res) => {

try {

const name = req.body.name;

const phone = req.body.phone;

const status = req.body.status || "OFFLINE";

if (!name || !phone) {

return res.status(400).json({ error: "Nama dan nomor WhatsApp wajib diisi" });

}

const result = await pool.query("INSERT INTO cs (name, phone, status, whatsapp_verified) VALUES ($1, $2, $3, FALSE) RETURNING *", [name, phone, status]);

res.status(201).json(result.rows[0]);

} catch (error) {

console.error(error);

res.status(500).json({ error: "Gagal menambahkan CS" });

}

});

app.patch("/api/cs/:id/status", async (req, res) => {

try {

const status = req.body.status;

const allowed = ["ONLINE", "OFFLINE", "NONAKTIF"];

if (!allowed.includes(status)) {

return res.status(400).json({ error: "Status tidak valid" });

}

const result = await pool.query("UPDATE cs SET status = $1 WHERE id = $2 RETURNING *", [status, req.params.id]);

if (!result.rows.length) {

return res.status(404).json({ error: "CS tidak ditemukan" });

}

res.json(result.rows[0]);

} catch (error) {

console.error(error);

res.status(500).json({ error: "Gagal mengubah status CS" });

}

});

app.patch("/api/cs/:id/verification", async (req, res) => {

try {

const verified = req.body.verified;

if (typeof verified !== "boolean") {

return res.status(400).json({ error: "Nilai verifikasi tidak valid" });

}

const result = await pool.query("UPDATE cs SET whatsapp_verified = $1 WHERE id = $2 RETURNING *", [verified, req.params.id]);

if (!result.rows.length) {

return res.status(404).json({ error: "CS tidak ditemukan" });

}

res.json(result.rows[0]);

} catch (error) {

console.error(error);

res.status(500).json({ error: "Gagal mengubah status verifikasi" });

}

});

app.delete("/api/cs/:id", async (req, res) => {

try {

const result = await pool.query("DELETE FROM cs WHERE id = $1 RETURNING *", [req.params.id]);

if (!result.rows.length) {

return res.status(404).json({ error: "CS tidak ditemukan" });

}

res.json({ success: true, message: "CS berhasil dihapus" });

} catch (error) {

console.error(error);

res.status(500).json({ error: "Gagal menghapus CS" });

}

});

app.get("/api/whatsapp", async (req, res) => {

try {

const result = await pool.query("SELECT whatsapp_accounts.*, cs.name AS cs_name FROM whatsapp_accounts JOIN cs ON whatsapp_accounts.cs_id = cs.id ORDER BY whatsapp_accounts.id ASC");

res.json(result.rows);

} catch (error) {

console.error(error);

res.status(500).json({ error: "Gagal mengambil akun WhatsApp" });

}

});

app.post("/api/whatsapp", async (req, res) => {

try {

const csId = req.body.cs_id;

const phone = req.body.phone;

const status = req.body.status || "OFFLINE";

if (!csId || !phone) {

return res.status(400).json({ error: "CS dan nomor WhatsApp wajib diisi" });

}

const csResult = await pool.query("SELECT id FROM cs WHERE id = $1", [csId]);

if (!csResult.rows.length) {

return res.status(404).json({ error: "CS tidak ditemukan" });

}

const result = await pool.query("INSERT INTO whatsapp_accounts (cs_id, phone, status) VALUES ($1, $2, $3) RETURNING *", [csId, phone, status]);

res.status(201).json(result.rows[0]);

} catch (error) {

console.error(error);

res.status(500).json({ error: "Gagal menyimpan akun WhatsApp" });

}

});

app.patch("/api/whatsapp/:id/status", async (req, res) => {

try {

const status = req.body.status;

const allowed = ["ONLINE", "OFFLINE", "NONAKTIF"];

if (!allowed.includes(status)) {

return res.status(400).json({ error: "Status tidak valid" });

}

const result = await pool.query("UPDATE whatsapp_accounts SET status = $1 WHERE id = $2 RETURNING *", [status, req.params.id]);

if (!result.rows.length) {

return res.status(404).json({ error: "Akun WhatsApp tidak ditemukan" });

}

res.json(result.rows[0]);

} catch (error) {

console.error(error);

res.status(500).json({ error: "Gagal mengubah status WhatsApp" });

}

});

app.listen(PORT, "0.0.0.0", async () => {

console.log("CS Routing System berjalan di port " + PORT);

await initDatabase();

});
