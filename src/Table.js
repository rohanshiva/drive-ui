import React, { useState, useRef, useCallback } from "react";
import useList from "./useList";
import { deleteDrawing, get } from "./api.js";
import { downloadBlob } from "./util.js";

import {
  Trash2,
  DownloadCloud,
  ChevronLeft,
  Folder,
  File,
} from "react-feather";
import "./Table.css";

export default function Table() {
  const [lastFile, setLastFile] = useState("");
  const [deleted, setDeleted] = useState("");
  const [preview, setPreview] = useState(null);
  const [prefixes, setPrefixes] = useState([]);

  const {
    files = [],
    last,
    loading,
    error,
  } = useList(lastFile, deleted, prefixes);

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

  async function handleDelete(key) {
    try {
      key = `${prefixes.join("")}${key}`;
      const res = await deleteDrawing(key);
      if (files.length === 1) {
        setPrefixes(
          prefixes.filter((_, index) => index !== prefixes.length - 1)
        );
      } else {
        setDeleted(key);
      }
    } catch (error) {
      console.error(error);
    }
  }

  function handleFolder(file) {
    setPrefixes([...prefixes, file.name]);
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
      setPreview({ name: file.rawName, url: blobUrl });
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <>
      <div
        className="prefixes"
        onClick={() =>
          setPrefixes(
            prefixes.filter((_, index) => index !== prefixes.length - 1)
          )
        }
      >
        {prefixes.length > 0 ? prefixes.join("") : "/"}
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
            {prefixes.length > 0 ? prefixes.join("") : "/"}
          </div>
          <div></div>
          <div className="rows">
            {files.map((file, index) => {
              return (
                <div
                  className="table-row"
                  ref={files.length === index + 1 ? lastElementRef : null}
                  key={`${file}${index}`}
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
          <div>{error && "Error"}</div>
        </div>
      )}
    </>
  );
}
