import mongoose from 'mongoose'

const resumeSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    pages: { type: Number, default: null },
    characterCount: { type: Number, required: true },
    text: { type: String, required: true },
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

const Resume = mongoose.model('Resume', resumeSchema)

export async function connectDB() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI is not set. Add it to server/.env.')
  }
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  console.log(`Connected to MongoDB (database: ${mongoose.connection.name})`)
}

export async function disconnectDB() {
  await mongoose.disconnect()
}

export async function saveResume(resume) {
  const doc = await Resume.create(resume)
  return doc.toJSON()
}

export async function getResumeById(id) {
  if (!mongoose.isValidObjectId(id)) return null
  const doc = await Resume.findById(id)
  return doc ? doc.toJSON() : null
}
