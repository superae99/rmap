"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const partner_routes_1 = __importDefault(require("./routes/partner.routes"));
const area_routes_1 = __importDefault(require("./routes/area.routes"));
const sales_territory_routes_1 = __importDefault(require("./routes/sales-territory.routes"));
const kakao_routes_1 = __importDefault(require("./routes/kakao.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const error_middleware_1 = require("./middlewares/error.middleware");
dotenv_1.default.config();
// Platform.sh 환경변수 처리
if (process.env.PLATFORM_VARIABLES) {
    try {
        const platformVars = JSON.parse(Buffer.from(process.env.PLATFORM_VARIABLES, 'base64').toString());
        Object.assign(process.env, platformVars);
    }
    catch (error) {
    }
}
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:4000', // Client dev server
    'http://localhost:4001', // Client dev server (alternative port)
    'http://localhost:5173', // Vite dev server
    process.env.CORS_ORIGIN, // Production Netlify URL
].filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, etc.)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/partners', partner_routes_1.default);
app.use('/api/areas', area_routes_1.default);
app.use('/api/sales-territories', sales_territory_routes_1.default);
app.use('/api/kakao', kakao_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Debug endpoint for environment variables
app.get('/debug/env', (req, res) => {
    res.json({
        JWT_SECRET: process.env.JWT_SECRET ? 'defined' : 'undefined',
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        PLATFORM_VARIABLES: process.env.PLATFORM_VARIABLES ? 'exists' : 'not exists'
    });
});
// Error handling
app.use(error_middleware_1.errorHandler);
// Database connection and server start
console.log('🚀 Starting server...');
console.log('📊 Environment:', process.env.NODE_ENV);
console.log('🔌 Port:', PORT);
console.log('🗄️ Database:', process.env.DB_DATABASE);
database_1.AppDataSource.initialize()
    .then(() => {
    console.log('✅ Database connected successfully');
    app.listen(PORT, () => {
        console.log(`🌟 Server is running on http://localhost:${PORT}`);
        console.log(`🏥 Health check: http://localhost:${PORT}/health`);
        console.log(`🔗 API base: http://localhost:${PORT}/api`);
    });
})
    .catch((error) => {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map