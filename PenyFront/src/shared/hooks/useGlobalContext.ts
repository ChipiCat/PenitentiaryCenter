import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { useAppDispatch } from "../store/hooks";
import { refetchUserThunk } from "../store/thunks/refetchUserThunk";

export function useGlobalContext() {
    const dispatch = useAppDispatch();
    const user = useSelector((state: RootState) => state.user.user);
    const refetchUser = async () => {
        if (user?.id) {
            dispatch(refetchUserThunk(user.id));
        }
    }
    return { user, refetchUser };
}