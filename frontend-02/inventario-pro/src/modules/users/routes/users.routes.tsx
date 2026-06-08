// src/modules/users/routes/users.routes.tsx

// src/modules/users/routes/users.routes.tsx
import UsersListPage from "../pages/UsersListPage";
import UserFormPage from "../pages/UserFormPage";
import UserDetailsPage from "../pages/UserDetailsPage";

export const usersRoutes = [
  {
    path: "/users",
    element: <UsersListPage />,
  },

  {
    path: "/users/new", // Criação de um novo usuário
    element: <UserFormPage />,
  },

  {
    path: "/users/:id", // Detalhes/Visualização do usuário (ID puro)
    element: <UserDetailsPage />,
  },

  {
    path: "/users/:id/edit", // Edição do usuário (ID + sufixo /edit)
    element: <UserFormPage />,
  },
];