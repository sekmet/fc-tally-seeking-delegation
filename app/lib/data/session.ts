import { kv } from "@vercel/kv";

export const MAXIMUM_KV_RESULT_LIFETIME_IN_SECONDS = 15 * 60; // 3 minutes

export async function get(fid: string, key: string, namespace: string = "") {
  if (!fid) {
    return null;
  }
  return await kv.hget(`session-${namespace}-${fid}`, key);
}

export async function getAll(fid: string, namespace: string = "") {
  if (!fid) {
    return null;
  }
  return await kv.hgetall(`session-${namespace}-${fid}`);
}

export async function set(
  fid: string,
  key: string,
  value: string,
  namespace: string = "",
) {
  await kv.expire(
    `session-${namespace}-${fid}`,
    MAXIMUM_KV_RESULT_LIFETIME_IN_SECONDS,
  );
  return await kv.hset(`session-${namespace}-${fid}`, { [key]: value });
}

export async function reset(fid: string, namespace: string = "") {
  return await kv.del(`session-${namespace}-${fid}`);
}
