import React, { useState, useRef, useCallback } from "react";
import useList from "./useList";
import { deleteDrawing, get, checkFolder } from "./api.js";
import { downloadBlob } from "./util.js";

import DeleteButton from "./Buttons/Delete.js";
import DownloadButton from "./Buttons/Download.js";
import PreviewButton from "./Buttons/Preview.js";
import BackButton from "./Buttons/Back.js";
import "./Table.css";

export default function Table(props) {
  const [lastFile, setLastFile] = useState("");
  const [deleted, setDeleted] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [prefix, setPrefix] = useState(null);

  const imageTypes = [
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
  ];

  const { files, last, loading, error } = useList(
    props,
    lastFile,
    deleted,
    prefix
  );

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
  function isImage(key) {
    for (const type of imageTypes) {
      if (key.endsWith(type)) {
        return true;
      }
    }
    return false;
  }
  async function handleDelete(key) {
    try {
      const res = await deleteDrawing(props, key);
      setDeleted(key);
      // setFiles(files.filter((d) => d !== key));
    } catch (error) {
      console.log(error);
    }
  }

  function handleFolder(key) {
    prefix ? setPrefix((prevPrefix) => [...prevPrefix, key]) : setPrefix([key]);
  }

  async function handleDownload(key) {
    try {
      if (prefix) {
        key = `${prefix.join("")}${key}`;
      }

      const blob = await get(props, key);
      // const blobUrl = window.URL.createObjectURL(blob);
      // await fetch(blobUrl).then(async (r)=> {console.log(await r.blob()) })
      downloadBlob(blob, key);
    } catch (error) {
      console.log(error);
    }
  }

  async function handlePreview(key) {
    try {
      if (prefix) {
        key = `${prefix.join("")}${key}`;
      }
      let blob = await get(props, key);
      if (key.endsWith(".svg")) {
        blob = blob.slice(0, blob.size, "image/svg+xml");
      }
      const blobUrl = window.URL.createObjectURL(blob);
      setPreviewUrl(blobUrl);
      setShowPreview(true);
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <>
      {showPreview && previewUrl && (
        <div className="preview-container">
          <div className="preview-nav">
            <div
              className="back-icon"
              onClick={() => {
                setShowPreview(false);
                setPreviewUrl(null);
              }}
            >
              <BackButton />
            </div>
          </div>
          <div className="img-container">
            <img src={previewUrl} alt={previewUrl} />
          </div>
        </div>
      )}
      {prefix && prefix.length > 0 && (
        <div
          className="back-icon"
          onClick={() => {
            setPrefix(
              prefix.filter((p, index) => {
                if (index != (prefix.length-1)) {
                  return p
                }
              })
            );
          }}
        >
          <BackButton />
        </div>
      )}
      <div className="table">
        {files.map((d, index) => {
          return (
            <div
              className="table-row"
              ref={files.length === index + 1 ? lastElementRef : null}
              key={`${d}${index}`}
            >
              <div className="td">
                <div className="file-icon">
                  {checkFolder(d) ? (
                    <svg>
                      <path
                        d="M18.422 10h15.07c.84 0 1.508.669 1.508 1.493v18.014c0 .818-.675 1.493-1.508 1.493H6.508C5.668 31 5 30.331 5 29.507V8.493C5 7.663 5.671 7 6.5 7h7.805c.564 0 1.229.387 1.502.865l1.015 1.777s.4.358 1.6.358z"
                        fill="#D3D6DD"
                      ></path>
                    </svg>
                  ) : (
                    <svg fill="#D3D6DD" viewBox="0 0 20 20">
                      <path
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  )}
                </div>
              </div>
              <div className="td">
                <div
                  className="file-name"
                  onClick={() =>
                    checkFolder(d) ? handleFolder(d) : handleDownload(d)
                  }
                >
                  {d}
                </div>
              </div>

              {!checkFolder(d) && (
                <div className="td">
                  <div className="actions">
                    <button
                      className="action-btn"
                      onClick={async () => await handleDownload(d)}
                    >
                      <div className="action-icon">
                        <DownloadButton />
                      </div>
                    </button>
                    <button
                      className="action-btn"
                      onClick={async () => await handleDelete(d)}
                    >
                      <div className="action-icon">
                        <DeleteButton />
                      </div>
                    </button>

                    <button
                      className="action-btn"
                      disabled={!isImage(d)}
                      title={
                        !isImage(d)
                          ? "Preview only available for image files."
                          : `Preview ${d}`
                      }
                      onClick={() => handlePreview(d)}
                    >
                      <div className="action-icon" disabled={!isImage(d)}>
                        <PreviewButton />
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

        <div>{error && "Error"}</div>
      </div>
    </>
  );
}
