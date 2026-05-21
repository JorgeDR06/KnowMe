import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import nunjucks from 'nunjucks'
import dotenv from 'dotenv'
import methodOverride from 'method-override'
import cookieParser from 'cookie-parser'

import connectMongo from './config/mongoose.js'
import Usuarios from './routes/user.js'
import User from './models/User.js'
import { viteAsset, viteCssFiles, isDev } from './utils/vite-assets.js'
import Porfolios from './routes/porfolios.js';
import Porfolio from './models/porfolio.js'
import Technologies from './routes/technologies.js'
import Languages from './routes/languages.js'
import Auth from './routes/auth.js'

import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { protectRoute, requireLogin, verifyToken, requireAdmin } from './auth/auth.js'

dotenv.config()

const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

connectMongo()

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "http://localhost:5173", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            scriptSrcAttr: ["'unsafe-inline'"],
            styleSrc: ["'self'", "http://localhost:5173", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            connectSrc: ["'self'", "http://localhost:5173", "ws://localhost:5173"],
            imgSrc: ["'self'", "data:", "https:"],
            mediaSrc: ["'self'", "https:"],
        }
    }
}))
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100,                  // máx 100 peticiones por IP
    message: { error: 'Demasiadas peticiones, intenta más tarde' }
}))

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(cookieParser())

// Hace disponible al usuario dispponible en todas las vistas si está autenticado
app.use((req, res, next) => {
    const token = req.cookies.token
    if (token) {
        try {
            req.user = verifyToken(token)
        } catch (e) {
            req.user = null
        }
    }
    res.locals.currentUser = req.user || null
    next()
})

// Sanitización NoSQL manual 
app.use((req, res, next) => {
    const sanitize = (obj) => {
        if (!obj || typeof obj !== 'object') return
        for (const key of Object.keys(obj)) {
            if (key.startsWith('$') || key.includes('.')) {
                delete obj[key]
            } else if (typeof obj[key] === 'object') {
                sanitize(obj[key])
            }
        }
    }
    sanitize(req.body)
    sanitize(req.params)
    next()
})

app.use('/build', express.static(path.resolve(process.cwd(), 'public/build')))
app.use(express.static(path.resolve(process.cwd(), 'public')))


nunjucks.configure(path.join(__dirname, 'views'), {
  autoescape: true,
  express: app,
  watch: process.env.NODE_ENV !== 'production'
})

app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      let method = req.body._method;
      delete req.body._method;
      return method;
    } 
}));

app.set('view engine', 'njk')
app.set('views', path.join(__dirname, 'views'))

app.locals.isDev = isDev
app.locals.viteAsset = viteAsset
app.locals.viteCssFiles = viteCssFiles

app.use('/api/porfolios', Porfolios)
app.use('/api/usuarios', Usuarios)
app.use('/api/technologies', Technologies)
app.use('/api/languages', Languages)
app.use('/api/auth', Auth)

// --- VISTAS ---

// Inicio
app.get('/', (req, res) => {
    res.render('home', { active: 'home' })
})

// Formulario de login
app.get('/login', (req, res) => {
    res.render('auth/login');
});

// Formulario de registro
app.get('/register', (req, res) => {
    res.render('auth/registro_usuario');
});

// Logout
app.get('/logout', (req, res) => {
  res.clearCookie('token')
  res.redirect('/login')
})

// Perfil de usuario
app.get('/perfil', requireLogin, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
        
        if (user) {
            res.render('perfil/perfil_usuario', { active: 'perfil', user })
        } else {
            return res.redirect('/login')
        }
    } catch (error) {
        res.status(500).render('error', { error: 'Error al cargar el perfil' + error.message})
    }
});

// Gestion de usuarios
app.get('/usuarios', requireAdmin, async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 })
        res.render('usuario/usuarios', { active: 'admin', users })
    } catch (error) {
        res.status(500).render('error', { error: 'Error al cargar usuarios' })
    }
})

app.get('/usuarios/:id/editar', requireAdmin, async (req, res) => {
    try {
        const u = await User.findById(req.params.id)
        if (!u) return res.redirect('/usuario/usuarios')
        res.render('usuario/usuario_editar', { active: 'admin', u })
    } catch (error) {
        res.status(500).render('error', { error: 'Error al cargar el usuario' })
    }
})

// Biblioteca de portfolios
app.get('/porfolios', async (req, res) => {
    res.render('porfolio/porfolios', {active: 'porfolios'})
})

app.get('/porfolios/:id', async (req, res) => {
    try {
        const porfolio = await Porfolio.findById(req.params.id)
            .populate('owner', 'username avatar socialLinks')
            .populate('technologies')
            .populate('languages')

        if (!porfolio) return res.render('error', { error: 'Porfolio no encontrado' })

        res.render('porfolio/porfolio-detalle', { active: 'porfolios', porfolio })
    } catch (error) {
        console.log(error)
        res.render('error', { error: 'Error al cargar el porfolio' })
    }
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Servidor: http://localhost:${port}`)
})