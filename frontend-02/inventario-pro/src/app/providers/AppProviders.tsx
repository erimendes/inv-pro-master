// src/app/providers/AppProviders.tsx
import { AuthProvider } from '../../modules/auth/context/AuthContext';
// futuramente:
// import { ThemeProvider } from './ThemeProvider';
// import { QueryProvider } from './QueryProvider';

interface Props {
  children: React.ReactNode;
}

export function AppProviders({ children }: Props) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}