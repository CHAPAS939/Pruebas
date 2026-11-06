"""Collect only the matching native installers and evidence for a community beta."""
import hashlib, json, os, shutil, subprocess
from pathlib import Path

root=Path(__file__).resolve().parents[1]
source=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()
preview=json.loads((root/'mochi-preview.json').read_text())
incoming=root/'build/release-input'
output=root/'build/release-files';output.mkdir(parents=True,exist_ok=True)
manifest={'version':preview['version'],'source_commit':source,'source_base':preview['upstream'],'official_release':False,'platforms':{},'files':[]}
for platform,folder in [('macOS','Coucou-Mochi-macOS-universal'),('Windows','Coucou-Mochi-Windows-x64')]:
    directory=incoming/folder;data=json.loads((directory/'build-manifest.json').read_text())
    if data['source_commit']!=source or data['source_base']!=preview['upstream'] or data['version']!=preview['version']:
        raise RuntimeError('Installer source or version differs from release source')
    manifest['platforms'][platform]=data
    for item in data['artifacts']:
        file=directory/item['name']
        if file.stat().st_size!=item['size_bytes'] or hashlib.sha256(file.read_bytes()).hexdigest()!=item['sha256']:
            raise RuntimeError('Installer checksum mismatch')
        shutil.copy2(file,output/file.name);manifest['files'].append(item)
    shutil.copy2(directory/'build-manifest.json',output/f'{platform}-build-manifest.json')
qa=incoming/'Mochi-native-Windows-QA';proof=json.loads((qa/'native-validation.json').read_text())
if proof.get('passed') is not True or proof.get('nativeApp') is not True:
    raise RuntimeError('Actual native Windows application QA did not pass')
for name in ['native-validation.json','performance.json']:
    shutil.copy2(qa/name,output/f'Windows-{name}')
(output/'release-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
(output/'SHA256SUMS.txt').write_text('\n'.join(f"{v['sha256']}  {v['name']}" for v in manifest['files'])+'\n')
print(json.dumps(manifest,indent=2))
