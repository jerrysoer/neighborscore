import { createHashRouter, RouterProvider } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Report } from './pages/Report';
import { Compare } from './pages/Compare';
import { MapView } from './pages/MapView';
import { Methodology } from './pages/Methodology';

const router = createHashRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/report', element: <Report /> },
      { path: '/compare', element: <Compare /> },
      { path: '/map', element: <MapView /> },
      { path: '/methodology', element: <Methodology /> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
