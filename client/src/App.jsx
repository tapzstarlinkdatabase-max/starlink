import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import EditPortal37 from "./Pages/EditPortal37.jsx";
import Login from "./Pages/Login.jsx";
import Profile37 from "./Pages/Profile37.jsx";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/edit/:id" element={<EditPortal37 />} />
      <Route path="/:id" element={<Profile37 />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
