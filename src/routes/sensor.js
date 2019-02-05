const router = require('express').Router();

const sensorController = require('../controllers/sensorController');
/*
    Todas las peticiones que se hacen en la pagina o sea;
    GET y POST. Son redirigidas a sus debidas rutas 
    para efectuar con lo querido.
*/
router.get('/', sensorController.inicio);
router.get('/crud', sensorController.list);
router.post('/add', sensorController.save);
router.get('/update/:id', sensorController.edit);
router.post('/update/:id', sensorController.update);
router.get('/delete/:id', sensorController.delete);
router.post('/search', sensorController.search);

router.get('/grafico', (req, res)=>{	//req = Obj peticion del navegador, res = Obj respuesta del servidor
	cont++;
	res.render('grafico.ejs');
});

module.exports = router;

