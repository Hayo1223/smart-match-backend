import prisma from '../lib/prismaClient.js'

export const getStats = async (req, res) => {
  try {
    const [agriculteur, grossisteCommercant] = await Promise.all([
      prisma.agriculteur.count(),
      prisma.grossisteCommercant.count()
    ])

    res.json({ agriculteur, grossisteCommercant })
  } catch (error) {
    console.error('Erreur getStats:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}