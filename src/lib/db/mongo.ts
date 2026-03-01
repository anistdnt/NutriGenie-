import "server-only";
import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined");
}
const MONGODB_URI_SAFE: string = MONGODB_URI;

const cached: MongooseCache = globalThis.mongooseCache ?? { conn: null, promise: null };

if (!globalThis.mongooseCache) {
  globalThis.mongooseCache = cached;
}

export async function connectDB() {
  if (cached.conn || mongoose.connection.readyState === 1) {
    return cached.conn ?? mongoose;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI_SAFE, {
      bufferCommands: false,
      maxPoolSize: 10,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
