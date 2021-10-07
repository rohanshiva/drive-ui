import { Deta } from "deta";

import {
  checkImage,
  checkFolder,
  removePrefix,
  removeTrailingSlash,
  checkTextFile,
} from "../utils/util";
import { getAccessToken } from "../utils/auth";

export default class API {
  constructor(idOrKey, drive) {
    this.idOrKey = idOrKey;
    this.drive = drive;
  }

  async list(last = "", prefixes = []) {
    const prefix = prefixes.join("/").concat("/");
    const drive = await API.driveObject(this.idOrKey, this.drive);
    const { paging, names } = await drive.list({
      limit: 22,
      last,
      prefix,
      recursive: false,
    });

    return { names: API.parseNames(names, prefix), last: paging?.last || "" };
  }

  async deleteKeys(keys = []) {
    const drive = await API.driveObject(this.idOrKey, this.drive);
    const res = await drive.deleteMany(keys);
    return res;
  }

  async get(key) {
    const drive = await API.driveObject(this.idOrKey, this.drive);
    const buf = await drive.get(key);
    return buf;
  }

  async put(key, prefixes = [], blob, contentType) {
    const prefix = prefixes.length ? prefixes.join("/").concat("/") : "";
    const drive = await API.driveObject(this.idOrKey, this.drive);
    const res = await drive.put(`${prefix}${key}`, { data: blob, contentType });
    return API.parseNames([res], prefix);
  }

  static async driveObject(idOrKey, drive) {
    if (process.env.REACT_APP_ENV !== "standalone") {
      const token = `Bearer ${await getAccessToken()}`;
      return Deta(idOrKey, token).Drive(drive);
    }

    return Deta(idOrKey).Drive(drive);
  }

  static parseNames(names = [], prefix = "") {
    return names.map((name) => {
      const isFolder = checkFolder(name);
      const isImage = !isFolder && checkImage(name);
      const prefixRemoved = removePrefix(name, prefix);
      const language = checkTextFile(name);
      
      return {
        rawName: name,
        isFolder,
        isImage,
        language,
        name: removeTrailingSlash(prefixRemoved),
        prefix,
        selected: false,
      };
    });
  }
}
