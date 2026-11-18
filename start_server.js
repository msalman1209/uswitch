console.log('Testing start server...');
try {
  require('./backend/node_modules/dotenv').config({ path: './backend/.env' });
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  require('./backend/dist/index.js');
} catch (e) {
  console.error('SERVER ERROR:', e);
}
