import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prismaClient.js'


export const register = async (req, res) => {
  try {
    const { email, password, role } = req.body

    
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, mot de passe et rôle sont requis' })
    }

    if (!['Agriculteur', 'GrossiseCommercant'].includes(role)) {
      return res.status(400).json({ error: 'Rôle invalide. Choisir Agriculteur ou Grossise/Commercant' })
    }

    
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé' })
    }

   
    const hashedPassword = await bcrypt.hash(password, 10)

    
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, role }
    })

   
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      message: 'Inscription réussie',
      token,
      user: { id: user.id, email: user.email, role: user.role }
    })

  } catch (error) {
    console.error('Erreur register:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}


export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' })
    }

   
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' })
    }

    
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' })
    }

   
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Connexion réussie',
      token,
      user: { id: user.id, email: user.email, role: user.role }
    })

  } catch (error) {
    console.error('Erreur login:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}