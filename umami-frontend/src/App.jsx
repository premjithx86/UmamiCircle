import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { MainLayout } from './layouts/MainLayout';
import { Home } from './pages/Home';
import { Explore } from './pages/Explore';
import { Notifications } from './pages/Notifications';
import { Profile } from './pages/Profile';
import { PostDetail } from './pages/PostDetail';
import { RecipeDetail } from './pages/RecipeDetail';
import { Chat } from './pages/Chat';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <Routes>
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
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export { App };
