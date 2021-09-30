import { useEffect, useState } from "react";

import API from "../api/api";
import useToggle from "./useToggle";

export default function useList(projectId, drive) {
  const [loading, toggleLoading] = useToggle();
  const [message, setMessage] = useState(null);
  const [files, setFiles] = useState({ selected: [], api: [] });

  const [prefixes, setPrefixes] = useState([]);

  const [last, setLast] = useState("");
  const [lastFile, setLastFile] = useState("");

  useEffect(() => {
    if (last) {
      toggleLoading();
      setMessage(null);
      new API(projectId, drive)
        .list(last, prefixes)
        .then((res) => {
          setFiles({ ...files, api: [...files.api, ...res.names] });
          setLastFile(res.last);
          toggleLoading();
        })
        .catch((err) => {
          setMessage({
            type: "error",
            text: err?.message || "List: Something went wrong!",
          });
          toggleLoading();
        });
    }
  }, [last]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setFiles({ selected: [], api: [] });
    toggleLoading();
    setMessage(null);
    new API(projectId, drive)
      .list("", prefixes)
      .then((res) => {
        setFiles({ selected: [], api: res.names });
        setLastFile(res.last);
        toggleLoading();
      })
      .catch((err) => {
        setMessage({
          type: "error",
          text: err?.message || "List: Something went wrong!",
        });
        toggleLoading();
      });
  }, [prefixes]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    loading,
    message,
    files,
    prefixes,
    last: lastFile,
    setFiles,
    setLast,
    setPrefixes,
    setMessage,
  };
}
