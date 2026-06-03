import { useAuth } from '../../app/providers/AuthContext';

export function Notification() {
  const { user } = useAuth(); // Aqui pegamos o "Francisco" do seu banco
  
  if (!user) return null;

  return (
    <div className="fixed bottom-20 right-6 animate-bounce">
      <span>Bem-vindo de volta, {user.name}!</span>
    </div>
  );
}