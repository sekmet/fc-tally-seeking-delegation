import { daoSearch } from "./daoSearch";
import { trimLeftPlus } from "./parseInput";

export async function fetchDaoResults(searchInput: string) {
  if (searchInput === null || searchInput === "" || searchInput === undefined) {
    return [];
  }

  const daoResult = await daoSearch(
    String(trimLeftPlus(searchInput).split("+").join(" ")),
  );

  return daoResult ?? [];
}
