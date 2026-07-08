import prisma from '../lib/prismaClient.js'


export const upsertProfile = async (req, res) => {
  try {
    const { userId, role } = req.user
    const data = req.body

    if (role === 'Agriculteur') {
      const profile = await prisma.agriculteur.upsert({
        where: { userId },
        update: data,
        create: {...data, userId}
      })
      return res.json({ message: 'Profil agriculteur sauvegardé', profile })
    }

    if (role === 'ConsommateurCommercant') {
      const profile = await prisma.consommateurCommercant.upsert({
        where: { userId },
        update: data,
        create: {...data, userId}
      })
      return res.json({ message: 'Profil commerçant/consommateur sauvegardé', profile })
    }

    res.status(400).json({ error: 'Rôle invalide' })

  } catch (error) {
    console.error('Erreur upsertProfile:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}


export const deleteProfile = async (req, res) => {
  try {
    const { userId, id, role } = req.user

    if (role === 'Agriculteur') {
      await prisma.agriculteur.delete({ where: { userId } });
      await prisma.user.delete({ where: { id }})
    } else if (role === 'ConsommateurCommercant') {
      await prisma.consommateurCommercant.delete({ where: { userId } });
     await prisma.user.delete({ where: { id } })
    } else {
      return res.status(400).json({ error: 'Rôle invalide' })
    }

    res.json({ message: 'Profil supprimé' })

  } catch (error) {
    console.error('Erreur deleteProfile:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}

export const getProfile = async (req, res) => {
  try {
    const { userId, role } = req.user
    let profile = null

    if (role === 'Agriculteur') {
      profile = await prisma.agriculteur.findUnique({ where: { userId } })
    } else if (role === 'ConsommateurCommercant') {
      profile = await prisma.consommateurCommercant.findUnique({ where: { userId } })
    }

    if (!profile) {
      return res.status(404).json({ error: 'Profil non trouvé' })
    }

    res.json({ profile })

  } catch (error) {
    console.error('Erreur getProfile:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}