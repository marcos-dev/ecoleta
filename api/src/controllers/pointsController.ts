import { Request, Response } from 'express';
import knex from '../data/connection';

class PointsController {

    async index(request: Request, response: Response) {
        debugger
        const { city, uf, items } = request.query;

        const parsedItems = String(items)
            .split(',')
            .map(item => Number(item.trim()));

        let points = await knex('points')
            .join('point_items', 'points.id', '=', 'point_items.point_id')
            .whereIn('point_items.item_id', parsedItems)
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            .orderBy('name')
            .select('points.*');

        //Todo implementar coom biblioeta de serialização
        const serializedPoints = points.map(point => {
            return {
                ...point,
                image_url: `http://192.168.1.61:3333/uploads/${point.image}`
            };
        });


        return response.json(serializedPoints);
    }

    async show(request: Request, response: Response) {
        const { id } = request.params;
        const foundPoint = await knex('points').where('id', id).first();

        if (!foundPoint) {
            return response.status(400).json({ message: 'Point not found' });
        }

        const point = {
            ...foundPoint,
            image_url: `http://192.168.1.61:3333/uploads/${foundPoint.image}`

        };

        const items = await knex('items')
            .join('point_items', 'items.id', '=', 'point_items.item_id')
            .where('point_items.point_id', id)
            .select('items.title');

        return response.json({ point, items });
    }

    async create(request: Request, response: Response) {
        const {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items
        } = request.body;

        let point = {
            image: request.file.filename,
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
        }

        const trx = await knex.transaction();

        const createdIds = await trx('points').insert(point);

        const point_id = createdIds[0];

        const pointItems = items
            .split(',')
            .map((item: string) => Number(item.trim()))
            .map((item_id: number) => {
                return {
                    item_id,
                    point_id: createdIds[0],
                }
            })

        await trx('point_items').insert(pointItems);

        await trx.commit();

        return response.json({
            id: point_id,
            ...point
        });
    }
}

export default PointsController;