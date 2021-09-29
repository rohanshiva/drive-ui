import styled from "@emotion/styled";
import { ThemeProvider } from "@emotion/react";
import React, { useState, useRef, useCallback } from "react";
import {
  File,
  Trash2,
  Folder,
  ChevronLeft,
  DownloadCloud,
} from "react-feather";

import useList from "../hooks/useList";
import useToggle from "../hooks/useToggle";
import { downloadBlob } from "../utils/util";
import DetaModal from "../_components/DetaModal";
import { get, put, deleteKeys } from "../api/api";
import ConfirmDelete from "../_components/ConfirmDelete";

import "./Table.css";

const Prefixes = styled.div`
  margin-top: 2rem;
  font-weight: 700;
  font-size: 20px;
  margin-bottom: 2rem;
  cursor: pointer;
`;

const PrefixSpan = styled.span`
  color: #82838d;
  &:last-child {
    color: #2e2e32;
  }
  &:hover {
    color: #2e2e32;
  }
`;

const PreviewContainer = styled.div`
  width: 998px;
  max-height: 80vh;
  color: #77777c;
  display: flex;
  flex-direction: column;
  background-color: #f5f4f7;
  border: 1px solid #777984;
  border-radius: 5px;
  cursor: pointer;
  overflow: hidden;
`;

const PreviewNav = styled.div`
  height: 40px;
  color: #2e2e32;
  font-weight: 700;
  min-height: 40px;
  display: flex;
  padding: 0.25rem 1rem;
  align-items: center;
  justify-content: space-between;
  background-color: #eae5e5;
  border-bottom: 1px solid #777984;
`;

const PreviewLeft = styled.div`
  display: flex;
  align-items: center;
`;

const PreviewRight = styled.div`
  display: flex;
  align-items: center;
`;

const ImgContainer = styled.div`
  display: grid;
  place-items: center;
  height: 100%;
  width: 100%;
`;

export default function Table({ theme }) {
  const [preview, setPreview] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [modalOpen, toggleModal] = useToggle();

  const {
    files,
    prefixes,
    last,
    loading,
    error,
    setFiles,
    setLast,
    setPrefixes,
  } = useList();

  const observer = useRef();

  const lastElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && last) {
          setLast(last);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, last, setLast]
  );

  function handlePageChange(prefixes) {
    setLast("");
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
      setPreview({ file, name: file.name, url: blobUrl });
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

  function onChangeCheckBox(event, index) {
    const selectedFile = files.api[index];
    const checked = event.target.checked;
    const selected = checked
      ? [...files.selected, selectedFile.rawName]
      : files.selected.filter((s) => s !== selectedFile.rawName);
    setFiles({
      selected,
      api: Object.assign([...files.api], {
        [index]: {
          ...selectedFile,
          selected: checked,
        },
      }),
    });
  }

  function handleDelete(keys) {
    deleteKeys(keys)
      .then((res) => {
        const deleted = res?.deleted || [];
        setFiles({
          selected: [],
          api: files.api.filter((file) => {
            return !deleted.includes(file.rawName);
          }),
        });
        toggleModal();
      })
      .catch((err) => {
        console.error(err);
      });
  }

  function handlePreviewDelete() {
    handleDelete([preview.file.rawName]);
    setPreview(null);
  }

  function handleSelectedDelete() {
    handleDelete(files.selected);
  }

  return (
    <ThemeProvider theme={theme}>
      <div
        onDragEnter={(event) => handleDragEnter(event)}
        onDragLeave={(event) => handleDragLeave(event)}
        onDragOver={(event) => handleDragOver(event)}
        onDrop={async (event) => await handleDrop(event)}
      >
        <Prefixes>
          {prefixes.length > 0 ? (
            prefixes.map((prefix, index) => (
              <PrefixSpan
                key={`${prefix}${index}`}
                onClick={() => handlePageChange(prefixes.slice(0, index + 1))}
              >
                {prefix}&nbsp;/&nbsp;
              </PrefixSpan>
            ))
          ) : (
            <PrefixSpan>/</PrefixSpan>
          )}
        </Prefixes>
        {preview && (
          <PreviewContainer>
            <PreviewNav>
              <PreviewLeft>
                <ChevronLeft
                  className="header-icon mgr-10px"
                  onClick={() => {
                    setPreview(null);
                  }}
                />
                <div>{preview.name}</div>
              </PreviewLeft>

              <PreviewRight>
                <DownloadCloud
                  className="header-icon mgr-10px"
                  onClick={async () => await handleDownload(preview.file)}
                />
                <Trash2
                  className="header-icon"
                  onClick={() => {
                    toggleModal();
                  }}
                />
              </PreviewRight>
            </PreviewNav>
            <ImgContainer>
              <img src={preview.url} alt={preview.name} />
            </ImgContainer>
          </PreviewContainer>
        )}
        {!preview && (
          <div className="table">
            <div className="table-header">
              <div className="left">
                {prefixes.length > 0 && files.selected.length === 0 ? (
                  <>
                    <ChevronLeft
                      className="header-icon mgr-10px"
                      onClick={() => handlePageChange(prefixes.slice(0, -1))}
                    />
                    {prefixes[prefixes.length - 1]}
                  </>
                ) : files.selected.length === 0 ? (
                  "/"
                ) : (
                  `${files.selected.length} item${
                    files.selected.length > 1 ? "s" : ""
                  } selected`
                )}
              </div>
              <div className="right">
                {files.selected.length !== 0 ? (
                  <Trash2
                    className="header-icon"
                    onClick={() => toggleModal()}
                  />
                ) : null}
              </div>
            </div>
            <div></div>
            <div className="rows">
              {files.api.map((file, index) => {
                return (
                  <div
                    className="table-row"
                    ref={files.api.length === index + 1 ? lastElementRef : null}
                    key={`${file.rawName}${index}`}
                  >
                    <div className="td">
                      <div className="checkbox-icon">
                        <div className="checkbox">
                          <input
                            type="checkbox"
                            checked={file.selected}
                            disabled={file.isFolder}
                            onChange={(e) => onChangeCheckBox(e, index)}
                          />
                        </div>
                        <div className="file-icon">
                          {file.isFolder ? <Folder /> : <File />}
                        </div>
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
      <DetaModal isOpen={modalOpen} toggleModal={toggleModal}>
        <ConfirmDelete
          count={preview ? 1 : files.selected.length}
          errorMessage={error}
          onConfirm={() =>
            preview ? handlePreviewDelete() : handleSelectedDelete()
          }
          onCancel={toggleModal}
        />
      </DetaModal>
    </ThemeProvider>
  );
}
