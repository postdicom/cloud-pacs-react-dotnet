import { createContext } from "react";

export const UserContext = createContext();

export function UserProvider({children}){
    const[user, setUser] = useState();

    async function register(email, password){
        
    }

    async function login(email, password){
        
    }

    async function logout(){
        
    }

    return(
        <UserContext.Provider value={ user, register, login, logout}>
            {children}
        </UserContext.Provider>
    )
}