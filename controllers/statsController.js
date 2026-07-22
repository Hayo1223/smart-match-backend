import prisma from '../lib/prismaClient.js'

export const getStats = async (req, res) => {
  try {
    const [agriculteur, grossiseCommercant] = await Promise.all([
      prisma.agriculteur.count(),
      prisma.grossiseCommercant.count()
    ])

    res.json({ agriculteur, grossiseCommercant })
  } catch (error) {
    console.error('Erreur getStats:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}