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
  private refreshQueue: Promise<string | null> | null = null;
  private storageAvailable = true;

  constructor() {
    // Check if localStorage is available
    this.checkStorageAvailability();
    // Listen to storage events for cross-tab synchronization
    this.setupStorageListener();
  }

  /**
   * Check if localStorage is available and working
   */
  private checkStorageAvailability(): void {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      this.storageAvailable = true;
    } catch (e) {
      console.error('[TokenManager] localStorage is not available:', e);
      this.storageAvailable = false;
    }
  }

  /**
   * Setup listener for storage events (cross-tab synchronization)
   */
  private setupStorageListener(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('storage', (e: StorageEvent) => {
      // Only react to token changes from other tabs
      if (e.key === 'accessToken' || e.key === 'refreshToken') {
        this.logAction('STORAGE_CHANGE_DETECTED', 
          `Key: ${e.key}, Old: ${e.oldValue ? 'exists' : 'null'}, New: ${e.newValue ? 'exists' : 'null'}`
        );

        // If tokens were cleared in another tab, redirect to login
        if (!e.newValue && (e.key === 'refreshToken' || e.key === 'accessToken')) {
          const hasRefresh = !!localStorage.getItem('refreshToken');
          const hasAccess = !!localStorage.getItem('accessToken');
          
          if (!hasRefresh && !hasAccess) {
            console.warn('[TokenManager] Tokens cleared in another tab, redirecting to login');
            window.location.href = '/';
          }
        }
      }
    });
  }

  /**
   * Log all token-related activities
   */
  private logAction(action: string, details?: string): void {
    if (!this.storageAvailable) return;

    try {
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
    } catch (error) {
      console.error('[TokenManager] Error logging action:', error);
    }
  }

  /**
   * Get the refresh token with logging
   */
  getRefreshToken(): string | null {
    if (!this.storageAvailable) {
      this.logAction("GET_REFRESH_TOKEN_ERROR", "localStorage not available");
      return null;
    }

    try {
      const token = localStorage.getItem("refreshToken");
      this.logAction("GET_REFRESH_TOKEN", token ? "Token retrieved" : "No token found");
      return token;
    } catch (error) {
      this.logAction("GET_REFRESH_TOKEN_ERROR", `Error: ${error}`);
      console.error('[TokenManager] Error getting refresh token:', error);
      return null;
    }
  }

  /**
   * Set the refresh token with logging
   */
  setRefreshToken(token: string): void {
    if (!this.storageAvailable) {
      this.logAction("SET_REFRESH_TOKEN_ERROR", "localStorage not available");
      console.error('[TokenManager] Cannot set refresh token: localStorage unavailable');
      return;
    }

    if (!token || token.trim() === '') {
      this.logAction("SET_REFRESH_TOKEN_ERROR", "Empty or invalid token");
      console.error('[TokenManager] Cannot set empty refresh token');
      return;
    }

    try {
      localStorage.setItem("refreshToken", token);
      this.logAction("SET_REFRESH_TOKEN", "Token successfully stored");
    } catch (error) {
      this.logAction("SET_REFRESH_TOKEN_ERROR", `Failed to store: ${error}`);
      console.error("[TokenManager] Error storing refresh token:", error);
      
      // Try to clear space and retry once
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn('[TokenManager] localStorage quota exceeded, attempting cleanup...');
        try {
          // Clear only our tokens to make space
          localStorage.removeItem('accessToken');
          localStorage.setItem("refreshToken", token);
          this.logAction("SET_REFRESH_TOKEN", "Token stored after cleanup");
        } catch (retryError) {
          console.error('[TokenManager] Retry failed:', retryError);
        }
      }
    }
  }

  /**
   * Set the access token with logging
   */
  setAccessToken(token: string): void {
    if (!this.storageAvailable) {
      this.logAction("SET_ACCESS_TOKEN_ERROR", "localStorage not available");
      console.error('[TokenManager] Cannot set access token: localStorage unavailable');
      return;
    }

    if (!token || token.trim() === '') {
      this.logAction("SET_ACCESS_TOKEN_ERROR", "Empty or invalid token");
      console.error('[TokenManager] Cannot set empty access token');
      return;
    }

    try {
      localStorage.setItem("accessToken", token);
      this.logAction("SET_ACCESS_TOKEN", "Token successfully stored");
    } catch (error) {
      this.logAction("SET_ACCESS_TOKEN_ERROR", `Failed to store: ${error}`);
      console.error("[TokenManager] Error storing access token:", error);
    }
  }

  /**
   * Get the access token with logging
   */
  getAccessToken(): string | null {
    if (!this.storageAvailable) {
      this.logAction("GET_ACCESS_TOKEN_ERROR", "localStorage not available");
      return null;
    }

    try {
      const token = localStorage.getItem("accessToken");
      this.logAction("GET_ACCESS_TOKEN", token ? "Token retrieved" : "No token found");
      return token;
    } catch (error) {
      this.logAction("GET_ACCESS_TOKEN_ERROR", `Error: ${error}`);
      console.error('[TokenManager] Error getting access token:', error);
      return null;
    }
  }

  /**
   * Clear all tokens with logging
   */
  clearTokens(): void {
    if (!this.storageAvailable) {
      this.logAction("CLEAR_TOKENS_ERROR", "localStorage not available");
      return;
    }

    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      this.logAction("CLEAR_TOKENS", "All tokens removed from localStorage");
    } catch (error) {
      this.logAction("CLEAR_TOKENS_ERROR", `Failed to clear: ${error}`);
      console.error("[TokenManager] Error clearing tokens:", error);
    }
  }

  /**
   * Check if tokens exist
   */
  hasTokens(): boolean {
    if (!this.storageAvailable) {
      this.logAction("CHECK_TOKENS_ERROR", "localStorage not available");
      return false;
    }

    try {
      const hasAccess = !!localStorage.getItem("accessToken");
      const hasRefresh = !!localStorage.getItem("refreshToken");
      this.logAction("CHECK_TOKENS", `Access: ${hasAccess}, Refresh: ${hasRefresh}`);
      return hasAccess && hasRefresh;
    } catch (error) {
      this.logAction("CHECK_TOKENS_ERROR", `Error: ${error}`);
      console.error('[TokenManager] Error checking tokens:', error);
      return false;
    }
  }

  /**
   * Queue refresh token requests to avoid race conditions
   */
  async queueRefresh(refreshFn: () => Promise<string | null>): Promise<string | null> {
    // If refresh is already in progress, wait for it
    if (this.refreshInProgress && this.refreshQueue) {
      this.logAction("REFRESH_QUEUED", "Waiting for ongoing refresh...");
      return this.refreshQueue;
    }

    this.refreshInProgress = true;
    this.logAction("REFRESH_STARTED", "Initiating token refresh");

    this.refreshQueue = (async () => {
      try {
        const newToken = await refreshFn();
        this.logAction("REFRESH_SUCCESS", newToken ? "New token received" : "No token received");
        return newToken;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logAction("REFRESH_FAILED", `Error: ${errorMessage}`);
        
        // Clear tokens on refresh failure to prevent retry loops
        this.clearTokens();
        
        throw error;
      } finally {
        this.refreshInProgress = false;
        this.refreshQueue = null;
        this.logAction("REFRESH_COMPLETED", "Token refresh process finished");
      }
    })();

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
