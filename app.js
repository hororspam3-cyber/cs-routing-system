let cs = [

{id:1,name:"Andi",phone:"628111111111",status:"ONLINE"},

{id:2,name:"Budi",phone:"628222222222",status:"OFFLINE"},

{id:3,name:"Citra",phone:"628333333333",status:"ONLINE"},

{id:4,name:"Deni",phone:"628444444444",status:"NONAKTIF"},

{id:5,name:"Eka",phone:"628555555555",status:"ONLINE"}

];

let customers = [

{phone:"628123456789",cs:"Andi",chat:true,time:"Hari ini 09:10"},

{phone:"628987654321",cs:"Citra",chat:false,time:"Hari ini 09:25"},

{phone:"628777888999",cs:"Eka",chat:true,time:"Hari ini 09:40"}

];

const $ = id => document.getElementById(id);

function statusLabel(status){

if(status==="ONLINE") return '<span class="status online">🟢 ONLINE</span>';

if(status==="OFFLINE") return '<span class="status offline">⚪ OFFLINE</span>';

return '<span class="status inactive">🔴 NONAKTIF</span>';

}

function render(){

$("onlineCount").textContent = cs.filter(x=>x.status==="ONLINE").length;

$("totalCs").textContent = cs.length;

$("chatCount").textContent = customers.filter(x=>x.chat).length;

$("noChatCount").textContent = customers.filter(x=>!x.chat).length;

$("csTable").innerHTML = cs.map((x,i)=>

'<tr>' +

'<td>'+x.name+'</td>' +

'<td>'+x.phone+'</td>' +

'<td>'+statusLabel(x.status)+'</td>' +

'<td>' +

'<select onchange="changeStatus('+i+',this.value)">' +

'<option value="ONLINE" '+(x.status==="ONLINE"?"selected":"")+' >ONLINE</option>' +

'<option value="OFFLINE" '+(x.status==="OFFLINE"?"selected":"")+' >OFFLINE</option>' +

'<option value="NONAKTIF" '+(x.status==="NONAKTIF"?"selected":"")+' >NONAKTIF</option>' +

'</select>' +

'</td>' +

'</tr>'

).join("");

$("customerTable").innerHTML = customers.map(x=>

'<tr>' +

'<td>'+x.phone+'</td>' +

'<td>'+x.cs+'</td>' +

'<td>'+(x.chat ? '<span class="status online">🟢 ADA CHAT</span>' : '<span class="status inactive">🔴 TIDAK ADA CHAT</span>')+'</td>' +

'<td>'+x.time+'</td>' +

'</tr>'

).join("");

}

function changeStatus(index,status){

cs[index].status=status;

render();

}

function searchCustomer(){

const q=$("customerSearch").value.trim();

const found=customers.find(x=>x.phone===q);

const box=$("searchResult");

box.classList.remove("hidden");

if(found){

box.innerHTML=

'<strong>✅ Customer ditemukan</strong><br>' +

'Nomor: '+found.phone+'<br>' +

'CS: '+found.cs+'<br>' +

'Status: '+(found.chat?"🟢 ADA CHAT":"🔴 TIDAK ADA CHAT")+'<br>' +

'Waktu masuk: '+found.time;

}else{

box.innerHTML=

'<strong>❌ Customer tidak ditemukan</strong><br>' +

'Nomor ini belum tercatat di sistem prototype.';

}

}

function routeCustomer(){

const online=cs.filter(x=>x.status==="ONLINE");

const box=$("routeResult");

box.classList.remove("hidden");

if(!online.length){

box.innerHTML="⚠️ Tidak ada CS yang sedang ONLINE.";

return;

}

const selected=online[Math.floor(Math.random()*online.length)];

box.innerHTML=

'<strong>🎯 CS terpilih: '+selected.name+'</strong><br>' +

'WhatsApp: '+selected.phone+'<br>' +

'Status: 🟢 ONLINE';

}

$("searchBtn").onclick=searchCustomer;

$("customerSearch").onkeydown=e=>{

if(e.key==="Enter") searchCustomer();

};

$("routeBtn").onclick=routeCustomer;

$("addCsBtn").onclick=()=> $("modal").classList.remove("hidden");

$("cancelBtn").onclick=()=> $("modal").classList.add("hidden");

$("saveBtn").onclick=()=>{

const name=$("newName").value.trim();

const phone=$("newPhone").value.trim();

const status=$("newStatus").value;

if(!name || !phone){

alert("Nama dan nomor WhatsApp wajib diisi.");

return;

}

cs.push({

id:Date.now(),

name,

phone,

status

});

$("newName").value="";

$("newPhone").value="";

$("modal").classList.add("hidden");

render();

};

document.querySelectorAll(".nav").forEach(btn=>{

btn.onclick=()=>{

document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));

document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));

btn.classList.add("active");

$(btn.dataset.page).classList.add("active");

const titles={

dashboard:"Dashboard",

cs:"Data CS",

customers:"Customer",

routing:"Routing"

};

$("pageTitle").textContent=titles[btn.dataset.page];

};

});

render();
