import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { RootLayout } from '@/components/layouts/root-layout';
import { DashboardPage } from '@/pages/dashboard/dashboard-page';
import { AiPlaygroundPage } from '@/pages/ai/ai-playground-page';
import { KnowledgePage } from '@/pages/knowledge/knowledge-page';
import { KnowledgeSearchPage } from '@/pages/search/knowledge-search-page';

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
      {
        path: 'knowledge',
        element: <KnowledgePage />,
      },
      {
        path: 'search',
        element: <KnowledgeSearchPage />,
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
