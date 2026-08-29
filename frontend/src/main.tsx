import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AdminLayout } from './components/AdminLayout';
import { Home } from './pages/Home';
import { Archive } from './pages/Archive';
import { ArchiveDetail } from './pages/ArchiveDetail';
import { DocumentReader } from './pages/DocumentReader';
import { Timeline } from './pages/Timeline';
import { TimelineDetail } from './pages/TimelineDetail';
import { Research } from './pages/Research';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminUpload } from './pages/AdminUpload';
import { AdminEdit } from './pages/AdminEdit';
import './styles.css';

function PublicLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Public archival website */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/archive/:id" element={<ArchiveDetail />} />
          <Route path="/archive/:id/read" element={<DocumentReader />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/timeline/:id" element={<TimelineDetail />} />
          <Route path="/research" element={<Research />} />
        </Route>

        {/* Admin portal */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="upload" element={<AdminUpload />} />
          <Route path="archive/:id/edit" element={<AdminEdit />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
