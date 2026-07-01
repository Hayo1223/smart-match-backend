import prisma from '../lib/prismaClient.js'


export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, email: true, role: true, createdAt: true }
      
    })

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }

    res.json({ user })

  } catch (error) {
    console.error('Erreur getProfile:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}