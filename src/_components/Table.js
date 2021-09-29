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

const TableContainer = styled.div`
  width: 998px;
  max-height: 80vh;
  color: #77777c;
  display: flex;
  flex-direction: column;
  background-color: #f5f4f7;
  border: 1px solid #777984;
  border-radius: 5px;
  overflow: hidden;
`;

const TableHeader = styled.div`
  color: #2e2e32;
  font-weight: 700;
  min-height: 40px;
  max-height: 40px;
  display: flex;
  padding: 0.25rem 1rem;
  align-items: center;
  justify-content: space-between;
  background-color: #eae5e5;
  border-bottom: 1px solid #777984;
`;

const TableLeft = styled.div`
  display: flex;
  align-items: center;
`;

const TableRight = styled.div`
  display: flex;
  align-items: center;
`;

const TableRows = styled.div`
  overflow-y: scroll;
`;

const TableRow = styled.div`
  padding: 0.25rem 1rem;
  display: grid;
  align-items: center;
  grid-template-columns: fit-content(4rem) 2fr 1fr;

  ${({ active = false }) =>
    active ? "background-color: #e9e8ec;" : "background-color: #f5f4f7;"}

  &:hover {
    background-color: #e9e8ec;
  }

  &:not(:last-child) {
    border-bottom: 1px solid #777984;
  }
`;

const TableColumn = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CheckboxIconContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Checkbox = styled.div`
  margin-right: 1rem;
`;

const FileIcon = styled.div`
  color: #777984;
`;

const FileName = styled.div`
  font-size: 0.875rem;
  font-weight: 600;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-left: 1rem;
  text-decoration: none;

  ${({ disabled = false }) =>
    disabled
      ? `color: #777984;`
      : `
      color: #3f83f8;
      &:hover {
        cursor: pointer;
        text-decoration: underline;
      }`}
`;

const Actions = styled.div`
  display: grid;
  grid-template-columns: auto;
  justify-items: end;
  justify-content: end;
`;

const ActionBtn = styled.button`
  background-color: transparent;
  border: none;
  outline: none;
`;

const Icon = styled.div`
  display: flex;
  margin-right: ${({ margin }) => margin};
  ${({ disabled = false }) =>
    disabled
      ? `color: #d3d6dd;`
      : `
      color: #a8aaad;
      &:hover {
        color: #5d5d61;
      }`};
`;

const Image = styled.img`
  object-fit: contain;
  height: 100%;
  width: 100%;
`;

const ToastContainer = styled.div`
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UploadToast = styled.div`
  width: 300px;
  height: 40px;

  color: #777984;
  font-weight: 700;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  background-color: #f6f1f1;
  z-index: 9999;
  border: 0.5px solid #777984;
  border-radius: 3px;
  box-shadow: 0 0 0 1px rgb(16 22 26 / 20%), 0 2px 4px rgb(16 22 26 / 40%),
    0 8px 24px rgb(16 22 26 / 40%);
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
                <Icon margin="10px">
                  <ChevronLeft
                    onClick={() => {
                      setPreview(null);
                    }}
                  />
                </Icon>
                <div>{preview.name}</div>
              </PreviewLeft>

              <PreviewRight>
                <Icon margin="10px">
                  <DownloadCloud
                    onClick={async () => await handleDownload(preview.file)}
                  />
                </Icon>
                <Icon>
                  <Trash2
                    onClick={() => {
                      toggleModal();
                    }}
                  />
                </Icon>
              </PreviewRight>
            </PreviewNav>
            <ImgContainer>
              <Image src={preview.url} alt={preview.name} />
            </ImgContainer>
          </PreviewContainer>
        )}
        {!preview && (
          <TableContainer>
            <TableHeader>
              <TableLeft>
                {prefixes.length > 0 && files.selected.length === 0 ? (
                  <>
                    <Icon margin="10px">
                      <ChevronLeft
                        onClick={() => handlePageChange(prefixes.slice(0, -1))}
                      />
                    </Icon>
                    {prefixes[prefixes.length - 1]}
                  </>
                ) : files.selected.length === 0 ? (
                  "/"
                ) : (
                  `${files.selected.length} item${
                    files.selected.length > 1 ? "s" : ""
                  } selected`
                )}
              </TableLeft>
              <TableRight>
                {files.selected.length !== 0 ? (
                  <Icon>
                    <Trash2 onClick={() => toggleModal()} />
                  </Icon>
                ) : null}
              </TableRight>
            </TableHeader>
            <div></div>
            <TableRows>
              {files.api.map((file, index) => {
                return (
                  <TableRow
                    ref={files.api.length === index + 1 ? lastElementRef : null}
                    key={`${file.rawName}${index}`}
                    active={file.selected}
                  >
                    <TableColumn>
                      <CheckboxIconContainer>
                        <Checkbox>
                          <input
                            type="checkbox"
                            checked={file.selected}
                            disabled={file.isFolder}
                            onChange={(e) => onChangeCheckBox(e, index)}
                          />
                        </Checkbox>
                        <FileIcon>
                          {file.isFolder ? <Folder /> : <File />}
                        </FileIcon>
                      </CheckboxIconContainer>
                    </TableColumn>
                    <TableColumn>
                      {file.isFolder || file.isImage ? (
                        <FileName
                          onClick={() =>
                            file.isFolder
                              ? handleFolder(file)
                              : handlePreview(file)
                          }
                        >
                          {file.name}
                        </FileName>
                      ) : (
                        <FileName disabled>{file.name}</FileName>
                      )}
                    </TableColumn>

                    {!file.isFolder && (
                      <TableColumn>
                        <Actions>
                          <ActionBtn
                            onClick={async () => await handleDownload(file)}
                          >
                            <Icon>
                              <DownloadCloud />
                            </Icon>
                          </ActionBtn>
                        </Actions>
                      </TableColumn>
                    )}
                  </TableRow>
                );
              })}
              {loading && (
                <TableRow>
                  <TableColumn></TableColumn>
                  <TableColumn>
                    <div>Loading...</div>
                  </TableColumn>
                </TableRow>
              )}
            </TableRows>
            <div>{error}</div>
          </TableContainer>
        )}
        {toastMsg && (
          <ToastContainer>
            <UploadToast>
              <div>{toastMsg}</div>
            </UploadToast>
          </ToastContainer>
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
