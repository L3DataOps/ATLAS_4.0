import { Routes, Route } from "react-router-dom";
import { XlvAuthProvider } from "./auth/XlvAuthContext";
import XlvProtectedRoute from "./auth/XlvProtectedRoute";
import XlvLayout from "./XlvLayout";
import XlvLogin from "./pages/Login/Xlvlogin";
import XlvDashboard from "./pages/Dashboard/XlvDashboard";

export default function XlvRoutes() {
  return (
    <XlvAuthProvider>
      <Routes>
        <Route path="login" element={<XlvLogin />} />

        <Route element={<XlvProtectedRoute />}>
          <Route element={<XlvLayout />}>
            <Route index element={<XlvDashboard />} />
            {/* more XLV pages here */}
          </Route>
        </Route>
      </Routes>
    </XlvAuthProvider>
  );
}
