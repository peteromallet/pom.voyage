import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { SiteFrame } from './components/SiteFrame';
import type { InitialData } from './types';
import { HomePage } from './pages/Home';
import { NotFoundPage } from './pages/NotFound';
import { PostPage } from './pages/Post';
import { PostsPage } from './pages/Posts';
import { AccountabilityPage } from './pages/Accountability';
import { AssortedPage } from './pages/Assorted';
import { CryptoConversationPage } from './pages/CryptoConversation';
import { ExperimentsPage } from './pages/Experiments';
import { CryptoConversationsPage } from './pages/CryptoConversations';
import { FeedbackPage } from './pages/Feedback';
import { MuteListPage } from './pages/MuteList';
import { ProjectsPage } from './pages/Projects';
import { RecommendationsPage } from './pages/Recommendations';

interface AppProps {
  initialData: InitialData;
}

export function App({ initialData: ssrData }: AppProps) {
  const location = useLocation();
  const [ssrPath] = useState(location.pathname);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  // Only use SSR data if we're still on the page that was server-rendered.
  // Any client-side navigation to a different path gets no SSR data.
  const initialData = location.pathname === ssrPath ? ssrData : ({ page: 'home' } as InitialData);
  return (
    <Routes>
      <Route
        path="/"
        element={
          <SiteFrame showFooter>
            <HomePage />
          </SiteFrame>
        }
      />
      <Route
        path="/posts"
        element={
          <SiteFrame showFooter>
            <PostsPage posts={initialData.page === 'posts' ? initialData.posts : undefined} />
          </SiteFrame>
        }
      />
      <Route
        path="/posts/:slug"
        element={
          <SiteFrame>
            <PostPage data={initialData.page === 'post' ? initialData.postPage : undefined} />
          </SiteFrame>
        }
      />
      <Route
        path="/assorted"
        element={
          <SiteFrame showFooter>
            <AssortedPage />
          </SiteFrame>
        }
      />
      <Route
        path="/assorted/experiments"
        element={
          <SiteFrame showFooter>
            <ExperimentsPage />
          </SiteFrame>
        }
      />
      <Route
        path="/assorted/accountability"
        element={
          <SiteFrame showFooter>
            <AccountabilityPage />
          </SiteFrame>
        }
      />
      <Route
        path="/assorted/projects"
        element={
          <SiteFrame showFooter>
            <ProjectsPage />
          </SiteFrame>
        }
      />
      <Route
        path="/assorted/crypto-conversations"
        element={
          <SiteFrame showFooter>
            <CryptoConversationsPage />
          </SiteFrame>
        }
      />
      <Route
        path="/assorted/crypto-conversations/:id"
        element={
          <SiteFrame showFooter>
            <CryptoConversationPage conversationId={initialData.page === 'crypto-conversation' ? initialData.conversationId : undefined} />
          </SiteFrame>
        }
      />
      <Route
        path="/assorted/feedback"
        element={
          <SiteFrame showFooter>
            <FeedbackPage feedback={initialData.page === 'feedback' ? initialData.feedback : undefined} />
          </SiteFrame>
        }
      />
      <Route
        path="/assorted/mute-list"
        element={
          <SiteFrame showFooter>
            <MuteListPage />
          </SiteFrame>
        }
      />
      <Route
        path="/assorted/recommendations"
        element={
          <SiteFrame showFooter>
            <RecommendationsPage recommendations={initialData.page === 'recommendations' ? initialData.recommendations : undefined} />
          </SiteFrame>
        }
      />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
