import { HashRouter, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import MockBanner from './components/MockBanner';
import OfflineBanner from './components/OfflineBanner';
import DevBadge from './components/DevBadge';
import PrintHeader from './components/PrintHeader';
import Home from './pages/Home';
import Schools from './pages/Schools';
import SchoolDetail from './components/SchoolDetail';
import Board from './pages/Board';
import Privacy from './pages/Privacy';
import MyProfile from './pages/MyProfile';
import DeletionRestoreBanner from './components/DeletionRestoreBanner';
import Faq from './pages/Faq';
import Edu from './pages/Edu';
import EduTopic from './pages/EduTopic';
import Recommendation from './pages/Recommendation';
import RecommendationCategory from './pages/RecommendationCategory';
import Support from './pages/Support';
import NotFound from './pages/NotFound';
import { WorkflowProgressProvider } from './lib/WorkflowProgressContext';
import PostOnboardingLoginPrompt from './components/PostOnboardingLoginPrompt';
import SkipLoginConsentPrompt from './components/SkipLoginConsentPrompt';

export default function App() {
  return (
    <HashRouter>
      <WorkflowProgressProvider>
        <div className="min-h-screen flex flex-col">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2
                       focus:z-50 focus:bg-brand-burgundy focus:text-white
                       focus:px-4 focus:py-2 focus:rounded-lg focus:no-underline"
          >
            跳至主內容
          </a>
          <MockBanner />
          <OfflineBanner />
          <Header />
          <DeletionRestoreBanner />
          <main id="main-content" className="flex-1 container-content py-8">
            <PrintHeader />
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/schools" element={<Schools />} />
                <Route path="/schools/:id" element={<SchoolDetail />} />
                <Route path="/board" element={<Board />} />
                <Route path="/faq" element={<Faq />} />
                <Route path="/edu" element={<Edu />} />
                <Route path="/edu/:slug" element={<EduTopic />} />
                <Route path="/recommendation" element={<Recommendation />} />
                <Route path="/recommendation/:slug" element={<RecommendationCategory />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/support" element={<Support />} />
                <Route path="/my-profile" element={<MyProfile />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ErrorBoundary>
          </main>
          <Footer />
          <DevBadge />
          <PostOnboardingLoginPrompt />
          <SkipLoginConsentPrompt />
        </div>
      </WorkflowProgressProvider>
    </HashRouter>
  );
}
