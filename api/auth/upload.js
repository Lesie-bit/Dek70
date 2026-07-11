import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { image } = req.body

    if (!image) {
      return res.status(400).json({ error: 'ไม่มีรูปภาพ' })
    }

    // อัปโหลดไป Cloudinary
    const result = await cloudinary.uploader.upload(image, {
      folder: 'repair-school',
      transformation: [
        { width: 1200, crop: 'limit' },  // จำกัดขนาดไม่เกิน 1200px
        { quality: 'auto' },              // ลดขนาดไฟล์อัตโนมัติ
        { fetch_format: 'auto' }          // เลือก format ที่เหมาะสม
      ]
    })

    return res.status(200).json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    })

  } catch (err) {
    console.error('Cloudinary error:', err)
    return res.status(500).json({ error: 'อัปโหลดรูปไม่สำเร็จ' })
  }
}