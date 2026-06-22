import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

// Pages
import Login from '../pages/auth/Login';
import AdminLogin from '../pages/admin/Login';
import Register from '../pages/auth/Register';
import Home from '../pages/Home';
import Services from '../pages/Services';
import ServiceDetail from '../pages/ServiceDetail';
import Track from '../pages/Track';
import FeedbackUser from '../pages/feedback/FeedbackUser';
import News from '../pages/News';
import NewsDetail from '../pages/NewsDetail';
import Contact from '../pages/Contact';
import Dashboard from '../pages/admin/Dashboard';
// import SubmitRequest from '../pages/citizens/SubmitRequest';
// import TrackRequest from '../pages/citizens/TrackRequest';
// import Feedback from '../pages/citizens/Feedback';
// import ReceiveFile from '../pages/onegate/ReceiveFile';
import FileList from '../pages/onegate/FileList';
// import AssignFile from '../pages/onegate/AssignFile';
// import ProcessFile from '../pages/processing/ProcessFile';
// import Result from '../pages/processing/Result';
import Documents from '../pages/documents/Documents';
import DocumentDetail from '../pages/documents/DocumentDetail';

import FeedbackList from '../pages/feedback/FeedbackList';
import FeedbackDetail from '../pages/feedback/FeedbackDetail';
import ContactList from '../pages/admin/ContactList';
import Users from '../pages/admin/Users';
import NewsManagement from '../pages/admin/News';
import Roles from '../pages/admin/Roles';
import Staff from '../pages/admin/Staff';
import Settings from '../pages/admin/Settings';
import FileDetail from '../pages/admin/FileDetail';
import Schedules from '../pages/admin/Schedules';

export default function AppRoutes() {
    return (
        <Routes>
            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/register" element={<Register />} />

            {/* Public routes */}
            <Route path="/home" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
            <Route path="/track" element={<Track />} />
            <Route path="/feedback" element={<FeedbackUser />} />
            <Route path="/news" element={<News />} />
            <Route path="/news/:id" element={<NewsDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Admin routes - commented out until created */}
            {/* <Route path="/citizens/submit-request" element={<SubmitRequest />} /> */}
            {/* <Route path="/citizens/track-request" element={<TrackRequest />} /> */}
            {/* <Route path="/citizens/feedback" element={<Feedback />} /> */}
            {/* <Route path="/onegate/receive-file" element={<ReceiveFile />} /> */}
            {/* <Route path="/onegate/file-list" element={<FileList />} /> */}
            {/* <Route path="/onegate/assign-file" element={<AssignFile />} /> */}
            {/* <Route path="/processing/process-file" element={<ProcessFile />} /> */}
            {/* <Route path="/processing/result" element={<Result />} /> */}
            <Route path="/admin/documents" element={<Documents />} />
            <Route path="/admin/documents/view/:id" element={<DocumentDetail />} />
            <Route path="/admin/feedbacks" element={<FeedbackList />} />
            <Route path="/admin/feedbacks/:id" element={<FeedbackDetail />} />
            <Route path="/admin/contacts" element={<ContactList />} />
            <Route path="/admin/applications" element={<FileList />} />
            <Route path="/admin/applications/:type" element={<FileList />} />
            <Route path="/admin/files/:id" element={<FileDetail />} />
            <Route path="/admin/schedules" element={<Schedules />} />
            <Route path="/admin/news" element={<NewsManagement />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/roles" element={<Roles />} />
            <Route path="/admin/staff" element={<Staff />} />
            {<Route path="/admin/settings" element={<Settings />} />}

            <Route path="/" element={<Navigate to="/home" />} />
            {/* <Route path="*" element={<Navigate to="/home" />} /> */}
        </Routes>
    );
}
