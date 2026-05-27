import { Router } from 'express'
import Invitation from '../models/Invitation.js'
import { requireLogin } from '../auth/auth.js'

const router = Router();

// Devuelve la primera invitación valida de un usuario
router.get('/siguiente', requireLogin, async (req, res) => {
    const invitation = await Invitation.findOne({ 
        generatedBy: req.user.id, 
        isUsed: false 
    })
    if (!invitation) return res.json({ key: null })
    res.json({ key: invitation.key })
})

export default router;