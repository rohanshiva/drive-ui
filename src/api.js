import {Deta} from "deta";

export const list = async (props, last="", prefix=null) => {
    const deta = Deta(props.projectKey);
    const drive = deta.Drive(props.driveName);
    let result;
    if (prefix) {
        result = last ? await drive.list({limit: 22, last, prefix}) : await drive.list({limit:22, prefix})
    } else {
        result = last ? await drive.list({limit: 22, last}) : await drive.list({limit:22})
    }
    let names = await result.names;
    let paging = await result.paging;
    if (!paging) {
        return {names, last: ""}
    }

    return {names, last: paging.last}
}

export const deleteDrawing = async (props, key) => {
    const deta = Deta(props.projectKey);
    const drive = deta.Drive(props.driveName);
    const deletedFile = await drive.delete(key);
    return deletedFile;
}

export const get = async (props, key) => {
    const deta = Deta(props.projectKey);
    const drive = deta.Drive(props.driveName);

    const buf = await drive.get(key);
    return buf;
}

export const checkFolder = (path) => {
    for (const c of path) {
        if (c === "/") {
            return true
        }
    }
    return false
}

export const filterFolders = (files, prevFolder = null, prefix=null)  => {
    files = files.map((file) => file.startsWith(prefix) ? file.split(prefix)[1] : file)
    const res = [];
    for (const file of files) {
        if (checkFolder(file)) {
            const folder = `${file.split("/")[0]}/`
            if (prevFolder !== folder) {
                prevFolder = folder
                res.push(folder)
            }
        } else {
            res.push(file)
        }
    }
    return res
}

