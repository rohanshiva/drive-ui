import { useEffect, useState } from "react";

import API from "../api/api";
import useToggle from "./useToggle";

export default function useList(projectId, drive) {
  const [loading, toggleLoading] = useToggle();
  const [error, setError] = useState("");
  const [files, setFiles] = useState({ selected: [], api: [] });

  const [prefixes, setPrefixes] = useState([]);

  const [last, setLast] = useState("");
  const [lastFile, setLastFile] = useState("");

  useEffect(() => {
    if (last) {
      toggleLoading();
      setError("");
      new API(projectId, drive)
        .list(last, prefixes)
        .then((res) => {
          setFiles({ ...files, api: [...files.api, ...res.names] });
          setLastFile(res.last);
          toggleLoading();
        })
        .catch((err) => {
          setError(err?.message || "List: Something went wrong!");
          toggleLoading();
        });
    }
  }, [last]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setFiles({ selected: [], api: [] });
    toggleLoading();
    setError("");
    new API(projectId, drive)
      .list("", prefixes)
      .then((res) => {
        setFiles({ selected: [], api: res.names });
        setLastFile(res.last);
        toggleLoading();
      })
      .catch((err) => {
        setError(err?.message || "List: Something went wrong!");
        toggleLoading();
      });
  }, [prefixes]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    loading,
    error,
    files,
    prefixes,
    last: lastFile,
    setFiles,
    setLast,
    setPrefixes,
    setError,
  };
}
