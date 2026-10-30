"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables first
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const models_1 = require("./models");
const api_1 = __importDefault(require("./routes/api"));
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 5000;
// Enable CORS with default settings
app.use((0, cors_1.default)({
    origin: '*',
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Mount all unified API routes under /api
app.use('/api', api_1.default);
// Health check endpoint
app.get('/health', (_req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Global 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});
// Start DB & Express Server
async function startServer() {
    await (0, models_1.initDB)();
    app.listen(PORT, () => {
        console.log(`[NexGen Power API] Server is running on port ${PORT}`);
    });
}
startServer().catch((err) => {
    console.error('[NexGen Power API] Server failed to start:', err);
});
exports.default = app;
