# Mochi Perch

Un compañero sentado en tus ventanas.

Mochi se sienta en el borde superior de una ventana, balancea los pies, sigue su posición y se inclina suavemente al moverse.

Este es un proyecto independiente basado en [Coucou](https://github.com/Louis-CFM/coucou), commit `74363634b037108393e450428e5f207515c2c29b`. La otra exploración se mantiene en una rama y una carpeta distintas. No es una versión oficial ni una aplicación macOS compilada.

## Dirección visual v2

La demo de navegador se ha rehecho con geometría 3D generada en código, tipografía Manrope y una paleta de madera, lino y salvia. La habitación incorpora iluminación real, sombras, lluvia y una ligera respuesta al cursor. Mochi tiene volumen y expresiones en ambas demos. Se conservan la navegación por teclado, el movimiento reducido y un renderer alternativo para dispositivos sin WebGL.

Three.js 0.170.0 y los archivos de fuente están incluidos dentro del HTML; la demo no descarga librerías ni fuentes de terceros al abrirse. Sus licencias están en `design/concept/THIRD-PARTY-LICENSES.txt`.

La nueva dirección 3D corresponde a la demo web. La integración nativa incluida sigue siendo el punto de partida SwiftUI/AppKit anterior: llevar este acabado 3D al renderer nativo y comprobarlo con Xcode quedan pendientes. No se presenta la captura como una app macOS en ejecución.

Validación visual v2: 36 comprobaciones de interacción y 16 de escena 3D, modo sin WebGL y suspensión del renderizado; capturas revisadas a 1440 px y 390 px. El renderer deja de dibujar al reducir movimiento o cerrar la habitación.

## Probar la demo

Abre `design/concept/index.html` en un navegador. Todo está incluido en un único HTML y no necesita servicios, claves ni instalación. Los estados del agente y las ventanas de la demo son simulados. Las preferencias visuales se guardan únicamente en el navegador.

## Probar la integración en macOS

Requiere macOS 15+, Xcode compatible con el proyecto y XcodeGen.

```sh
cd NotchBuddy
xcodegen generate
xcodebuild -scheme NotchBuddy -configuration Debug -destination 'platform=macOS' CODE_SIGNING_ALLOWED=NO build
```

Arrastra a Mochi manteniendo Opción (⌥) hasta el borde superior de una ventana con espacio por encima. El gesto normal sigue añadiendo contexto. Arrástralo para soltarlo, haz doble clic para volver al notch o usa el menú contextual para abandonar la ventana.

## Validación realizada

- Demo: pruebas automatizadas de interacción en Chromium, capturas a 1440 px y 390 px, sin errores JavaScript ni peticiones de red externas.
- Lógica nativa: compilada y ejecutada con Swift 6.0.3 en Linux. `bash scripts/test-window-perch.sh` comprueba el borde de destino, movimiento, monitores secundarios, conversión de coordenadas, ventanas sin espacio y movimiento reducido.
- Regresión: pruebas existentes de `DesktopMochiLogic` ejecutadas con Foundation en Linux, omitiendo únicamente su importación de CoreGraphics en una copia temporal.
- Sintaxis nativa: archivos nuevos y modificados analizados con el compilador Swift. Catálogo de localización validado con `python3 scripts/test-localization.py`.
- Pendiente: compilación completa y ejecución de AppKit/SwiftUI con Xcode en macOS. Las capturas muestran la demo de navegador, no una app nativa en ejecución.

## Revisión pendiente en un Mac

- Mover y redimensionar la ventana en varias pantallas, incluidas las colocadas arriba o a la izquierda.
- Minimizar, restaurar, cerrar y poner la ventana en pantalla completa.
- Cambiar de aplicación y entre ventanas de la misma aplicación.
- Recibir una aprobación y comprobar la vuelta a la ventana después.
- Comprobar clics transparentes fuera del cuerpo, bloqueo de pantalla y Reducir movimiento.

## Presentación

`PITCH.md` contiene una propuesta breve para Louis en inglés. Se entrega como borrador; no se ha enviado ningún mensaje, issue ni pull request.

## Créditos

Código base, personaje y motor de Coucou: Louis Raillé y colaboradores. La demo reutiliza el renderer JavaScript del prototipo original, con sus créditos y licencias preservados. Código bajo `LICENSE`; nombre, personaje y recursos bajo `LICENSE-ASSETS.md`. Esta contribución se prepara para revisión del autor.
