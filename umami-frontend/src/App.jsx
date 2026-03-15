import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { MainLayout } from './layouts/MainLayout';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ProtectedRoute } from './components/ProtectedRoute';

// Lazy load pages
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Explore = lazy(() => import('./pages/Explore').then(m => ({ default: m.Explore })));
const Search = lazy(() => import('./pages/Search').then(m => ({ default: m.Search })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const Notifications = lazy(() => import('./pages/Notifications').then(m => ({ default: m.Notifications })));
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const PostDetail = lazy(() => import('./pages/PostDetail').then(m => ({ default: m.PostDetail })));
const RecipeDetail = lazy(() => import('./pages/RecipeDetail').then(m => ({ default: m.RecipeDetail })));
const Chat = lazy(() => import('./pages/Chat').then(m => ({ default: m.Chat })));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Signup = lazy(() => import('./pages/Signup').then(m => ({ default: m.Signup })));
const CreatePost = lazy(() => import('./pages/CreatePost').then(m => ({ default: m.CreatePost })));
const CreateRecipe = lazy(() => import('./pages/CreateRecipe').then(m => ({ default: m.CreateRecipe })));
const AIChat = lazy(() => import('./pages/AIChat').then(m => ({ default: m.AIChat })));

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <AuthProvider>
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
                    <Route path="search" element={<Search />} />
                    <Route path="u/:username" element={<Profile />} />
                    <Route path="posts/:id" element={<PostDetail />} />
                    <Route path="recipes/:id" element={<RecipeDetail />} />
                    
                    {/* Protected Private Routes */}
                    <Route path="notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                    <Route path="messages" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                    <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                    <Route path="create/post" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
                    <Route path="create/recipe" element={<ProtectedRoute><CreateRecipe /></ProtectedRoute>} />
                    <Route path="ai-chat" element={<ProtectedRoute><AIChat /></ProtectedRoute>} />
                  </Route>
                </Routes>
              </Suspense>
            </Router>
          </ThemeProvider>
        </AuthProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export { App };
