import { Routes, Route } from "react-router-dom";
import "../src/index.css";

import ProtectedRoute from "./ProtectedRoute";
import Layout from "./pages/Layout/Layout";

import LoginPage from "./pages/Login/LoginPage";
import HomePage from "./pages/Home/HomePage";
import CreateCase from "./pages/CreateCase/CreateCase";
import CreateRemote from "./pages/CreateRemote/CreateRemote";
import OpenCasesPage from "./pages/OpenCases/OpenCases";
import CaseDetails from "./pages/CaseDetails/CaseDetails";
import ClosedCasesPage from "./pages/ClosedCases/ClosedCases";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/create-case"
        element={
          <ProtectedRoute>
            <CreateCase />
            <CreateRemote />
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
        <Route path="/closed-cases" element={<ClosedCasesPage />} />
        <Route path="/create-remote" element={<CreateRemote />} />
      </Route>
    </Routes>
  );
}

export default App;
