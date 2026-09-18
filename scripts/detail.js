/* =========================================================
   Detalle de producto/servicio.
   Lee el ítem guardado en sessionStorage por main.js
   (sessionStorage.setItem('selectedItem', ...)) al hacer
   clic en una tarjeta del home.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const raw = sessionStorage.getItem("selectedItem");
  const wrap = document.getElementById("detailWrap");

  if (!raw) {
    wrap.innerHTML = `<p class="text-muted">No se encontró el producto o servicio. <a href="/index.html">Volver al inicio</a>.</p>`;
    return;
  }

  const item = JSON.parse(raw);
  const isService = Boolean(item.duracion);

  wrap.innerHTML = `
    <div class="row g-4">
      <div class="col-md-5">
        <img src="${item.imagen}" alt="${item.nombre}" class="detail-img">
      </div>
      <div class="col-md-7">
        ${item.categoria ? `<span class="detail-categoria">${item.categoria}</span>` : ""}
        <h2 class="fw-bold mt-2">${item.nombre}</h2>
        <p class="detail-precio">$${item.precio}</p>
        ${isService ? `<p class="text-muted"><i class="bi bi-clock"></i> ${item.duracion} minutos</p>` : ""}
        ${item.descripcion ? `<p class="mt-3">${item.descripcion}</p>` : ""}
        <button class="btn btn-detail-primary mt-3" id="btnAccionDetail">
          ${isService ? "Reservar servicio" : "Añadir al carrito"}
        </button>
      </div>
    </div>
  `;

  document.getElementById("btnAccionDetail").addEventListener("click", () => {
    if (isService) {
      servicioSeleccionado = item;
      fechaSeleccionada = null;
      horaSeleccionada = null;
      document.getElementById("inputFecha").value = "";
      document.getElementById("inputFecha").min = new Date().toISOString().split("T")[0];
      document.getElementById("horasContainer").innerHTML = "";
      document.getElementById("confirmarReserva").disabled = true;
      new bootstrap.Modal(document.getElementById("modalReserva")).show();
    } else {
      addToCart(item.nombre, item.precio, item.imagen);
    }
  });
});