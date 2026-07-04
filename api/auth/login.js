import { connectDB } from '../../lib/db.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'กรอกอีเมลและรหัสผ่าน' })
  }

  const db = await connectDB()
  const users = db.collection('users')

  const user = await users.findOne({ email })
  if (!user) {
    return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' })
  }

  const match = await bcrypt.compare(password, user.password_hash)
  if (!match) {
    return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' })
  }

  const token = jwt.sign(
    { userId: user._id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )

  return res.status(200).json({
    success: true,
    token,
    user: { name: user.name, email: user.email, role: user.role }
  })
}