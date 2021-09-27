import { useEffect, useState } from "react";
import { list } from "./api";
export default function useList(lastFile, deleted = null, prefixes) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [files, setFiles] = useState([]);
  const [last, setLast] = useState("");

  useEffect(() => {
    setLoading(true);
    setError(false);
    setFiles((prevfiles) => prevfiles.filter((file) => file !== deleted));
    setLoading(false);
  }, [deleted]);

  useEffect(() => {
    setLoading(true);
    setError(false);
    const prefix = prefixes.join("");
    list(lastFile, prefix).then((res) => {
      setFiles([...files, ...res.names]);
      setLast(res.last);
      setLoading(false);
    });
  }, [lastFile]);

  useEffect(() => {
    if (prefixes) {
      setFiles([]);

      const prefix = prefixes.join("");
      setLoading(true);
      setError(false);
      list("", prefix).then((res) => {
        setFiles(res.names);
        setLast(res.last);

        setLoading(false);
      });
    }
  }, [prefixes]);
  return { loading, error, files, last };
}
