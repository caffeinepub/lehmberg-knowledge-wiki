import { useInternetIdentity } from "./useInternetIdentity";

export function useAuthState() {
  const { identity, login, clear, loginStatus, isInitializing, isLoggingIn } =
    useInternetIdentity();

  const isAuthenticated = !!identity && loginStatus !== "initializing";

  return {
    identity,
    login,
    logout: clear,
    loginStatus,
    isInitializing,
    isLoggingIn,
    isAuthenticated,
  };
}
