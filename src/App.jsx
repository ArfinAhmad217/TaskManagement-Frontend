import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import TaskDetail from "./pages/TaskDetail";
import Teams from "./pages/Teams";
import Notifications from "./pages/Notifications";
import Users from "./pages/Users";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Application */}
        <Route element={<Layout />}>

          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/tasks" element={<Tasks />} />

          <Route
            path="/tasks/:id"
            element={<TaskDetail />}
          />

          <Route path="/teams" element={<Teams />} />

          <Route
            path="/notifications"
            element={<Notifications />}
          />

          {/* Admin + Manager only */}
          <Route
            path="/users"
            element={
              <ProtectedRoute
                allowedRoles={["Admin", "Manager"]}
              >
                <Users />
              </ProtectedRoute>
            }
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;