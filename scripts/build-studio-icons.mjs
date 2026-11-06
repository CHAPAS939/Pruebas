import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const require=createRequire(new URL('../windows/package.json',import.meta.url));
const {build}=require('esbuild');
const file=fileURLToPath(new URL('../shared/mochi-scenes/outfit-icons.js',import.meta.url));
const result=await build({entryPoints:[fileURLToPath(new URL('./studio-icons-entry.ts',import.meta.url))],bundle:true,format:'iife',platform:'browser',target:'es2020',minify:true,write:false,banner:{js:'/* Generated from Coucou’s canonical outfit drawings by scripts/build-studio-icons.mjs. */'}});
const text=result.outputFiles[0].text;
if(process.argv.includes('--check')){if(readFileSync(file,'utf8')!==text)throw Error('Run node scripts/build-studio-icons.mjs');console.log('Studio outfit icons match the canonical drawings.');}else{writeFileSync(file,text);console.log('Generated shared studio outfit icons.');}
