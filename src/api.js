import { drive } from "./config.js";

export const list = async (last = "", prefix = "") => {
  let options = { limit: 22, last, prefix, recursive: false };
  
  const result = await drive.list(options);
  const names = await result.names;
  const paging = await result.paging;

  if (!paging) {
    return { names, last: "" };
  }

  return { names, last: paging.last };
};

export const deleteDrawing = async (key) => {
  const deletedFile = await drive.delete(key);
  return deletedFile;
};

export const get = async (key) => {
  const buf = await drive.get(key);
  return buf;
};
