import express from 'express'
import Porfolio from '../models/porfolio.js'
import { protectRoute, requireLogin } from '../auth/auth.js' 
import { upload } from '../config/cloudinary.js'

const router = express.Router();

// Valores válidos según el modelo
const VALID_MEDIA_TYPES = ['image', 'video'];

// GET: Obtener todos los porfolios
router.get('/', async (req, res) => {
    try {
        const result = await Porfolio.find().populate('owner', 'name avatar')
            .populate('technologies')
            .populate('languages');
        if (!result || result.length === 0) {
            return res.status(404).send({ error: "No se encontraron porfolios" });
        }
        res.status(200).send({ result });
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: "Error al obtener los porfolios" });
    }
});

// GET: Buscar porfolios por título, tecnología o lenguaje
router.get('/find', async (req, res) => {
    try {
        const { title, technology, language, featured } = req.query;

        if (!title && !technology && !language && !featured) {
            return res.status(400).send({ error: "Se requiere al menos un parámetro de búsqueda" });
        }

        const query = {};
        if (title)      query.title        = { $regex: title, $options: 'i' };
        if (technology) query.technologies = { $in: technology.split(',') };  // acepta uno o varios IDs separados por coma
        if (language)   query.languages    = { $in: language.split(',') };
        if (featured === 'true') query.featured = true;

        const result = await Porfolio.find(query)
            .populate('owner', 'name avatar')
            .populate('technologies')
            .populate('languages');

        if (!result || result.length === 0) {
            return res.status(404).send({ error: "No se encontraron porfolios" });
        }

        res.status(200).send({ result });

    } catch (error) {
        console.log(error);
        res.status(500).send({ error: "Error al buscar porfolios" });
    }
});

// GET: Obtener porfolios de un usuario concreto
router.get('/user/:userId', async (req, res) => {
    try {
        const result = await Porfolio.find({ owner: req.params.userId }).populate('owner', 'name avatar')
            .populate('technologies')
            .populate('languages');
        if (!result || result.length === 0) {
            return res.status(404).send({ error: "Este usuario no tiene porfolios" });
        }
        res.status(200).send({ result });
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: "Error al obtener los porfolios del usuario" });
    }
});

// GET: Obtener porfoliolio por ID
router.get('/:id', async (req, res) => {
    try {
        const result = await Porfolio.findById(req.params.id).populate('owner', 'name avatar')
            .populate('technologies')
            .populate('languages');
        if (!result) {
            return res.status(404).send({ error: "Porfolio no encontrado" });
        }
        res.status(200).send({ result });
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: "Error al obtener el porfolio" });
    }
});

// POST: Crear porfoliolio (usuario registrado)
router.post('/', requireLogin, async (req, res) => {
    try {
        const { title, description, media, technologies, languages, githubRepo, liveDemo, featured, codeSnippets } = req.body;

        if (!title || !description) {
            return res.status(400).send({ error: "Faltan campos obligatorios: title y description" });
        }

        if (codeSnippets !== undefined && !Array.isArray(codeSnippets)) {
            return res.status(400).send({ error: "El campo codeSnippets debe ser un array" })
        }

        if (title.length < 3 || title.length > 100) {
            return res.status(400).send({ error: "El título debe tener entre 3 y 100 caracteres" });
        }
        if (description.length < 10 || description.length > 2000) {
            return res.status(400).send({ error: "La descripción debe tener entre 10 y 2000 caracteres" });
        }

        if (media !== undefined) {
            if (!Array.isArray(media)) {
                return res.status(400).send({ error: "El campo media debe ser un array" });
            }
            for (const item of media) {
                if (!item.url || !item.type) {
                    return res.status(400).send({ error: "Cada elemento de media debe tener 'url' y 'type'" });
                }
                if (!VALID_MEDIA_TYPES.includes(item.type)) {
                    return res.status(400).send({ error: `El tipo de media debe ser uno de: ${VALID_MEDIA_TYPES.join(', ')}` });
                }
            }
        }

        if (technologies !== undefined && !Array.isArray(technologies)) {
            return res.status(400).send({ error: "El campo technologies debe ser un array" });
        }
        if (languages !== undefined && !Array.isArray(languages)) {
            return res.status(400).send({ error: "El campo languages debe ser un array" });
        }

        const porfolio = new Porfolio({
            title,
            description,
            media,
            technologies,
            languages,
            githubRepo,
            liveDemo,
            featured: featured ?? false,
            codeSnippets,
            owner: req.user.id
        });

        const result = await porfolio.save();
        res.status(201).send({ result });

    } catch (error) {
        console.log(error);
        if (error.name === 'ValidationError') {
            return res.status(400).send({ error: error.message });
        }
        res.status(500).send({ error: "Error al crear el porfolio" });
    }
});

