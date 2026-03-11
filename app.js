
import { auth, db } from "./firebase.js";
import {
ref,
get,
push,
set,update
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

import {
signInWithEmailAndPassword,
signOut,
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

let personaActual = null;

/* LOGIN ADMIN */

window.loginAdmin = async function(){

const correo=document.getElementById("correo").value;
const clave=document.getElementById("clave").value;

try{

await signInWithEmailAndPassword(auth,correo,clave);

window.location.href="dashboard.html";

}catch{

alert("Datos incorrectos");

}

}



/* CERRAR SESION */

window.cerrarSesion=function(){

signOut(auth);

window.location.href="login.html";

}


/* PROTEGER PAGINAS ADMIN */

onAuthStateChanged(auth,(user)=>{

const pagina = window.location.pathname;

/* Si intenta entrar sin login */
if(!user && (
pagina.includes("dashboard.html") ||
pagina.includes("registrar.html")
)){

alert("Debe iniciar sesión como administrador");

window.location.href="login.html";

}

});





window.buscarPersona = async function(){

const dni = document.getElementById("dni").value;

const personaRef = ref(db,"personas/"+dni);

const snapshot = await get(personaRef);

if(snapshot.exists()){

personaActual = snapshot.val();

const horaActual = new Date().toLocaleTimeString();
const fechaActual = new Date().toLocaleDateString("sv-SE");

let botonDashboard = "";

// Mostrar dashboard solo si es Directora
if(personaActual.cargo && personaActual.cargo.toLowerCase() === "directora"){

botonDashboard = `
<a href="login.html" class="btn btn-dark mt-2 ms-2">
Ir al Dashboard
</a>
`;

}

document.getElementById("datos").innerHTML =
`
<p><strong>Nombre:</strong> ${personaActual.nombre}</p>
<p><strong>Apellido:</strong> ${personaActual.apellido}</p>
<p><strong>Cargo:</strong> ${personaActual.cargo}</p>
<p><strong>Hora:</strong> ${horaActual}</p>
<p><strong>Fecha:</strong> ${fechaActual}</p>

<button class="btn btn-success mt-3" onclick="marcarAsistencia()">
Marcar Asistencia
</button>

${botonDashboard}
`;

}else{

personaActual = null;

document.getElementById("datos").innerHTML = `
<div class="alert alert-danger">
DNI no registrado
</div>
`;

}

}


window.marcarAsistencia = async function() {
  if (!personaActual) {
    alert("Primero busque el DNI");
    return;
  }

  const dni = document.getElementById("dni").value;
  const fecha = new Date().toLocaleDateString("sv-SE");
  const hora = new Date().toLocaleTimeString(); // formato 7:35:37 p. m.

  const asistenciaRef = ref(db, "asistencias/" + dni + "_" + fecha);
  const snapshot = await get(asistenciaRef);

  if (!snapshot.exists()) {
    // Si no hay registro para hoy, es hora de entrada
    await set(asistenciaRef, {
      dni: dni,
      nombre: personaActual.nombre,
      apellido: personaActual.apellido,
      cargo: personaActual.cargo,
      fecha: fecha,
      horaEntrada: hora,
      horaSalida: ""
    });
    alert("Hora de entrada registrada");
  } else {
    // Si ya existe, es hora de salida
    await update(asistenciaRef, { horaSalida: hora });
    alert("Hora de salida registrada");
  }

  listarAsistencias(); // refrescar tabla
};
window.registrarPersona = async function(){

const dni = document.getElementById("dniPersona").value;
const nombre = document.getElementById("nombrePersona").value;
const apellido = document.getElementById("apellidoPersona").value;
const cargo = document.getElementById("cargoPersona").value;

if(dni === "" || nombre === "" || apellido === "" || cargo === ""){
alert("Complete todos los campos");
return;
}

const personaRef = ref(db,"personas/"+dni);

await set(personaRef,{
nombre:nombre,
apellido:apellido,
cargo:cargo
});

alert("Persona registrada correctamente");

document.getElementById("dniPersona").value="";
document.getElementById("nombrePersona").value="";
document.getElementById("apellidoPersona").value="";
document.getElementById("cargoPersona").value="";

}

window.listarPersonas = async function(){

const listaRef = ref(db,"personas");

const snapshot = await get(listaRef);

if(!snapshot.exists()){
document.getElementById("listaPersonas").innerHTML = "No hay personas registradas";
return;
}

let html = `
<table class="table table-bordered">
<thead class="table-dark">
<tr>
<th>DNI</th>
<th>Nombre</th>
<th>Apellido</th>
<th>Cargo</th>
</tr>
</thead>
<tbody>
`;

snapshot.forEach(child => {

const dni = child.key;
const data = child.val();

html += `
<tr>
<td>${dni}</td>
<td>${data.nombre}</td>
<td>${data.apellido}</td>
<td>${data.cargo}</td>
</tr>
`;

});

html += "</tbody></table>";

document.getElementById("listaPersonas").innerHTML = html;

}

window.listarAsistencias = async function() {
  const asistenciasRef = ref(db, "asistencias");
  const snapshot = await get(asistenciasRef);

  if (snapshot.exists()) {
    const datos = snapshot.val();

    let tabla = `
      <table class="table table-bordered">
      <thead>
        <tr>
          <th>DNI</th>
          <th>Nombre</th>
          <th>Apellido</th>
          <th>Cargo</th>
          <th>Fecha</th>
          <th>Hora Entrada</th>
          <th>Hora Salida</th>
        </tr>
      </thead>
      <tbody>
    `;

    for (let id in datos) {
      tabla += `
        <tr>
          <td>${datos[id].dni}</td>
          <td>${datos[id].nombre}</td>
          <td>${datos[id].apellido}</td>
          <td>${datos[id].cargo}</td>
          <td>${datos[id].fecha}</td>
          <td>${datos[id].horaEntrada || ""}</td>
          <td>${datos[id].horaSalida || ""}</td>
        </tr>
      `;
    }

    tabla += "</tbody></table>";
    document.getElementById("listaAsistencias").innerHTML = tabla;
  } else {
    document.getElementById("listaAsistencias").innerHTML =
      "<div class='alert alert-warning'>No hay asistencias registradas</div>";
  }
};

import {
createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


window.registrarAdmin = async function(){

const correo=document.getElementById("correo").value;
const clave=document.getElementById("clave").value;

try{

await createUserWithEmailAndPassword(auth,correo,clave);

alert("Administrador registrado correctamente");

window.location.href="dashboard.html";

}catch(error){

alert("Error: "+error.message);

}

}

window.mostrarAsistenciasHoy = async function() {
  const hoy = new Date().toLocaleDateString("sv-SE"); // formato YYYY-MM-DD

  const asistenciasRef = ref(db, "asistencias");
  const snapshot = await get(asistenciasRef);

  if (!snapshot.exists()) {
    document.getElementById("listaAsistencias").innerHTML =
      "<div class='alert alert-warning'>No hay asistencias hoy</div>";
    return;
  }

  const datos = snapshot.val();

  let tabla = `
    <table class="table table-bordered">
    <thead>
      <tr>
        <th>DNI</th>
        <th>Nombre</th>
        <th>Apellido</th>
        <th>Cargo</th>
        <th>Fecha</th>
        <th>Hora Entrada</th>
        <th>Hora Salida</th>
      </tr>
    </thead>
    <tbody>
  `;

  for (let id in datos) {
    if (datos[id].fecha === hoy) {
      tabla += `
        <tr>
          <td>${datos[id].dni}</td>
          <td>${datos[id].nombre}</td>
          <td>${datos[id].apellido}</td>
          <td>${datos[id].cargo}</td>
          <td>${datos[id].fecha}</td>
          <td>${datos[id].horaEntrada || ""}</td>
          <td>${datos[id].horaSalida || ""}</td>
        </tr>
      `;
    }
  }

  tabla += "</tbody></table>";

  document.getElementById("listaAsistencias").innerHTML = tabla;
};

// FILTRAR → PERMITE EDITAR HORAS
window.filtrarAsistencias = async function() {
  const fechaBuscar = document.getElementById("fechaFiltro").value;

  if (fechaBuscar === "") {
    alert("Seleccione una fecha");
    return;
  }

  const asistenciasRef = ref(db, "asistencias");
  const snapshot = await get(asistenciasRef);

  if (!snapshot.exists()) {
    document.getElementById("listaAsistencias").innerHTML =
      "<div class='alert alert-warning'>No hay registros</div>";
    return;
  }

  const datos = snapshot.val();

  let tabla = `
    <table class="table table-bordered">
    <thead>
      <tr>
        <th>DNI</th>
        <th>Nombre</th>
        <th>Apellido</th>
        <th>Cargo</th>
        <th>Fecha</th>
        <th>Hora Entrada</th>
        <th>Hora Salida</th>
        <th>Editar</th>
      </tr>
    </thead>
    <tbody>
  `;

  for (let id in datos) {
    if (datos[id].fecha === fechaBuscar) {
      tabla += `
        <tr>
          <td>${datos[id].dni}</td>
          <td>${datos[id].nombre}</td>
          <td>${datos[id].apellido}</td>
          <td>${datos[id].cargo}</td>
          <td>${datos[id].fecha}</td>
          <td>${datos[id].horaEntrada || ""}</td>
          <td>${datos[id].horaSalida || ""}</td>
          <td>
            <button class="btn btn-warning btn-sm" onclick="abrirModalEditar('${id}','${datos[id].horaEntrada || ""}','${datos[id].horaSalida || ""}')">
              Editar
            </button>
          </td>
        </tr>
      `;
    }
  }

  tabla += "</tbody></table>";
  document.getElementById("listaAsistencias").innerHTML = tabla;
};
// Abrir modal pasando id, horaEntrada y horaSalida
window.abrirModalEditar = function(id, horaEntrada, horaSalida) {
  document.getElementById("editId").value = id;
  document.getElementById("nuevaHoraEntrada").value = horaEntrada || "";
  document.getElementById("nuevaHoraSalida").value = horaSalida || "";

  const modal = new bootstrap.Modal(document.getElementById("modalEditar"));
  modal.show();
};

// Guardar horas de entrada y salida en Firebase
window.guardarHoras = async function() {
  const id = document.getElementById("editId").value;
  let nuevaHoraEntrada = document.getElementById("nuevaHoraEntrada").value.trim();
  let nuevaHoraSalida = document.getElementById("nuevaHoraSalida").value.trim();

  if (!nuevaHoraEntrada && !nuevaHoraSalida) {
    alert("Ingrese al menos una hora");
    return;
  }

 

  const asistenciaRef = ref(db, "asistencias/" + id);

  const actualizaciones = {};
  if (nuevaHoraEntrada) actualizaciones.horaEntrada = nuevaHoraEntrada;
  if (nuevaHoraSalida) actualizaciones.horaSalida = nuevaHoraSalida;

  await update(asistenciaRef, actualizaciones);

  alert("Horas actualizadas correctamente");

  const modal = bootstrap.Modal.getInstance(document.getElementById("modalEditar"));
  modal.hide();

  filtrarAsistencias(); // refresca tabla con los nuevos datos
};

window.exportarPlanillaPDF = async function() {
  const fechaFiltro = document.getElementById("mesFiltroPDF").value; // usar mesFiltroPDF
  if (!fechaFiltro) {
    alert("Seleccione un mes (YYYY-MM) en el filtro)");
    return;
  }

  const [anio, mes] = fechaFiltro.split("-");

  const asistenciasRef = ref(db, "asistencias");
  const snapshot = await get(asistenciasRef);

  if (!snapshot.exists()) {
    alert("No hay registros para este mes");
    return;
  }

  const datos = snapshot.val();

  // Crear objeto con personas y sus asistencias
  const personas = {};
  for (let id in datos) {
    const d = datos[id];
    if (d.fecha.startsWith(`${anio}-${mes}`)) { // Filtrar solo mes seleccionado
      const nombre = d.nombre + " " + d.apellido;
      if (!personas[nombre]) personas[nombre] = {};
      const dia = new Date(d.fecha).getDate(); // Número del día
      personas[nombre][dia] = "A"; // Marcar asistencia
    }
  }

  const diasMes = new Date(anio, mes, 0).getDate(); // Días del mes
  const columns = [{ header: "Nombre", dataKey: "nombre" }];
  for (let d = 1; d <= diasMes; d++) columns.push({ header: d.toString(), dataKey: d.toString() });

  const rows = [];
  const hoy = new Date(); // Fecha actual
  const mesActual = hoy.getMonth() + 1;
  const anioActual = hoy.getFullYear();
  const diaActual = hoy.getDate();

  for (let nombre in personas) {
    const fila = { nombre };
    for (let d = 1; d <= diasMes; d++) {
      // Si el día aún no pasó, dejar en blanco
      if (anio > anioActual || (anio == anioActual && mes > mesActual) || (anio == anioActual && mes == mesActual && d > diaActual)) {
        fila[d] = "";
      } else {
        fila[d] = personas[nombre][d] || "F"; // F si no asistió y ya pasó
      }
    }
    rows.push(fila);
  }

  // Generar PDF
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("landscape");
  doc.setFontSize(14);
  doc.text(`Planilla de Asistencia - ${mes}/${anio}`, 14, 15);

  doc.autoTable({
    startY: 25,
    head: [columns.map(c => c.header)],
    body: rows.map(r => columns.map(c => r[c.dataKey])),
    theme: "grid",
    headStyles: { fillColor: [50, 50, 50], textColor: [255, 255, 255] },
    styles: { fontSize: 8, cellPadding: 2 },
  });

  doc.save(`Planilla_Asistencia_${mes}_${anio}.pdf`);
};
