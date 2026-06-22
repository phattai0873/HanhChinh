import Navbar from './Navbar';
import './Layout.css';

const Layout = ({ children }) => {
    return (
        <div className="layout">
            <Navbar />
            <main className="main-content">
                {children}
            </main>
            <footer className="footer">
                <div className="footer-content">
                    <p>&copy; 2026 UBND Phường/Xã - Hệ thống Quản lý Hành chính Điện tử</p>
                    <p>Phát triển bởi Đội ngũ CNTT</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
