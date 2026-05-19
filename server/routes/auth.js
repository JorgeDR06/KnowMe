import { Router } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import User from '../models/User.js';
import Invitation from '../models/Invitation.js';
import { generateToken } from '../auth/auth.js';

const router = Router();

// Registro
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: "Nombre, email y password son obligatorios" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "El email ya está registrado" });
        }

        // Hash de la contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Crear usuario
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'user'
        });
        const savedUser = await newUser.save();

        // Generar 10 invitaciones
        const invitations = Array.from({ length: 10 }).map(() => ({
            key: crypto.randomBytes(4).toString('hex').toUpperCase(),
            generatedBy: savedUser._id,
            isUsed: false
        }));
        await Invitation.insertMany(invitations);

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
        res.status(500).json({ error: "Error en el servidor" });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Credenciales incorrectas" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Credenciales incorrectas" });
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
        res.status(500).json({ error: "Error en el servidor" });
    }
});

export default router;