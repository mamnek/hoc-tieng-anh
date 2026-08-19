import { MongoClient, Db } from 'mongodb';

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://lekinhbaochau_db_user:lHJyYGxwn0VqdTrr@cluster0.u9joaox.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const DB_NAME = process.env.MONGODB_DB_NAME || 'ielts_arena';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 10,
  });

  await client.connect();
  const db = client.db(DB_NAME);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export async function getDatabase(): Promise<Db> {
  const { db } = await connectToDatabase();
  return db;
}
