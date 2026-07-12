import MainLayout from "./components/MainLayout";
import { Routes, Route, Navigate } from "react-router";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={
          <div>
            Dashboard Content
          </div>
        } />
        <Route path="/customers" element={
          <div>
            Customers Content
          </div>
        } />
        <Route path="/orders" element={
          <div>
            Orders Content
          </div>
        } />
        <Route path="/inventory" element={
          <div>
            Inventory Content
          </div>
        } />
        <Route path="/reports" element={
          <div>
            Reports Content
          </div>
        } />
        <Route path="/settings" element={
          <div>
            Settings Content
          </div>
        } />
      </Route>
    </Routes>
  );
}

export default App;
