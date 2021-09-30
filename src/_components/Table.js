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

import API from "../api/api";
import useList from "../hooks/useList";
import useToggle from "../hooks/useToggle";
import { downloadBlob } from "../utils/util";
import { prependOrUpdate } from "../utils/util";
import DetaModal from "../_components/DetaModal";
import EmptyDrive from "../_components/EmptyDrive";
import { RootContainer } from "../styles/_default";
import DragAndDrop from "../_components/DragAndDrop";
import ConfirmDelete from "../_components/ConfirmDelete";

const Prefixes = styled.div`
  margin-top: 2rem;
  font-weight: 700;
  font-size: 20px;
  margin-bottom: 2rem;
`;

const PrefixSpan = styled.span`
  color: ${(props) => props.theme.colors.secondary3};
  &:last-child {
    color: ${(props) => props.theme.colors.dark};
  }
  &:hover {
    color: ${(props) => props.theme.colors.dark};
  }

  ${({ link = true }) => (link ? "cursor: pointer" : "cursor: initial")};
`;

const TableContainer = styled.div`
  width: 998px;
  height: 80vh;
  color: ${(props) => props.theme.colors.secondary4};
  display: flex;
  flex-direction: column;
  background-color: ${(props) => props.theme.colors.primaryFillColor};
  border: ${(props) => `1px solid ${props.theme.colors.secondary1}`};
  border-radius: 5px;
  overflow: hidden;
  position: relative;
`;

const PreviewContainer = styled(TableContainer)`
  cursor: pointer;
`;

const TableHeader = styled.div`
  color: ${(props) => props.theme.colors.dark};
  font-weight: 700;
  min-height: 40px;
  max-height: 40px;
  display: flex;
  padding: 0.25rem 1rem;
  align-items: center;
  justify-content: space-between;
  background-color: ${(props) => props.theme.colors.tertiaryFillColor};
  border-bottom: ${(props) => `1px solid ${props.theme.colors.secondary1}`};
`;

const PreviewNav = styled(TableHeader)`
  height: 40px;
`;

const TableLeft = styled.div`
  display: flex;
  align-items: center;
`;

const TableRight = styled(TableLeft)``;
const PreviewLeft = styled(TableLeft)``;
const PreviewRight = styled(TableLeft)``;

const ImgContainer = styled.div`
  display: grid;
  place-items: center;
  max-height: calc(80vh - 40px);
`;

const Image = styled.img`
  object-fit: contain;
  width: 100%;
  height: 100%;
`;

const TableRows = styled.div`
  overflow-y: scroll;
`;

const TableRow = styled.div`
  padding: 0.25rem 1rem;
  display: grid;
  align-items: center;
  grid-template-columns: fit-content(4rem) 2fr 1fr;

  ${({ theme, active = false }) =>
    active
      ? `background-color: ${theme.colors.fillColor1};`
      : `background-color: ${theme.colors.primaryFillColor};`}

  &:hover {
    background-color: ${(props) => props.theme.colors.fillColor1};
  }

  &:not(:last-child) {
    border-bottom: ${(props) => `1px solid ${props.theme.colors.secondary1}`};
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
  color: ${(props) => props.theme.colors.secondary1};
`;

const FileName = styled.div`
  font-size: 0.875rem;
  font-weight: 600;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-left: 1rem;
  text-decoration: none;

  ${({ theme, disabled = false }) =>
    disabled
      ? `color: ${theme.colors.secondary1};`
      : `
      color: ${theme.colors.primary1};
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
  padding: 0px;
`;

const Icon = styled.div`
  display: flex;
  cursor: pointer;
  margin-right: ${({ margin }) => margin};
  ${({ theme, disabled = false }) =>
    disabled
      ? `color: ${theme.colors.secondary5};`
      : `
      color: ${theme.colors.dark1};
      &:hover {
        color: ${theme.colors.dark2};
      }`};
`;

const LoadingText = styled.div`
  padding: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
