const PAGE_SIZE = 10
let currentPage = 1;
let pokemons = []

String.prototype.toProperCase = function () {
  return this.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
};

const populateTypes = async () => {
  const res = await axios.get('https://pokeapi.co/api/v2/type');
  const types = res.data.results;
  types.forEach((type) => {
    var html = `
    <div class="form-check margin">
    <input class="form-check-input" type="checkbox" id="${type.name}" value="">
    <label class="form-check-label">
        ${type.name.toProperCase()}
    </label>
</div>
    `
    $('#typeSelect').append(html);
  }
  );
};

const updatePaginationDiv = (currentPage, numPages) => {
  $('#pagination').empty();

  let startPage = Math.max(currentPage - 2, 1);
  let endPage = Math.min(startPage + 4, numPages);

  if (endPage - startPage < 4) {
    startPage = Math.max(endPage - 4, 1);
  }

  if (startPage !== 1 || currentPage !== 1) {
    $('#pagination').append(`
    <button class="btn btn-primary page ml-1 numberedButtons${currentPage === 1 ? ' disabled' : ''}" value="${currentPage - 1}">&laquo; Previous</button>
  `);
  }

  for (let i = startPage; i <= endPage; i++) {
    $('#pagination').append(`
      <button class="btn btn-primary page ml-1 numberedButtons${i === currentPage ? ' active' : ''}" value="${i}">${i}</button>
    `);
  }

  if (endPage !== numPages || currentPage !== numPages) {
    $('#pagination').append(`
    <button class="btn btn-primary page ml-1 numberedButtons${currentPage === numPages ? ' disabled' : ''}" value="${currentPage + 1}">Next &raquo;</button>
  `);
  }
};

const paginate = async (currentPage, PAGE_SIZE, pokemons) => {
  selected_pokemons = pokemons.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  $('#titleInfo').empty();
  $('#titleInfo').append(`
    <h1 class="justify-content-center-header">Displaying ${Math.min(PAGE_SIZE, pokemons.length - (currentPage - 1) * PAGE_SIZE)} of ${pokemons.length} Pokemon</h1>
    `);

  $('#pokeCards').empty();
  selected_pokemons.forEach(async (pokemon) => {
    const res = await axios.get(pokemon.url);
    $('#pokeCards').append(`
      <div class="pokeCard card" pokeName=${res.data.name}>
        <h4>${res.data.name.toUpperCase()}</h4>
        <img src="${res.data.sprites.front_default}" alt="${res.data.name}"/>
        <button type="button" class="btn btn-primary margin" data-toggle="modal" data-target="#pokeModal">
          More
        </button>
      </div>
    `);
  });
};

const typeApplyButton = async () => {
  let selectedTypes = [];
  $('#typeSelect input:checked').each(function () {
    selectedTypes.push($(this).attr('id'));
  });
};




const setup = async () => {
  // test out poke api using axios here
  populateTypes();

  $('#pokeCards').empty()
  let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
  pokemons = response.data.results;


  paginate(currentPage, PAGE_SIZE, pokemons)
  const numPages = Math.ceil(pokemons.length / PAGE_SIZE)
  updatePaginationDiv(currentPage, numPages)


  // pop up modal when clicking on a pokemon card
  // add event listener to each pokemon card
  $('body').on('click', '.pokeCard', async function (e) {
    const pokemonName = $(this).attr('pokeName')
    // console.log("pokemonName: ", pokemonName);
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
    // console.log("res.data: ", res.data);
    const types = res.data.types.map((type) => type.type.name)
    // console.log("types: ", types);
    $('.modal-body').html(`
        <div style="width:200px">
        <img src="${res.data.sprites.other['official-artwork'].front_default}" alt="${res.data.name}"/>
        <div>
        <h3>Abilities</h3>
        <ul>
        ${res.data.abilities.map((ability) => `<li>${ability.ability.name}</li>`).join('')}
        </ul>
        </div>

        <div>
        <h3>Stats</h3>
        <ul>
        ${res.data.stats.map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
        </ul>

        </div>

        </div>
          <h3>Types</h3>
          <ul>
          ${types.map((type) => `<li>${type}</li>`).join('')}
          </ul>
      
        `)
    $('.modal-title').html(`
        <h2>${res.data.name.toUpperCase()}</h2>
        <h5>${res.data.id}</h5>
        `)
  })

  // add event listener to pagination buttons
  $('body').on('click', ".numberedButtons", async function (e) {
    currentPage = Number(e.target.value)
    if (//if the variable typePokemons does not exist
      typeof typePokemons === 'undefined') {
      paginate(currentPage, PAGE_SIZE, pokemons)

      //update pagination buttons
      updatePaginationDiv(currentPage, numPages)
    }
    else {
      paginate(currentPage, PAGE_SIZE, typePokemons)

      //update pagination buttons
      updatePaginationDiv(currentPage, Math.ceil(typePokemons.length / PAGE_SIZE))
    }

  })

  // add event listener to type apply button
  $('body').on('click', "#typeApplyButton", async function () {
    let selectedTypes = [];
    let currentPage = 1;
    $('#typeSelect input:checked').each(function () {
      selectedTypes.push($(this).attr('id'));
    }
    );
    console.log(selectedTypes);
    typePokemons = []
    if (selectedTypes.length === 1) {
      pokemons.forEach((pokemon) => {
        var checkPokemon = pokemonWithTypes.filter((poke) => poke.name === pokemon.name)[0]
        // console.log(checkPokemon);
        if (checkPokemon.types.some((type) => selectedTypes.includes(type))) {
          typePokemons.push(pokemon)
          return
        }
      })
      console.log(typePokemons);
    }
    else {
      pokemons.forEach((pokemon) => {
        var checkPokemon = pokemonWithTypes.filter((poke) => poke.name === pokemon.name)[0];
        if (selectedTypes.every((type) => checkPokemon.types.includes(type))) {
          typePokemons.push(pokemon);
        }
      });
      console.log(typePokemons);
    }

    paginate(currentPage, PAGE_SIZE, typePokemons)
    updatePaginationDiv(currentPage, Math.ceil(typePokemons.length / PAGE_SIZE))

  }
  )
  pokemonWithTypes = []
  await pokemons.forEach(async (pokemon) => {
    const res = await axios.get(pokemon.url);
    var pokemonTypes = []
    res.data.types.forEach((type) => {
      pokemonTypes.push(type.type.name)
      pokemonWithTypes.push({
        name: res.data.name,
        types: pokemonTypes
      });
    });
  });

}


$(document).ready(setup)