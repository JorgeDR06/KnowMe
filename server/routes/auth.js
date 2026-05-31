import { Router } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import User from '../models/User.js';
import Invitation from '../models/Invitation.js';
import { generateToken } from '../auth/auth.js';

const router = Router();

// Registro
router.post('/register', async (req, res) => {
    const { name, email, password, role, invitationKey } = req.body;
    const formData = { name, email, invitationKey };
    try {

        if (!name || !email || !password) {
            return res.render('auth/registro_usuario', { error: 'Nombre, email y contraseña son obligatorios', formData });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('auth/registro_usuario', { error: 'El email ya está registrado', formData });
        }

        // Hash de la contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        
        // Devolvemso un error si la invitación no es válida
        const invitation = await Invitation.findOne({ key: invitationKey, isUsed: false});
        if(!invitation)
            return res.render('auth/registro_usuario', { error: 'Código de invitación inválido o ya usado', formData });

        // Crear usuario
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'user',
            invitedBy: invitation.generatedBy
        });
        const savedUser = await newUser.save();

        // Generar 10 invitaciones
        const invitations = Array.from({ length: 10 }).map(() => ({
            key: crypto.randomBytes(4).toString('hex').toUpperCase(),
            generatedBy: savedUser._id,
            isUsed: false
        }));
        await Invitation.insertMany(invitations);
        
        // Marcamos la invitación como usada
        invitation.isUsed = true;
        invitation.usedBy = savedUser._id;
        await invitation.save();

        const token = generateToken(savedUser);  

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 2 * 60 * 60 * 1000
        });

        res.redirect('/porfolios')

    } catch (err) {
        console.error(err);
        res.render('auth/registro_usuario', { error: 'Error en el servidor, inténtalo de nuevo', formData });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.render('auth/login', { error: 'Credenciales incorrectas', formData: { email } });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('auth/login', { error: 'Credenciales incorrectas', formData: { email } });
        }

        const token = generateToken(user);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 2 * 60 * 60 * 1000
        });

        res.redirect('/porfolios')
    } catch (err) {
        res.render('auth/login', { error: 'Error en el servidor, inténtalo de nuevo' });
    }
});

export default router;