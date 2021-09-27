import Table from "./Table.js";

function App() {
  return (
    <div className="App">
      <Table
        projectKey={process.env.REACT_APP_PROJECT_KEY}
        driveName={process.env.REACT_APP_DRIVE_NAME}
      />
    </div>
  );
}

export default App;
