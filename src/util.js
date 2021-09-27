export const downloadBlob = (blob, name) => {
  if (window.navigator && window.navigator.msSaveOrOpenBlob)
    return window.navigator.msSaveOrOpenBlob(blob);

  // For other browsers:
  // Create a link pointing to the ObjectURL containing the blob.
  const data = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = data;
  link.download = name;

  // this is necessary as link.click() does not work on the latest firefox
  link.dispatchEvent(
    new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window,
    })
  );

  setTimeout(() => {
    // For Firefox it is necessary to delay revoking the ObjectURL
    window.URL.revokeObjectURL(data);
    link.remove();
  }, 100);
};

export const checkFolder = (path) => {
  return path.endsWith("/");
};

export const removePrefix = (key, prefix) => {
  return key.replace(prefix, "");
};

export const removeTrailingSlash = (key) => {
  return key.replace(/\/$/, "");
};

export function checkImage(key) {
  for (const type of [
    ".apng",
    ".avif",
    ".gif",
    ".jpg",
    ".jpeg",
    ".jfif",
    ".pjpeg",
    ".pjp",
    ".png",
    ".svg",
    ".webp",
  ]) {
    if (key.endsWith(type)) {
      return true;
    }
  }
  return false;
}
