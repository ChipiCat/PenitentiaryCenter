/**
 * Token Manager - Centralized token tracking and management
 * Helps debug refresh token issues with detailed logging
 */

interface TokenLog {
  timestamp: string;
  action: string;
  tokenExists: boolean;
  tokenPreview: string;
  details?: string;
}

class TokenManager {
  private logs: TokenLog[] = [];
  private readonly MAX_LOGS = 100;
  private refreshInProgress = false;
  private refreshQueue: Promise<string | null> = Promise.resolve(null);

  /**
   * Log all token-related activities
   */
  private logAction(action: string, details?: string): void {
    const token = localStorage.getItem("refreshToken");
    const log: TokenLog = {
      timestamp: new Date().toISOString(),
      action,
      tokenExists: !!token,
      tokenPreview: token ? `${token.substring(0, 10)}...${token.substring(token.length - 10)}` : "NO_TOKEN",
      details,
    };

    this.logs.push(log);
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift();
    }

    // Always log to console for debugging
    /*console.log(
      `[TokenManager] ${action}`,
      {
        timestamp: log.timestamp,
        tokenExists: log.tokenExists,
        tokenPreview: log.tokenPreview,
        details,
      }
    );
    */
  }

  /**
   * Get the refresh token with logging
   */
  getRefreshToken(): string | null {
    const token = localStorage.getItem("refreshToken");
    this.logAction("GET_REFRESH_TOKEN", token ? "Token retrieved" : "No token found");
    return token;
  }

  /**
   * Set the refresh token with logging
   */
  setRefreshToken(token: string): void {
    try {
      localStorage.setItem("refreshToken", token);
      this.logAction("SET_REFRESH_TOKEN", "Token successfully stored");
    } catch (error) {
      this.logAction("SET_REFRESH_TOKEN_ERROR", `Failed to store: ${error}`);
      console.error("Error storing refresh token:", error);
    }
  }

  /**
   * Set the access token with logging
   */
  setAccessToken(token: string): void {
    try {
      localStorage.setItem("accessToken", token);
      this.logAction("SET_ACCESS_TOKEN", "Token successfully stored");
    } catch (error) {
      this.logAction("SET_ACCESS_TOKEN_ERROR", `Failed to store: ${error}`);
      console.error("Error storing access token:", error);
    }
  }

  /**
   * Get the access token with logging
   */
  getAccessToken(): string | null {
    const token = localStorage.getItem("accessToken");
    this.logAction("GET_ACCESS_TOKEN", token ? "Token retrieved" : "No token found");
    return token;
  }

  /**
   * Clear all tokens with logging
   */
  clearTokens(): void {
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      this.logAction("CLEAR_TOKENS", "All tokens removed from localStorage");
    } catch (error) {
      this.logAction("CLEAR_TOKENS_ERROR", `Failed to clear: ${error}`);
      console.error("Error clearing tokens:", error);
    }
  }

  /**
   * Check if tokens exist
   */
  hasTokens(): boolean {
    const hasAccess = !!localStorage.getItem("accessToken");
    const hasRefresh = !!localStorage.getItem("refreshToken");
    this.logAction("CHECK_TOKENS", `Access: ${hasAccess}, Refresh: ${hasRefresh}`);
    return hasAccess && hasRefresh;
  }

  /**
   * Queue refresh token requests to avoid race conditions
   */
  async queueRefresh(refreshFn: () => Promise<string | null>): Promise<string | null> {
    // If refresh is already in progress, wait for it
    if (this.refreshInProgress) {
      this.logAction("REFRESH_QUEUED", "Waiting for ongoing refresh...");
      return this.refreshQueue;
    }

    this.refreshInProgress = true;
    this.logAction("REFRESH_STARTED", "Initiating token refresh");

    this.refreshQueue = refreshFn()
      .then((newToken) => {
        this.logAction("REFRESH_SUCCESS", newToken ? "New token received" : "No token received");
        return newToken;
      })
      .catch((error) => {
        this.logAction("REFRESH_FAILED", `Error: ${error.message}`);
        return null;
      })
      .finally(() => {
        this.refreshInProgress = false;
        this.logAction("REFRESH_COMPLETED", "Token refresh process finished");
      });

    return this.refreshQueue;
  }

  /**
   * Get all logs for debugging
   */
  getLogs(): TokenLog[] {
    return [...this.logs];
  }

  /**
   * Print formatted log history
   */
  printLogs(): void {
    console.group("[TokenManager] Log History");
    console.table(this.logs);
    console.groupEnd();
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Clear logs
   */
  clearLogs(): void {
    this.logs = [];
    console.log("[TokenManager] Logs cleared");
  }
}

export const tokenManager = new TokenManager();
