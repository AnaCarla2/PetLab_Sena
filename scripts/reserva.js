/* =========================================================
   Reserva de servicios desde el Home (modal #modalReserva)
   Crea la cita en la MISMA localStorage ("petlab_citas") que
   usan pages/citas.html y pages/adminPyS.html, para que todo
   quede integrado en un solo lugar.
   ========================================================= */

let servicioSeleccionado = null;
let fechaSeleccionada = null;
let horaSeleccionada = null;

const inputFecha = document.getElementById("inputFecha");
const horasContainer = document.getElementById("horasContainer");
const confirmarBtn = document.getElementById("confirmarReserva");
const reservaMascotaSelect = document.getElementById("reservaMascota");

const HORAS_DISPONIBLES = [
  "08:00", "09:00", "10:00", "11:00",
  "14:00", "15:00", "16:00", "17:00"
];

document.getElementById("modalReserva").addEventListener("show.bs.modal", () => {
  const mascotas = JSON.parse(localStorage.getItem("petlab_mascotas")) || [];
  reservaMascotaSelect.innerHTML = '<option value="">Selecciona una mascota (opcional)</option>';
  mascotas.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m.id;
    opt.textContent = m.nombre;
    reservaMascotaSelect.appendChild(opt);
  });
});

inputFecha.addEventListener("change", () => {
  fechaSeleccionada = inputFecha.value;
  horaSeleccionada = null;
  confirmarBtn.disabled = true;

  horasContainer.innerHTML = "";
  HORAS_DISPONIBLES.forEach(hora => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-outline-primary btn-sm hora-slot";
    btn.textContent = hora;
    btn.addEventListener("click", () => {
      document.querySelectorAll(".hora-slot").forEach(b => b.classList.remove("active", "btn-primary"));
      btn.classList.add("active", "btn-primary");
      horaSeleccionada = hora;
      confirmarBtn.disabled = false;
    });
    horasContainer.appendChild(btn);
  });
});

confirmarBtn.addEventListener("click", () => {
  if (!fechaSeleccionada || !horaSeleccionada || !servicioSeleccionado) return;

  const citas = JSON.parse(localStorage.getItem("petlab_citas")) || [];
  const nuevaCita = {
    id: crypto.randomUUID(),
    mascotaId: reservaMascotaSelect.value || null,
    veterinario: document.getElementById("reservaVeterinario").value || "Por asignar",
    servicio: servicioSeleccionado.nombre,
    fecha: fechaSeleccionada,
    hora: horaSeleccionada,
    estado: "Confirmada"
  };
  citas.push(nuevaCita);
  localStorage.setItem("petlab_citas", JSON.stringify(citas));

  bootstrap.Modal.getInstance(document.getElementById("modalReserva")).hide();

  document.getElementById("reservaResumen").textContent =
    `${servicioSeleccionado.nombre} · ${fechaSeleccionada} a las ${horaSeleccionada}`;
  new bootstrap.Modal(document.getElementById("modalReservaConfirmada")).show();
});