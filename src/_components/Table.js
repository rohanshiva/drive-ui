import { ThemeProvider } from "@emotion/react";
import styled from "@emotion/styled";

import DetaModal from "../_components/DetaModal";
import React, { useState, useRef, useCallback } from "react";

import { margin, padding } from "../styles/_formatting";
import {
  smallTextStyle,
  regularTextStyle,
  largeBoldTextStyle,
} from "../styles/_typographies.js";

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
import { get, put, deleteKeys } from "../api/api";
import ConfirmDelete from "../_components/ConfirmDelete";

import "./Table.css";

const TableDiv = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #fff8f8;
  border: 1px solid ${(props) => props.theme.colors.primary2};
  border-radius: 5px;
  overflow: hidden;
  width: 998px;
  max-height: 80vh;
  color: ${(props) => props.theme.colors.primary2};
`;

const PrefixesDiv = styled.div`
  ${largeBoldTextStyle};
  font-weight: 700;
  cursor: pointer;
  ${margin("top", 3)};
  ${margin("bottom", 3)};
`;

const TableRows = styled.div`
  overflow-y: scroll;
`;

const TableHeader = styled.div`
  color: ${(props) => props.theme.colors.header};
  font-weight: 700;
  min-height: 40px;
  max-height: 40px;
  display: flex;
  ${padding("top", 0.1)};
  ${padding("bottom", 0.1)};
  ${padding("right", 2)};
  ${padding("left", 2)};
  align-items: center;
  justify-content: space-between;
  background-color: ${(props) => props.theme.colors.headerBg};
  border-bottom: 1px solid ${(props) => props.theme.colors.primary2};
`;

const TableRow = styled.div`
  ${padding("top", 0.1)};
  ${padding("bottom", 0.1)};
  ${padding("right", 2)};
  ${padding("left", 2)};
  display: grid;
  align-items: center;
  grid-template-columns: fit-content(4rem) 2fr 1fr;
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
        <PrefixesDiv className="prefixes">
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
        </PrefixesDiv>
        {preview && (
          <div className="preview-container">
            <div className="preview-nav">
              <div className="left">
                <ChevronLeft
                  className="header-icon mgr-10px"
                  onClick={() => {
                    setPreview(null);
                  }}
                />
                <div>{preview.name}</div>
              </div>

              <div className="right">
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
              </div>
            </div>
            <div className="img-container">
              <img src={preview.url} alt={preview.name} />
            </div>
          </div>
        )}
        {!preview && (
          <TableDiv>
            <TableHeader className="table-header">
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
            </TableHeader>
            <div></div>
            <TableRows className="rows">
              {files.api.map((file, index) => {
                return (
                  <TableRow
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
                  </TableRow>
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
            </TableRows>
            <div>{error}</div>
          </TableDiv>
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
