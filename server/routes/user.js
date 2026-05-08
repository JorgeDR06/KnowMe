import { Router } from 'express';
import User from '../models/User.js';

let router = Router();

// Listado general
router.get('/', (req, res) => {
    User.find().then(resultado => {
        res.render('usuarios_listado', {user: resultado});
    }).catch(error => {
        // Aquí podríamos renderizar una página de error
    });
});

// Formulario de alta de contacto
router.get('/registro', (req, res) => {
    res.render('registro_usuario');
});

// Formulario de edición de usuario
router.get('/perfil/:id', (req, res) => {
    User.findById(req.params['id']).then(resultado => {
        if (resultado) {
            res.render('perfil_usuario', {contacto: resultado});
        } else {
            res.render('error', {error: "Usuario no encontrado"});
        }
    }).catch(error => {
        res.render('error', {error: "Usuario no encontrado"});
    });
});

// Perfil de usuario
router.get('/:id', (req, res) => {
    User.findById(req.params['id']).then(resultado => {
        res.render('perfil_usuario', {contacto: resultado});
    }).catch(error => {
        // Aquí podríamos renderizar una página de error
    });
});

// Ruta para insertar contactos
router.post('/', (req, res) => {

    let nuevoUsuario = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
    });

    nuevoUsuario.save().then(resultado => {
        res.redirect(req.baseUrl);
    }).catch(error => {
        let errores = Object.keys(error.errors);
        let mensaje = "";
        if(errores.length > 0)
        {
            errores.forEach(clave => {
                mensaje += '<p>' + error.errors[clave].message + '</p>';
            })
        }
        else
        {
            mensaje = 'Error añadiendo el usuario';
        }
        console.log();
        res.render('error', {error: mensaje});
    });
});

// Ruta para borrar contactos
router.delete('/:id', (req, res) => {
    User.findByIdAndDelete(req.params.id).then(resultado => {
        res.redirect(req.baseUrl);
    }).catch(error => {
        res.render('error', {error: "Error borrando el usuario"});
    });
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
    }).catch(error => {
        res.render('error', {error: "Error modificando contacto"});
    });
});

export default router;