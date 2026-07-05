import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import profileRoutes from './routes/profileRoutes.js'
import matchingRoutes from './routes/matchingRoutes.js'

const app = express()
const PORT = process.env.PORT || 5025

const allowedOrigins = [
  'http://localhost:5173',
  'https://smart-match-dbmj.vercel.app'
]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error(`Origine non autorisée : ${origin}`))
    }
  },
  credentials: true
}))

app.use(express.json())


app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/matching', matchingRoutes)


app.get('/', (req, res) => {
  res.json({ message: 'Smart Match API fonctionne' })
})

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`)
})