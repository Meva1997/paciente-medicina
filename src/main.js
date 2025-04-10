const inputName = document.querySelector('#name'); 
const email = document.querySelector('#email'); 
const age = document.querySelector('#age'); 
const consult = document.querySelector('#consult'); 
const sintoms = document.querySelector('#sintoms'); 
const formulario = document.querySelector('.formulario'); 
const pacienteIngresado = document.querySelector('#paciente-ingresado');
const tituloLista = document.querySelector('.titulo-lista')
const textoLista = document.querySelector('.texto-lista');  

inputName.addEventListener('input', validarCampo);
email.addEventListener('input', validarCampo);
age.addEventListener('input', validarCampo);
consult.addEventListener('input', validarCampo);
sintoms.addEventListener('input', validarCampo);

formulario.addEventListener('submit', enviarFormulario); 

let editando = false; 

const citaObj = {
  id: generarId(),
  name: '',
  email: '',
  age: '',
  consult: '',
  sintoms: ''
}

pacienteIngresado.addEventListener('click', (e) => {
  if(e.target.classList.contains('editar-btn')){
    const id = e.target.getAttribute('data-id');
    editarPaciente(id)
  }

  if(e.target.classList.contains('eliminar-btn')){
    const id = e.target.getAttribute('data-id'); 
    eliminarPaciente(id)
  }
})

function validarCampo(e){

  
  if(e.target.value.trim() === ''){
    eliminarAlerta(e.target)
    mensajeAlerta('Este campo es obligatorio', e.target.parentElement); 
    return
  }
  
  if(e.target.id === 'email' && !validarEmail(e.target)){
    eliminarAlerta(e.target)
    mensajeAlerta('Email invalido', e.target.parentElement); 
    return
  }
  
  // Asignamos el valor al objeto citaObj
  citaObj[e.target.id] = e.target.value.trim()
  eliminarAlerta(e.target)

}


function enviarFormulario(e){
  e.preventDefault();
  eliminarAlerta(e.target);

  // Verificar si todos los campos están llenos
  if (!citaObj.name || !citaObj.email || !citaObj.age || !citaObj.consult || !citaObj.sintoms) {
    mensajeAlerta('Por favor, complete todos los campos.', formulario);
    return; // Evitar que se agregue o edite el paciente si algún campo está vacío
  } 

  if(editando){
    actualizarPacienteLocalStorage(); 
    alertaExito('Editado Correctamente')
    editando = false; 
    limpiarObjeto(); 
  } else {
    if (!citaObj.id) {
      citaObj.id = generarId(); // Generar un ID si no existe
    }
    crearLocalStorage();
    alertaExito('Paciente agregado');
  }
  
  console.log(citaObj)
  cargarLocalStorage();   
  reiniciarFormulario();
  document.querySelector('#btn-submit').textContent = 'Agregar'; 

  
}

function mostrarPaciente(paciente){
  const {name, email, age, consult , sintoms, id} = paciente

  const div = document.createElement('div')
  div.classList.add('info-paciente')
  div.innerHTML = `
    <p><span class="text-indigo-700 font-bold">Nombre:</span> ${name}</p>
    <p><span class="text-indigo-700 font-bold">Email:</span> ${email}</p>
    <p><span class="text-indigo-700 font-bold">Edad:</span> ${age}</p>
    <p><span class="text-indigo-700 font-bold">Motivo de consulta:</span> ${consult}</p>
    <p><span class="text-indigo-700 font-bold">Sintomas:</span> ${sintoms}</p>
    <div class="buttons flex justify-evenly mt-3">
      <button class="editar-btn text-white bg-blue-500 border-blue-700 rounded-md w-auto px-3 hover:bg-blue-900 hover:cursor-pointer" data-id="${id}">Editar</button>
      <button class="eliminar-btn text-white bg-red-500 border-red-700 rounded-md w-auto px-3 hover:bg-red-900 hover:cursor-pointer" data-id="${id}">Eliminar</button>
    </div>
  `;

  pacienteIngresado.appendChild(div); 
  tituloLista.innerHTML = `<p class="text-2xl">Lista de <span class="font-bold text-indigo-700">Pacientes</span>`
  textoLista.style.display = 'none'
}

