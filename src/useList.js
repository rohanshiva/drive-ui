import { useEffect, useState } from "react";
import { list, filterFolders } from "./api";
export default function useList(props, lastFile, deleted = null, prefixes) {
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
    const prefix = (prefixes && prefixes.length > 0) ? prefixes.join("") : null
    list(props, lastFile, prefix).then((res) => {
      const filteredList = filterFolders(res.names, files[files.length - 1], prefix);
      setFiles((prevfiles) => [...prevfiles, ...filteredList]);
      setLast(res.last);
      setLoading(false);
    });
  }, [props, lastFile]);

  useEffect(() => {
    console.log(prefixes);
    if (prefixes) {
      const prefix = (prefixes && prefixes.length > 0) ? prefixes.join("") : null
      console.log(prefix);
      setLoading(true);
      setError(false);
      list(props, "", prefix).then((res) => {
        console.log(res.names)
        const filteredList = filterFolders(res.names, null, prefix);
        console.log(res.last)
        setFiles(filteredList);
        setLast(res.last);
        setLoading(false);
      });
    }
  }, [prefixes]);
  return { loading, error, files, last };
}
