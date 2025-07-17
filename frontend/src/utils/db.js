// utils/db.js
import { openDB, deleteDB } from 'idb';

const DB_NAME = 'GoogleActivityApp';
const DB_VERSION = 3;
const STORE_NAME = 'searchResults';


async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('savedDatasets')) {
        db.createObjectStore('savedDatasets', { keyPath: 'id' });
      }
    },
  });
}

export async function getDB() {
  try {
    return await initDB();
  } catch (err) {
    console.warn('Initial DB open failed. Attempting recovery...', err);
    if (err.name === 'NotFoundError' || err.name === 'VersionError' || err.name === 'InvalidStateError') {
      // Delete and retry from scratch
      await deleteDB(DB_NAME);
      return await initDB();
    } else {
      throw err; // let other unexpected errors surface
    }
  }
}

export const DB_CONSTANTS = {
  DB_NAME,
  DB_VERSION,
  STORE_NAME: 'searchResults',
  STORE_NAME_SAVED: 'savedDatasets',
};


