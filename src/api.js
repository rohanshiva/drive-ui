import { drive } from "./config.js";
import { checkFolder, removePrefix, checkImage } from "./util.js";

export const list = async (last = "", prefix = "") => {
  const { paging, names } = await drive.list({
    limit: 22,
    last,
    prefix,
    recursive: false,
  });

  return { names: parseNames(names, prefix), last: paging?.last || "" };
};

const parseNames = (names = [], prefix = "") => {
  return names.map((name) => {
    const isFolder = checkFolder(name);
    const isImage = !isFolder && checkImage(name);
    return {
      rawName: name,
      isFolder,
      isImage,
      name: removePrefix(name, prefix),
      prefix,
    };
  });
};

export const deleteDrawing = async (key) => {
  const deletedFile = await drive.delete(key);
  return deletedFile;
};

export const get = async (key) => {
  const buf = await drive.get(key);
  return buf;
};
