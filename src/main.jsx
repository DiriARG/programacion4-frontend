import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import App from "./App.jsx";
import { AutenticacionProvider } from "./context/AutenticacionContext.jsx";
import "./index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AutenticacionProvider>
          <App />
        </AutenticacionProvider>
        <Toaster position="bottom-right" richColors />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
