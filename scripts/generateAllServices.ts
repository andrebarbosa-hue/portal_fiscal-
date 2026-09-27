import * as fs from 'fs';
import * as path from 'path';
import { nbsCatalog } from '../src/data/nbsData';

// Map of NBS descriptions to test validity
const nbsMap = new Map<string, string>();
nbsCatalog.forEach(item => {
  nbsMap.set(item.codigo, item.descricao);
});

console.log(`NBS Database loaded with ${nbsMap.size} codes.`);

// We will generate the entire list of 370+ services from the 16 pages of PDF
// Let's write the complete generator script
