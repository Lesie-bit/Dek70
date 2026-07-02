import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
let client
let db

export async function connectDB() {
  if (db) return db
  client = new MongoClient(uri)
  await client.connect()
  db = client.db('repair_school')
  return db
}