`;

const ErrorMessage = styled(LoadingText)`
  background-color: ${(props) => props.theme.colors.deleteRed};
  color: ${(props) => props.theme.colors.white};
`;

const ProcessingMessage = styled(LoadingText)`
  background-color: ${(props) => props.theme.colors.yellow};
  color: ${(props) => props.theme.colors.white};
`;

const SuccessMessage = styled(LoadingText)`
  background-color: ${(props) => props.theme.colors.green};
  color: ${(props) => props.theme.colors.white};
`;

export default function Table({ drive, projectId, theme, readOnly = false }) {
  const [preview, setPreview] = useState(null);
  const [dnd, setDnd] = useState({ over: false, count: 0 });
  const [modalOpen, toggleModal] = useToggle();

  const {
    files,
    prefixes,
    last,
    loading,
    message,
    setFiles,
    setLast,
    setPrefixes,
    setMessage,
  } = useList(projectId, drive);

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

  function handlePageChange(prefixes = []) {
    setLast("");
    setPrefixes(prefixes);
    setPreview(null);
  }

  function handleFolder(file) {
    handlePageChange([...prefixes, file.name]);
  }

  async function handleDownload(file) {
    try {
      setMessage(null);
      const blob = await new API(projectId, drive).get(file.rawName);
      downloadBlob(blob, file.name);
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.message || "Download: Something went wrong!",
      });
    }
  }

  async function handlePreview(file) {
    try {
      setMessage({ type: "processing", text: `Opening ${file.name}...` });
      let blob = await new API(projectId, drive).get(file.rawName);
      if (file.rawName.endsWith(".svg")) {
        blob = blob.slice(0, blob.size, "image/svg+xml");
      }
      const blobUrl = window.URL.createObjectURL(blob);
      setPreview({ file, name: file.name, url: blobUrl });
      setMessage(null);
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.message || "Preview: Something went wrong!",
      });
    }
  }

  async function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer.files[0];
    const buffer = await file.arrayBuffer();
    const { type: contentType, name } = file;

    setDnd({ over: false, count: 0 });
    setMessage({
      type: "processing",
      text: `Uploading ${name}...`,
    });
    try {
      const [file] = await new API(projectId, drive).put(
        name,
        prefixes,
        new Uint8Array(buffer),
        contentType
      );
      setFiles({ ...files, api: prependOrUpdate(files.api, file) });
      setMessage({
        type: "success",
        text: `Uploaded ${name} successfully`,
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: `Failed to upload ${name} please try again.`,
      });
    }
  }

  function handleDragEnter(event) {
    event.preventDefault();
    event.stopPropagation();
    setDnd({ over: true, count: dnd.count + 1 });
  }

  function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
  }

  function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    setDnd({ ...dnd, count: dnd.count - 1 });
    if (dnd.count <= 1) {
      setDnd({ over: false, count: 0 });
    }
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
    setMessage(null);
    new API(projectId, drive)
      .deleteKeys(keys)
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
        setMessage({
          type: "error",
          text: err?.message || "Delete: Something went wrong!",
        });
        toggleModal();
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
      <RootContainer
        onDragEnter={(event) => !readOnly && handleDragEnter(event)}
        onDragLeave={(event) => !readOnly && handleDragLeave(event)}
        onDragOver={(event) => !readOnly && handleDragOver(event)}
        onDrop={async (event) => !readOnly && (await handleDrop(event))}
      >
        <Prefixes>
          <PrefixSpan onClick={() => handlePageChange()}>
            {drive}&#160;&#160;&#160;/&#160;&#160;&#160;
          </PrefixSpan>
          {prefixes.length < 5 &&
            prefixes.map((prefix, index) => (
              <PrefixSpan
                key={`${prefix}${index}`}
                onClick={() => handlePageChange(prefixes.slice(0, index + 1))}
              >
                {prefix}&#160;&#160;&#160;/&#160;&#160;&#160;
              </PrefixSpan>
            ))}
          {prefixes.length >= 5 && (
            <>
              <PrefixSpan
                onClick={() =>
                  handlePageChange(prefixes.slice(0, prefixes.length - 2))
                }
              >
                ...&#160;&#160;&#160;/&#160;&#160;&#160;
              </PrefixSpan>
              {prefixes.slice(prefixes.length - 2).map((prefix, index) => (
                <PrefixSpan
                  key={`${prefix}${index}`}
                  onClick={() =>
                    handlePageChange(
                      prefixes.slice(0, prefixes.length - 2 + index + 1)
                    )
                  }
                >
                  {prefix}&#160;&#160;&#160;/&#160;&#160;&#160;
                </PrefixSpan>
              ))}
            </>
          )}
          {preview ? (
            <PrefixSpan link={false}>{preview.name}</PrefixSpan>
          ) : null}
        </Prefixes>
        {preview && (
          <PreviewContainer>
            <PreviewNav>
              <PreviewLeft>
                <Icon margin="1rem">
                  <ChevronLeft
                    onClick={() => {
                      setPreview(null);
                    }}
                  />
                </Icon>
                <div>{preview.name}</div>
              </PreviewLeft>

              <PreviewRight>
                <Icon margin={!readOnly ? "1rem" : "0rem"}>
                  <DownloadCloud
                    onClick={async () => await handleDownload(preview.file)}
                  />
                </Icon>
                {!readOnly ? (
                  <Icon>
                    <Trash2
                      onClick={() => {
                        toggleModal();
                      }}
                    />
                  </Icon>
                ) : null}
              </PreviewRight>
            </PreviewNav>
            <ImgContainer>
              <Image src={preview.url} alt={preview.name} />
            </ImgContainer>
          </PreviewContainer>
        )}
        {!preview && (
          <TableContainer>
            {dnd.over ? <DragAndDrop /> : null}
            <TableHeader>
              <TableLeft>
                {prefixes.length > 0 && files.selected.length === 0 ? (
                  <>
                    <Icon margin="1rem">
                      <ChevronLeft
                        onClick={() => handlePageChange(prefixes.slice(0, -1))}
                      />
                    </Icon>
                    <div>{prefixes[prefixes.length - 1]}</div>
                  </>
                ) : files.selected.length === 0 ? (
                  drive
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

            {message && message.type === "error" ? (
              <ErrorMessage>{message.text}</ErrorMessage>
            ) : null}
            {message && message.type === "processing" ? (
              <ProcessingMessage>{message.text}</ProcessingMessage>
            ) : null}
            {message && message.type === "success" ? (
              <SuccessMessage>{message.text}</SuccessMessage>
            ) : null}

            <TableRows>
              {!loading && !dnd.over && files.api.length === 0 ? (
                <EmptyDrive readOnly={readOnly} />
              ) : null}
              {files.api.map((file, index) => {
                return (
                  <TableRow
                    ref={files.api.length === index + 1 ? lastElementRef : null}
                    key={`${file.rawName}${index}`}
                    active={file.selected}
                  >
                    <TableColumn>
                      <CheckboxIconContainer>
                        {!readOnly ? (
                          <Checkbox>
                            <input
                              type="checkbox"
                              checked={file.selected}
                              disabled={file.isFolder}
                              onChange={(e) => onChangeCheckBox(e, index)}
                            />
                          </Checkbox>
                        ) : null}
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
                    <LoadingText>Loading...</LoadingText>
                  </TableColumn>
                </TableRow>
              )}
            </TableRows>
          </TableContainer>
        )}
      </RootContainer>
      <DetaModal isOpen={modalOpen} toggleModal={toggleModal}>
        <ConfirmDelete
          count={preview ? 1 : files.selected.length}
          onConfirm={() =>
            preview ? handlePreviewDelete() : handleSelectedDelete()
          }
          onCancel={toggleModal}
        />
      </DetaModal>
    </ThemeProvider>
  );
}
