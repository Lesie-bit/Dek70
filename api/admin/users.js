import { connectDB } from '../../lib/db.js'
import { verifyToken } from '../../lib/auth-middleware.js'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  const user = verifyToken(req)
  if (!user) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' })
  if (user.role !== 'admin') return res.status(403).json({ error: 'ไม่มีสิทธิ์' })

  const db = await connectDB()
  const col = db.collection('users')

  // GET — ดึง user ทั้งหมด
  if (req.method === 'GET') {
    const users = await col.find({}, {
      projection: { password_hash: 0 } // ไม่ส่ง password กลับไป
    }).sort({ created_at: -1 }).toArray()
    return res.status(200).json(users)
  }

  // PATCH — เปลี่ยน role
  if (req.method === 'PATCH') {
    const { userId, role } = req.body
    if (!['student', 'technician', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'role ไม่ถูกต้อง' })
    }
    await col.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { role } }
    )
    return res.status(200).json({ success: true })
  }

  // DELETE — ลบ user
  if (req.method === 'DELETE') {
    const { userId } = req.body
    await col.deleteOne({ _id: new ObjectId(userId) })
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}