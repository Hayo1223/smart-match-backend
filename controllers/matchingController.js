import prisma from '../lib/prismaClient.js'

const calculateScore = async (agriculteur, grossisteCommercant) => {
  let score = 0
  const details = []

  
  const produitsCommuns = agriculteur.produit.filter(p =>
    grossisteCommercant.demande?.some(d =>
      d.toLowerCase().trim() === p.toLowerCase().trim()
    )
  )
  if (produitsCommuns.length > 0) {
    score += produitsCommuns.length * 20
    details.push(`Produits en commun : ${produitsCommuns.join(', ')} (+${produitsCommuns.length * 20} pts)`)
  }

  
  const locAgriMots = agriculteur.localisation
    ?.toLowerCase()
    .split(/[\s,\/\-]+/)
    .map(m => m.trim())
    .filter(Boolean) ?? []

  const locConsoMots = grossisteCommercant.localisationC
    ?.toLowerCase()
    .split(/[\s,\/\-]+/)
    .map(m => m.trim())
    .filter(Boolean) ?? []

  const locCommunes = locAgriMots.filter(mot =>
    locConsoMots.includes(mot) && mot.length > 2
  )
  if (locCommunes.length > 0) {
    score += locCommunes.length * 25
    details.push(`Localisation commune : ${locCommunes.join(', ')} (+${locCommunes.length * 25} pts)`)
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

  
 if (agriculteur.genre && grossisteCommercant.genre) {
  const genreAgri = agriculteur.genre.toLowerCase().trim()
  const genreConso = grossisteCommercant.genre.toLowerCase().trim()

  if (genreAgri === genreConso) {
    score += 7
    details.push(`Même genre : ${agriculteur.genre} (+7 pts)`)
  } else {
    score += 5
    details.push(`Genre différent : ${agriculteur.genre} et ${grossisteCommercant.genre} (+5 pts)`)
  }
}

  return { score, details }
}


export const getMesAgriculteurs = async (req, res) => {
  try {
    const { userId, role } = req.user
    const {
        nom,
        prenom,
        localisation,
        produit
      } = req.query;
      const nomFilter = nom?.trim();
      const prenomFilter = prenom?.trim();
      const localisationFilter = localisation?.trim();
      const produitFilter = produit?.trim();

    if (role !== 'GrossisteCommercant') {
      return res.status(403).json({
        error: 'Seuls les grossises peuvent accéder à cette page'
      })
    }

    
    const agriculteurs = await prisma.agriculteur.findMany({
        where: {
        available: true
         },
      include: {
        user: { select: { id: true, email: true } }
      }
    })

    let filteredAgriculteurs = agriculteurs;
    if (nomFilter) {
    filteredAgriculteurs = filteredAgriculteurs.filter(a =>
        a.nom.toLowerCase().includes(nomFilter.toLowerCase())
          );
         }
    if (prenomFilter) {
          filteredAgriculteurs = filteredAgriculteurs.filter(a =>
          a.prenom.toLowerCase().includes(prenomFilter.toLowerCase())
            );
          }
    if (localisationFilter) {
          filteredAgriculteurs = filteredAgriculteurs.filter(a =>
          a.localisation
          ?.toLowerCase()
          .includes(localisationFilter.toLowerCase())
            );
          }
    if (produitFilter) {
        filteredAgriculteurs = filteredAgriculteurs.filter(a =>
        a.produit?.some(p =>
        p.toLowerCase().includes(produitFilter.toLowerCase())
        )
          );
        }
    if (agriculteurs.length === 0) {
      return res.json({ agriculteurs: [] })
    }

    res.json({
      totalAgriculteurs: filteredAgriculteurs.length,
      agriculteurs: filteredAgriculteurs.map(a => ({
        agriculteurId: a.id,
        userId: a.userId,
        nom: a.nom,
        prenom: a.prenom,
        localisation: a.localisation,
        produit: a.produit,
        numeroMobile: a.numeroAgriculmobile,
        numeroWhatsapp: a.numeroAgriculwhatsapp,
        photoUrl: a.photoUrl || null,
        email: a.user.email
      }))
    })

  } catch (error) {
    console.error('Erreur getMesAgriculteurs:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}

export const getAgriculteursCarte = async (req, res) => {
  try {
    const agriculteurs = await prisma.agriculteur.findMany({
      where: {
        available: true,
        latitude: { not: null },
        longitude: { not: null }
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        produit: true,
        latitude: true,
        longitude: true,
        photoUrl: true
      }
    })

    res.json(agriculteurs)
  } catch (error) {
    console.error('Erreur getAgriculteursCarte:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}

export const getMatches = async (req, res) => {
  try {
    const { userId, role } = req.user
    const {
        nom,
        prenom,
        localisation,
        produit,
        scoreMin,
        scoreMax
      } = req.query;
      const nomFilter = nom?.trim();
      const prenomFilter = prenom?.trim();
      const localisationFilter = localisation?.trim();
      const produitFilter = produit?.trim();

    if (role !== 'Agriculteur') {
      return res.status(403).json({
        error: 'Seuls les agriculteurs peuvent accéder au matching'
      })
    }

    const agriculteur = await prisma.agriculteur.findUnique({
      where: { userId }
    })

    if (!agriculteur) {
      return res.status(404).json({
        error: 'Profil agriculteur introuvable. Créez votre profil avant de lancer un matching.'
      })
    }

    const grossisteCommercants = await prisma.grossisteCommercant.findMany({
      include: {
        user: { select: { email: true } }
      }
    })

    if (grossisteCommercants.length === 0) {
      return res.json({
        message: 'Aucun grossise disponible pour le moment',
        matches: []
      })
    }

    const matchesRaw = await Promise.all(
      grossisteCommercants.map(async conso => {
        const { score, details } = await calculateScore(agriculteur, conso)
        return {
          GrossisteCommercantId: conso.id,
          userId: conso.userId,
          nomC: conso.nomC,
          prenomC: conso.prenomC,
          localisationC: conso.localisationC,
          metier: conso.metier,
          demande: conso.demande,
          genre: conso.genre,
          numeroMobile: conso.numeroMobile, 
          numeroWhatsapp: conso.numeroWhatsapp,
          email: conso.user.email,
          photoUrl: conso.photoUrl,
          score,
          matchDetails: details
        }
      })
    )

    const matches = matchesRaw
      .filter(match => match.score > 0)
      .sort((a, b) => b.score - a.score)

      let filteredMatches = matches;
      if (nomFilter) {
          filteredMatches = filteredMatches.filter(match =>
          match.nomC?.toLowerCase().includes(nomFilter.toLowerCase())
          );
        }
      if (prenomFilter) {
          filteredMatches = filteredMatches.filter(match =>
          match.prenomC?.toLowerCase().includes(prenomFilter.toLowerCase())
          );
        }
      if (localisationFilter) {
          filteredMatches = filteredMatches.filter(match =>
          match.localisationC
          ?.toLowerCase()
          .includes(localisationFilter.toLowerCase())
          );
        }
      if (produitFilter) {
          filteredMatches = filteredMatches.filter(match =>
          Array.isArray(match.demande) && match.demande.some(p =>
          p.toLowerCase().includes(produitFilter.toLowerCase())
            )
          );
        }
      if (scoreMin) {
          filteredMatches = filteredMatches.filter(
          match => match.score >= Number(scoreMin)
          );
        }
      if (scoreMax) {
          filteredMatches = filteredMatches.filter(
          match => match.score <= Number(scoreMax)
          );
        }  

    res.json({
      nom: `${agriculteur.nom}`,
      prenom: `${agriculteur.prenom}`,
      totalMatches: filteredMatches.length,
      matches: filteredMatches
    })

  } catch (error) {
    console.error('Erreur getMatches:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}