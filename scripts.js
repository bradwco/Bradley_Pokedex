/* Data Sources:
Sprites - Repository: https://github.com/PokeAPI/sprites
  Pattern: https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{id}.png
Audios(?) - Pokemon Showdown: https://github.com/smogon/pokemon-showdown-client, https://github.com/PokeAPI/cries
  Pattern: https://play.pokemonshowdown.com/audio/cries/{name}.mp3
Stats - Repository: https://github.com/lgreski/pokemonData, https://pokemondb.net  
*/

// Stats Importing 
// "ID","Name","Form","Type1","Type2","Total","HP","Attack","Defense","Sp. Atk","Sp. Def","Speed","Generation"

let pokemonData = [];
fetch("data/Pokemon_Stats.csv")
  .then(response => response.text())
  .then(text => {
    const rows = text.split("\n")
    const headers = rows[0].split(",")

    const pokemon = rows.slice(1)
      .map(row => row.split(","))
      .filter(cols => Number(cols[0]) <= 151 && cols[0] != "")
      .map(cols => {
        const clean = cols.map(c => c.replace(/"/g, "").trim());
        
        return {
          id: Number(clean[0]),
          name: clean[1],
          type1: clean[3],
          type2: clean[4] || null,
          hp: Number(clean[5]),
          attack: Number(clean[6]),
          defense: Number(clean[7]),
          spAtk: Number(clean[8]),
          spDef: Number(clean[9]),
          speed: Number(clean[10]),
          generation: Number(clean[11])
        };
      });
      pokemonData = pokemon;
      init();
  }); 

  // Sprite Getter
  function getSprite(id){
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
  }

  // Sound Getter
  function getSound(name){
    return `https://play.pokemonshowdown.com/audio/cries/${name}.mp3`
  }

  // Render Grid of Pokemon
  function renderGrid(data){
    const grid = document.getElementById("pokemonGrid");
    grid.innerHTML = "";

    data.forEach(p => {
      const card = document.createElement("div")
      card.classList.add("poke-card")
      card.innerHTML = `
        <div class="poke-num">#${String(p.id).padStart(3, "0")}</div>
        <img class="poke-sprite" src="${getSprite(p.id)}" alt="${p.name}">
        <div class="poke-name">${p.name}</div>
        <div class="poke-types-row">
          <span class="poke-type-pip">${p.type1}</span>
          ${p.type2 ? `<span class="poke-type-pip">${p.type2}</span>` : ""}
        </div>
      `;
      grid.appendChild(card);
    });
  }

  function init(){
    renderGrid(pokemonData)
  }