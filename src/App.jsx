// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vitejs.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "./components/Dashboard.jsx";
// import Guidelines from "./components/Guidelines";
import MachineList from "./components/MachineList";
import InventoryLog from "./components/InventoryLog";
import BreakdownLog from "./components/BreakdownLog";
import PreventiveMaintenanceLog from "./components/PreventiveMaintenanceLog";
import Validation from "./components/Validation";


function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 p-4">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          {/* <Route path="/guidelines" element={<Guidelines />} /> */}
          <Route path="/machine-list" element={<MachineList />} />
          <Route path="/inventory-log" element={<InventoryLog />} />
          <Route path="/breakdown-log" element={<BreakdownLog />} />
          <Route path="/preventive-maintenance-log" element={<PreventiveMaintenanceLog />} />
          <Route path="/validation" element={<Validation />} />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;
