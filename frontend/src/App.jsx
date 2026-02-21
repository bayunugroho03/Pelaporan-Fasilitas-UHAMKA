import { Routes, Route, BrowserRouter } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
// Student Pages
import StudentMenu from "./pages/student/StudentMenu";
import CreateReport from "./pages/student/CreateReport";
import MyReports from "./pages/student/MyReports";
// Admin Pages
import AdminMenu from "./pages/admin/AdminMenu";
import IncomingReports from "./pages/admin/IncomingReports";
import HistoryReports from "./pages/admin/HistoryReports";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Student Routes */}
      <Route path="/student" element={<StudentMenu />} />
      <Route path="/student/create" element={<CreateReport />} />
      <Route path="/student/history" element={<MyReports />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminMenu />} />
      <Route path="/admin/incoming" element={<IncomingReports />} />
      <Route path="/admin/history" element={<HistoryReports />} />
    </Routes>
  );
}

export default App;