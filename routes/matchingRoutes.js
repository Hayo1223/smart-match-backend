import express from 'express'
import { getMatches, getMesAgriculteurs, getAgriculteursCarte } from '../controllers/matchingController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', authMiddleware, getMatches)
router.get('/mes-agriculteurs', authMiddleware, getMesAgriculteurs)
router.get('/agriculteurs/carte', getAgriculteursCarte)

export default router