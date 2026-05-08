import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import nunjucks from 'nunjucks'
import dotenv from 'dotenv'
import methodOverride from 'method-override'

import connectMongo from './config/mongoose.js'
import Usuarios from './routes/user.js'
import { viteAsset, viteCssFiles, isDev } from './utils/vite-assets.js'
import Porfolios from './routes/porfolios.js';
import Porfolio from './models/porfolio.js'
import Technologies from './routes/technologies.js'
import Languages from './routes/languages.js'


dotenv.config()

const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

connectMongo()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use('/build', express.static(path.resolve(process.cwd(), 'public/build')))
app.use(express.static(path.resolve(process.cwd(), 'public')))
app.use('/user', userRoutes);
app.use('/')


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

// Vistas
app.get('/', (req, res) => {
    res.render('home', { active: 'home' })
})

app.get('/porfolios', async (req, res) => {
    const result = await Porfolio.find().populate('owner', 'username avatar')
    res.render('porfolios', { active: 'porfolios', porfolios: result })
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Servidor: http://localhost:${port}`)
})