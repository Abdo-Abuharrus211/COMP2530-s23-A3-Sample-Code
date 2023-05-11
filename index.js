const PAGE_SIZE = 10;
let currentPage = 1;
let pokemons = [];

const updatePaginationDiv = (currentPage, numPages) => {
  $("#pagination").empty();

  const startPage = 1;
  const endPage = numPages;
  for (let i = startPage; i <= endPage; i++) {
    $("#pagination").append(`
      <button class="btn btn-primary page ml-1 numberedButtons" value="${i}">${i}</button>
    `);
  }
};

const paginate = async (currentPage, PAGE_SIZE, filteredPokemons) => {
  const selectedPokemons = filteredPokemons.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  $("#pokeCards").empty();
  for (const pokemon of selectedPokemons) {
    const res = await axios.get(pokemon.url);
    $("#pokeCards").append(`
      <div class="pokeCard card" pokeName=${res.data.name} category=${pokemon.category}>
        <h3>${res.data.name.toUpperCase()}</h3>
        <img src="${res.data.sprites.front_default}" alt="${res.data.name}"/>
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#pokeModal">
          More
        </button>
      </div>
    `);
  }
};

const setup = async () => {
  // test out poke api using axios here
  $("#pokeCards").empty();
  const response = await axios.get("https://pokeapi.co/api/v2/pokemon?offset=0&limit=810");
  pokemons = response.data.results.map((pokemon) => ({ ...pokemon, category: "all" }));

  const categories = ["all", "fire", "water", "grass", "electric", "ice", "rock", "ground", "flying", "poison"];
  const categoryOptions = categories.map((category) => `<option value="${category}">${category.toUpperCase()}</option>`);
  $("#categoryFilter").html(categoryOptions);

  // filter pokemons by category
  $("#categoryFilter").on("change", function () {
    const selectedCategory = $(this).val();
    if (selectedCategory === "all") {
      for (const pokemon of filteredPokemons) {
        $(`.pokeCard[category="${pokemon.category}"]`).show();
      }
      paginate(currentPage, PAGE_SIZE, pokemons);
    } else {
      const filteredPokemons = pokemons.filter((pokemon) => pokemon.category === selectedCategory);
      for (const pokemon of pokemons) {
        if (pokemon.category === selectedCategory) {
          $(`.pokeCard[category="${pokemon.category}"]`).show();
        } else {
          $(`.pokeCard[category="${pokemon.category}"]`).hide();
        }
      }
      paginate(currentPage, PAGE_SIZE, filteredPokemons);
    }
    currentPage = 1;
    const numPages = Math.ceil(filteredPokemons.length / PAGE_SIZE);
    updatePaginationDiv(currentPage, numPages);
  });

  paginate(currentPage, PAGE_SIZE, pokemons);
  const numPages = Math.ceil(pokemons.length / PAGE_SIZE);
  updatePaginationDiv(currentPage, numPages);

  // pop up modal when clicking on a pokemon card
  // add event listener to each pokemon card
  $("body").on("click", ".pokeCard", async function (e) {
    const pokemonName = $(this).attr("pokeName");
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
    const types = res.data.types.map((type) => type.type.name);
    // update modal with pokemon data
    const pokemonData = {
      name: res.data.name,
      imageUrl: res.data.sprites.front_default,
      type: res.data.types.map((type) => type.type.name),
      height: res.data.height,
      weight: res.data.weight,
    };

    $("#pokeModalLabel").html(pokemonData.name.toUpperCase());
    $("#pokeModalImg").attr("src", pokemonData.imageUrl);
    $("#pokeType").html(pokemonData.type.join(", "));
    $("#pokeHeight").html(pokemonData.height);
    $("#pokeWeight").html(pokemonData.weight);
  });

  // change page when clicking on numbered button
  $("body").on("click", ".numberedButtons", async function (e) {
    currentPage = parseInt($(this).val());
    const selectedCategory = $("#categoryFilter").val();
    if (selectedCategory === "all") {
      paginate(currentPage, PAGE_SIZE, pokemons);
    } else {
      const filteredPokemons = pokemons.filter((pokemon) => pokemon.category === selectedCategory);
      paginate(currentPage, PAGE_SIZE, filteredPokemons);
    }
    const numPages = Math.ceil(filteredPokemons.length / PAGE_SIZE);
    updatePaginationDiv(currentPage, numPages);
  });

  // change page when clicking on prev/next button
  $("#prevBtn").on("click", async function () {
    if (currentPage > 1) {
      currentPage--;
      const selectedCategory = $("#categoryFilter").val();
      if (selectedCategory === "all") {
        paginate(currentPage, PAGE_SIZE, pokemons);
      } else {
        const filteredPokemons = pokemons.filter((pokemon) => pokemon.category === selectedCategory);
        paginate(currentPage, PAGE_SIZE, filteredPokemons);
      }
      const numPages = Math.ceil(filteredPokemons.length / PAGE_SIZE);
      updatePaginationDiv(currentPage, numPages);
    }
  });

  $("#nextBtn").on("click", async function () {
    const selectedCategory = $("#categoryFilter").val();
    const numPages = Math.ceil(filteredPokemons.length / PAGE_SIZE);
    if (currentPage < numPages) {
      currentPage++;
      if (selectedCategory === "all") {
        paginate(currentPage, PAGE_SIZE, pokemons);
      } else {
        const filteredPokemons = pokemons.filter((pokemon) => pokemon.category === selectedCategory);
        paginate(currentPage, PAGE_SIZE, filteredPokemons);
      }
      updatePaginationDiv(currentPage, numPages);
    }
  });
};

$(document).ready(setup);
