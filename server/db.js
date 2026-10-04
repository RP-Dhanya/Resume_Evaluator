import mongoose from 'mongoose'

const scoreSchema = new mongoose.Schema(
  {
    resume: {
      fileName: { type: String, required: true },
      fileSize: { type: Number, required: true },
      pages: { type: Number, default: null },
      wordCount: { type: Number, required: true },
      text: { type: String, required: true },
    },
    jobDescription: { type: String, required: true },
    engine: { type: String, enum: ['labd', 'rules'], required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    rating: { type: String, required: true },
    summary: { type: String, default: '' },
    breakdown: [
      {
        _id: false,
        key: String,
        label: String,
        score: Number,
        max: Number,
        detail: String,
      },
    ],
    keywords: {
      matched: [String],
      missing: [String],
    },
    suggestions: [String],
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform: (doc, ret) => {
        ret.id = ret._id.toString()
        delete ret._id
        return ret
      },
    },
  }
)

scoreSchema.index({ createdAt: -1 })

const Score = mongoose.models.Score || mongoose.model('Score', scoreSchema)

function buildMongoUri() {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI
  const { MONGO_DB_USERNAME, MONGO_DB_PASSWORD, MONGO_DB_HOST } = process.env
  if (!MONGO_DB_USERNAME || !MONGO_DB_PASSWORD || !MONGO_DB_HOST) return null
  const user = encodeURIComponent(MONGO_DB_USERNAME)
  const pass = encodeURIComponent(MONGO_DB_PASSWORD)
  return `mongodb+srv://${user}:${pass}@${MONGO_DB_HOST}/?retryWrites=true&w=majority&appName=Cluster0`
}

export function isDbConfigured() {
  return Boolean(buildMongoUri())
}

// Reuse one connection across requests (and across warm serverless invocations on Vercel).
let connecting = null

export async function connectDB() {
  if (mongoose.connection.readyState === 1) return
  const uri = buildMongoUri()
  if (!uri) throw new Error('MongoDB is not configured. Set MONGO_DB_USERNAME, MONGO_DB_PASSWORD and MONGO_DB_HOST.')

  connecting ??= mongoose
    .connect(uri, {
      dbName: process.env.MONGO_DB_NAME || 'resume-evaluator',
      serverSelectionTimeoutMS: 8000,
    })
    .then(() => console.log(`Connected to MongoDB (database: ${mongoose.connection.name})`))
    .finally(() => {
      connecting = null
    })
  await connecting
}

export async function saveScore(record) {
  await connectDB()
  const doc = await Score.create(record)
  return doc.toJSON()
}

export async function getScoreById(id) {
  if (!mongoose.isValidObjectId(id)) return null
  await connectDB()
  const doc = await Score.findById(id)
  return doc ? doc.toJSON() : null
}

export async function listScores(limit = 20) {
  await connectDB()
  const docs = await Score.find({}, { 'resume.text': 0, jobDescription: 0 })
    .sort({ createdAt: -1 })
    .limit(limit)
  return docs.map((d) => d.toJSON())
}
