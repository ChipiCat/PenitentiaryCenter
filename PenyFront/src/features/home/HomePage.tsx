import { useSelector } from "react-redux";
import { Button } from "@mantine/core";
import { LogOut } from "lucide-react";
import type { RootState } from "../../shared/store/store";
import { useAppDispatch } from "../../shared/store/hooks";
import { logoutThunk } from "../../shared/store/thunks/authThunk";

const HomePage = () => {
    const user = useSelector((state: RootState) => state.user.user);
    const dispatch = useAppDispatch();

    const handleLogout = () => {
        dispatch(logoutThunk());
    };

    if (!user) {
        return <div>Loading...</div>;
    } else {
        return (
            <div style={{ padding: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                    <h2>Home Page - Protected</h2>
                    <Button 
                        variant="outline" 
                        color="red" 
                        leftSection={<LogOut size={16} />}
                        onClick={handleLogout}
                    >
                        Cerrar Sesión
                    </Button>
                </div>
                <div style={{ marginBottom: "1rem" }}>
                    <strong>Nombre:</strong> {user.name}
                </div>
                <div style={{ marginBottom: "1rem" }}>
                    <strong>Email:</strong> {user.email}
                </div>
                {/* Agrega más campos según la estructura de tu usuario */}
            </div>
        );
    }
}

export default HomePage;