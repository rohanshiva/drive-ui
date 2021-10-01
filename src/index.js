import React, { useState } from "react";
import ReactDOM from "react-dom";

import Table from "./_components/Table";
import { lightMode } from "./styles/_themes";

function App() {
  const [drives] = useState([
    process.env.REACT_APP_DRIVE_NAME,
    "drive1",
    "drive2",
  ]);
  const [drive, setDrive] = useState(process.env.REACT_APP_DRIVE_NAME);
  return (
    <div>
      {drives.map((drive) => (
        <input
          key={drive}
          type="button"
          value={drive}
          onClick={() => setDrive(drive)}
        />
      ))}
      <Table
        key={`${drive}`}
        drive={drive}
        projectId={process.env.REACT_APP_PROJECT_KEY}
        theme={lightMode}
        readOnly={false}
      />
    </div>
  );
}

if (process.env.REACT_APP_ENV === "standalone") {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById("root")
  );
}

export default Table;
