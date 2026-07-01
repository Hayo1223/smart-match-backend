import express from 'express'
import { getProfile } from '../controllers/userController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

// authMiddleware protège cette route — sans token valide, accès refusé
router.get('/profile', authMiddleware, getProfile)

export default router