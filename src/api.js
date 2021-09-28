import { drive } from "./config.js";
import {
  checkImage,
  checkFolder,
  removePrefix,
  removeTrailingSlash,
} from "./util.js";

export const list = async (last = "", prefixes = []) => {
  const prefix = prefixes.join("/").concat("/");
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
    const prefixRemoved = removePrefix(name, prefix);
    return {
      rawName: name,
      isFolder,
      isImage,
      name: removeTrailingSlash(prefixRemoved),
      prefix,
      selected: false,
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

export const put = async (key, blob, contentType) => {
  const buf = await drive.put(key, { data: blob, contentType });
  return buf;
};
