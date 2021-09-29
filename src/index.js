import React from "react";
import ReactDOM from "react-dom";

import Table from "./_components/Table";
import { lightMode } from "./styles/_themes";

import "./index.css";

if (process.env.REACT_APP_ENV === "standalone") {
  ReactDOM.render(
    <React.StrictMode>
      <Table theme={lightMode} />
    </React.StrictMode>,
    document.getElementById("root")
  );
}

export default Table;
