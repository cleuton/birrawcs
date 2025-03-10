import bcrypt from 'bcrypt';
import { getDB } from '../db.mjs';
import logger from '../util/logger.mjs';
import { Binary } from 'mongodb';
import { stringParaUuidBinario } from './taskCrudService.mjs';

export async function getUserIdentity(userUUID) {

  if (!userUUID) {
    logger.error('userService: UUID do usuário não informado');  
    throw new Error('UUID do usuário não informado');
  }

  try {
    const db = getDB();
    const usersCollection = db.collection('users');
    //const binaryId = stringParaUuidBinario(userUUID);
    const userIdBuffer = Buffer.from(userUUID.replace(/-/g, ''), 'hex');
    const binaryId = new Binary(userIdBuffer, Binary.SUBTYPE_UUID);    
    const user = await usersCollection.findOne({
      id: binaryId
    }); 
    return {id: userUUID,
            email: user.email,
            name: user.name,
            role: user.admin ? 'admin' : 'user'
          };
  }
  catch (error) {
    logger.error(`userService: Falha ao obter o usuário: ${error}`);
    throw new Error('Falha ao obter o usuário');
  }
};

// Admin é binário
export async function getUsersByRole(admin) {
    if (admin === undefined || admin === null) {
        logger.error('userService: Papel do usuário não informado');
        throw new Error('Papel do usuário não informado');
    }
    try {
        const db = getDB();
        const usersCollection = db.collection('users');
        const users = await usersCollection.find({ 'admin': admin}).toArray();
        return users.map(user => ({
            id: user.id,
            email: user.email,
            name: user.name
        }));
    }
    catch (error) {
        logger.error(`userService: Falha ao obter usuários: ${error}`);
        throw new Error('Falha ao obter usuários');
    }
};

export async function searchUsersByName(userName) {
    if (!userName) {
        logger.error('userService: Nome do usuário não informado');
        throw new Error('Nome do usuário não informado');
    }

    const escapeRegex = (text) => {
      return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    };
    
    try {
        const db = getDB();
        const usersCollection = db.collection('users');
        const cleanUserName = userName.replace(/["']/g, '');
        const escapedUserName = escapeRegex(cleanUserName);   
        const regex = new RegExp(escapedUserName, 'i'); 
        const users = await usersCollection.find({ 
          name: regex
        }).toArray();      
        return users.map(user => ({
            id: user.id,
            name: user.name
        }));
    }
    catch (error) {
        logger.error(`userService: Falha ao obter usuários: ${error}`);
        throw new Error('Falha ao obter usuários');
    }
}