# Coucou · Mochi Home + Perch

Versión integrada: habitación 3D y Mochi sentado en ventanas reales, para macOS y Windows. Los dos proyectos originales se conservan por separado; sus notas están en `docs/mochi-home` y `docs/mochi-perch`.

## Instaladores

- macOS 15+: `Coucou-Mochi-macOS-universal.dmg`, app universal para Apple Silicon e Intel, firma ad-hoc sin notarizar. Arrastrar Coucou a Aplicaciones.
- Windows 10/11 x64: `Coucou-Mochi-Windows-x64-setup.exe` y `.msi`, sin firma comercial. También se prepara un ZIP portable.

Los instaladores ya están generados y verificados en ambos sistemas. Descargas, instrucciones y sumas SHA-256 en [INSTALLERS.md](INSTALLERS.md).

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

La habitación incluye estilos **Acogedor, Gamer, Minimalista y Mediterráneo** con muebles y decoración diferentes. Puedes cambiar la especie y posición de la planta, el patrón de alfombra, los cuadros y el acabado del escritorio. Las opciones automáticas siguen el estilo elegido; las elecciones personales se conservan. Toca la lámpara, la ventana, el escritorio, el asiento o la planta para interactuar.

En **Guardarropa → Combinar atuendos** puedes añadir gafas y bufanda al atuendo principal. En el menú contextual del Mochi del escritorio, **Saltar a otra ventana** busca otra ventana visible con espacio encima y mueve solo a Mochi, conservando la ropa. Si no hay un destino adecuado, mantiene su posición. El movimiento reducido elimina la animación del salto.

Abre la pestaña con la lámpara para entrar en la habitación. Usa Opción (Mac) o Alt (Windows) al soltar a Mochi en el borde superior de una ventana para engancharlo. El arrastre habitual conserva la función original de Coucou. En Windows se puede elegir una ventana visible aunque no esté activa; la ventana necesita espacio encima para que Mochi quepa. Se mantienen los conjuntos de ropa y el Canvas de respaldo.

En la habitación, **Decorar** permite elegir Arena, Salvia, Rosa o Medianoche y mostrar u ocultar planta y alfombra. **Guardarropa** permite probar y guardar los atuendos de Coucou, incluidos los nuevos auriculares, gorro de rana y flor. La decoración se guarda localmente. El atuendo también se aplica al personaje fuera de la habitación; al engancharlo al borde de una ventana, conserva la ropa y apoya las dos manos sobre el borde.

## Estado

Código integrado sobre `74363634b037108393e450428e5f207515c2c29b`, conservando las contribuciones Home `006aa4d` y Perch `b815bc6`. Los builds nativos y los instaladores de la revisión `d77866afa21d6ad146cb1e189b75dad76166ea9b` han terminado correctamente en ambas plataformas. El repositorio de Louis devuelve 403 para la conexión CHAPAS939; el usuario ha autorizado compilar en una rama nueva de `CHAPAS939/Pruebas`, conservando su rama principal.
