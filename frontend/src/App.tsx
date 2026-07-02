import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import CandidatoPage from './pages/CandidatoPage';
import AdminPage from './pages/AdminPage';
import './styles/globals.css';

const router = createBrowserRouter(
  [
    { path: '/prueba/:token', element: <CandidatoPage /> },
    { path: '/admin', element: <AdminPage /> },
    { path: '/', element: <Navigate to="/admin" replace /> },
    { path: '*', element: <Navigate to="/admin" replace /> },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
    },
  }
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
