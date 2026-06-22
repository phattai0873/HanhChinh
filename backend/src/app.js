const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middlewares
// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static('uploads'));

const authRoutes = require('./routes/auth.routes');
const fileRoutes = require('./routes/file.routes');
const feedbackRoutes = require('./routes/feedback.routes');
const userRoutes = require('./routes/user.routes');
const citizenRoutes = require('./routes/citizen.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const applicationRoutes = require('./routes/application.routes');
const newsRoutes = require('./routes/news.routes');
const documentRoutes = require('./routes/document.routes');
const contactRoutes = require('./routes/contact.routes');
const testRoutes = require('./routes/test.routes');
const scheduleRoutes = require('./routes/schedule.routes');

app.use('/api/test', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/feedbacks', feedbackRoutes);
app.use('/api/users', userRoutes);
app.use('/api/citizens', citizenRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/schedules', scheduleRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Có lỗi xảy ra!' });
});

module.exports = app;
