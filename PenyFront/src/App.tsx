import { BrowserRouter, Routes, Route } from "react-router";
import "@mantine/core/styles.css";

import { createTheme, MantineProvider } from "@mantine/core";
import { LoginPage } from "./features/login";
import HomePage from "./features/home/HomePage";
import ProtectedRoute from "./shared/components/ProtectedRoute";
import PublicRoute from "./shared/components/PublicRoute";
import MainLayout from "./shared/layouts/MainLayout";
import ProfilePage from "./features/profile";
import UsersPage from "./features/users";
import ActivityPage from "./features/activity";
import { ROUTES } from "./shared/config/routes";
import { PrisonersPage } from "./features/prisoners/pages/PrisonersPage";
import { NewPrisonerPage } from "./features/prisoners/pages/NewPrisonerPage";
import { PrisonerProfilePage } from "./features/prisoners/pages/PrisonerProfilePage";

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
          <Route path={ROUTES.LOGIN} element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />
          
          <Route path={ROUTES.HOME} element={
            <ProtectedRoute>
              <MainLayout>
                <HomePage />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          {/* ✅ RUTA PRINCIPAL DE PRISONERS - Maneja lista y formularios */}
          <Route path={ROUTES.PRISONERS} element={
            <ProtectedRoute>
              <MainLayout>
                <PrisonersPage />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path={ROUTES.PRISONERS_NEW} element={
            <ProtectedRoute>
              <MainLayout>
                <NewPrisonerPage />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path={`${ROUTES.PRISONERS}/:id`} element={
            <ProtectedRoute>
              <MainLayout>
                <PrisonerProfilePage />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path={ROUTES.PROFILE} element={
            <ProtectedRoute>
              <MainLayout>
                <ProfilePage />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path={ROUTES.USERS} element={
            <ProtectedRoute>
              <MainLayout>
                <UsersPage />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path={ROUTES.ACTIVITY} element={
            <ProtectedRoute>
              <MainLayout>
                <ActivityPage />
              </MainLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;