import express from 'express'
import { laisserAvis, getAvis, monAvis } from '../controllers/avisController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/', authMiddleware, laisserAvis)
router.get('/:userId', getAvis)
router.get('/mon-avis/:cibleId', authMiddleware, monAvis)

export default router