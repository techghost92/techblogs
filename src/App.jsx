import { Routes, Route } from 'react-router-dom';
import BaseLayout from './layouts/BaseLayout.jsx';
import Home from './pages/Home.jsx';
import BlogIndex from './pages/BlogIndex.jsx';
import PostPage from './pages/PostPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<BaseLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<BlogIndex />} />
        <Route path="/blog/tag/:tag" element={<BlogIndex />} />
        <Route path="/blog/:slug" element={<PostPage />} />
      </Route>
    </Routes>
  );
}
