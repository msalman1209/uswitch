"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const models_1 = require("./models");
const api_1 = __importDefault(require("./routes/api"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Enable CORS with default settings (allow requests from frontend dev server)
app.use((0, cors_1.default)({
    origin: '*', // In production, replace with specific domain
    credentials: true
}));
app.use(express_1.default.json());
// Routes
app.use('/api', api_1.default);
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});
// Start DB & Express Server
async function startServer() {
    await (0, models_1.initDB)();
    app.listen(PORT, () => {
        console.log(`[Uswitch API] Server is running on port ${PORT}`);
    });
}
startServer().catch((err) => {
    console.error('Server failed to start:', err);
});
