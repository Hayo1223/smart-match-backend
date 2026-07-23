import prisma from '../lib/prismaClient.js'


export const laisserAvis = async (req, res) => {
  try {
    const { userId } = req.user
    const { cibleId, note, commentaire } = req.body

    
    if (!cibleId || !note) {
      return res.status(400).json({ error: 'cibleId et note sont requis' })
    }
    
    const noteInt = parseInt(note)
    if (noteInt < 1 || noteInt > 5) {
      return res.status(400).json({ error: 'La note doit être entre 1 et 5' })
    }

    if (userId === parseInt(cibleId)) {
      return res.status(400).json({ error: 'Vous ne pouvez pas vous noter vous-même' })
    }

    
    const avis = await prisma.avis.upsert({
      where: {
        auteurId_cibleId: { auteurId: userId, cibleId: parseInt(cibleId) }
      },
      update: { note: noteInt, commentaire },
      create: { auteurId: userId, cibleId: parseInt(cibleId), note: noteInt, commentaire }
    })

    res.status(201).json({ message: 'Avis enregistré avec succès', avis })

  } catch (error) {
    console.error('Erreur laisserAvis:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}


export const getAvis = async (req, res) => {
  try {
    const cibleId = parseInt(req.params.userId)

    const avis = await prisma.avis.findMany({
      where: { cibleId },
      include: {
        auteur: {
          select: { id: true, role: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

   
    const total = avis.length
    const moyenne = total > 0
      ? (avis.reduce((sum, a) => sum + a.note, 0) / total).toFixed(1)
      : null

    res.json({ avis, moyenne, total })

  } catch (error) {
    console.error('Erreur getAvis:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}


export const monAvis = async (req, res) => {
  try {
    const { userId } = req.user
    const cibleId = parseInt(req.params.cibleId)

    const avis = await prisma.avis.findUnique({
      where: {
        auteurId_cibleId: { auteurId: userId, cibleId }
      }
    })

    res.json({ avis })

  } catch (error) {
    console.error('Erreur monAvis:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}