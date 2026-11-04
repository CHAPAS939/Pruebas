# Mochi Home · contribución para macOS y Windows

Una habitación 3D para Mochi, con luz de día o de noche, lluvia y lámpara. Las preferencias se guardan en la configuración local de Coucou.

Contribución independiente sobre Coucou, base `74363634b037108393e450428e5f207515c2c29b`. Home y Perch permanecen en proyectos y ramas diferentes. Incluye código real de ambas apps; aún no es una versión binaria verificada en los dos sistemas.

## Integración

En macOS usa SwiftUI/AppKit y un WKWebView local. En Windows se integra en la app Tauri existente. Ambos cargan la misma geometría y el mismo contrato de estado desde `shared/mochi-scenes/`; el dibujo original conserva los conjuntos de ropa y sirve como alternativa si falla WebGL.

Los estados vienen de las sesiones reales de Coucou. No se usan agentes ni ventanas simulados en la integración. Los recursos están incluidos en la app: no hay CDN, descargas de código ni servicios añadidos. Three.js 0.170.0 se incluye con su licencia MIT para mantener un solo renderer en ambas plataformas. Es la única dependencia nueva de renderizado y no añade paquetes npm ni crates.

El renderer se crea al mostrarse, deja de programar cuadros cuando está oculto o pausado y muestra un cuadro estático con Reducir movimiento. Los mensajes contienen únicamente estado visual, preferencias y mirada; no contienen comandos, prompts, rutas ni credenciales. El iframe de Windows solo permite scripts y no recibe APIs de Tauri.

Abre la pestaña con la lámpara en la isla. Día, noche o reloj local, lluvia y lámpara son controles independientes.

## Compilar y probar

macOS 15+, Xcode compatible y XcodeGen:

```sh
cd NotchBuddy
xcodegen generate
xcodebuild -scheme NotchBuddy -configuration Debug -destination 'platform=macOS' CODE_SIGNING_ALLOWED=NO build
```

Windows, con las herramientas de compilación requeridas por `windows/README.md`:

```sh
cd windows
npm ci
cargo build --release --locked -p coucou-hook
npm run tauri dev
```

Para generar la app de revisión: `npx tauri build --debug --no-bundle`. El workflow `.github/workflows/mochi-cross-platform.yml` compila macOS y Windows en una matriz, ejecuta las regresiones y guarda dos ZIP de revisión sin firmar. La comprobación final requiere que los dos sistemas pasen. No publica releases.

## Validación realizada en este entorno Linux

- TypeScript y Vite: compilación correcta en ambos proyectos; recursos compartidos comparados byte a byte con los incluidos en el build.
- Regresiones existentes: Perch, 38 archivos de pruebas aprobados; Home, 37 aprobados inicialmente y el archivo de traducciones corregido después (33 pruebas aprobadas). Las 25 pruebas del ciclo de vida de escritorio también pasan en Home.
- Pruebas nuevas: 5 del contrato compartido y 1 del adaptador de Windows por proyecto; 1 adicional de preferencias y límites día/noche en Home.
- Escenas reales empaquetadas: comprobadas en Chromium dentro del iframe aislado, cinco estados, pausa, movimiento reducido y alternativa sin WebGL, sin peticiones externas ni errores. Las capturas de recursos no son capturas de la app nativa.
- Swift: lógica de habitación compilada y ejecutada; análisis sintáctico de archivos nuevos y modificados; catálogo de traducciones validado.

## Pendiente antes de darlo por listo

Los builds completos con Xcode y Windows todavía no se han ejecutado: este entorno es Linux. El workflow queda preparado, pero no se ha podido activar en GitHub con la conexión actual (escritura denegada, HTTP 403). No hay PR abierto ni instaladores verificados.

Revisar en ambos sistemas: transiciones de aprobación/preguntas y regreso al escritorio, conjuntos de ropa, movimiento reducido, bloqueo y suspensión de pantalla, clics transparentes y fallback de GPU.

## Demo y propuesta

`design/concept/index.html` conserva la demo estética independiente. Sus agentes y ventanas son simulados. `PITCH.md` es un borrador para Louis; no se ha enviado.

Código base, personaje y recursos de Coucou: Louis Raillé y colaboradores. Se preservan `LICENSE`, `LICENSE-ASSETS.md` y las licencias de terceros. Esta contribución se prepara para revisión del proyecto.
