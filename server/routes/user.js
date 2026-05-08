import { Router } from 'express';
import crypto from 'crypto';
import User from '../models/User.js';
import Invitation from '../models/Invitation.js';

let router = Router();

// Listado general
router.get('/', async (req, res) => {
    try {
        const usuarios = await User.find();
        res.render('usuarios_listado', { user: usuarios });
    } catch (error) {
        res.status(500).render('error', { error: "Error al cargar la lista" });
    }
});

// Formulario de creación
router.get('/nuevo', (req, res) => {
    res.render('registro_usuario');
});

// Ver perfil del usuario y sus invitaciones
router.get('/:id', async (req, res) => {
    try {
        // Ejecutamos ambas consultas al mismo tiempo
        const [usuario, invitaciones] = await Promise.all([
            User.findById(req.params.id),
            Invitation.find({ generatedBy: req.params.id }).populate('usedBy', 'name')
        ]);

        if (!usuario) return res.status(404).render('error', { error: "No existe" });

        res.render('perfil_usuario', { 
            user: usuario, 
            invitaciones: invitaciones 
        });
    } catch (error) {
        res.status(500).render('error', { error: "Error al cargar el perfil" });
    }
});

// Actualizar usuario
router.put('/:id', async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id, req.body);
        res.redirect(req.baseUrl);
    } catch (error) {
        res.status(500).render('error', { error: "Error al actualizar" });
    }
});

// Ruta para editar el usuario desde el perfil
router.put('/:id', (req, res) => {
    User.findByIdAndUpdate(req.params.id, {
        $set: {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            bio: req.body.bio,
            skills: req.body.skills,
            languajes: req.body.languajes,
            role: req.body.role,
            avatar: req.body.avatar,
            socialLinks: req.body.socialLinks,
            invitedBy: req.body.invitedBy
        }
    }, {new: true}).then(resultado => {
        res.redirect(req.baseUrl);
    } catch (error) {
        res.status(500).render('error', { error: "Error al borrar" });
    }
});

export default router;