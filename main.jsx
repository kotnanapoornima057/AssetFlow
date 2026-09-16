import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import "animate.css";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "./context/ThemeContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Toaster
      position="top-right"
      reverseOrder={false}
      toastOptions={{
        duration: 3000,

        success: {
          style: {
            background: "#16a34a",
            color: "#fff",
            fontWeight: "600",
          },
        },

        error: {
          style: {
            background: "#dc2626",
            color: "#fff",
            fontWeight: "600",
          },
        },

        loading: {
          style: {
            background: "#2563eb",
            color: "#fff",
          },
        },
      }}
    />

    <ThemeProvider>
      <App />
    </ThemeProvider>

  </StrictMode>
);