import { Router } from 'express'
import Notification from '../models/notification.js'
import { requireLogin, requireAdmin } from '../auth/auth.js'

const router = Router()

// Crear notificación (solo admin)
router.post('/', requireAdmin, async (req, res) => {
    try {
        const { user, message } = req.body

        if (!user || !message) {
            return res.status(400).json({ error: 'Usuario y mensaje son obligatorios' })
        }

        await Notification.create({ user, message })
        res.redirect('/usuarios')
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la notificación' })
    }
})

// Obtener notificaciones del usuario logueado
router.get('/', requireLogin, async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user.id })
            .sort({ createdAt: -1 })
        res.status(200).json({ notifications })
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las notificaciones' })
    }
})

// Marcar como leída
router.put('/:id/leer', requireLogin, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { read: true },
            { new: true }
        )

        if (!notification) return res.status(404).json({ error: 'Notificación no encontrada' })

        res.status(200).json({ notification })
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la notificación' })
    }
})

export default router