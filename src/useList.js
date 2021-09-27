import { useEffect, useState } from "react";

import { list } from "./api";
import useToggle from "./useToggle";

export default function useList(lastFile, prefixes) {
  const [loading, toggleLoading] = useToggle();
  const [error, setError] = useState("");
  const [files, setFiles] = useState([]);
  const [last, setLast] = useState("");

  useEffect(() => {
    toggleLoading();
    setError("");
    const prefix = prefixes.join("");
    list(lastFile, prefix)
      .then((res) => {
        setFiles([...files, ...res.names]);
        setLast(res.last);
        toggleLoading();
      })
      .catch((err) => {
        setError(err);
      });
  }, [lastFile]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (prefixes.length) {
      setFiles([]);
      toggleLoading();
      setError("");
      const prefix = prefixes.join("");
      list("", prefix)
        .then((res) => {
          setFiles(res.names);
          setLast(res.last);
          toggleLoading();
        })
        .catch((err) => {
          setError(err);
        });
    }
  }, [prefixes]); // eslint-disable-line react-hooks/exhaustive-deps

  return { loading, error, files, last };
}
