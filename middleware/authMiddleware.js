import jwt from 'jsonwebtoken'

const authMiddleware = (req, res, next) => {
  try {
   
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token manquant ou invalide' })
    }

   
    const token = authHeader.split(' ')[1]

    
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

  
    req.user = decoded

    
    next()

  } catch (error) {
    if (error.name !== 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expiré, reconnectez-vous' })
    }
    return res.status(401).json({ error: 'Token invalide' })
  }
}

export default authMiddleware