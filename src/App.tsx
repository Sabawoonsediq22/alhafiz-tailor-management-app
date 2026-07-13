import MainLayout from "./components/common/MainLayout";
import { Routes, Route, Navigate } from "react-router";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import NewCustomer from "./pages/NewCustomer";
import Orders from "./pages/Orders";
import Inventory from "./pages/Inventory";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/new-customer" element={<NewCustomer />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;
