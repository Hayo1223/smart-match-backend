import jwt from 'jsonwebtoken'

const authMiddleware = (req, res, next) => {
  try {
    // 1. Lire le token dans le header Authorization
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token manquant ou invalide' })
    }

    // 2. Extraire le token (enlever "Bearer ")
    const token = authHeader.split(' ')[1]

    // 3. Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // 4. Attacher les infos utilisateur à la requête
    req.user = decoded

    // 5. Passer à la route suivante
    next()

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expiré, reconnectez-vous' })
    }
    return res.status(401).json({ error: 'Token invalide' })
  }
}

export default authMiddleware