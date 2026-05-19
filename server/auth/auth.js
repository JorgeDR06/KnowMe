import jwt from 'jsonwebtoken'

// Obtenemos la clave secreta desde las variables de entorno.
// Si por algÃºn motivo no existe en el archivo .env, ponemos un valor por defecto.
const secret = process.env.JWT_SECRET || 'clave_por_defecto_segura';

/**
 * FunciÃ³n para generar un token JWT a partir de un usuario vÃ¡lido.
 * @param {Object} user - Objeto del usuario (proveniente de la BD)
 * @returns {String} Token JWT firmado
 */
const generateToken = (user) => {
    // El payload es la informaciÃ³n Ãºtil que irÃ¡ dentro del token.
    const payload = {
        id: user._id,
        login: user.login,
        rol: user.rol // Importante para gestionar los permisos luego
    };
    
    // Firmamos el token con nuestro secreto y le damos un tiempo de expiraciÃ³n (ej. 2 horas)
    return jwt.sign(payload, secret, { expiresIn: '2h' });
};

/**
 * FunciÃ³n para verificar un token JWT y extraer la informaciÃ³n del usuario.
 * @param {String} token - Token JWT a verificar
 * @returns {Object} Payload decodificado si es vÃ¡lido (lanza error si es invÃ¡lido)
 */
const verifyToken = (token) => {
    // jwt.verify comprueba la firma del token usando nuestra clave secreta.
    // Si el token fue alterado o expirÃ³, esto lanzarÃ¡ un error automÃ¡ticamente.
    return jwt.verify(token, secret);
};

/**
 * Middleware de protecciÃ³n de rutas que verifica el token y el rol.
 * Al devolver una funciÃ³n, podemos pasarle parÃ¡metros (allowedRoles) cuando la usamos en las rutas.
 * @param {""} allowedRoles - Array con los roles permitidos ['admin', 'manager', 'user']
 */
const protectRoute = (allowedRoles) => {
    return (req, res, next) => {
        // 1. Obtener el token de las cabeceras de la peticiÃ³n
        // Normalmente viene en la cabecera "Authorization" con el formato "Bearer <token>"
        let token = req.headers['authorization'];

        // Si no hay token en la cabecera, denegamos el acceso (PDF: "Login incorrecto")
        if (!token) {
            return res.status(401).json({ error: "Login incorrecto", result: null });
        }

        try {
            // Limpiamos el token por si viene con el prefijo "Bearer "
            if (token.startsWith('Bearer ')) {
                token = token.slice(7, token.length); // Quitamos la palabra "Bearer "
            }

            // 2. Verificamos el token usando nuestra funciÃ³n auxiliar
            const decoded = verifyToken(token);

            // Guardamos la informaciÃ³n descifrada del usuario en el objeto `req`
            // AsÃ­ estarÃ¡ disponible para los siguientes middlewares o controladores
            req.user = decoded;

            // 3. Comprobamos si el rol del usuario estÃ¡ dentro de los roles permitidos
            if (!allowedRoles.includes(req.user.rol)) {
                // PDF: Si el token es vÃ¡lido pero el rol no tiene permiso -> HTTP 403
                return res.status(403).json({ error: "Acceso no autorizado", result: null });
            }

            // Si todo es correcto (token vÃ¡lido y rol permitido), continuamos con la ejecuciÃ³n
            next();

        } catch (error) {
            // Si jwt.verify falla (token alterado, expirado, etc.) se captura el error aquÃ­
            // PDF: Si el token es invÃ¡lido -> HTTP 401
            return res.status(401).json({ error: "Login incorrecto", result: null });
        }
    };
};

const requireLogin = (req, res, next) => {
    const token = req.cookies.token
    console.log('Cookie token:', token)

    if (!token) return res.redirect('/login')

    try {
        const decoded = verifyToken(token)
        req.user = decoded
        next()
    } catch (err) {
        console.log('Error:', err.message)
        return res.redirect('/login')
    }
}

// Exportamos las funciones para usarlas en otros archivos
export {
    generateToken,
    verifyToken,
    protectRoute,
    requireLogin
};