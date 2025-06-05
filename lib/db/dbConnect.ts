import { mockDb } from './mockDb';

export default async function dbConnect() {
  // In a real application, this would establish a connection to MongoDB
  // For our mock application, we'll just return the mock database
  return mockDb;
}
