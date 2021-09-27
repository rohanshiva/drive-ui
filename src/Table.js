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
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [prefixes, setPrefixes] = useState([]);
  const [selected, setSelected] = useState("");

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

  function handleFolder(key) {
    setPrefixes([...prefixes, key]);
  }

  async function handleDownload(key) {
    try {
      const blob = await get(key);
      downloadBlob(blob, key);
    } catch (error) {
      console.error(error);
    }
  }

  async function handlePreview(key) {
    try {
      let blob = await get(key);
      if (key.endsWith(".svg")) {
        blob = blob.slice(0, blob.size, "image/svg+xml");
      }
      const blobUrl = window.URL.createObjectURL(blob);
      setPreviewUrl(blobUrl);
      setSelected(key);
      setShowPreview(true);
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
      {showPreview && previewUrl && (
        <div className="preview-container">
          <div className="preview-nav">
            <ChevronLeft
              className="back-icon"
              onClick={() => {
                setShowPreview(false);
                setPreviewUrl(null);
              }}
            />
            <div>{selected}</div>
          </div>
          <div className="img-container">
            <img src={previewUrl} alt={previewUrl} />
          </div>
        </div>
      )}
      {!showPreview && (
        <div className="table">
          <div className="table-header">
            {prefixes.length > 0 ? prefixes.join("") : "/"}
          </div>
          <div></div>
          <div className="rows">
            {files.map((d, index) => {
              return (
                <div
                  className="table-row"
                  ref={files.length === index + 1 ? lastElementRef : null}
                  key={`${d}${index}`}
                >
                  <div className="td">
                    <div className="file-icon">
                      {d.isFolder ? <Folder /> : <File />}
                    </div>
                  </div>
                  <div className="td">
                    {d.isFolder || d.isImage ? (
                      <div
                        className="file-name"
                        onClick={() =>
                          d.isFolder
                            ? handleFolder(d.name)
                            : handlePreview(d.rawName)
                        }
                      >
                        {d.name}
                      </div>
                    ) : (
                      <div className="file-name-disabled">{d.name}</div>
                    )}
                  </div>

                  {!d.isFolder && (
                    <div className="td">
                      <div className="actions">
                        <button
                          className="action-btn"
                          onClick={async () => await handleDownload(d)}
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
