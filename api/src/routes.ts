import express, { request, response } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';
import { celebrate, Joi } from 'celebrate';

import PointsController from './controllers/pointsController'
import ItemsController from './controllers/itemsController'

//index, show, create, update, delete

const routes = express.Router();
const upload = multer(multerConfig);
const pointsController = new PointsController();
const itemsController = new ItemsController();

//Items routes
routes.get('/items', itemsController.index);

//Points routes
routes.get('/points', pointsController.index);
routes.get('/points/:id', pointsController.show);
routes.post('/points',
    upload.single('image'),
    celebrate({
        body: Joi.object().keys({
            name: Joi.string().required(),
            email: Joi.string().required().email(),
            whatsapp: Joi.string().required(),
            latitude: Joi.number().required(),
            longitude: Joi.number().required(),
            city: Joi.string().required(),
            uf: Joi.string().required().max(2),
            items: Joi.string().required() //TODO: validar com regex se está separado com virgula
        })
    }, {
        abortEarly: false
    }),
    pointsController.create);//TODO: Implemetar file filter do multer


export default routes;