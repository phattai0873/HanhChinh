import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Sidebar() {
    const { user } = useAuth();

    const menuItems = [
        { label: 'Dashboard', path: '/dashboard', roles: ['admin', 'staff', 'citizen'] },
        { label: 'Submit Request', path: '/citizens/submit-request', roles: ['citizen'] },
        { label: 'Track Request', path: '/citizens/track-request', roles: ['citizen'] },
        { label: 'Feedback', path: '/citizens/feedback', roles: ['citizen'] },
        { label: 'Receive File', path: '/onegate/receive-file', roles: ['onegate'] },
        { label: 'File List', path: '/onegate/file-list', roles: ['onegate'] },
        { label: 'Assign File', path: '/onegate/assign-file', roles: ['onegate'] },
        { label: 'Process File', path: '/processing/process-file', roles: ['processing'] },
        { label: 'Incoming', path: '/documents/incoming', roles: ['processing'] },
        { label: 'Outgoing', path: '/documents/outgoing', roles: ['processing'] },
        { label: 'Feedback List', path: '/feedback/feedback-list', roles: ['admin', 'staff'] },
        { label: 'Users', path: '/admin/users', roles: ['admin'] },
        { label: 'Roles', path: '/admin/roles', roles: ['admin'] },
        { label: 'Settings', path: '/admin/settings', roles: ['admin'] },
    ];

    const visibleItems = menuItems.filter(item =>
        user && item.roles.includes(user.role)
    );

    return (
        <aside className="w-64 bg-gray-900 text-white min-h-screen p-4">
            <nav className="space-y-2">
                {visibleItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className="block px-4 py-2 rounded hover:bg-gray-800 transition"
                    >
                        {item.label}
                    </Link>
                ))}
            </nav>
            <div className="absolute bottom-0 left-0 w-full p-6 bg-slate-950/50 backdrop-blur-sm">
                <Link
                    to="/"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
                >
                    <span className="text-xl">🏠</span>
                    <span className="font-medium">Về trang chủ</span>
                </Link>
            </div>
        </aside>
    );
}
