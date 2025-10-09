import type { ReactNode } from "react";
import { CustomHeaders } from "../components/CustomHeader";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => (
  <div>
    {/* Aquí puedes poner tu header, sidebar, etc */}
    <CustomHeaders />
    <main>{children}</main>
  </div>
);

export default MainLayout;