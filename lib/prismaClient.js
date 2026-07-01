import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL est manquante dans le fichier .env')
}

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })

const globalForPrisma = globalThis

const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma