import { connectDB } from '../../lib/db.js'
import { verifyToken } from '../../lib/auth-middleware.js'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
    const user = verifyToken(req)
    if (!user) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' })

    // เฉพาะ admin กับ technician เท่านั้น
    if (user.role !== 'admin' && user.role !== 'technician') {
        return res.status(403).json({ error: 'ไม่มีสิทธิ์' })
    }

    const { id } = req.query

    if (req.method === 'PATCH') {
        const { status, note } = req.body
        const db = await connectDB()
        const col = db.collection('repair_requests')

        // ถ้าช่างกดรับงาน → บันทึกว่าใครรับ
        const updateData = {
            ...(status && { status }),
            ...(note && { note }),
            updated_at: new Date()
        }

        if (status === 'in_progress') {
            updateData.assigned_to = user.name
            updateData.assigned_id = user.userId
        }

        await col.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        )

        return res.status(200).json({ success: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
}