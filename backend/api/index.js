// Vercel Serverless Function entry point for Express API
const imported = require('../dist/index');
const app = imported.default || imported;

module.exports = app;
