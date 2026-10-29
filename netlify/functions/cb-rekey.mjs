/* The CB: sealing again under a new key. Every quarter of an hour, and only
   while one of the three sealing keys has an _OLD partner (a rotation in
   progress): reads the store from where the last run stopped, seals again under
   the new key whatever is still under the old one, and writes how far it has
   got in `key-rotation`. With no _OLD key set it reads nothing and does
   nothing. See rekeyStore in ../cb/lib.mjs for how to rotate a key. */
import { rekeyStore } from '../cb/lib.mjs';

export default async () => {
  await rekeyStore();
};

export const config = { schedule: '*/15 * * * *' };
