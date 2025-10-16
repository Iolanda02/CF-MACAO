import ItemVariant from '../models/ItemVariant.js';
import * as factory from './factory.controller.js';

export const getAllItemVariants = factory.getAll(ItemVariant);

export const getItemVariant = factory.getOne(ItemVariant, { path: 'itemId' });

export const createItemVariant = factory.createOne(ItemVariant);

export const updateItemVariant = factory.updateOne(ItemVariant);

export const deleteItemVariant = factory.deleteOne(ItemVariant);
