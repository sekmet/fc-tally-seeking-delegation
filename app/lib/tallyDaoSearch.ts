import { daoSearch } from "./daoSearch";
import { trimLeft, trimLeftPlus } from "./parseInput";

export async function fetchDaoResults(searchInput: string) {
  if (searchInput === null || searchInput === "" || searchInput === undefined) {
    return [];
  }

  const daoResult = await daoSearch(
    String(trimLeft(trimLeftPlus(searchInput).split("+").join(" "))),
  );

  return daoResult ?? [];
}
