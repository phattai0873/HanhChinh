import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { dashboardService } from '../../services';
import './Dashboard.css';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [pendingTasks, setPendingTasks] = useState(null);
    const [recentActivities, setRecentActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [statsData, tasksData, activitiesData] = await Promise.all([
                dashboardService.getStats(),
                dashboardService.getPendingTasks(),
                dashboardService.getRecentActivities(10)
            ]);

            setStats(statsData);
            setPendingTasks(tasksData);
            setRecentActivities(activitiesData);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="loading">Đang tải dữ liệu...</div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="dashboard-page">
                <div className="dashboard-header">
                    <h1>📊 Dashboard</h1>
                    <p>Tổng quan hệ thống quản lý hành chính</p>
                </div>

                {/* Pending Tasks */}
                {pendingTasks && (
                    <section className="pending-tasks">
                        <h2>⏰ Công việc cần xử lý</h2>
                        <div className="tasks-grid">
                            <div className="task-card urgent">
                                <div className="task-icon">📄</div>
                                <div className="task-info">
                                    <h3>{pendingTasks.pending_files || 0}</h3>
                                    <p>Hồ sơ chờ xử lý</p>
                                </div>
                            </div>
                            <div className="task-card warning">
                                <div className="task-icon">💬</div>
                                <div className="task-info">
                                    <h3>{pendingTasks.pending_feedbacks || 0}</h3>
                                    <p>Phản ánh chờ xử lý</p>
                                </div>
                            </div>
                            <div className="task-card info">
                                <div className="task-icon">📥</div>
                                <div className="task-info">
                                    <h3>{pendingTasks.pending_incoming_docs || 0}</h3>
                                    <p>Văn bản đến chờ xử lý</p>
                                </div>
                            </div>
                            {pendingTasks.pending_outgoing_docs !== undefined && (
                                <div className="task-card success">
                                    <div className="task-icon">📤</div>
                                    <div className="task-info">
                                        <h3>{pendingTasks.pending_outgoing_docs || 0}</h3>
                                        <p>Văn bản đi chờ duyệt</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Statistics Overview */}
                {stats && (
                    <section className="stats-overview">
                        <h2>📈 Thống kê tổng quan</h2>

                        {/* Files Stats */}
                        <div className="stat-section">
                            <h3>📁 Hồ sơ</h3>
                            <div className="stat-cards">
                                <div className="stat-card">
                                    <span className="stat-label">Tổng số</span>
                                    <span className="stat-value">{stats.files?.total || 0}</span>
                                </div>
                                <div className="stat-card pending">
                                    <span className="stat-label">Chờ xử lý</span>
                                    <span className="stat-value">{stats.files?.pending || 0}</span>
                                </div>
                                <div className="stat-card processing">
                                    <span className="stat-label">Đang xử lý</span>
                                    <span className="stat-value">{stats.files?.processing || 0}</span>
                                </div>
                                <div className="stat-card completed">
                                    <span className="stat-label">Hoàn thành</span>
                                    <span className="stat-value">{stats.files?.completed || 0}</span>
                                </div>
                                <div className="stat-card rejected">
                                    <span className="stat-label">Từ chối</span>
                                    <span className="stat-value">{stats.files?.rejected || 0}</span>
                                </div>
                            </div>
                        </div>

                        {/* Feedbacks Stats */}
                        <div className="stat-section">
                            <h3>💬 Phản ánh kiến nghị</h3>
                            <div className="stat-cards">
                                <div className="stat-card">
                                    <span className="stat-label">Tổng số</span>
                                    <span className="stat-value">{stats.feedbacks?.total || 0}</span>
                                </div>
                                <div className="stat-card pending">
                                    <span className="stat-label">Chờ xử lý</span>
                                    <span className="stat-value">{stats.feedbacks?.pending || 0}</span>
                                </div>
                                <div className="stat-card processing">
                                    <span className="stat-label">Đang xử lý</span>
                                    <span className="stat-value">{stats.feedbacks?.processing || 0}</span>
                                </div>
                                <div className="stat-card completed">
                                    <span className="stat-label">Đã giải quyết</span>
                                    <span className="stat-value">{stats.feedbacks?.resolved || 0}</span>
                                </div>
                                <div className="stat-card rejected">
                                    <span className="stat-label">Từ chối</span>
                                    <span className="stat-value">{stats.feedbacks?.rejected || 0}</span>
                                </div>
                            </div>
                        </div>

                        {/* Users Stats */}
                        <div className="stat-section">
                            <h3>👥 Người dùng</h3>
                            <div className="stat-cards">
                                <div className="stat-card">
                                    <span className="stat-label">Tổng số</span>
                                    <span className="stat-value">{stats.users?.total || 0}</span>
                                </div>
                                <div className="stat-card info">
                                    <span className="stat-label">Người dân</span>
                                    <span className="stat-value">{stats.users?.citizens || 0}</span>
                                </div>
                                <div className="stat-card success">
                                    <span className="stat-label">Cán bộ</span>
                                    <span className="stat-value">{stats.users?.staff || 0}</span>
                                </div>
                                <div className="stat-card warning">
                                    <span className="stat-label">Lãnh đạo</span>
                                    <span className="stat-value">{stats.users?.leaders || 0}</span>
                                </div>
                                <div className="stat-card urgent">
                                    <span className="stat-label">Quản trị</span>
                                    <span className="stat-value">{stats.users?.admins || 0}</span>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Recent Activities */}
                {recentActivities.length > 0 && (
                    <section className="recent-activities">
                        <h2>🕐 Hoạt động gần đây</h2>
                        <div className="activities-list">
                            {recentActivities.map((activity, index) => (
                                <div key={index} className="activity-item">
                                    <div className="activity-icon">
                                        {activity.record_type === 'file' && '📄'}
                                        {activity.record_type === 'feedback' && '💬'}
                                        {activity.record_type === 'document' && '📋'}
                                    </div>
                                    <div className="activity-content">
                                        <p className="activity-action">
                                            <strong>{activity.user_name}</strong> {activity.action}
                                        </p>
                                        {activity.note && (
                                            <p className="activity-note">{activity.note}</p>
                                        )}
                                        <span className="activity-time">
                                            {new Date(activity.created_at).toLocaleString('vi-VN')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </Layout>
    );
};

export default Dashboard;
