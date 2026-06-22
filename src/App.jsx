import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import Layout from "./pages/Layout/Layout";

import LoginPage from "./pages/Login/LoginPage";
import HomePage from "./pages/Home/HomePage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<HomePage />} />
      </Route>
    </Routes>
  );
}

export default App;
