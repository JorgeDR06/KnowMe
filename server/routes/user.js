import { Router } from 'express';
import crypto from 'crypto';
import User from '../models/User.js';
import Invitation from '../models/Invitation.js';
import { protectRoute, requireLogin, verifyToken, requireAdmin } from '../auth/auth.js'

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

// Actualizar usuario desde perfil
router.put('/:id/perfil', async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id, {
            $set: {
                name: req.body.name,
                email: req.body.email,
                bio: req.body.bio,
                role: req.body.role,
                avatar: req.body.avatar,
                socialLinks: req.body.socialLinks
            }
        });
        res.redirect('/perfil/' + req.params.id);
    } catch (error) {
        res.status(500).render('error', { error: "Error al actualizar" });
    }
});

// Actualizar usuario
router.put('/:id', async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id, {
            $set: {
                name: req.body.name,
                email: req.body.email,
                bio: req.body.bio,
                role: req.body.role,
                avatar: req.body.avatar,
                socialLinks: req.body.socialLinks
            }
        });
        res.redirect('/usuarios');
    } catch (error) {
        res.status(500).render('error', { error: "Error al actualizar" });
    }
});

// Eliminar usuario
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id)
        res.redirect('/usuarios')
    } catch (error) {
        res.status(500).render('error', { error: 'Error al eliminar el usuario' })
    }
})

export default router;