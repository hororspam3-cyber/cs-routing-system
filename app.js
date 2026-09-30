let cs = [];

let customers = [];

const $ = id => document.getElementById(id);

function statusLabel(status){

if(status === "ONLINE") return '<span class="status online">🟢 ONLINE</span>';

if(status === "OFFLINE") return '<span class="status offline">⚪ OFFLINE</span>';

return '<span class="status inactive">🔴 NONAKTIF</span>';

}

async function loadCs(){

try {

const response = await fetch("/api/cs");

if(!response.ok) throw new Error("Gagal mengambil data CS");

cs = await response.json();

render();

} catch(error) {

console.error(error);

alert("Gagal mengambil data CS dari database.");

}

}

function render(){

$("onlineCount").textContent = cs.filter(x => x.status === "ONLINE").length;

$("totalCs").textContent = cs.length;

$("chatCount").textContent = customers.filter(x => x.chat).length;

$("noChatCount").textContent = customers.filter(x => !x.chat).length;

$("csTable").innerHTML = cs.map(x =>

'<tr>' +

'<td>' + x.name + '</td>' +

'<td>' + x.phone + '</td>' +

'<td>' + statusLabel(x.status) + '</td>' +

'<td>' +

'<select onchange="changeStatus(' + x.id + ', this.value)">' +

'<option value="ONLINE" ' + (x.status === "ONLINE" ? "selected" : "") + '>ONLINE</option>' +

'<option value="OFFLINE" ' + (x.status === "OFFLINE" ? "selected" : "") + '>OFFLINE</option>' +

'<option value="NONAKTIF" ' + (x.status === "NONAKTIF" ? "selected" : "") + '>NONAKTIF</option>' +

'</select>' +

'</td>' +

'</tr>'

).join("");

$("customerTable").innerHTML = customers.map(x =>

'<tr>' +

'<td>' + x.phone + '</td>' +

'<td>' + x.cs + '</td>' +

'<td>' + (x.chat ? '<span class="status online">🟢 ADA CHAT</span>' : '<span class="status inactive">🔴 TIDAK ADA CHAT</span>') + '</td>' +

'<td>' + x.time + '</td>' +

'</tr>'

).join("");

}

async function changeStatus(id, status){

try {

const response = await fetch("/api/cs/" + id + "/status", {

method: "PATCH",

headers: { "Content-Type": "application/json" },

body: JSON.stringify({ status: status })

});

if(!response.ok) throw new Error("Gagal mengubah status");

await loadCs();

} catch(error) {

console.error(error);

alert("Gagal mengubah status CS.");

}

}

async function saveCs(){

const name = $("newName").value.trim();

const phone = $("newPhone").value.trim();

const status = $("newStatus").value;

if(!name || !phone){

alert("Nama dan nomor WhatsApp wajib diisi.");

return;

}

try {

const response = await fetch("/api/cs", {

method: "POST",

headers: { "Content-Type": "application/json" },

body: JSON.stringify({ name: name, phone: phone, status: status })

});

const data = await response.json();

if(!response.ok) throw new Error(data.error || "Gagal menambahkan CS");

$("newName").value = "";

$("newPhone").value = "";

$("newStatus").value = "OFFLINE";

$("modal").classList.add("hidden");

await loadCs();

} catch(error) {

console.error(error);

alert(error.message);

}

}

function searchCustomer(){

const q = $("customerSearch").value.trim();

const found = customers.find(x => x.phone === q);

const box = $("searchResult");

box.classList.remove("hidden");

if(found){

box.innerHTML =

'<strong>✅ Customer ditemukan</strong><br>' +

'Nomor: ' + found.phone + '<br>' +

'CS: ' + found.cs + '<br>' +

'Status: ' + (found.chat ? "🟢 ADA CHAT" : "🔴 TIDAK ADA CHAT") + '<br>' +

'Waktu masuk: ' + found.time;

} else {

box.innerHTML = '<strong>❌ Customer tidak ditemukan</strong><br>Nomor ini belum tercatat di sistem.';

}

}

function routeCustomer(){

const online = cs.filter(x => x.status === "ONLINE");

const box = $("routeResult");

box.classList.remove("hidden");

if(!online.length){

box.innerHTML = "⚠️ Tidak ada CS yang sedang ONLINE.";

return;

}

const selected = online[Math.floor(Math.random() * online.length)];

box.innerHTML =

'<strong>🎯 CS terpilih: ' + selected.name + '</strong><br>' +

'WhatsApp: ' + selected.phone + '<br>' +

'Status: 🟢 ONLINE';

}

$("searchBtn").onclick = searchCustomer;

$("customerSearch").onkeydown = e => {

if(e.key === "Enter") searchCustomer();

};

$("routeBtn").onclick = routeCustomer;

$("addCsBtn").onclick = () => $("modal").classList.remove("hidden");

$("cancelBtn").onclick = () => $("modal").classList.add("hidden");

$("saveBtn").onclick = saveCs;

document.querySelectorAll(".nav").forEach(btn => {

btn.onclick = () => {

document.querySelectorAll(".nav").forEach(x => x.classList.remove("active"));

document.querySelectorAll(".page").forEach(x => x.classList.remove("active"));

btn.classList.add("active");

$(btn.dataset.page).classList.add("active");

const titles = {

dashboard: "Dashboard",

cs: "Data CS",

customers: "Customer",

routing: "Routing"

};

$("pageTitle").textContent = titles[btn.dataset.page];

};

});

loadCs();
