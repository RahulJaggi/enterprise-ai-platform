import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { RootLayout } from '@/components/layouts/root-layout';
import { DashboardPage } from '@/pages/dashboard/dashboard-page';
import { AiPlaygroundPage } from '@/pages/ai/ai-playground-page';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'ai',
        element: <AiPlaygroundPage />,
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
