import { Routes, Route } from "react-router-dom";
import "../src/index.css";

import ProtectedRoute from "./ProtectedRoute";
import Layout from "./pages/Layout/Layout";

import LoginPage from "./pages/Login/LoginPage";
import HomePage from "./pages/Home/HomePage";
import CreateCase from "./pages/CreateCase/CreateCase";
import OpenCasesPage from "./pages/OpenCases/OpenCases";
import CaseDetails from "./pages/CaseDetails/CaseDetails"

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/create-case"
        element={
          <ProtectedRoute>
            <CreateCase />
          </ProtectedRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<HomePage />} />
        <Route path="/open-cases" element={<OpenCasesPage />} />
        <Route path="/cases/:id" element={<CaseDetails />} />
      </Route>
    </Routes>
  );
}

export default App;
