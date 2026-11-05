# Coucou · Habitación ampliada y combinaciones visibles — instaladores de prueba

Habitación ampliada con zoom, controles de combinación visibles y saltos entre ventanas integrados en la app completa de Coucou. Compilación nativa y empaquetado verificados en macOS y Windows en [GitHub Actions](https://github.com/CHAPAS939/Pruebas/actions/runs/42028581308).

Origen de ambos paquetes: `7c831314b97f1ab68e38748e6fd04a9c742dae69`, sobre Coucou `74363634b037108393e450428e5f207515c2c29b`.

| Sistema | Descargar | Instalar |
| --- | --- | --- |
| macOS 15+, Apple Silicon e Intel | [ZIP con DMG universal](https://github.com/CHAPAS939/Pruebas/actions/runs/42028581308/artifacts/13415257188) | Descomprimir, abrir el DMG y arrastrar Coucou a Aplicaciones. |
| Windows 10/11 x64 | [ZIP con EXE, MSI y portable](https://github.com/CHAPAS939/Pruebas/actions/runs/42028581308/artifacts/13415088388) | Descomprimir y ejecutar `Coucou-Mochi-Windows-x64-setup.exe`, o elegir el MSI. |

GitHub requiere iniciar sesión para descargar artefactos. Estos enlaces caducan el 5 de diciembre de 2026. Los ZIP incluyen `build-manifest.json` y `SHA256SUMS.txt`.

Son builds de prueba: el DMG tiene firma ad-hoc y no está notarizado; los instaladores de Windows no llevan firma comercial. Mantienen los identificadores de Coucou y reemplazan su app cuando se instalan en la misma ubicación.

## Habitación interactiva

La habitación usa ahora una vista de 520 puntos de alto en ambos sistemas. Los botones **+ / −** acercan la escena del 100 % al 200 %; el porcentaje vuelve al encuadre completo. Al acercar, la cámara sigue el rincón donde Mochi trabaja, descansa o riega.

Abre la pestaña de la lámpara. En **Decorar** puedes elegir **Acogedor, Gamer, Minimalista o Mediterráneo**. Cada estilo cambia muebles y detalles de la escena. Puedes editar la especie y posición de la planta, el patrón de alfombra, la decoración de pared y el acabado del escritorio; también se mantienen las cuatro paletas, la lluvia, la lámpara y los interruptores de planta y alfombra.

Las opciones **Automático** siguen el estilo elegido. Las elecciones personales se conservan al cambiar de estilo y al reiniciar la app. **Restablecer decoración** vuelve a las opciones automáticas sin cambiar el estilo ni la ropa.

Toca los objetos en la escena: la lámpara cambia la luz; la ventana cambia la lluvia; el escritorio, el asiento y la planta llevan a Mochi a trabajar en su rincón, descansar o regar. Son actividades visuales, sin iniciar tareas de agentes. El movimiento reducido coloca al personaje directamente en su destino. Si falla WebGL, continúa el dibujo de respaldo.

## Combinar atuendos y saltar

En **Guardarropa → Combinar atuendos** puedes añadir gafas y bufanda al atuendo principal. Los controles aparecen encima de la cuadrícula, sin tener que desplazarse, tanto en la habitación como en el guardarropa independiente. La cuadrícula conserva su propio desplazamiento si hace falta. La combinación se guarda y se mantiene en la habitación, la barra y el escritorio. Una elección adicional de gafas sustituye unas gafas del atuendo principal; una bufanda no se duplica.

Haz clic derecho en el Mochi del escritorio y elige **Saltar a otra ventana**. Busca otra ventana visible con espacio encima y salta en arco hasta ella, sin mover ni activar las ventanas de otras aplicaciones. Si no hay destino, permanece donde está. La opción de reducir movimiento elimina la animación. Las manos se sueltan durante el salto y vuelven al borde al aterrizar, conservando la ropa. El doble clic sigue devolviéndolo a la barra.

## Probar Alt en Windows

Cierra la versión anterior de Coucou desde el icono junto al reloj antes de instalar el nuevo EXE. Abre una ventana sin maximizar y deja espacio por encima. Arrastra a Mochi desde la barra, mantén Alt y suelta el ratón cerca del borde superior de esa ventana; después suelta Alt.

La corrección permite elegir una ventana visible aunque no tenga el foco, conserva Alt durante una liberación casi simultánea de tecla y ratón, y da prioridad a una caída válida sobre la ventana frente a la zona invisible de retorno a la barra. Usa la posición real del cursor al soltar. Una ventana maximizada no deja el espacio necesario para sentar a Mochi.

## Verificación

- macOS: app universal compilada, arquitecturas ARM64 e Intel verificadas; recursos compartidos comparados con el código fuente; firma ad-hoc verificada; DMG verificado y montado para repetir la comprobación de recursos y firma.
- Windows: compilación Release, 579 pruebas de la app y 30 del relay aprobadas (7 pruebas ignoradas, incluido el proceso auxiliar de la prueba nativa); 537 pruebas del frontend y 9 de la escena compartida aprobadas; instaladores NSIS y MSI generados y recursos comparados con el código fuente.
- Arrastre de Windows: la zona de retorno a la barra conserva su tamaño anterior aunque la habitación sea más alta; se comprueba también a 150 % y 200 %, con monitores por encima del principal.
- Ambos trabajos nativos y el control final de las dos plataformas terminaron correctamente en la misma ejecución.
- Windows Alt y destinos de salto: 8 comprobaciones aprobadas en un trabajo nativo independiente; captura de una ventana real sin foco, oclusión, minimizar/restaurar y cierre, además de la conservación de Alt y la prioridad frente a la zona de retorno de la barra. El proceso auxiliar se ejecuta por separado.
- Interfaz en Chromium con el puente nativo simulado: cuatro estilos 3D distintos sin reemplazar el renderizador; decoración y posición de planta editables; objetos interactivos; ropa combinada guardada y restaurada; respaldo tras perder WebGL. La habitación completa se ha comprobado dentro de la barra (620 × 468, ventana real de 720 × 560): gafas, bufanda e iconos pulsables sin desplazamiento previo; guardarropa independiente; límites 100–200 % y restablecimiento; mismo renderizador. También se comprueba el enfoque al trabajar, descansar y regar, con los puntos interactivos dentro del encuadre. La prueba reproducible está en `scripts/verify-room-layout.cjs` y requiere Vite, Playwright y Chromium. El personaje sobre el borde conserva gorro, gafas y bufanda; suelta las manos durante el estado visual de salto.
- Saltos: detección de candidatos en ventanas reales de Windows; pruebas de geometría, trayectorias y extremos en ambas plataformas, incluidos monitores con coordenadas negativas, movimiento reducido y rechazo de contactos fuera de pantalla. La ejecución completa de la interacción en el equipo del usuario no está automatizada.
- Estas comprobaciones no equivalen a una prueba interactiva de todas las funciones en el equipo del usuario.

## SHA-256 de los instaladores

```text
1f3820e61145a6b882c330640c27b3f2439c51f05e0640ec5ae69c49ae6ea799  Coucou-Mochi-macOS-universal.dmg
e7f79b69eb67e9d3842d27299997746c26fa27485afb7813d7eae777834010ab  Coucou-Mochi-Windows-x64-setup.exe
1c4b29f9dd9bc8db01d8f3e6fc8a6928dae7890b5d66dc47abd63faf1be7ec1e  Coucou-Mochi-Windows-x64.msi
2611dc9f8230dc12fd220e36941024200e1072621c21ff9694068146eac6e763  Coucou-Mochi-Windows-x64-portable.zip
```

Código base, personaje y recursos: Louis Raillé y colaboradores. No es una release oficial de Louis-CFM/coucou. La rama principal de `CHAPAS939/Pruebas` y el repositorio original no se han modificado.
