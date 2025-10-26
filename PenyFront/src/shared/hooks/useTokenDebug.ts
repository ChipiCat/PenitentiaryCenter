import { useEffect, useState } from "react";
import { tokenManager } from "../services/tokenManager";

interface TokenStatus {
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
  isRefreshing: boolean;
}

/**
 * Hook to monitor token status and refresh token logs
 * Useful for debugging token issues
 */
export const useTokenDebug = () => {
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>(() => ({
    hasAccessToken: !!localStorage.getItem("accessToken"),
    hasRefreshToken: !!localStorage.getItem("refreshToken"),
    isRefreshing: false,
  }));

  useEffect(() => {
    // Monitor storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "accessToken" || e.key === "refreshToken") {
        setTokenStatus({
          hasAccessToken: !!localStorage.getItem("accessToken"),
          hasRefreshToken: !!localStorage.getItem("refreshToken"),
          isRefreshing: false,
        });
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const printTokenLogs = () => {
    tokenManager.printLogs();
  };

  const exportTokenLogs = () => {
    const logs = tokenManager.exportLogs();
    console.log(logs);
    // Create a blob and download
    const blob = new Blob([logs], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `token-logs-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    tokenStatus,
    printTokenLogs,
    exportTokenLogs,
    getLogs: () => tokenManager.getLogs(),
  };
};
