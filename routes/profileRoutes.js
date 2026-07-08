import express from 'express'
import { upsertProfile, getProfile, deleteProfile } from '../controllers/profileController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()


router.post('/', authMiddleware, upsertProfile)
router.get('/', authMiddleware, getProfile)
router.delete('/', authMiddleware, deleteProfile)
router.put('/', authMiddleware, upsertProfile)

export default router