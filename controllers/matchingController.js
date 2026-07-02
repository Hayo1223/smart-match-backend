import prisma from '../lib/prismaClient.js'


const calculateScore = (Agriculteur, ConsommateurCommercant) => {
  let score = 0
  const details = []


  const commonPD = Agriculteur.produit.filter(produit =>
    ConsommateurCommercant.demande.includes(produit)
  )
  if (commonPD.length > 0) {
    score += commonPD.length * 15
    details.push(`Element en commun : ${commonPD.join(', ')} (+${commonPD.length * 15} pts)`)
  }

  
  if (Agriculteur.localisation.toLowerCase() === ConsommateurCommercant.localisationC.toLowerCase()) {
    score += 20
    details.push(`Même ville : ${Agriculteur.localisation} (+20 pts)`)
  }

  
  if (Agriculteur.available) {
    score += 10
    details.push(`Agriculteur disponible ou verifier (+10 pts)`)
  }

  return { score, details }
}


export const getMatches = async (req, res) => {
  try {
    const { userId, role } = req.user

    
    if (role !== 'Agriculteur') {
      return res.status(403).json({ error: 'Seuls les Agriculteur peuvent accéder au matching' })
    }

    
    const Agriculteur = await prisma.agriculteur.findUnique({
      where: { userId }
    })

    if (!Agriculteur) {
      return res.status(404).json({
        error: 'Profil Agriculteur introuvable. Créez votre profil avant de lancer un matching.'
      })
    }

    
    const ConsommateurCommercant = await prisma.consommateurCommercant.findMany({
      include: { user: { select: { email: true } } }
    })

    if (ConsommateurCommercant.length === 0) {
      return res.json({ message: 'Aucun Consommateur ou Commercant disponible pour le moment', matches: [] })
    }

    
    const matches = ConsommateurCommercant
      .map(ConsommateurCommercant => {
        const { score, details } = calculateScore(Agriculteur, ConsommateurCommercant)
        return {
          ConsommateurCommercantId: ConsommateurCommercant.idC,
          ConsommateurCommercantN: ConsommateurCommercant.nomC,
          ConsommateurCommercantP: ConsommateurCommercant.prenomC,
          localisationC: ConsommateurCommercant.localisationC,
          demandeType: commonPD,
          email: ConsommateurCommercant.user.email,
          score,
          matchDetails: details
        }
      })
      .filter(match => match.score > 0) 
      .sort((a, b) => b.score - a.score) 

    res.json({
      AgriculteurN: `${Agriculteur.nom} ${Agriculteur.prenom}`,
      totalMatches: matches.length,
      matches
    })

  } catch (error) {
    console.error('Erreur getMatches:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}