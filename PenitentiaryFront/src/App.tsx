import { useState } from "react";
import reactLogo from "./assets/react.svg";

import viteLogo from "/vite.svg";
import { BrowserRouter, Route, Routes } from "react-router";
import "@mantine/core/styles.css";
import "./App.css";
import { MantineProvider } from "@mantine/core";
import { AuthPage } from "./features/auth";

function App() {


  return (
    <MantineProvider>
      <BrowserRouter>
       <Routes>
         <Route path="/" element={<AuthPage />} />
       </Routes>
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;
