import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './context/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { MainLayout } from './layouts/MainLayout';
import { LoadingSpinner } from './components/LoadingSpinner';

// Lazy load pages
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Explore = lazy(() => import('./pages/Explore').then(m => ({ default: m.Explore })));
const Notifications = lazy(() => import('./pages/Notifications').then(m => ({ default: m.Notifications })));
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const PostDetail = lazy(() => import('./pages/PostDetail').then(m => ({ default: m.PostDetail })));
const RecipeDetail = lazy(() => import('./pages/RecipeDetail').then(m => ({ default: m.RecipeDetail })));
const Chat = lazy(() => import('./pages/Chat').then(m => ({ default: m.Chat })));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Signup = lazy(() => import('./pages/Signup').then(m => ({ default: m.Signup })));

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <ThemeProvider>
          <Router>
            <Suspense fallback={
              <div className="flex justify-center items-center h-screen">
                <LoadingSpinner size="lg" />
              </div>
            }>
              <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Main App Routes */}
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<Home />} />
                  <Route path="explore" element={<Explore />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="messages" element={<Chat />} />
                  <Route path="u/:username" element={<Profile />} />
                  <Route path="posts/:id" element={<PostDetail />} />
                  <Route path="recipes/:id" element={<RecipeDetail />} />
                </Route>
              </Routes>
            </Suspense>
          </Router>
        </ThemeProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export { App };