function crearLocalStorage(){
  let pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];

  // Elimina cualquier paciente con ese ID (por si es edición)
  pacientes = pacientes.filter(paciente => paciente.id !== citaObj.id); 

  pacientes.push({...citaObj}); // Agregamos una copia del objeto actual

  localStorage.setItem('pacientes', JSON.stringify(pacientes)); //  Guardamos el arreglo actualizado

   // Recargar pacientes en el HTML
   cargarLocalStorage();
};

function cargarLocalStorage(){
  let pacientes = JSON.parse(localStorage.getItem('pacientes')) || []; 

  // Eliminar pacientes con id vacío
  pacientes = pacientes.filter(paciente => paciente.id !== '');

  //limpiar html antes de volver a mostrar pacientes editados
  pacienteIngresado.innerHTML = ''; 

  pacientes.forEach(paciente => {
    mostrarPaciente(paciente)
  })

}


function editarPaciente(id){
  const pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];
  const pacienteEditar = pacientes.find(paciente => paciente.id === id); 

   // Verificar si se encuentra el paciente
   if (pacienteEditar) {
    //cargar en inputs
    inputName.value = pacienteEditar.name;
    email.value = pacienteEditar.email;
    age.value = pacienteEditar.age;
    consult.value = pacienteEditar.consult;
    sintoms.value = pacienteEditar.sintoms;

    editando = true;

    // Actualizar citaObj con los datos editados
    Object.assign(citaObj, pacienteEditar);

    document.querySelector('#btn-submit').textContent = 'Guardar Cambios'; 
  } else {
    console.error('Paciente no encontrado');
  }
}

function actualizarPacienteLocalStorage(){
  let pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];

  // Encontramos y actualizamos el paciente que tiene el mismo ID
  pacientes = pacientes.map(paciente => 
    paciente.id === citaObj.id ? {...citaObj} : paciente
  );

  localStorage.setItem('pacientes', JSON.stringify(pacientes)); // Guardar la lista actualizada

  cargarLocalStorage(); // Recargar pacientes para mostrar los cambios
}


function eliminarPaciente(id){
  let pacientes = JSON.parse(localStorage.getItem('pacientes')) || []; 

  pacientes = pacientes.filter(paciente => paciente.id !== id); 

  localStorage.setItem('pacientes', JSON.stringify(pacientes))

  cargarLocalStorage()

  if(pacientes.length === 0){
    tituloLista.innerHTML = `
    <h2 class="text-xl mt-0">No hay <span class="text-indigo-700 font-bold text-xl">Pacientes</span> en la lista</h2>
    <p class="texto-lista text-[15px] text-gray-400 font-light">Agrega un paciente</p>
    `; 
  }
}

function reiniciarFormulario(){
  formulario.reset()
  limpiarObjeto()
}

function limpiarObjeto(){

    Object.assign(citaObj, {
      id: '',
      name: '',
      email: '',
      age: '',
      consult: '', 
      sintoms: ''
    })
}


function generarId(){
  return Math.random().toString(36).substring(2) + Date.now(); 
}

function validarEmail(email){
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return emailRegex.test(email.value); 
}

function eliminarAlerta(referencia){
  const alertaExiste = referencia.parentElement.querySelector('.alerta-error')
  if(alertaExiste){
    alertaExiste.remove(); 
  }
}

function mensajeAlerta(msg, referencia){
  const alerta = document.createElement('div');
  alerta.innerHTML = `
    <p class="alerta-error text-white px-1.5 py-0.5 uppercase text-xs font-bold bg-red-400 border-2 border-red-600 rounded-md w-auto mb-1">${msg}</p>
  `; 
  
  referencia.appendChild(alerta)
}

function alertaExito(msg){
  const alerta = document.createElement('div'); 
  alerta.classList.add('alerta-exito', 'text-center', 'mb-2')
  alerta.innerHTML = `
    <p class="bg-green-500 border-green-700 text-white uppercase w-auto px-2 rounded-md">${msg}</p>
  `;

  formulario.appendChild(alerta)
  setTimeout(() => {
    if(alerta){
      alerta.remove(); 
    }
  }, 3000);
}


cargarLocalStorage(); 