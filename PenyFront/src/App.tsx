
import { BrowserRouter, Routes, Route } from "react-router";
import "@mantine/core/styles.css";

import { createTheme, MantineProvider } from "@mantine/core";
import { LoginPage } from "./features/login";

function App() {
  const theme = createTheme({
    fontFamily: "Open Sans, sans-serif",
    primaryColor: "cyan",
    
  });
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;
