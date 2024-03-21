import { get, reset, resetkey, set } from "./session";

const getCursor = async (fid: string) => {
  const cursor = await get(fid, "cursor", "fc-tally-sd-010");
  return cursor;
};

const setCursor = async (fid: string, cursor: string) => {
  await set(fid, "cursor", cursor, "fc-tally-sd-010");
};

const getOrganizationId = async (fid: string) => {
  const organizationId = await get(fid, "organizationId", "fc-tally-sd-010");
  return organizationId;
};

const setOrganizationId = async (fid: string, organizationId: string) => {
  await set(fid, "organizationId", String(organizationId), "fc-tally-sd-010");
};

const getDaoId = async (fid: string) => {
  const daoId = await get(fid, "daoId", "fc-tally-sd-010");
  return daoId;
};

const setDaoId = async (fid: string, daoId: string) => {
  await set(fid, "daoId", String(daoId), "fc-tally-sd-010");
};

const getGovernorId = async (fid: string) => {
  const governorId = await get(fid, "governorId", "fc-tally-sd-010");
  return governorId;
};

const setGovernorId = async (fid: string, governorId: string) => {
  await set(fid, "governorId", String(governorId), "fc-tally-sd-010");
};

const getDaoSlug = async (fid: string) => {
  const daoSlug = await get(fid, "daoSlug", "fc-tally-sd-010");
  return daoSlug;
};

const setDaoSlug = async (fid: string, daoSlug: string) => {
  await set(fid, "daoSlug", String(daoSlug), "fc-tally-sd-010");
};

const resetCursor = async (fid: string) => {
  await resetkey(fid, "fc-tally-sd-010", "cursor");
};

const resetData = async (fid: string) => {
  await reset(fid, "fc-tally-sd-010");
};

export {
  getCursor,
  getDaoId,
  getDaoSlug,
  getGovernorId,
  getOrganizationId,
  resetCursor,
  resetData,
  setCursor,
  setDaoId,
  setDaoSlug,
  setGovernorId,
  setOrganizationId,
};
