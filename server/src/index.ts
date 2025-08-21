import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import entriesRouter from './routes/entries';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Supabase client
export const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

// Test Supabase connection
async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('entries')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection error:', error);
    } else {
      console.log('Supabase connection successful');
    }
  } catch (error) {
    console.error('Supabase connection test failed:', error);
  }
}

// Middleware
app.use(helmet());

// CORS configuration for multiple environments
const allowedOrigins = [
  'http://localhost:5173',  // ローカル開発環境
  'http://localhost:3000',  // 代替ローカル環境
  process.env.FRONTEND_URL, // 本番環境のフロントエンドURL
  // 複数のドメインを追加可能
  // 'https://yourdomain.vercel.app',
  // 'https://yourdomain.netlify.app'
].filter(Boolean); // undefinedを除外

app.use(cors({
  origin: function (origin, callback) {
    // モバイルアプリや同一サーバーからのリクエストの場合、originがundefinedになることがある
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));

app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Routes
app.use('/api/entries', entriesRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await testSupabaseConnection();
});
