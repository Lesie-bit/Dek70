import { connectDB } from '../../lib/db.js'
import { verifyToken } from '../../lib/auth-middleware.js'

export default async function handler(req, res) {
  const user = verifyToken(req)
  if (!user) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' })
  if (user.role !== 'admin') return res.status(403).json({ error: 'ไม่มีสิทธิ์' })

  const db = await connectDB()
  const col = db.collection('repair_requests')

  const [total, pending, in_progress, done] = await Promise.all([
    col.countDocuments({}),
    col.countDocuments({ status: 'pending' }),
    col.countDocuments({ status: 'in_progress' }),
    col.countDocuments({ status: 'done' }),
  ])

  // 5 คำขอล่าสุด
  const recent = await col.find({}).sort({ created_at: -1 }).limit(5).toArray()

  return res.status(200).json({ total, pending, in_progress, done, recent })
}