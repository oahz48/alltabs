import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { deflateRawSync } from 'node:zlib';

// Create a conventional ZIP using Node's built-ins so packaging works on Mac and Windows.
function crc32(data) {
  let crc=0xffffffff;
  for(const byte of data){crc^=byte;for(let i=0;i<8;i++)crc=(crc>>>1)^(0xedb88320&-(crc&1));}
  return (crc^0xffffffff)>>>0;
}
async function listFiles(dir, prefix='') {
  const files=[];
  for(const item of await readdir(dir,{withFileTypes:true})) {
    const name=prefix+item.name;
    if(item.isDirectory()) files.push(...await listFiles(path.join(dir,item.name),name+'/'));
    else if(item.isFile()) files.push(name);
  }
  return files.sort();
}
const root=path.resolve('extension');
const manifest=JSON.parse(await readFile(path.join(root,'manifest.json'),'utf8'));
const locals=[],central=[];let offset=0;
const files=await listFiles(root);
for(const file of files){
  const name=Buffer.from(file),data=await readFile(path.join(root,file)),packed=deflateRawSync(data),crc=crc32(data);
  const header=Buffer.alloc(30);header.writeUInt32LE(0x04034b50);header.writeUInt16LE(20,4);header.writeUInt16LE(0x800,6);header.writeUInt16LE(8,8);header.writeUInt16LE(33,12);header.writeUInt32LE(crc,14);header.writeUInt32LE(packed.length,18);header.writeUInt32LE(data.length,22);header.writeUInt16LE(name.length,26);
  locals.push(header,name,packed);
  const index=Buffer.alloc(46);index.writeUInt32LE(0x02014b50);index.writeUInt16LE(20,4);index.writeUInt16LE(20,6);index.writeUInt16LE(0x800,8);index.writeUInt16LE(8,10);index.writeUInt16LE(33,14);index.writeUInt32LE(crc,16);index.writeUInt32LE(packed.length,20);index.writeUInt32LE(data.length,24);index.writeUInt16LE(name.length,28);index.writeUInt32LE(offset,42);
  central.push(index,name);offset+=header.length+name.length+packed.length;
}
const directory=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(files.length,8);end.writeUInt16LE(files.length,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);
await mkdir('dist',{recursive:true});
const output=path.resolve('dist',`alltabs-${manifest.version}.zip`);
await writeFile(output,Buffer.concat([...locals,directory,end]));
console.log(`Packaged ${files.length} files: ${output}`);
