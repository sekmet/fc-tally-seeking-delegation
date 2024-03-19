import { kv } from "@vercel/kv";

export async function get(fid: string, key: string, namespace: string = "") {
  if (!fid) {
    return null;
  }
  console.log(`GET session-${namespace}-${fid}`);
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
  console.log(`SET session-${namespace}-${fid}`);
  return await kv.hset(`session-${namespace}-${fid}`, { [key]: value });
}

export async function reset(fid: string, namespace: string = "") {
  console.log(`DEL/RESET session-${namespace}-${fid}`);
  return await kv.del(`session-${namespace}-${fid}`);
}
