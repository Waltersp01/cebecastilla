import { auth } from "./firebase.js";

import { signInWithEmailAndPassword } from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

window.loginAdmin = async function(){

const email = document.getElementById("correo").value;
const password = document.getElementById("clave").value;

try{

await signInWithEmailAndPassword(auth,email,password);

window.location.href="dashboard.html";

}catch(error){

alert("Credenciales incorrectas");

}

}