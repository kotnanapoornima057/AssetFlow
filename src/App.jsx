import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import { SidebarProvider } from "./context/SidebarContext";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";

import Dashboard from "./pages/Dashboard";
import Departments from "./pages/Departments";
import Categories from "./pages/Categories";
import Assets from "./pages/Assets";
import AssetDetails from "./pages/AssetDetails";
import Users from "./pages/Users";
import Bookings from "./pages/Bookings";
import Maintenance from "./pages/Maintenance";
import Allocations from "./pages/Allocations";
import Transfers from "./pages/Transfers";
import ActivityLogs from "./pages/ActivityLogs";
import Reports from "./pages/Reports";
import Audits from "./pages/Audits";
import MyAssets from "./pages/MyAssets";
import DepartmentAssets from "./pages/DepartmentAssets";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import ChangePassword from "./pages/ChangePassword";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>

      <SidebarProvider>

        <Routes>

          {/* ==================================================
              AUTHENTICATION
          ================================================== */}

          <Route
            path="/"
            element={<Login />}
          />

          <Route
            path="/signup"
            element={<Signup />}
          />

          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

          {/* ==================================================
              DASHBOARD
          ================================================== */}

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* ==================================================
              ASSETS
          ================================================== */}

          <Route
            path="/assets"
            element={
              <ProtectedRoute>
                <Assets />
              </ProtectedRoute>
            }
          />

          <Route
            path="/assets/:id"
            element={
              <ProtectedRoute>
                <AssetDetails />
              </ProtectedRoute>
            }
          />

          {/* ==================================================
              ALLOCATIONS
          ================================================== */}

          <Route
            path="/allocations"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "Admin",
                  "Asset Manager",
                ]}
              >
                <Allocations />
              </ProtectedRoute>
            }
          />

          {/* ==================================================
              TRANSFERS
          ================================================== */}

          <Route
            path="/transfers"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "Admin",
                  "Asset Manager",
                  "Department Head",
                ]}
              >
                <Transfers />
              </ProtectedRoute>
            }
          />

          {/* ==================================================
              AUDITS
          ================================================== */}

          <Route
            path="/audits"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "Admin",
                  "Asset Manager",
                ]}
              >
                <Audits />
              </ProtectedRoute>
            }
          />

          {/* ==================================================
              DEPARTMENTS
          ================================================== */}

          <Route
            path="/departments"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "Admin",
                ]}
              >
                <Departments />
              </ProtectedRoute>
            }
          />

          {/* ==================================================
              CATEGORIES
          ================================================== */}

          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <Categories />
              </ProtectedRoute>
            }
          />

          {/* ==================================================
              USERS
          ================================================== */}

          <Route
            path="/users"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "Admin",
                ]}
              >
                <Users />
              </ProtectedRoute>
            }
          />

          {/* ==================================================
              BOOKINGS
          ================================================== */}

          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <Bookings />
              </ProtectedRoute>
            }
          />

          {/* ==================================================
              MAINTENANCE
          ================================================== */}

          <Route
            path="/maintenance"
            element={
              <ProtectedRoute>
                <Maintenance />
              </ProtectedRoute>
            }
          />

          {/* ==================================================
              REPORTS
          ================================================== */}

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />

          {/* ==================================================
              ACTIVITY LOGS
          ================================================== */}

          <Route
            path="/activity"
            element={
              <ProtectedRoute>
                <ActivityLogs />
              </ProtectedRoute>
            }
          />

          {/* ==================================================
              EMPLOYEE
          ================================================== */}

          <Route
            path="/my-assets"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "Employee",
                ]}
              >
                <MyAssets />
              </ProtectedRoute>
            }
          />

          {/* ==================================================
              DEPARTMENT HEAD
          ================================================== */}

          <Route
            path="/department-assets"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "Department Head",
                ]}
              >
                <DepartmentAssets />
              </ProtectedRoute>
            }
          />

          {/* ==================================================
              PROFILE
          ================================================== */}

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* ==================================================
              SETTINGS
          ================================================== */}

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* ==================================================
              CHANGE PASSWORD
          ================================================== */}

          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />

        </Routes>

      </SidebarProvider>

    </BrowserRouter>
  );
}

export default App;