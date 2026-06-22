import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/home" className="navbar-logo">
                    <span className="logo-icon">🏛️</span>
                    <span className="logo-text">Hành Chính Điện Tử</span>
                </Link>

                <div className="navbar-menu">
                    <Link to="/home" className="nav-link">Trang chủ</Link>

                    {user?.role === 'citizen' ? (
                        <>
                            <Link to="/citizens/submit-request" className="nav-link">Nộp hồ sơ</Link>
                            <Link to="/citizens/track-request" className="nav-link">Tra cứu hồ sơ</Link>
                            <Link to="/feedback" className="nav-link">Phản ánh</Link>
                        </>
                    ) : (
                        <>
                            <Link to="/dashboard" className="nav-link">Dashboard</Link>
                            <Link to="/onegate/file-list" className="nav-link">Quản lý hồ sơ</Link>
                            <Link to="/feedback/feedback-list" className="nav-link">Phản ánh</Link>
                            {['admin', 'leader'].includes(user?.role) && (
                                <Link to="/admin/users" className="nav-link">Quản trị</Link>
                            )}
                        </>
                    )}
                </div>

                <div className="navbar-user">
                    <div className="user-info">
                        <span className="user-icon">👤</span>
                        <span className="user-name">{user?.full_name}</span>
                        <span className="user-role">({user?.role})</span>
                    </div>
                    <button onClick={handleLogout} className="logout-btn">
                        Đăng xuất
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
