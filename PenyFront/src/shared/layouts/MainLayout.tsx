import type { ReactNode } from "react";
import { NavbarSimple } from "../components/NavbarSimple";
import { CustomHeader } from "../components/CustomHeader";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => (
  <div style={{
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    position: 'relative'
  }}>
    
    <NavbarSimple />
    <CustomHeader />

    <main
      style={{
        position: 'fixed',
        top: '64px', 
        left: 'var(--navbar-width, 260px)',
        width: 'calc(100vw - var(--navbar-width, 260px))',
        height: 'calc(100vh - 64px)', 
        backgroundColor: "light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-8))",
        padding: "var(--mantine-spacing-lg)",
        transition: "left 0.3s ease, width 0.3s ease",
        overflow: 'auto',
        boxSizing: 'border-box',
        paddingTop: 'var(--mantine-spacing-xl)',
      }}
    >
      {children}
    </main>
  </div>
);

export default MainLayout;