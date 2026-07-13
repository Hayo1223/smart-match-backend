import prisma from '../lib/prismaClient.js'

export const getStats = async (req, res) => {
  try {
    const [agriculteur, consommateurCommercant] = await Promise.all([
      prisma.agriculteur.count(),
      prisma.consommateurCommercant.count()
    ])

    res.json({ agriculteur, consommateurCommercant })
  } catch (error) {
    console.error('Erreur getStats:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}