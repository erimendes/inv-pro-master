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
    path: "/users/new",
    element: <UserFormPage />,
  },

  {
    path: "/users/:id",
    element: <UserDetailsPage />,
  },

  {
    path: "/users/:id/edit",
    element: <UserFormPage />,
  },
];