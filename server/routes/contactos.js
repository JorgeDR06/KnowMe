import { Router } from 'express';
import Contacto from '../models/contacto.js';

let router = Router();

// Listado general
router.get('/', (req, res) => {
    Contacto.find().then(resultado => {
        res.render('contactos_listado', {contactos: resultado});
    }).catch(error => {
        // Aquí podríamos renderizar una página de error
    });
});

// Formulario de alta de contacto
router.get('/nuevo', (req, res) => {
    res.render('contactos_nuevo');
});

// Formulario de edición de contacto
router.get('/editar/:id', (req, res) => {
    Contacto.findById(req.params['id']).then(resultado => {
        if (resultado) {
            res.render('contactos_editar', {contacto: resultado});
        } else {
            res.render('error', {error: "Contacto no encontrado"});
        }
    }).catch(error => {
        res.render('error', {error: "Contacto no encontrado"});
    });
});

// Ficha de contacto
router.get('/:id', (req, res) => {
    Contacto.findById(req.params['id']).then(resultado => {
        res.render('contactos_ficha', {contacto: resultado});
    }).catch(error => {
        // Aquí podríamos renderizar una página de error
    });
});

// Ruta para insertar contactos
router.post('/', (req, res) => {

    let nuevoContacto = new Contacto({
        nombre: req.body.nombre,
        telefono: req.body.telefono,
        edad: req.body.edad
    });
    nuevoContacto.save().then(resultado => {
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
            mensaje = 'Error añadiendo contacto';
        }
        console.log();
        res.render('error', {error: mensaje});
    });
});

// Ruta para borrar contactos
router.delete('/:id', (req, res) => {
    Contacto.findByIdAndDelete(req.params.id).then(resultado => {
        res.redirect(req.baseUrl);
    }).catch(error => {
        res.render('error', {error: "Error borrando contacto"});
    });
});

// Ruta para editar contactos
router.put('/:id', (req, res) => {
    Contacto.findByIdAndUpdate(req.params.id, {
        $set: {
            nombre: req.body.nombre,
            edad: req.body.edad,
            telefono: req.body.telefono
        }
    }, {new: true}).then(resultado => {
        res.redirect(req.baseUrl);
    }).catch(error => {
        res.render('error', {error: "Error modificando contacto"});
    });
});

export default router;