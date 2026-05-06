import { createContext } from "react";
import type { User } from "../../../shared/types.ts";

type AuthContextData = [User | null | undefined, (user: User | null | undefined) => void];

// Context for storing the page's current authentication state.
// If the context's value is a User, the current user is logged in.
// If the context's value is null, the current user is not logged in.
// If the context's value is undefined, the page's authentication state has not been determined.
const AuthContext = createContext<AuthContextData>([undefined, () => {}]);

export default AuthContext;
