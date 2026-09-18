// Panel de administración: gestión de Servicios (API real) y Citas (localStorage).

const API_BASE = "https://8mameppfds.us-east-1.awsapprunner.com";

if (localStorage.getItem("role") !== "admin") {
  window.location.href = "/index.html";
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("jwtToken") || ""}`
  };
}

// --- Tabs ---
document.querySelectorAll("#adminTabs .nav-link").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#adminTabs .nav-link").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".admin-tab").forEach(t => t.classList.add("d-none"));
    document.getElementById(btn.dataset.tab).classList.remove("d-none");
  });
});

// --- Servicios ---
function cargarItems() {
  const tbody = document.getElementById("itemsTableBody");
  tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">Cargando...</td></tr>`;

  fetch(`${API_BASE}/servicios`)
    .then(res => res.json())
    .then(items => {
      if (!items.length) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No hay servicios registrados.</td></tr>`;
        return;
      }
      tbody.innerHTML = "";
      items.forEach(item => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><img src="${item.imagen || ""}" class="admin-thumb" onerror="this.style.opacity=0"></td>
          <td>${item.nombre}</td>
          <td>$${item.precio}</td>
          <td>${item.duracion ? item.duracion + " min" : "—"}</td>
          <td class="row-actions">
            <button onclick='editarItem(${JSON.stringify(item)})'><i class="bi bi-pencil"></i></button>
            <button class="text-danger" onclick="confirmarEliminarItem('${item.id}')"><i class="bi bi-trash"></i></button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    })
    .catch(err => {
      console.error(err);
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4">Error al cargar servicios.</td></tr>`;
    });
}

function abrirModalNuevoItem() {
  document.getElementById("modalItemTitulo").textContent = "Añadir servicio";
  document.getElementById("formItem").reset();
  document.getElementById("itemId").value = "";
}

function editarItem(item) {
  document.getElementById("modalItemTitulo").textContent = "Editar servicio";
  document.getElementById("itemId").value = item.id;
  document.getElementById("itemNombre").value = item.nombre;
  document.getElementById("itemPrecio").value = item.precio;
  document.getElementById("itemDuracion").value = item.duracion || "";
  document.getElementById("itemImagen").value = item.imagen || "";

  new bootstrap.Modal(document.getElementById("modalItem")).show();
}

document.getElementById("btnGuardarItem").addEventListener("click", () => {
  const id = document.getElementById("itemId").value;
  const body = {
    nombre: document.getElementById("itemNombre").value.trim(),
    precio: Number(document.getElementById("itemPrecio").value),
    duracion: Number(document.getElementById("itemDuracion").value) || null,
    imagen: document.getElementById("itemImagen").value.trim()
  };

  const url = id ? `${API_BASE}/servicios/${id}` : `${API_BASE}/servicios`;
  const method = id ? "PUT" : "POST";

  fetch(url, { method, headers: authHeaders(), body: JSON.stringify(body) })
    .then(res => {
      if (!res.ok) throw new Error("No se pudo guardar. Revisa la ruta/método con tu backend.");
      bootstrap.Modal.getInstance(document.getElementById("modalItem")).hide();
      cargarItems();
    })
    .catch(err => alert(err.message));
});

function confirmarEliminarItem(id) {
  if (!confirm("¿Eliminar este servicio?")) return;
  fetch(`${API_BASE}/servicios/${id}`, { method: "DELETE", headers: authHeaders() })
    .then(res => {
      if (!res.ok) throw new Error("No se pudo eliminar. Revisa la ruta con tu backend.");
      cargarItems();
    })
    .catch(err => alert(err.message));
}

// --- Citas ---
const CITAS_KEY = "petlab_citas";

function getCitasAdmin() {
  return JSON.parse(localStorage.getItem(CITAS_KEY)) || [];
}

function nombreMascotaAdmin(id) {
  const mascotas = JSON.parse(localStorage.getItem("petlab_mascotas")) || [];
  const m = mascotas.find(m => m.id === id);
  return m ? m.nombre : "Mascota eliminada";
}

function renderCitasAdmin() {
  const tbody = document.getElementById("citasTableBody");
  const citas = getCitasAdmin();

  if (!citas.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No hay citas registradas.</td></tr>`;
    return;
  }

  tbody.innerHTML = "";
  citas.forEach(c => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${nombreMascotaAdmin(c.mascotaId)}</td>
      <td>${c.veterinario}</td>
      <td>${c.servicio || "—"}</td>
      <td>${c.fecha}</td>
      <td>${c.hora}</td>
      <td>
        <select class="form-select form-select-sm select-estado" data-id="${c.id}">
          <option ${c.estado === "Pendiente" ? "selected" : ""}>Pendiente</option>
          <option ${c.estado === "Confirmada" ? "selected" : ""}>Confirmada</option>
          <option ${c.estado === "Cancelada" ? "selected" : ""}>Cancelada</option>
        </select>
      </td>
      <td class="row-actions">
        <button class="text-danger" onclick="eliminarCitaAdmin('${c.id}')"><i class="bi bi-trash"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll(".select-estado").forEach(sel => {
    sel.addEventListener("change", () => {
      const citas = getCitasAdmin();
      const idx = citas.findIndex(c => c.id === sel.dataset.id);
      if (idx > -1) {
        citas[idx].estado = sel.value;
        localStorage.setItem(CITAS_KEY, JSON.stringify(citas));
      }
    });
  });
}

function eliminarCitaAdmin(id) {
  if (!confirm("¿Eliminar esta cita?")) return;
  const citas = getCitasAdmin().filter(c => c.id !== id);
  localStorage.setItem(CITAS_KEY, JSON.stringify(citas));
  renderCitasAdmin();
}

document.addEventListener("DOMContentLoaded", () => {
  cargarItems();
  renderCitasAdmin();
});