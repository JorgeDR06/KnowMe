import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Technology from './models/Technology.js'
import Language from './models/Language.js'

dotenv.config({ path: '../.env' })

const technologies = [
    // Frontend
    { name: 'React', category: 'frontend' },
    { name: 'Vue.js', category: 'frontend' },
    { name: 'Angular', category: 'frontend' },
    { name: 'Svelte', category: 'frontend' },
    { name: 'Next.js', category: 'frontend' },
    { name: 'Nuxt.js', category: 'frontend' },
    { name: 'Astro', category: 'frontend' },
    { name: 'Tailwind CSS', category: 'frontend' },
    { name: 'Bootstrap', category: 'frontend' },
    { name: 'Vite', category: 'frontend' },
    { name: 'Webpack', category: 'frontend' },
    { name: 'Redux', category: 'frontend' },
    { name: 'Three.js', category: 'frontend' },

    // Backend
    { name: 'Node.js', category: 'backend' },
    { name: 'Express', category: 'backend' },
    { name: 'NestJS', category: 'backend' },
    { name: 'Django', category: 'backend' },
    { name: 'Flask', category: 'backend' },
    { name: 'FastAPI', category: 'backend' },
    { name: 'Spring Boot', category: 'backend' },
    { name: 'Laravel', category: 'backend' },
    { name: 'Rails', category: 'backend' },
    { name: 'GraphQL', category: 'backend' },
    { name: 'REST API', category: 'backend' },
    { name: 'Socket.io', category: 'backend' },

    // Base de datos
    { name: 'MongoDB', category: 'base de datos' },
    { name: 'PostgreSQL', category: 'base de datos' },
    { name: 'MySQL', category: 'base de datos' },
    { name: 'SQLite', category: 'base de datos' },
    { name: 'Redis', category: 'base de datos' },
    { name: 'Firebase', category: 'base de datos' },
    { name: 'Supabase', category: 'base de datos' },
    { name: 'Prisma', category: 'base de datos' },
    { name: 'Mongoose', category: 'base de datos' },

    // DevOps
    { name: 'Docker', category: 'devops' },
    { name: 'Kubernetes', category: 'devops' },
    { name: 'GitHub Actions', category: 'devops' },
    { name: 'Jenkins', category: 'devops' },
    { name: 'Nginx', category: 'devops' },
    { name: 'AWS', category: 'devops' },
    { name: 'Google Cloud', category: 'devops' },
    { name: 'Azure', category: 'devops' },
    { name: 'Vercel', category: 'devops' },
    { name: 'Netlify', category: 'devops' },
    { name: 'Linux', category: 'devops' },

    // Mobile
    { name: 'React Native', category: 'mobile' },
    { name: 'Flutter', category: 'mobile' },
    { name: 'Expo', category: 'mobile' },
    { name: 'Ionic', category: 'mobile' },
    { name: 'Swift UI', category: 'mobile' },
    { name: 'Jetpack Compose', category: 'mobile' },

    // Otros
    { name: 'Git', category: 'otros' },
    { name: 'Figma', category: 'otros' },
    { name: 'Electron', category: 'otros' },
    { name: 'Tauri', category: 'otros' },
    { name: 'WebSockets', category: 'otros' },
    { name: 'OpenAI API', category: 'otros' },
]

const languages = [
    // Frontend
    { name: 'HTML', category: 'frontend' },
    { name: 'CSS', category: 'frontend' },
    { name: 'JavaScript', category: 'frontend' },
    { name: 'TypeScript', category: 'frontend' },
    { name: 'SASS', category: 'frontend' },

    // Backend
    { name: 'Python', category: 'backend' },
    { name: 'Java', category: 'backend' },
    { name: 'PHP', category: 'backend' },
    { name: 'C#', category: 'backend' },
    { name: 'Ruby', category: 'backend' },
    { name: 'Elixir', category: 'backend' },
    { name: 'Scala', category: 'backend' },
    { name: 'Kotlin', category: 'backend' },

    // DevOps
    { name: 'Bash', category: 'devops' },
    { name: 'YAML', category: 'devops' },
    { name: 'Dockerfile', category: 'devops' },

    // Base de datos
    { name: 'SQL', category: 'base de datos' },
    { name: 'GraphQL', category: 'base de datos' },

    // Mobile
    { name: 'Swift', category: 'mobile' },
    { name: 'Dart', category: 'mobile' },
    { name: 'Objective-C', category: 'mobile' },

    // Otros
    { name: 'Go', category: 'otros' },
    { name: 'Rust', category: 'otros' },
    { name: 'C', category: 'otros' },
    { name: 'C++', category: 'otros' },
    { name: 'Lua', category: 'otros' },
    { name: 'R', category: 'otros' },
    { name: 'Solidity', category: 'otros' },
    { name: 'WebAssembly', category: 'otros' },
]

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('MongoDB conectado')

        await Technology.deleteMany({})
        await Language.deleteMany({})
        console.log('Colecciones limpiadas')

        // Insertar
        await Technology.insertMany(technologies)
        console.log(`${technologies.length} tecnologías insertadas`)

        await Language.insertMany(languages)
        console.log(`${languages.length} lenguajes insertados`)

        console.log('\nSeed completado')
        process.exit(0)
    } catch (error) {
        console.error('Error en el seed:', error)
        process.exit(1)
    }
}

seed()