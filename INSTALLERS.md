# Coucou · Mochi Studio — instaladores de prueba

Habitación editable, guardarropa combinable, nuevas apariencias y enganche automático a ventanas, integrados en la app completa de Coucou para Windows y macOS.

Compilación y empaquetado nativos verificados en [GitHub Actions](https://github.com/CHAPAS939/Pruebas/actions/runs/42134455542). Ambos paquetes proceden de `9c33f5dc908d06ac11b01cd0e5a1bab40f7d6c13`, sobre Coucou `74363634b037108393e450428e5f207515c2c29b`.

| Sistema | Descargar | Instalar |
| --- | --- | --- |
| macOS 15+, Apple Silicon e Intel | [ZIP con DMG universal](https://github.com/CHAPAS939/Pruebas/actions/runs/42134455542/artifacts/13464084837) | Descomprimir, abrir el DMG y arrastrar Coucou a Aplicaciones. |
| Windows 10/11 x64 | [ZIP con EXE, MSI y portable](https://github.com/CHAPAS939/Pruebas/actions/runs/42134455542/artifacts/13465012936) | Descomprimir y ejecutar `Coucou-Mochi-Windows-x64-setup.exe`, o elegir el MSI. |

Cierra antes la versión anterior desde el icono de Coucou. GitHub requiere iniciar sesión para descargar artefactos; los enlaces caducan el 6 de diciembre de 2026. Cada ZIP incluye `build-manifest.json` y `SHA256SUMS.txt`.

Son compilaciones de prueba: Windows no tiene firma comercial y macOS usa firma ad-hoc, sin notarizar. Los avisos de descarga o reputación pueden continuar. Esta actualización mantiene los identificadores de Coucou y sustituye la app si se instala en la misma ubicación. No es una release oficial de Louis.

## Habitación

Abre la pestaña de la lámpara y entra en **Habitación**. Elige **Acogedor, Gamer, Minimalista o Mediterráneo** y personaliza paleta, planta, alfombra, decoración de pared, escritorio, lluvia y luz. Las opciones automáticas siguen el estilo elegido.

Activa **Mover muebles** para arrastrarlos directamente sobre el suelo. También puedes seleccionar un mueble, usar las flechas y girarlo; **Deshacer** recupera la distribución anterior. Los puntos de interacción y la posición de Mochi siguen a cada mueble. Guarda hasta **cuatro habitaciones** con nombre, estilo, decoración, muebles y distribución.

Añade **cama, consola y estantería**. Sus puntos de interacción llevan a Mochi a dormir, jugar con un mando o leer un libro. El escritorio, el asiento y la planta conservan sus actividades; la lámpara y la ventana cambian la luz y la lluvia.

Los botones **+ / −** acercan del 100 % al 200 %. El porcentaje restaura el encuadre. La cámara sigue la actividad al acercar. El panel de opciones tiene desplazamiento propio.

## Apariencias y conjuntos

En **Guardarropa** hay siete apariencias nuevas: **Diamantes, Ópalo, Obsidiana, Oro, Galaxia, Gelatina y Lava**, además del aspecto clásico.

**Diamantes** conserva el cuerpo redondeado de Mochi: base negra, muchas piedras pequeñas individuales, reflejos blancos y azulados y destellos suaves. Las piedras rodean la cara sin ocultar los ojos. El movimiento reducido mantiene los destellos estáticos.

Combina el atuendo principal con **gafas y bufanda**, personaliza el color de los accesorios y guarda hasta **ocho conjuntos** con nombre. La vista 3D muestra los cambios en grande y conserva el mismo renderizador al cambiar de apariencia. Las apariencias y accesorios se mantienen en la barra, el escritorio y al sujetarse a ventanas. También existe dibujo Canvas de respaldo.

## Fotos y objetos de escritorio

En **Foto**, elige encuadre de habitación o personaje, pose, ángulo, zoom y fondo transparente. **Ocultar controles** amplía la vista; el botón flotante permite volver. **Guardar PNG** abre el diálogo nativo de guardado y exporta la escena a **1600 × 1600**, sin controles en la imagen. Si no está disponible la vista 3D, la exportación queda desactivada y los cambios se siguen guardando.

Desde **Habitación → Llevar al escritorio**, saca la taza, el cojín o la planta como pequeños objetos independientes. Arrástralos por el escritorio y usa clic derecho para guardarlos. La posición se conserva y se ajusta al área visible al restaurarla.

## Engancharse y saltar entre ventanas

Arrastra Mochi desde la barra o el escritorio hasta el **borde superior de una ventana** y suéltalo. Se engancha automáticamente con los brazos: **no requiere Alt ni Opción**. Una marca anticipa los bordes válidos y Mochi estira las manos al acercarse. Puede seguir una ventana que no tenga el foco, siempre que el borde sea visible y tenga espacio encima. Una ventana maximizada normalmente no deja ese espacio.

Clic derecho en el Mochi del escritorio → **Saltar a otra ventana** busca un destino visible y realiza el salto en arco, conservando apariencia y accesorios. Suelta las manos durante el salto y vuelve a sujetarse al aterrizar. No mueve ni activa las ventanas de otras aplicaciones. Sin destino válido permanece donde está; reducir movimiento elimina la animación. Doble clic lo devuelve a la barra.

## Verificación

- Windows: compilación Release; **579 pruebas de la app**, **30 del relay**, **539 de interfaz** y **16 de la escena y datos compartidos** aprobadas. Siete pruebas de la app están ignoradas. Instaladores NSIS/EXE, MSI y portable generados; recursos comparados con el código fuente.
- Ventanas reales de Windows: **7 comprobaciones aprobadas**, con un proceso auxiliar ejecutado por separado. Incluyen una ventana sin foco, oclusión, minimizar/restaurar, cierre, geometría, DPI y prioridad de un borde válido frente al retorno a la barra.
- macOS: app universal compilada con Xcode para ARM64 e Intel, recursos comparados, firma ad-hoc verificada y DMG verificado y montado para repetir la comprobación de recursos y firma.
- WebKit real de macOS: el editor del paquete abre y renderiza la escena 3D, conserva la apariencia de diamantes y exporta un PNG válido de 323979 bytes. La prueba usa el mismo cargador local de recursos que la app.
- Interfaz en Chromium: siete materiales sin recrear el renderizador, cuatro estilos distintos, decoración independiente, arrastre físico de muebles, giro y deshacer, cama/consola/lectura, guardar y restaurar habitación y conjunto, selección de objetos de escritorio y foto RGBA de 1600 × 1600 con transparencia comprobada. También se comprueban el movimiento reducido, el respaldo tras perder WebGL y las manos al sujetarse, acercarse y saltar conservando la apariencia y los accesorios.
- Validadores de PNG de Swift y Rust y esquemas de personalización aprobados. El control final exige que los dos instaladores terminen correctamente en la misma ejecución.

La prueba de interfaz usa Chromium y un puente nativo simulado; la selección de ventanas reales, las APIs y la compilación se comprueban por separado en los trabajos nativos. No equivale a una prueba manual de todas las interacciones en el equipo del usuario.

## SHA-256

```text
41239d7c70242980a49942f06147495c0bd3f59b1504405d09b2ef9c65a6b1f1  Coucou-Mochi-macOS-universal.dmg
bfd4bd9bc98905c0ad3783e63b13755d3ad401397481b27b12f84acf64a9a73c  Coucou-Mochi-Windows-x64-portable.zip
897c6f9f496b1364477c9599e5e1195db3f6e6fa10bb8499f305ccd553d121ec  Coucou-Mochi-Windows-x64-setup.exe
deba9d4bef611f9913343ab51605864495bd203680640455e36c19b72da7372c  Coucou-Mochi-Windows-x64.msi
```

Código base, personaje y recursos: Louis Raillé y colaboradores. El repositorio original y la rama principal de `CHAPAS939/Pruebas` no se han modificado.
