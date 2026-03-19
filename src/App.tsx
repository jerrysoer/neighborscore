import { lazy, Suspense } from 'react';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Report } from './pages/Report';
import { Methodology } from './pages/Methodology';
import { LoadingFallback } from './components/LoadingFallback';

const MapView = lazy(() =>
  import('./pages/MapView').then((m) => ({ default: m.MapView })),
);
const Compare = lazy(() =>
  import('./pages/Compare').then((m) => ({ default: m.Compare })),
);

const router = createHashRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/report', element: <Report /> },
      {
        path: '/compare',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Compare />
          </Suspense>
        ),
      },
      {
        path: '/map',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <MapView />
          </Suspense>
        ),
      },
      { path: '/methodology', element: <Methodology /> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
