import { connectDB } from '../lib/db.js'
import { verifyToken } from '../lib/auth-middleware.js'

export default async function handler(req, res) {
  const user = verifyToken(req)
  if (!user) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' })

  const db = await connectDB()
  const col = db.collection('repair_requests')

  // student เห็นแค่ของตัวเอง, admin/technician เห็นทั้งหมด
  const filter = (user.role === 'admin' || user.role === 'technician')
    ? {}
    : { reporter_id: user.userId }

  const [total, pending, in_progress, done] = await Promise.all([
    col.countDocuments(filter),
    col.countDocuments({ ...filter, status: 'pending' }),
    col.countDocuments({ ...filter, status: 'in_progress' }),
    col.countDocuments({ ...filter, status: 'done' }),
  ])

  return res.status(200).json({ total, pending, in_progress, done })
}