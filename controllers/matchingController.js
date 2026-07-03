import prisma from '../lib/prismaClient.js'

const calculateScore = (agriculteur, consommateurCommercant) => {
  let score = 0
  const details = []

  
  const produitsCommuns = agriculteur.produit.filter(p =>
    consommateurCommercant.demande?.some(d =>
      d.toLowerCase().trim() === p.toLowerCase().trim()
    )
  )
  if (produitsCommuns.length > 0) {
    score += produitsCommuns.length * 20
    details.push(`Produits en commun : ${produitsCommuns.join(', ')} (+${produitsCommuns.length * 20} pts)`)
  }

  
  const locAgri = agriculteur.localisation?.toLowerCase().trim()
  const locConso = consommateurCommercant.localisationC?.toLowerCase().trim()
  if (locAgri && locConso && locAgri === locConso) {
    score += 25
    details.push(`Même localisation : ${agriculteur.localisation} (+25 pts)`)
  }

  
  if (agriculteur.available) {
    score += 15
    details.push(`Agriculteur disponible ou vérifié (+15 pts)`)
  }

  
  const aContact = agriculteur.numeroAgriculmobile || agriculteur.numeroAgriculwhatsapp
  if (aContact) {
    score += 10
    details.push(`Contact disponible (+10 pts)`)
  }

  
  if (agriculteur.genre && consommateurCommercant.genre) {
    const genreAgri = agriculteur.genre.toLowerCase()
    const genreConso = consommateurCommercant.genre.toLowerCase()

    const genresOpposés = (
      (genreAgri === 'masculin' && genreConso === 'féminin') ||
      (genreAgri === 'féminin' && genreConso === 'masculin')
    )

    if (genreAgri === genreConso) {
      score += 7
      details.push(`Même genre : ${agriculteur.genre} (+7 pts)`)
    } else if (genresOpposés) {
      score += 5
      details.push(`Genre opposé : ${agriculteur.genre} ↔ ${consommateurCommercant.genre} (+5 pts)`)
    }
  }

  return { score, details }
}


export const getMatches = async (req, res) => {
  try {
    const { userId, role } = req.user

    if (role !== 'Agriculteur') {
      return res.status(403).json({
        error: 'Seuls les agriculteurs peuvent accéder au matching'
      })
    }

    const agriculteur = await prisma.agriculteurProfile.findUnique({
      where: { userId }
    })

    if (!agriculteur) {
      return res.status(404).json({
        error: 'Profil agriculteur introuvable. Créez votre profil avant de lancer un matching.'
      })
    }

    const consommateursCommercants = await prisma.consommateurCommercantProfile.findMany({
      include: {
        user: { select: { email: true } }
      }
    })

    if (consommateursCommercants.length === 0) {
      return res.json({
        message: 'Aucun consommateur disponible pour le moment',
        matches: []
      })
    }

    const matches = consommateursCommercants
      .map(conso => {
        const { score, details } = calculateScore(agriculteur, conso)
        return {
          consommateurId: conso.id,
          nomC: conso.nomC,
          prenomC: conso.prenomC,
          localisationC: conso.localisationC,
          metier: conso.metier,
          demande: conso.demande,
          genre: conso.genre,
          numeroMobile: conso.numeroMobile,
          numeroWhatsapp: conso.numeroWhatsapp,
          email: conso.user.email,
          score,
          matchDetails: details
        }
      })
      .filter(match => match.score > 0)
      .sort((a, b) => b.score - a.score)

    res.json({
      nom: `${agriculteur.nom} ${agriculteur.prenom}`,
      totalMatches: matches.length,
      matches
    })

  } catch (error) {
    console.error('Erreur getMatches:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}