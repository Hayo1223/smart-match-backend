import express from 'express'
import { uploadPhoto } from '../controllers/uploadController.js'
import authMiddleware from '../middleware/authMiddleware.js'
import upload from '../middleware/upload.js'

const router = express.Router()

router.post('/photo', authMiddleware, upload.single('photo'), uploadPhoto)

export default router