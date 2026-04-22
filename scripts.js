/* Data Sources:
  Sprites - https://github.com/PokeAPI/sprites
    Pattern: https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{id}.png
  Cries - https://github.com/smogon/pokemon-showdown-client
    Pattern: https://play.pokemonshowdown.com/audio/cries/{name}.mp3
  Stats - https://github.com/lgreski/pokemonData
    CSV: data/Pokemon_Stats.csv
  Music - https://www.youtube.com/watch?v=vGk1udp7Nc4
*/

// #Global Vars
let pokemonData = [];
let activeType = null;

const typeColors = {
  Normal: '#a8a878', Fire: '#f08030', Water: '#6890f0', Grass: '#78c850',
  Electric: '#f8d030', Ice: '#98d8d8', Fighting: '#c03028', Poison: '#a040a0',
  Ground: '#e0c068', Flying: '#a890f0', Psychic: '#f85888', Bug: '#a8b820',
  Rock: '#b8a038', Ghost: '#705898', Dragon: '#7038f8'
};

// #Background Music
const bgMusic = new Audio("assets/pkMusic.mp3");
bgMusic.volume = 0.25;
bgMusic.loop = true;
document.addEventListener("click", function startMusic() {
  bgMusic.play().catch(function() {});
}, { once: true });

// #Asset Helpers
function getSprite(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

function playCry(name) {
  const cry = new Audio(`https://play.pokemonshowdown.com/audio/cries/${name.toLowerCase()}.mp3`);
  cry.volume = 0.3;
  cry.play().catch(function() {});
}

// #CSV Import
fetch("data/Pokemon_Stats.csv")
  .then(r => r.text())
  .then(text => {
    const rows = text.split("\n");
    const seen = new Set();

    pokemonData = rows.slice(1)
      .map(row => row.split(","))
      .filter(cols => Number(cols[0]) <= 151 && cols[0] !== "")
      .map(cols => {
        const c = cols.map(v => v.replace(/"/g, "").trim());
        return {
          id: Number(c[0]), name: c[1], type1: c[3], type2: c[4] || null,
          total: Number(c[5]), hp: Number(c[6]), attack: Number(c[7]),
          defense: Number(c[8]), spAtk: Number(c[9]), spDef: Number(c[10]),
          speed: Number(c[11]), generation: Number(c[12])
        };
      })
      .filter(p => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });

    renderGrid(pokemonData);
  });

// #Grid Rendering
function renderGrid(data) {
  const grid = document.getElementById("pokemonGrid");
  grid.innerHTML = "";

  data.forEach(p => {
    const card = document.createElement("div");
    card.classList.add("poke-card");
    card.innerHTML = `
      <div class="poke-num">#${String(p.id).padStart(3, "0")}</div>
      <img class="poke-sprite" src="${getSprite(p.id)}" alt="${p.name}">
      <div class="poke-name">${p.name}</div>
    `;
    card.addEventListener("click", () => selectPokemon(p));
    grid.appendChild(card);
  });
}

// #Filtering
function filterPokemon() {
  const query = document.getElementById("searchInput").value.toLowerCase().trim();
  let filtered = pokemonData;

  if (query) {
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(query) || String(p.id).includes(query)
    );
  }
  if (activeType) {
    filtered = filtered.filter(p => p.type1 === activeType || p.type2 === activeType);
  }

  renderGrid(filtered);
}

function setType(type) {
  activeType = type;
  filterPokemon();
}

// #Tab Switching
function switchTab(tabName) {
  document.querySelectorAll(".tabContent").forEach(c => c.classList.remove("active"));
  document.getElementById(`${tabName}Tab`).classList.add("active");

  document.querySelectorAll(".tabBar button").forEach(b => b.classList.remove("active"));
  document.querySelector(`.tabBar button[data-tab="${tabName}"]`).classList.add("active");
}

// #Pokemon Detail View
function selectPokemon(p) {
  document.querySelector(".detailEmpty").style.display = "none";
  document.getElementById("detailView").style.display = "block";

  document.getElementById("detailSprite").src = getSprite(p.id);
  document.getElementById("detailNum").textContent = `#${String(p.id).padStart(3, "0")}`;
  document.getElementById("detailName").textContent = p.name;

  let typesHTML = `<span class="detailTypeBadge" style="background:${typeColors[p.type1]}">${p.type1}</span>`;
  if (p.type2) {
    typesHTML += `<span class="detailTypeBadge" style="background:${typeColors[p.type2]}">${p.type2}</span>`;
  }
  document.getElementById("detailTypes").innerHTML = typesHTML;

  playCry(p.name);
  switchTab("pokemon");
  renderStatBars(p);
}

// #Stat Bars
function renderStatBars(p) {
  const maxStat = 255;
  const stats = [
    { label: "HP",   cls: "hp",  value: p.hp },
    { label: "ATK",  cls: "atk", value: p.attack },
    { label: "DEF",  cls: "def", value: p.defense },
    { label: "SP.A", cls: "spa", value: p.spAtk },
    { label: "SP.D", cls: "spd", value: p.spDef },
    { label: "SPD",  cls: "spe", value: p.speed }
  ];

  document.getElementById("statBars").innerHTML = stats.map(s => {
    const pct = Math.min((s.value / maxStat) * 100, 100);
    return `
      <div class="statRow">
        <span class="statLabel">${s.label}</span>
        <span class="statValue">${s.value}</span>
        <div class="statBarTrack">
          <div class="statBarFill ${s.cls}" style="width: ${pct}%"></div>
        </div>
      </div>
    `;
  }).join("");
}