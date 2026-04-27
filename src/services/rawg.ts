import axios from "axios";

const apiKey = import.meta.env.RAWG_API_KEY;

const api = axios.create({
  baseURL: "https://api.rawg.io/api",
  params: {
    key: apiKey,
  },
});

function formatGame(game: any) {
  const platforms = game.platforms?.map((item: any) => item.platform.name) ?? [];

  return {
    id: game.id,
    slug: game.slug,
    name: game.name,
    background_image: game.background_image,
    platforms,
  };
}

function formatGameResults(data: any) {
  let results = [];

  for (let i = 0; i < data.results.length; i++) {
    results.push(formatGame(data.results[i]));
  }

  return {
    ...data,
    results,
  };
}

async function fetchGames(params: object) {
  const { data } = await api.get("/games", {
    params: {
      page: params.page || 1,
      page_size: 20,
      ...params,
    },
  });

  return formatGameResults(data);
}

export async function getGames(page = 1) {
  return fetchGames({ page });
}

export async function searchGames(searchTerm: string, page = 1) {
  return fetchGames({ search: searchTerm, page });
}

export async function getPopularGames(page = 1) {
  return fetchGames({ ordering: "-added", page });
}

export async function getNewestGames(page = 1) {
  return fetchGames({ ordering: "-released", page });
}

export async function getRecentlyUpdatedGames(page = 1) {
  return fetchGames({ ordering: "-updated", page });
}

export async function getTopRatedGames(page = 1) {
  return fetchGames({ ordering: "-rating", page });
}

export async function getGamesByGenre(genre: string, page = 1) {
  return fetchGames({ genres: genre, page });
}

export async function getGamesByPlatform(platform: string | number, page = 1) {
  return fetchGames({ platforms: platform, page });
}

export async function getGamesByDeveloper(developer: string, page = 1) {
  return fetchGames({ developers: developer, page });
}

export async function getGamesByPublisher(publisher: string, page = 1) {
  return fetchGames({ publishers: publisher, page });
}

export async function getGamesByTag(tag: string, page = 1) {
  return fetchGames({ tags: tag, page });
}

export async function getGameById(id: string | number) {
  const { data } = await api.get(`/games/${id}`);
  return formatGame(data);
}

export async function getSuggestedGames(id: string | number) {
  const { data } = await api.get(`/games/${id}/suggested`);
  return formatGameResults(data);
}

export async function getGenres() {
  const { data } = await api.get("/genres");
  return data;
}

export async function getPlatforms() {
  const { data } = await api.get("/platforms");
  return data;
}

export async function getPublishers() {
  const { data } = await api.get("/publishers");
  return data;
}

export async function getTags() {
  const { data } = await api.get("/tags");
  return data;
}

// async function test() {
//   try {
//     let data = await searchGames("zelda");
//     console.log(data.results);
//   } catch (e) {
//     console.error(e);
//   }
// }

// test();
