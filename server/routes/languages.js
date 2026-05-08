import express from 'express'
import Language from '../models/Language.js'
// import auth from '../utils/auth.js'

const router = express.Router()

const VALID_CATEGORIES = ['frontend', 'backend', 'devops', 'base de datos', 'mobile', 'otros']

// GET: Obtener todos
router.get('/', async (req, res) => {
    try {
        const result = await Language.find().sort({ category: 1, name: 1 })
        if (!result || result.length === 0) {
            return res.status(404).send({ error: "No se encontraron lenguajes" })
        }
        res.status(200).send({ result })
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: "Error al obtener los lenguajes" })
    }
})

// GET: Buscar por nombre (para el buscador con autocompletado)
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query
        if (!q) {
            return res.status(400).send({ error: "Se requiere el parámetro de búsqueda 'q'" })
        }
        const result = await Language.find({
            name: { $regex: q, $options: 'i' }
        }).sort({ name: 1 }).limit(10)

        res.status(200).send({ result })
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: "Error al buscar lenguajes" })
    }
})

// GET: Filtrar por categoría
router.get('/categoria/:category', async (req, res) => {
    try {
        if (!VALID_CATEGORIES.includes(req.params.category)) {
            return res.status(400).send({ error: `Categoría inválida. Valores permitidos: ${VALID_CATEGORIES.join(', ')}` })
        }
        const result = await Language.find({ category: req.params.category }).sort({ name: 1 })
        if (!result || result.length === 0) {
            return res.status(404).send({ error: "No se encontraron lenguajes en esta categoría" })
        }
        res.status(200).send({ result })
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: "Error al obtener lenguajes por categoría" })
    }
})

// GET: Obtener por ID
router.get('/:id', async (req, res) => {
    try {
        const result = await Language.findById(req.params.id)
        if (!result) {
            return res.status(404).send({ error: "Lenguaje no encontrado" })
        }
        res.status(200).send({ result })
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: "Error al obtener el lenguaje" })
    }
})

// POST: Crear lenguaje (solo admin)
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
        if (await Language.findOne({ name: { $regex: `^${name}$`, $options: 'i' } })) {
            return res.status(400).send({ error: "Ya existe un lenguaje con ese nombre" })
        }

        const language = new Language({ name, category })
        const result = await language.save()
        res.status(201).send({ result })

    } catch (error) {
        console.log(error)
        if (error.code === 11000) {
            return res.status(400).send({ error: "Ya existe un lenguaje con ese nombre" })
        }
        res.status(500).send({ error: "Error al crear el lenguaje" })
    }
})

// PUT: Actualizar lenguaje (solo admin)
router.put('/:id', /* auth.protegerRuta(["admin"]), */ async (req, res) => {
    try {
        const language = await Language.findById(req.params.id)
        if (!language) {
            return res.status(404).send({ error: "Lenguaje no encontrado" })
        }

        const { name, category } = req.body

        if (name !== undefined) {
            if (name.length < 1 || name.length > 50) {
                return res.status(400).send({ error: "El nombre debe tener entre 1 y 50 caracteres" })
            }
            if (await Language.findOne({ name: { $regex: `^${name}$`, $options: 'i' }, _id: { $ne: req.params.id } })) {
                return res.status(400).send({ error: "Ya existe un lenguaje con ese nombre" })
            }
        }
        if (category !== undefined && !VALID_CATEGORIES.includes(category)) {
            return res.status(400).send({ error: `Categoría inválida. Valores permitidos: ${VALID_CATEGORIES.join(', ')}` })
        }

        const result = await Language.findByIdAndUpdate(
            req.params.id,
            { $set: { name, category } },
            { new: true, runValidators: true }
        )
        res.status(200).send({ result })

    } catch (error) {
        console.log(error)
        if (error.code === 11000) {
            return res.status(400).send({ error: "Ya existe un lenguaje con ese nombre" })
        }
        res.status(500).send({ error: "Error al actualizar el lenguaje" })
    }
})

// DELETE: Eliminar lenguaje (solo admin)
router.delete('/:id', /* auth.protegerRuta(["admin"]), */ async (req, res) => {
    try {
        const result = await Language.findByIdAndDelete(req.params.id)
        if (!result) {
            return res.status(404).send({ error: "Lenguaje no encontrado" })
        }
        res.status(200).send({ result })
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: "Error al eliminar el lenguaje" })
    }
})

export default router