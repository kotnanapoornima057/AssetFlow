import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({
  children,
  allowedRoles = [],
}) {
  const location = useLocation();

  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  // ----------------------------------------------------------
  // No token
  // ----------------------------------------------------------

  if (!token) {
    return (
      <Navigate
        to="/"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // ----------------------------------------------------------
  // Get user
  // ----------------------------------------------------------

  let user = null;

  try {
    user = storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch (error) {
    console.error(
      "Invalid user data in localStorage."
    );

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  // ----------------------------------------------------------
  // If user information is missing
  // ----------------------------------------------------------

  if (!user) {
    localStorage.removeItem("token");

    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  // ----------------------------------------------------------
  // Role authorization
  // ----------------------------------------------------------

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  // ----------------------------------------------------------
  // Authorized
  // ----------------------------------------------------------

  return children;
}

export default ProtectedRoute;