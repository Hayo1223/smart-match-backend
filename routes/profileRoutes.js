import express from 'express'
import { upsertProfile, getProfile } from '../controllers/profileController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()


router.post('/', authMiddleware, upsertProfile)
router.get('/', authMiddleware, getProfile)

export default router