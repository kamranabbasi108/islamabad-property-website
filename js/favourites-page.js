function renderFavouritesPage() {
  const ids = getFavourites();
  const list = PROPERTIES.filter((p) => ids.includes(p.id));
  const grid = document.getElementById("favouritesGrid");
  const empty = document.getElementById("favouritesEmpty");
  if (!list.length) {
    grid.innerHTML = "";
    grid.style.display = "none";
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";
  grid.style.display = "grid";
  grid.innerHTML = list
    .map((p) => {
      const card = renderPropertyCard(p);
      return card.replace(
        '<div class="icon-btns">',
        `<div class="icon-btns"><button class="icon-circle" data-remove-fav="${p.id}" title="Remove from Favourites">${ICONS.close}</button>`
      );
    })
    .join("");
}

async function initFavouritesPage() {
  const empty = document.getElementById("favouritesEmpty");
  if (!getFavourites().length) {
    empty.style.display = "block";
    return;
  }
  renderLoadingState("favouritesGrid", "Loading your saved properties…");
  await loadProperties();
  if (propertiesLoadError) {
    renderErrorState("favouritesGrid");
    return;
  }
  renderFavouritesPage();
}

document.addEventListener("DOMContentLoaded", () => {
  initFavouritesPage();
  document.getElementById("favouritesGrid").addEventListener("click", (e) => {
    const removeBtn = e.target.closest("[data-remove-fav]");
    if (removeBtn) {
      toggleFavourite(removeBtn.dataset.removeFav);
      renderFavouritesPage();
    }
  });
});
