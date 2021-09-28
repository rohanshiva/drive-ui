import { useEffect, useState } from "react";

import { list } from "./api";
import useToggle from "./useToggle";

export default function useList(lastFile, prefixes) {
  const [loading, toggleLoading] = useToggle();
  const [error, setError] = useState("");
  const [files, setFiles] = useState([]);
  const [last, setLast] = useState("");

  useEffect(() => {
    if (lastFile) {
      toggleLoading();
      setError("");
      list(lastFile, prefixes)
        .then((res) => {
          setFiles([...files, ...res.names]);
          setLast(res.last);
          toggleLoading();
        })
        .catch((err) => {
          setError(err);
        });
    }
  }, [lastFile]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setFiles([]);
    toggleLoading();
    setError("");
    list("", prefixes)
      .then((res) => {
        setFiles(res.names);
        setLast(res.last);
        toggleLoading();
      })
      .catch((err) => {
        setError(err);
      });
  }, [prefixes]); // eslint-disable-line react-hooks/exhaustive-deps

  return { loading, error, files, last };
}
