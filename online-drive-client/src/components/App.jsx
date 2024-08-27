import React from "react";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./Dashboard";
import Login from "./Login";
import Register from "./Register";
import Reset from "./Reset";

function App() {
  return (
    <Routes>
      <Route path="/">
        <Route index element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="reset" element={<Reset />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="folder/:folderId" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}

export default App;
