import {Request, Response} from 'express';
import knex from '../data/connection';

class ItemsController {
     async index(request: Request, response: Response) {
        let search = String(request.query.search);
        let items = await knex('items').select('*');
    
        const serializedItems = items.map(item => {
            return {
                id: item.id,
                title: item.title,
                image: `http://192.168.1.61:3333/uploads/${item.image}`,
            };
        });
    
        return response.json(serializedItems);
    }
}

export default ItemsController;