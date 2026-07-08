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
    const { userId } = req.user;

    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    res.json({ message: "Compte supprimé avec succès" });
  } catch (error) {
    console.error("Erreur deleteProfile:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

export const getProfile = async (req, res) => {
  try {
    const { userId, role } = req.user
    let profile = null

    if (role === 'Agriculteur') {
      profile = await prisma.agriculteur.findUnique({
        where: { userId }
      })
    } else if (role === 'ConsommateurCommercant') {
      profile = await prisma.consommateurCommercant.findUnique({
        where: { userId }
      })
    }

    return res.json({
      profile: profile || null
    })

  } catch (error) {
    console.error('Erreur getProfile:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}