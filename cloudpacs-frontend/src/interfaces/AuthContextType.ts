import type { LoginCredentials } from "./LoginCredentials";
import type { User } from "./User";

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
}