# Coucou · Mochi Home + Perch

Versión integrada: habitación 3D y Mochi sentado en ventanas reales, para macOS y Windows. Los dos proyectos originales se conservan por separado; sus notas están en `docs/mochi-home` y `docs/mochi-perch`.

## Instaladores

- macOS 15+: `Coucou-Mochi-macOS-universal.dmg`, app universal para Apple Silicon e Intel, firma ad-hoc sin notarizar. Arrastrar Coucou a Aplicaciones.
- Windows 10/11 x64: `Coucou-Mochi-Windows-x64-setup.exe` y `.msi`, sin firma comercial. También se prepara un ZIP portable.

Estos son los nombres que generará la compilación. Aún no hay binarios construidos: este entorno es Linux y el workflow nativo no se ha ejecutado.

El workflow `.github/workflows/mochi-installers.yml` compila ambos sistemas, verifica los recursos compartidos dentro del build y guarda los instaladores, el commit de origen y sus sumas SHA-256 como artefactos. Solo da el conjunto por correcto si pasan ambos sistemas. No crea releases, etiquetas ni modifica ramas oficiales.

Para compilar localmente:

```sh
# En macOS, con Xcode, XcodeGen y Node 24:
bash scripts/build-mochi-macos.sh
```

```powershell
# En Windows, con Rust/MSVC, WebView2 y Node 24:
./scripts/build-mochi-windows.ps1
```

La app mantiene los identificadores y la configuración de Coucou. Esta compilación reemplaza la app instalada cuando se instala en la misma ubicación. No es una release oficial del proyecto.

## Uso

Abre la pestaña con la lámpara para entrar en la habitación. Usa Opción (Mac) o Alt (Windows) al soltar a Mochi en el borde superior de una ventana para sentarlo. El arrastre habitual conserva la función original de Coucou. Se mantienen los conjuntos de ropa y el Canvas de respaldo.

## Estado

Código integrado sobre `74363634b037108393e450428e5f207515c2c29b`, conservando las contribuciones Home `006aa4d` y Perch `b815bc6`. Los builds nativos y los instaladores siguen pendientes. El repositorio de Louis devuelve 403 para la conexión CHAPAS939; el usuario ha autorizado compilar en una rama nueva de `CHAPAS939/Pruebas`, conservando su rama principal.
