
import { BrowserRouter, Routes, Route } from "react-router";
import "@mantine/core/styles.css";

import { createTheme, MantineProvider } from "@mantine/core";
import { LoginPage } from "./features/login";
import HomePage from "./features/home/HomePage";
import ProtectedRoute from "./shared/components/ProtectedRoute";
import PublicRoute from "./shared/components/PublicRoute";

function App() {
  const theme = createTheme({
    fontFamily: "Open Sans, sans-serif",
    colors: {
      darkblue: [
        "#20263c",
        "#20263c",
        "#20263c",
        "#20263c",
        "#20263c",
        "#20263c",
        "#20263c",
        "#20263c",
        "#20263c",
        "#20263c"
      ]
    },
    primaryColor: "darkblue",
  });
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />
          <Route path="/home" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;
