let fotoActual = "";

document.getElementById("mascotaFoto").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    fotoActual = reader.result; // base64
    document.getElementById("mascotaFotoPreview").innerHTML = `<img src="${fotoActual}">`;
  };
  reader.readAsDataURL(file);
});

const MASCOTAS_KEY = "petlab_mascotas";

// )
function getMascotas() {
  return JSON.parse(localStorage.getItem(MASCOTAS_KEY)) || [];
}

// 
function saveMascota(mascota) {
  const mascotas = getMascotas();
  if (mascota.id) {
    const idx = mascotas.findIndex(m => m.id === mascota.id);
    mascotas[idx] = mascota;
  } else {
    mascota.id = crypto.randomUUID();
    mascotas.push(mascota);
  }
  localStorage.setItem(MASCOTAS_KEY, JSON.stringify(mascotas));
}

// 
function deleteMascota(id) {
  const mascotas = getMascotas().filter(m => m.id !== id);
  localStorage.setItem(MASCOTAS_KEY, JSON.stringify(mascotas));
}

const iconosEspecie = {
  Perro: "bi-emoji-smile",
  Gato: "bi-emoji-sunglasses",
  Ave: "bi-feather",
  Conejo: "bi-flower1",
  Otro: "bi-heart"
};

function renderMascotas() {
  const container = document.getElementById("mascotasContainer");
  const vacio = document.getElementById("mascotasVacio");
  const mascotas = getMascotas();

  container.innerHTML = "";

  if (mascotas.length === 0) {
    vacio.classList.remove("d-none");
    return;
  }
  vacio.classList.add("d-none");

  mascotas.forEach(m => {
    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-lg-4";
    col.innerHTML = `
      <div class="card-mascota-icono">
  ${m.foto ? `<img src="${m.foto}">` : `<i class="bi ${iconosEspecie[m.especie] || "bi-heart"}"></i>`}
</div>
        <div class="card-mascota-info">
          <h5>${m.nombre}</h5>
          <p class="mb-1">${m.especie}${m.raza ? " · " + m.raza : ""}</p>
          <p class="text-muted mb-0">
            ${m.edad ? m.edad + " años" : "Edad no registrada"}
            ${m.peso ? " · " + m.peso + " kg" : ""}
          </p>
        </div>
        <div class="card-mascota-acciones">
          <button class="btn-icon-mascota" onclick="editarMascota('${m.id}')" title="Editar">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn-icon-mascota text-danger" onclick="confirmarEliminarMascota('${m.id}')" title="Eliminar">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    `;
    container.appendChild(col);
  });
}

function abrirModalNueva() {
  document.getElementById("modalMascotaTitulo").textContent = "Añadir mascota";
  document.getElementById("formMascota").reset();
  document.getElementById("mascotaId").value = "";
  fotoActual = "";
  document.getElementById("mascotaFotoPreview").innerHTML = `<i class="bi bi-camera"></i>`;
}

function editarMascota(id) {
  const mascota = getMascotas().find(m => m.id === id);
  if (!mascota) return;

  document.getElementById("modalMascotaTitulo").textContent = "Editar mascota";
  document.getElementById("mascotaId").value = mascota.id;
  document.getElementById("mascotaNombre").value = mascota.nombre;
  document.getElementById("mascotaEspecie").value = mascota.especie;
  document.getElementById("mascotaRaza").value = mascota.raza || "";
  document.getElementById("mascotaEdad").value = mascota.edad || "";
  document.getElementById("mascotaPeso").value = mascota.peso || "";
  document.getElementById("mascotaNotas").value = mascota.notas || "";
  fotoActual = mascota.foto || "";
document.getElementById("mascotaFotoPreview").innerHTML = mascota.foto
  ? `<img src="${mascota.foto}">`
  : `<i class="bi bi-camera"></i>`;
  new bootstrap.Modal(document.getElementById("modalMascota")).show();
}

function confirmarEliminarMascota(id) {
  if (confirm("¿Eliminar esta mascota? Esta acción no se puede deshacer.")) {
    deleteMascota(id);
    renderMascotas();
  }
}

document.getElementById("btnGuardarMascota").addEventListener("click", () => {
  const form = document.getElementById("formMascota");
  const nombre = document.getElementById("mascotaNombre").value.trim();
  const especie = document.getElementById("mascotaEspecie").value;
  foto: fotoActual
  if (!nombre || !especie) {
    form.reportValidity();
    return;
  }

  const mascota = {
    id: document.getElementById("mascotaId").value || null,
    nombre,
    especie,
    raza: document.getElementById("mascotaRaza").value.trim(),
    edad: document.getElementById("mascotaEdad").value,
    peso: document.getElementById("mascotaPeso").value,
    notas: document.getElementById("mascotaNotas").value.trim()
  };

  saveMascota(mascota);
  renderMascotas();

  bootstrap.Modal.getInstance(document.getElementById("modalMascota")).hide();
});

document.addEventListener("DOMContentLoaded", renderMascotas);