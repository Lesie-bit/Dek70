import { connectDB } from '../../lib/db.js'
import bcrypt from 'bcryptjs'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, email, password, role } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'กรอกข้อมูลให้ครบ' })
  }

  // ✅ เช็คโดเมนอีเมล
  if (!email.endsWith('@sappha.ac.th')) {
    return res.status(403).json({ error: 'สมัครได้เฉพาะอีเมล @sappha.ac.th เท่านั้น' })
  }

  const db = await connectDB()
  const users = db.collection('users')

  const existing = await users.findOne({ email })
  if (existing) {
    return res.status(409).json({ error: 'อีเมลนี้ถูกใช้แล้ว' })
  }

  const password_hash = await bcrypt.hash(password, 10)

  await users.insertOne({
    name,
    email,
    password_hash,
    role: role === 'admin' || role === 'technician' ? role : 'student',
    created_at: new Date()
  })

  return res.status(201).json({ success: true })
}