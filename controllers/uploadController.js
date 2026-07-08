import cloudinary from '../lib/cloudinary.js'
import prisma from '../lib/prismaClient.js'

export const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier envoyé' })
    }

    const { userId } = req.user

    const base64 = req.file.buffer.toString('base64')
    const dataUri = `data:${req.file.mimetype};base64,${base64}`

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'souk/agriculteurs',
      transformation: [
        { width: 500, height: 500, crop: 'fill' }, 
        { quality: 'auto' }                         
      ]
    })

    await prisma.agriculteur.update({
      where: { userId },
      data: { photoUrl: result.secure_url }
    })

    res.json({
      message: 'Photo uploadée avec succès',
      photoUrl: result.secure_url
    })

  } catch (error) {
    console.error('Erreur upload:', error)
    res.status(500).json({ error: 'Erreur lors de l\'upload' })
  }
}