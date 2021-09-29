import React from "react";
import ReactDOM from "react-dom";

import Table from "./_components/Table";
import { lightMode } from "./styles/_themes";

if (process.env.REACT_APP_ENV === "standalone") {
  ReactDOM.render(
    <React.StrictMode>
      <Table
        drive={process.env.REACT_APP_DRIVE_NAME}
        projectId={process.env.REACT_APP_PROJECT_KEY}
        theme={lightMode}
      />
    </React.StrictMode>,
    document.getElementById("root")
  );
}

export default Table;
