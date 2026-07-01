import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/authRoutes.js'

const app = express()
const PORT = process.env.PORT || 3000

// Middlewares globaux
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)

// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'Smart Match API fonctionne [Yes]' })
})

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`)
})