// PUT: Actualizar porfoliolio
router.put('/:id',  requireLogin, async (req, res) => {
    try {
        const porfolio = await Porfolio.findById(req.params.id);
        if (!porfolio) {
            return res.status(404).send({ error: "Porfolio no encontrado" });
        }

        const isOwner = porfolio.owner.toString() === req.user.id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).send({ error: "No tienes permiso para editar este porfolio" });
        }

        const { title, description, media, technologies, languages, githubRepo, liveDemo, featured, codeSnippets } = req.body;

        if (title !== undefined && (title.length < 3 || title.length > 100)) {
            return res.status(400).send({ error: "El título debe tener entre 3 y 100 caracteres" });
        }
        if (description !== undefined && (description.length < 10 || description.length > 2000)) {
            return res.status(400).send({ error: "La descripción debe tener entre 10 y 2000 caracteres" });
        }
        if (media !== undefined) {
            if (!Array.isArray(media)) {
                return res.status(400).send({ error: "El campo media debe ser un array" });
            }
            for (const item of media) {
                if (!item.url || !item.type) {
                    return res.status(400).send({ error: "Cada elemento de media debe tener 'url' y 'type'" });
                }
                if (!VALID_MEDIA_TYPES.includes(item.type)) {
                    return res.status(400).send({ error: `El tipo de media debe ser uno de: ${VALID_MEDIA_TYPES.join(', ')}` });
                }
            }
        }
        if (technologies !== undefined && !Array.isArray(technologies)) {
            return res.status(400).send({ error: "El campo technologies debe ser un array" });
        }
        if (languages !== undefined && !Array.isArray(languages)) {
            return res.status(400).send({ error: "El campo languages debe ser un array" });
        }

        const result = await Porfolio.findByIdAndUpdate(
            req.params.id,
            { $set: { title, description, media, technologies, languages, githubRepo, liveDemo, featured, codeSnippets } },
            { new: true, runValidators: true }
        );

        res.status(200).send({ result });

    } catch (error) {
        console.log(error);
        if (error.name === 'ValidationError') {
            return res.status(400).send({ error: error.message });
        }
        res.status(500).send({ error: "Error al actualizar el porfolio" });
    }
});

// DELETE: Eliminar porfoliolio
router.delete('/:id', requireLogin, async (req, res) => {
    try {
        const porfolio = await Porfolio.findById(req.params.id);
        if (!porfolio) {
            return res.status(404).send({ error: "Porfolio no encontrado" });
        }

        const isOwner = porfolio.owner.toString() === req.user.id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).send({ error: "No tienes permiso para eliminar este porfolio" });
        }

        const result = await Porfolio.findByIdAndDelete(req.params.id);
        res.status(200).send({ result });

    } catch (error) {
        console.log(error);
        res.status(500).send({ error: "Error al eliminar el porfolio" });
    }
});

// POST: Subir media (imagen o vídeo)
router.post('/upload', requireLogin, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({ error: "No se ha subido ningún archivo" })
        }
        res.status(200).send({
            url: req.file.path,
            publicId: req.file.filename,
            type: req.file.mimetype.startsWith('video') ? 'video' : 'image'
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: "Error al subir el archivo" })
    }
});

export default router;