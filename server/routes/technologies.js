import express from 'express'
import Technology from '../models/Technology.js'
// import auth from '../utils/auth.js'

const router = express.Router()

const VALID_CATEGORIES = ['frontend', 'backend', 'devops', 'base de datos', 'mobile', 'otros']

// GET: Obtener todas
router.get('/', async (req, res) => {
    try {
        const result = await Technology.find().sort({ category: 1, name: 1 })
        if (!result || result.length === 0) {
            return res.status(404).send({ error: "No se encontraron tecnologías" })
        }
        res.status(200).send({ result })
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: "Error al obtener las tecnologías" })
    }
})

// GET: Buscar por nombre (para el buscador con autocompletado)
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query
        if (!q) {
            return res.status(400).send({ error: "Se requiere el parámetro de búsqueda 'q'" })
        }
        const result = await Technology.find({
            name: { $regex: q, $options: 'i' }
        }).sort({ name: 1 }).limit(10)

        res.status(200).send({ result })
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: "Error al buscar tecnologías" })
    }
})

// GET: Filtrar por categoría
router.get('/categoria/:category', async (req, res) => {
    try {
        if (!VALID_CATEGORIES.includes(req.params.category)) {
            return res.status(400).send({ error: `Categoría inválida. Valores permitidos: ${VALID_CATEGORIES.join(', ')}` })
        }
        const result = await Technology.find({ category: req.params.category }).sort({ name: 1 })
        if (!result || result.length === 0) {
            return res.status(404).send({ error: "No se encontraron tecnologías en esta categoría" })
        }
        res.status(200).send({ result })
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: "Error al obtener tecnologías por categoría" })
    }
})

// GET: Obtener por ID
router.get('/:id', async (req, res) => {
    try {
        const result = await Technology.findById(req.params.id)
        if (!result) {
            return res.status(404).send({ error: "Tecnología no encontrada" })
        }
        res.status(200).send({ result })
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: "Error al obtener la tecnología" })
    }
})

// POST: Crear tecnología (solo admin)
router.post('/', /* auth.protegerRuta(["admin"]), */ async (req, res) => {
    try {
        const { name, category } = req.body

        if (!name || !category) {
            return res.status(400).send({ error: "Faltan campos obligatorios: name y category" })
        }
        if (name.length < 1 || name.length > 50) {
            return res.status(400).send({ error: "El nombre debe tener entre 1 y 50 caracteres" })
        }
        if (!VALID_CATEGORIES.includes(category)) {
            return res.status(400).send({ error: `Categoría inválida. Valores permitidos: ${VALID_CATEGORIES.join(', ')}` })
        }
        if (await Technology.findOne({ name: { $regex: `^${name}$`, $options: 'i' } })) {
            return res.status(400).send({ error: "Ya existe una tecnología con ese nombre" })
        }

        const technology = new Technology({ name, category })
        const result = await technology.save()
        res.status(201).send({ result })

    } catch (error) {
        console.log(error)
        if (error.code === 11000) {
            return res.status(400).send({ error: "Ya existe una tecnología con ese nombre" })
        }
        res.status(500).send({ error: "Error al crear la tecnología" })
    }
})

// PUT: Actualizar tecnología (solo admin)
router.put('/:id', /* auth.protegerRuta(["admin"]), */ async (req, res) => {
    try {
        const technology = await Technology.findById(req.params.id)
        if (!technology) {
            return res.status(404).send({ error: "Tecnología no encontrada" })
        }

        const { name, category } = req.body

        if (name !== undefined) {
            if (name.length < 1 || name.length > 50) {
                return res.status(400).send({ error: "El nombre debe tener entre 1 y 50 caracteres" })
            }
            if (await Technology.findOne({ name: { $regex: `^${name}$`, $options: 'i' }, _id: { $ne: req.params.id } })) {
                return res.status(400).send({ error: "Ya existe una tecnología con ese nombre" })
            }
        }
        if (category !== undefined && !VALID_CATEGORIES.includes(category)) {
            return res.status(400).send({ error: `Categoría inválida. Valores permitidos: ${VALID_CATEGORIES.join(', ')}` })
        }

        const result = await Technology.findByIdAndUpdate(
            req.params.id,
            { $set: { name, category } },
            { new: true, runValidators: true }
        )
        res.status(200).send({ result })

    } catch (error) {
        console.log(error)
        if (error.code === 11000) {
            return res.status(400).send({ error: "Ya existe una tecnología con ese nombre" })
        }
        res.status(500).send({ error: "Error al actualizar la tecnología" })
    }
})

// DELETE: Eliminar tecnología (solo admin)
router.delete('/:id', /* auth.protegerRuta(["admin"]), */ async (req, res) => {
    try {
        const result = await Technology.findByIdAndDelete(req.params.id)
        if (!result) {
            return res.status(404).send({ error: "Tecnología no encontrada" })
        }
        res.status(200).send({ result })
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: "Error al eliminar la tecnología" })
    }
})

export default router