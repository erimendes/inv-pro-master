// import {
//   createContext,
//   useEffect,
//   useState,
// } from 'react';

// interface User {
//   id: number;
//   name: string;
//   email: string;
//   role: 'ADMIN' | 'USER';
// }

// interface AuthContextData {
//   user: User | null;
//   signed: boolean;

//   signIn: (
//     userData: User,
//   ) => void;

//   signOut: () => void;
// }

// interface AuthProviderProps {
//   children: React.ReactNode;
// }

// export const AuthContext =
//   createContext(
//     {} as AuthContextData,
//   );

// export function AuthProvider({
//   children,
// }: AuthProviderProps) {
//   const [user, setUser] =
//     useState<User | null>(null);

//   // =====================================
//   // LOAD USER
//   // =====================================

//   useEffect(() => {
//     const storageUser =
//       localStorage.getItem(
//         '@APP_USER',
//       );

//     if (storageUser) {
//       setUser(
//         JSON.parse(storageUser),
//       );
//     }
//   }, []);

//   // =====================================
//   // LOGIN
//   // =====================================

//   function signIn(
//     userData: User,
//   ) {
//     localStorage.setItem(
//       '@APP_USER',
//       JSON.stringify(userData),
//     );

//     setUser(userData);
//   }

//   // =====================================
//   // LOGOUT
//   // =====================================

//   function signOut() {
//     localStorage.removeItem(
//       '@APP_USER',
//     );

//     setUser(null);
//   }

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         signed: !!user,
//         signIn,
//         signOut,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }