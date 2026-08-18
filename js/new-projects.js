function projectWaMessage(pr) {
  return `Hi, I'd like to register my interest in:\n${pr.name}\nLocation: ${pr.location}\nStatus: ${pr.status}`;
}

function renderProjectCard(pr) {
  return `
  <div class="card project-card" data-category="${pr.category}">
    <div class="prop-image" style="height:200px;">
      <span class="badge-status">${pr.status}</span>
      <img src="${pr.image}" alt="${pr.name}" loading="lazy">
    </div>
    <div class="prop-body">
      <div class="prop-location">${pr.location}</div>
      <h3 class="prop-title">${pr.name}</h3>
      ${pr.partner ? `<p style="font-size:0.85rem; color:var(--muted); margin:0;">Partner: <strong style="color:var(--navy);">${pr.partner}</strong></p>` : ""}
      ${pr.completion ? `<p style="font-size:0.85rem; color:var(--muted); margin:0; display:flex; align-items:center; gap:6px;">${ICONS.clock} Expected Completion: <strong style="color:var(--navy);">${pr.completion}</strong></p>` : ""}
      <p style="font-size:0.9rem; color:var(--text); margin-top:6px;">${pr.description}</p>
      <a class="btn btn-whatsapp btn-block" style="margin-top:14px;" href="${waLink(BUSINESS.whatsappNumbers[0], projectWaMessage(pr))}" target="_blank" rel="noopener">${ICONS.whatsapp} Register Interest</a>
    </div>
  </div>`;
}

function renderProjects(category) {
  const grid = document.getElementById("projectsGrid");
  const list = category === "all" ? PROJECTS : PROJECTS.filter((p) => p.category === category);
  grid.innerHTML = list.map(renderProjectCard).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  renderProjects("current");
  document.querySelectorAll(".tab-pill").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab-pill").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      renderProjects(tab.dataset.category);
    });
  });
});
