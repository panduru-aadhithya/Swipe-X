import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

let isConnected = false;
let isConnecting = false;

export function resolveMongoUri(): string | undefined {
  let uri = process.env.MONGODB_URI;

  if (!uri || uri.trim() === '') {
    const candidatePaths = [
      path.resolve(process.cwd(), '.env'),
      path.resolve(process.cwd(), 'backend/.env'),
      path.resolve(process.cwd(), 'backend/.env.example'),
      path.resolve(process.cwd(), '.env.example')
    ];
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, 'utf8');
        const match = content.match(/^MONGODB_URI=(.+)$/m);
        if (match && match[1].trim()) {
          uri = match[1].trim();
          break;
        }
      }
    }
  }

  if (!uri) return undefined;

  // Sanitize angle brackets if user entered <username> or <password>
  uri = uri.replace(/:\/\/([^/:]*?)<([^>]+)>([^/:]*?):/, '://$1$2$3:');
  uri = uri.replace(/:\/\/([^/:]*?)<([^>]+)>([^/:]*?)@/, '://$1$2$3@');

  // Ensure targeted database name is /swipex instead of test or admin
  if (uri.includes('27017/?')) {
    uri = uri.replace('27017/?', '27017/swipex?');
  } else if (uri.endsWith('27017/')) {
    uri = uri + 'swipex';
  } else if (uri.endsWith('27017')) {
    uri = uri + '/swipex';
  }

  process.env.MONGODB_URI = uri;
  return uri;
}

export async function connectMongoDB(): Promise<boolean> {
  const uri = resolveMongoUri();

  if (!uri || uri.trim() === '') {
    console.log('[MongoDB Atlas] Notice: MONGODB_URI environment variable is not defined.');
    console.log('[MongoDB Atlas] The application is utilizing the local JSON persistence layer (db_store.json).');
    console.log('[MongoDB Atlas] To connect to MongoDB Atlas, add your MONGODB_URI to your environment.');
    isConnected = false;
    return false;
  }

  if (isConnected || mongoose.connection.readyState === 1) {
    isConnected = true;
    return true;
  }

  if (isConnecting) {
    return false;
  }

  try {
    isConnecting = true;
    console.log('[MongoDB Atlas] Connecting to MongoDB Atlas cluster...');

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 6000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority'
    });

    isConnected = true;
    isConnecting = false;
    console.log('[MongoDB Atlas] Successfully connected to MongoDB Atlas.');

    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB Atlas] Runtime connection error:', err.message);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB Atlas] Disconnected from MongoDB Atlas. Using fallback store.');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('[MongoDB Atlas] Reconnected to MongoDB Atlas.');
      isConnected = true;
    });

    return true;
  } catch (error: any) {
    isConnecting = false;
    isConnected = false;
    console.error('[MongoDB Atlas] Connection attempt failed:', error?.message || error);
    console.warn('[MongoDB Atlas] Falling back safely to local JSON database (db_store.json) without disrupting application services.');
    return false;
  }
}

export function isMongoConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

export async function disconnectMongoDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('[MongoDB Atlas] Disconnected.');
  }
}

export function getMongoStatus(): {
  status: 'connected' | 'disconnected' | 'connecting';
  uriConfigured: boolean;
  dbName?: string;
} {
  const readyState = mongoose.connection.readyState;
  let status: 'connected' | 'disconnected' | 'connecting' = 'disconnected';

  if (readyState === 1) status = 'connected';
  else if (readyState === 2) status = 'connecting';

  const uri = resolveMongoUri();
  return {
    status,
    uriConfigured: Boolean(uri && uri.trim().length > 0),
    dbName: mongoose.connection.db?.databaseName
  };
}
