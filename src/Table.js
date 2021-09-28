import React, { useState, useRef, useCallback } from "react";
import { DownloadCloud, ChevronLeft, Folder, File } from "react-feather";

import { get, put } from "./api.js";
import useList from "./useList";
import { downloadBlob } from "./util.js";

import "./Table.css";

export default function Table() {
  const [lastFile, setLastFile] = useState("");
  const [preview, setPreview] = useState(null);
  const [prefixes, setPrefixes] = useState([]);
  const [toastMsg, setToastMsg] = useState(null);

  const { files, last, loading, error } = useList(lastFile, prefixes);

  const observer = useRef();

  const lastElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && last) {
          setLastFile(last);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, last]
  );

  function handlePageChange(prefixes) {
    setLastFile("");
    setPrefixes(prefixes);
  }

  function handleFolder(file) {
    handlePageChange([...prefixes, file.name]);
  }

  async function handleDownload(file) {
    try {
      const blob = await get(file.rawName);
      downloadBlob(blob, file.name);
    } catch (error) {
      console.error(error);
    }
  }

  async function handlePreview(file) {
    try {
      let blob = await get(file.rawName);
      if (file.rawName.endsWith(".svg")) {
        blob = blob.slice(0, blob.size, "image/svg+xml");
      }
      const blobUrl = window.URL.createObjectURL(blob);
      setPreview({ name: file.name, url: blobUrl });
    } catch (error) {
      console.error(error);
    }
  }

  async function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    setToastMsg(null);
    const file = event.dataTransfer.files[0];
    let buffer = await file.arrayBuffer();
    buffer = new Uint8Array(buffer);
    const contentType = file.type;
    const key = file.name;

    try {
      await put(`${prefixes.join("/")}/${key}`, buffer, contentType);
      setToastMsg(`Uploaded ${key} successfully.`);
      setTimeout(() => {
        setToastMsg(null);
      }, 3000);
    } catch (error) {
      setToastMsg(`Failed to upload ${key} please try again.`);
      setTimeout(() => {
        setToastMsg(null);
      }, 3000);
    }
  }

  function handleDragEnter(event) {
    event.preventDefault();
    event.stopPropagation();
  }

  function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    setToastMsg(`Drop to upload the file.`);
  }

  function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    setToastMsg(null);
  }

  return (
    <div
      onDragEnter={(event) => handleDragEnter(event)}
      onDragLeave={(event) => handleDragLeave(event)}
      onDragOver={(event) => handleDragOver(event)}
      onDrop={async (event) => await handleDrop(event)}
    >
      <div className="prefixes">
        {prefixes.length > 0 ? (
          prefixes.map((prefix, index) => (
            <span
              key={`${prefix}${index}`}
              onClick={() => handlePageChange(prefixes.slice(0, index + 1))}
            >
              {prefix}&nbsp;/&nbsp;
            </span>
          ))
        ) : (
          <span>/</span>
        )}
      </div>
      {preview && (
        <div className="preview-container">
          <div className="preview-nav">
            <ChevronLeft
              className="back-icon"
              onClick={() => {
                setPreview(null);
              }}
            />
            <div>{preview.name}</div>
          </div>
          <div className="img-container">
            <img src={preview.url} alt={preview.name} />
          </div>
        </div>
      )}
      {!preview && (
        <div className="table">
          <div className="table-header">
            {prefixes.length > 0 ? (
              <ChevronLeft
                className="back-icon"
                onClick={() => handlePageChange(prefixes.slice(0, -1))}
              />
            ) : null}
            {prefixes.length > 0 ? prefixes[prefixes.length - 1] : "/"}
          </div>
          <div></div>
          <div className="rows">
            {files.map((file, index) => {
              return (
                <div
                  className="table-row"
                  ref={files.length === index + 1 ? lastElementRef : null}
                  key={`${file.rawName}${index}`}
                >
                  <div className="td">
                    <div className="file-icon">
                      {file.isFolder ? <Folder /> : <File />}
                    </div>
                  </div>
                  <div className="td">
                    {file.isFolder || file.isImage ? (
                      <div
                        className="file-name"
                        onClick={() =>
                          file.isFolder
                            ? handleFolder(file)
                            : handlePreview(file)
                        }
                      >
                        {file.name}
                      </div>
                    ) : (
                      <div className="file-name-disabled">{file.name}</div>
                    )}
                  </div>

                  {!file.isFolder && (
                    <div className="td">
                      <div className="actions">
                        <button
                          className="action-btn"
                          onClick={async () => await handleDownload(file)}
                        >
                          <div className="action-icon">
                            <DownloadCloud />
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {loading && (
              <div className="table-row">
                <div className="td"></div>
                <div className="td">
                  <div className="fileName">Loading...</div>
                </div>
              </div>
            )}
          </div>
          <div>{error}</div>
        </div>
      )}
      {toastMsg && (
        <div className="toast-container">
          <div className="upload-toast">
            <div className="toast-msg">{toastMsg}</div>
          </div>
        </div>
      )}
    </div>
  );
}
