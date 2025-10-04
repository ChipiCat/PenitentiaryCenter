import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

export function useGlobalContext() {
    const user = useSelector((state: RootState) => state.user.user);

    return { user };
}