import { useEffect, useState } from "react";
import { useTokenDebug } from "../hooks/useTokenDebug";
import "../styles/TokenDebugger.css";

interface TokenLog {
  timestamp: string;
  action: string;
  tokenExists: boolean;
  tokenPreview: string;
  details?: string;
}

/**
 * Token Debugger Component
 * Shows real-time token status and logs
 * Only visible in development mode with VITE_DEBUG_TOKENS=true
 */
export const TokenDebugger = () => {
  const { tokenStatus, getLogs, printTokenLogs, exportTokenLogs } = useTokenDebug();
  const [isExpanded, setIsExpanded] = useState(false);
  const [logs, setLogs] = useState<TokenLog[]>([]);

  // Only show in development
  const shouldShow = import.meta.env.DEV && import.meta.env.VITE_DEBUG_TOKENS === "true";

  useEffect(() => {
    if (!shouldShow) return;

    const interval = setInterval(() => {
      setLogs(getLogs());
    }, 1000);

    return () => clearInterval(interval);
  }, [getLogs, shouldShow]);

  if (!shouldShow) return null;

  return (
    <div className="token-debugger">
      <button
        className="token-debugger__toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        title="Token Debugger"
      >
        🔐
      </button>

      {isExpanded && (
        <div className="token-debugger__panel">
          <div className="token-debugger__header">
            <h3>🔐 Token Debugger</h3>
            <button
              className="token-debugger__close"
              onClick={() => setIsExpanded(false)}
            >
              ✕
            </button>
          </div>

          <div className="token-debugger__status">
            <div className="status-item">
              <span className="status-label">Access Token:</span>
              <span className={`status-value ${tokenStatus.hasAccessToken ? "active" : ""}`}>
                {tokenStatus.hasAccessToken ? "✓ Present" : "✗ Missing"}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Refresh Token:</span>
              <span className={`status-value ${tokenStatus.hasRefreshToken ? "active" : ""}`}>
                {tokenStatus.hasRefreshToken ? "✓ Present" : "✗ Missing"}
              </span>
            </div>
          </div>

          <div className="token-debugger__actions">
            <button onClick={printTokenLogs} className="action-btn">
              📋 Print Logs
            </button>
            <button onClick={exportTokenLogs} className="action-btn">
              💾 Export Logs
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                setLogs([]);
              }}
              className="action-btn danger"
            >
              🗑️ Clear Tokens
            </button>
          </div>

          <div className="token-debugger__logs">
            <h4>Recent Activity ({logs.length})</h4>
            <div className="logs-container">
              {logs.slice(-20).reverse().map((log, idx) => (
                <div key={idx} className="log-entry">
                  <span className="log-time">{log.timestamp.split("T")[1].split(".")[0]}</span>
                  <span className={`log-action`}>{log.action}</span>
                  <span className={`log-status ${log.tokenExists ? "exists" : "missing"}`}>
                    {log.tokenExists ? "✓" : "✗"}
                  </span>
                  {log.details && <span className="log-details">{log.details}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
