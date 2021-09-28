import { useEffect, useState } from "react";

import { list } from "./api";
import useToggle from "./useToggle";

export default function useList() {
  const [loading, toggleLoading] = useToggle();
  const [error, setError] = useState("");
  const [files, setFiles] = useState([]);

  const [prefixes, setPrefixes] = useState([]);

  const [last, setLast] = useState("");
  const [lastFile, setLastFile] = useState("");

  useEffect(() => {
    if (last) {
      toggleLoading();
      setError("");
      list(last, prefixes)
        .then((res) => {
          setFiles([...files, ...res.names]);
          setLastFile(res.last);
          toggleLoading();
        })
        .catch((err) => {
          setError(err);
        });
    }
  }, [last]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setFiles([]);
    toggleLoading();
    setError("");
    list("", prefixes)
      .then((res) => {
        setFiles(res.names);
        setLastFile(res.last);
        toggleLoading();
      })
      .catch((err) => {
        setError(err);
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
  };
}
