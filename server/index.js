import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import nunjucks from 'nunjucks'
import dotenv from 'dotenv'
import methodOverride from 'method-override'
import cookieParser from 'cookie-parser'

import crypto from 'node:crypto'
import connectMongo from './config/mongoose.js'
import Invitaciones from './routes/invitation.js'
import Invitation from './models/Invitation.js'
import Usuarios from './routes/user.js'
import User from './models/User.js'
import Notificaciones from './routes/notification.js'
import Notification from './models/notification.js'
import { viteAsset, viteCssFiles, isDev, viteAssetEntry } from './utils/vite-assets.js'
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
app.set('trust proxy', 1)

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
app.use(async (req, res, next) => {
    const token = req.cookies.token
    if (token) {
        try {
            req.user = verifyToken(token)
        } catch (e) {
            req.user = null
        }
    }
    res.locals.currentUser = req.user || null

    if (req.user) {
        const unreadCount = await Notification.countDocuments({ 
            user: req.user.id, 
            read: false 
        })
        res.locals.unreadCount = unreadCount
    }

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
app.locals.viteAssetEntry = viteAssetEntry

app.use('/api/porfolios', Porfolios)
app.use('/api/usuarios', Usuarios)
app.use('/api/technologies', Technologies)
app.use('/api/languages', Languages)
app.use('/api/auth', Auth)
app.use('/api/notificaciones', Notificaciones)
app.use('/api/invitaciones', Invitaciones) 

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

// Notificaciones
app.get('/notificaciones', requireLogin, async (req, res) => {
    const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 })
    const formatted = notifications.map(n => {
        const obj = n.toObject()
        obj.fechaFormateada = new Date(n.createdAt).toLocaleDateString('es-ES', { 
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
        })
        return obj
    })
    res.render('notificaciones/notificaciones', { active: 'notificaciones', notifications: formatted })
})

// Perfil propio → redirige al público
app.get('/perfil', requireLogin, (req, res) => {
    res.redirect(`/perfil/${req.user.id}`)
})

// Perfil público
app.get('/perfil/:id', async (req, res) => {
    const [user, portfolios] = await Promise.all([
        User.findById(req.params.id)
            .populate('invitedBy', 'name avatar')
            .populate('skills')
            .populate('languages'),
        Porfolio.find({ owner: req.params.id })
            .populate('technologies')
            .populate('languages')
    ])
    if (!user) return res.redirect('/')
    const isOwner = req.user && req.user.id === user._id.toString()
    const memberSince = new Date(user.createdAt).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    res.render('perfil/perfil_publico', { active: 'perfil', user, isOwner, portfolios, memberSince })
})

// Perfil editable — solo el propietario
app.get('/perfil/:id/editar', requireLogin, async (req, res) => {
    if (req.user.id !== req.params.id) return res.redirect(`/perfil/${req.params.id}`)
    const [user, portfolios] = await Promise.all([
        User.findById(req.params.id)
            .populate('skills')
            .populate('languages'),
        Porfolio.find({ owner: req.params.id })
            .populate('technologies')
            .populate('languages')
    ])
    const memberSince = new Date(user.createdAt).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    res.render('perfil/perfil_usuario', { active: 'perfil', user, portfolios, memberSince, error: req.query.error || null })
})

// Gestion de usuarios
app.get('/usuarios', requireAdmin, async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 })
        res.render('usuario/usuarios', { active: 'admin', users })
    } catch (error) {
        res.status(500).render('error', { error: 'Error al cargar usuarios' })
    }
})

app.get('/usuarios/nuevo', requireAdmin, (req, res) => {
    res.render('usuario/usuario_nuevo', { active: 'admin' })
})

app.post('/api/usuarios', requireAdmin, async (req, res) => {
    const { name, email, password, role } = req.body
    const formData = { name, email, role }
    try {
        if (!name || !email || !password)
            return res.render('usuario/usuario_nuevo', { active: 'admin', error: 'Nombre, email y contraseña son obligatorios', formData })

        const existing = await User.findOne({ email })
        if (existing)
            return res.render('usuario/usuario_nuevo', { active: 'admin', error: 'El email ya está registrado', formData })

        const bcrypt = await import('bcrypt')
        const hashedPassword = await bcrypt.default.hash(password, 10)
        const newUser = new User({ name, email, password: hashedPassword, role: role || 'user' })
        const saved = await newUser.save()

        const invitations = Array.from({ length: 10 }).map(() => ({
            key: crypto.randomBytes(4).toString('hex').toUpperCase(),
            generatedBy: saved._id,
            isUsed: false
        }))
        await Invitation.insertMany(invitations)

        res.redirect('/usuarios')
    } catch (err) {
        console.error(err)
        res.render('usuario/usuario_nuevo', { active: 'admin', error: 'Error al crear el usuario', formData })
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

// Crear porfolio
app.get('/porfolios/nuevo', requireLogin, (req, res) => {
    res.render('porfolio/porfolio-form', { active: 'porfolios' })
})

app.get('/porfolios/:id', async (req, res) => {
    try {
        const porfolio = await Porfolio.findById(req.params.id)
            .populate('owner', 'name avatar socialLinks')
            .populate('technologies')
            .populate('languages')

        if (!porfolio) return res.render('error', { error: 'Porfolio no encontrado' })

        res.render('porfolio/porfolio-detalle', { active: 'porfolios', porfolio })
    } catch (error) {
        console.log(error)
        res.render('error', { error: 'Error al cargar el porfolio' })
    }
})

// Editar porfolio
app.get('/porfolios/:id/editar', requireLogin, async (req, res) => {
    try {
        const porfolio = await Porfolio.findById(req.params.id)
            .populate('technologies')
            .populate('languages')
        if (!porfolio) return res.render('error', { error: 'Porfolio no encontrado' })
        res.render('porfolio/porfolio-form', { active: 'porfolios', porfolio })
    } catch (error) {
        res.render('error', { error: 'Error al cargar el porfolio' })
    }
})

const port = process.env.PORT || 3003
app.listen(port, () => {
  console.log(`Servidor: http://localhost:${port}`)
})