/* =========================================================
   Gestión de Citas — PetLab
   Citas y su relación con mascotas: localStorage por ahora
   (clave "petlab_citas"). El listado de Servicios SÍ se
   trae de tu API real, porque /servicios ya existe.

   Cuando tengas el endpoint /citas en el backend, reemplaza
   las funciones marcadas con TODO por sus fetch().
   Lo mismo aplica si luego creas /veterinarios: reemplaza
   el <select id="citaVeterinario"> fijo del HTML por un
   render dinámico igual al de citaServicio.
   ========================================================= */

const CITAS_KEY = "petlab_citas";

// TODO: reemplazar por fetch("https://8mameppfds.us-east-1.awsapprunner.com/citas")
function getCitas() {
  return JSON.parse(localStorage.getItem(CITAS_KEY)) || [];
}

// TODO: reemplazar por fetch(..., { method: "POST" o "PUT" })
function saveCita(cita) {
  const citas = getCitas();
  if (cita.id) {
    const idx = citas.findIndex(c => c.id === cita.id);
    citas[idx] = cita;
  } else {
    cita.id = crypto.randomUUID();
    citas.push(cita);
  }
  localStorage.setItem(CITAS_KEY, JSON.stringify(citas));
}

// TODO: reemplazar por fetch(..., { method: "DELETE" })
function deleteCita(id) {
  const citas = getCitas().filter(c => c.id !== id);
  localStorage.setItem(CITAS_KEY, JSON.stringify(citas));
}

const pillEstado = {
  Pendiente: "pill-pendiente",
  Confirmada: "pill-confirmada",
  Cancelada: "pill-cancelada"
};

function poblarSelectMascotas() {
  const select = document.getElementById("citaMascota");
  const aviso = document.getElementById("avisoSinMascotas");
  const mascotas = JSON.parse(localStorage.getItem("petlab_mascotas")) || [];

  select.innerHTML = '<option value="">Selecciona...</option>';
  mascotas.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m.id;
    opt.textContent = m.nombre;
    select.appendChild(opt);
  });

  aviso.style.display = mascotas.length === 0 ? "block" : "none";
}

function cargarServiciosReales() {
  const select = document.getElementById("citaServicio");
  fetch("https://8mameppfds.us-east-1.awsapprunner.com/servicios")
    .then(res => res.json())
    .then(servicios => {
      select.innerHTML = '<option value="">Sin servicio específico</option>';
      servicios.forEach(s => {
        const opt = document.createElement("option");
        opt.value = s.nombre;
        opt.textContent = `${s.nombre} — $${s.precio}`;
        select.appendChild(opt);
      });
    })
    .catch(() => {
      select.innerHTML = '<option value="">No se pudieron cargar los servicios</option>';
    });
}

function nombreMascota(id) {
  const mascotas = JSON.parse(localStorage.getItem("petlab_mascotas")) || [];
  const m = mascotas.find(m => m.id === id);
  return m ? m.nombre : "Mascota eliminada";
}

function renderCitas() {
  const container = document.getElementById("citasContainer");
  const vacio = document.getElementById("citasVacio");
  const citas = getCitas().sort((a, b) => `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`));

  container.innerHTML = "";

  if (citas.length === 0) {
    vacio.classList.remove("d-none");
    return;
  }
  vacio.classList.add("d-none");

  citas.forEach(c => {
    const col = document.createElement("div");
    col.className = "col-12 col-md-6";
    col.innerHTML = `
      <div class="card-cita">
        <div class="card-cita-fecha">
          <div class="dia">${new Date(c.fecha + "T00:00:00").getDate()}</div>
          <div class="mes">${new Date(c.fecha + "T00:00:00").toLocaleDateString("es-CO", { month: "short" })}</div>
        </div>
        <div class="card-cita-info">
          <h5>${nombreMascota(c.mascotaId)}</h5>
          <p class="mb-1"><i class="bi bi-person-badge"></i> ${c.veterinario}</p>
          ${c.servicio ? `<p class="mb-1"><i class="bi bi-clipboard2-pulse"></i> ${c.servicio}</p>` : ""}
          <p class="mb-0"><i class="bi bi-clock"></i> ${c.hora}</p>
        </div>
        <div class="card-cita-lateral">
          <span class="pill-estado ${pillEstado[c.estado] || ""}">${c.estado}</span>
          <div class="card-cita-acciones">
            <button class="btn-icon-mascota" onclick="editarCita('${c.id}')" title="Editar">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn-icon-mascota text-danger" onclick="confirmarEliminarCita('${c.id}')" title="Cancelar">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `;
    container.appendChild(col);
  });
}

function abrirModalNuevaCita() {
  document.getElementById("modalCitaTitulo").textContent = "Agendar cita";
  document.getElementById("formCita").reset();
  document.getElementById("citaId").value = "";
  document.getElementById("citaFecha").min = new Date().toISOString().split("T")[0];
  poblarSelectMascotas();
}

function editarCita(id) {
  const cita = getCitas().find(c => c.id === id);
  if (!cita) return;

  poblarSelectMascotas();

  document.getElementById("modalCitaTitulo").textContent = "Editar cita";
  document.getElementById("citaId").value = cita.id;
  document.getElementById("citaMascota").value = cita.mascotaId;
  document.getElementById("citaVeterinario").value = cita.veterinario;
  document.getElementById("citaFecha").value = cita.fecha;
  document.getElementById("citaHora").value = cita.hora;
  document.getElementById("citaEstado").value = cita.estado;

  new bootstrap.Modal(document.getElementById("modalCita")).show();
}

function confirmarEliminarCita(id) {
  if (confirm("¿Cancelar y eliminar esta cita?")) {
    deleteCita(id);
    renderCitas();
  }
}

document.getElementById("btnGuardarCita").addEventListener("click", () => {
  const form = document.getElementById("formCita");
  const mascotaId = document.getElementById("citaMascota").value;
  const veterinario = document.getElementById("citaVeterinario").value;
  const fecha = document.getElementById("citaFecha").value;
  const hora = document.getElementById("citaHora").value;

  if (!mascotaId || !veterinario || !fecha || !hora) {
    form.reportValidity();
    return;
  }

  const esNueva = !document.getElementById("citaId").value;

  const cita = {
    id: document.getElementById("citaId").value || null,
    mascotaId,
    veterinario,
    servicio: document.getElementById("citaServicio").value,
    fecha,
    hora,
    estado: esNueva ? "Confirmada" : document.getElementById("citaEstado").value
  };

  saveCita(cita);
  renderCitas();

  bootstrap.Modal.getInstance(document.getElementById("modalCita")).hide();

  if (esNueva) {
    document.getElementById("confirmacionResumen").textContent =
      `${nombreMascota(mascotaId)} · ${veterinario} · ${fecha} a las ${hora}`;
    new bootstrap.Modal(document.getElementById("modalCitaConfirmada")).show();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  renderCitas();
  cargarServiciosReales();

  // Si llegan desde el Home con ?nueva=1, abre directamente el modal de agendar
  if (new URLSearchParams(window.location.search).get("nueva") === "1") {
    abrirModalNuevaCita();
    bootstrap.Modal.getOrCreateInstance(document.getElementById("modalCita")).show();
  }
});