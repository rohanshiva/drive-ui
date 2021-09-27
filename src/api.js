import { drive } from "./config.js";

export const list = async (last = "", prefix = "") => {
  const { paging, names } = await drive.list({
    limit: 22,
    last,
    prefix,
    recursive: false,
  });

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
