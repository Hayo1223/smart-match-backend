import express from 'express'
import { getMatches, getMesAgriculteurs } from '../controllers/matchingController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', authMiddleware, getMatches)
router.get('/mes-agriculteurs', authMiddleware, getMesAgriculteurs)

export default router