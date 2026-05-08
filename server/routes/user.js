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

// Borrar usuario
router.delete('/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);

        res.redirect(req.baseUrl);
    } catch (error) {
        res.status(500).render('error', { error: "Error al borrar" });
    }
});

export default router;