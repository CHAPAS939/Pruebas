# Coucou · Mochi Studio sobre Coucou 0.6 — instaladores de prueba

Estudio ampliable, cámara giratoria, decoración con guías y colisiones, luz regulable y colores fieles al sujetarse a ventanas, integrados en la app completa de Coucou para Windows y macOS.

Compilación y empaquetado nativos verificados en [GitHub Actions](https://github.com/CHAPAS939/Pruebas/actions/runs/42290466543). Ambos paquetes proceden de `e21aff253ead90e1c0fb3aef436f9c212149172c`, sobre Coucou `b1bc09de7f7c24a80bd8eca5729b8bee60f66402`.

| Sistema | Descargar | Instalar |
| --- | --- | --- |
| macOS 15+, Apple Silicon e Intel | [ZIP con DMG universal](https://github.com/CHAPAS939/Pruebas/actions/runs/42290466543/artifacts/13539543588) | Descomprimir, abrir el DMG y arrastrar Coucou a Aplicaciones. |
| Windows 10/11 x64 | [ZIP con EXE, MSI y portable](https://github.com/CHAPAS939/Pruebas/actions/runs/42290466543/artifacts/13539698607) | Descomprimir y ejecutar `Coucou-Mochi-Windows-x64-setup.exe`, o elegir el MSI. |

Cierra antes la versión anterior desde el icono de Coucou. GitHub requiere iniciar sesión para descargar artefactos; los enlaces caducan el 6 de diciembre de 2026. Cada ZIP incluye `build-manifest.json` y `SHA256SUMS.txt`.

Son compilaciones de prueba: Windows no tiene firma comercial y macOS usa firma ad-hoc, sin notarizar. Los avisos de descarga o reputación pueden continuar. Esta actualización mantiene los identificadores de Coucou y sustituye la app si se instala en la misma ubicación. No es una release oficial de Louis.

## Nueva base oficial

Incluye la revisión completa `b1bc09de` de la rama oficial, con sus novedades 0.6: lanzador de sesiones y archivos sobre sesiones, mejoras de Flow y voz, permisos de agentes y correcciones de Windows. En Mac conserva también Coucoudoro, las nuevas capturas y el cansancio de Mochi. Cada función mantiene las plataformas que admite el original. El lanzador de sesiones y la habitación conviven en pestañas independientes.

Studio y los objetos de escritorio de Windows se crean al arrancar siguiendo la corrección de WebView2 de la nueva base. Cerrar Studio lo oculta y pausa su escena; al abrirlo se recupera la misma ventana. Su memoria se reduce mientras permanece oculto.

La rama original todavía etiqueta estas novedades como **0.6 Unreleased** y conserva versiones internas 0.5.8 en Mac y 0.5.9 en Windows. Esta preview mantiene esos campos originales; el commit y los manifiestos identifican la actualización integrada.

## Estudio ampliado y cámara

El botón **↗ Abrir estudio** de la habitación abre una ventana independiente y redimensionable. La habitación y el estudio usan la misma configuración: los cambios de apariencia y decoración se sincronizan entre ambos. Su tamaño inicial se ajusta al espacio disponible en la pantalla. Puedes cerrar o minimizar el estudio sin cerrar Coucou. Al ocultarse o minimizarse, su escena deja de animarse.

Activa **Girar vista** y arrastra la escena para cambiar el ángulo y la altura. También hay controles de **Giro de cámara**, **Altura de cámara** y **Restablecer cámara**. La rueda acerca o aleja mientras está activa esa herramienta. El acercamiento y el giro son suaves; con movimiento reducido se aplican directamente. Las habitaciones guardadas conservan cámara e iluminación.

## Habitación

Abre la pestaña de la lámpara y entra en **Habitación**. Elige **Acogedor, Gamer, Minimalista o Mediterráneo** y personaliza paleta, planta, alfombra, decoración de pared, escritorio, lluvia y luz. Las opciones automáticas siguen el estilo elegido.

Activa **Mover muebles** para arrastrarlos directamente sobre el suelo. También puedes seleccionar un mueble, usar las flechas y girarlo; **Deshacer** recupera la distribución anterior. Las guías muestran alineaciones cercanas y los topes evitan solapar las huellas de los muebles en el suelo, incluso al arrastrar rápido o girar. La alfombra puede pasar por debajo de otros objetos. Los muebles nuevos buscan una posición libre; si no cabe uno, la app conserva la distribución. Los puntos de interacción y la posición de Mochi siguen a cada mueble. Guarda hasta **cuatro habitaciones** con nombre, estilo, decoración, muebles y distribución.

Añade **cama, consola y estantería**. Sus puntos de interacción llevan a Mochi a dormir, jugar con un mando o leer un libro. El escritorio, el asiento y la planta conservan sus actividades; la lámpara y la ventana cambian la luz y la lluvia.

Los botones **+ / −** acercan del 100 % al 200 %. El porcentaje restaura el encuadre. La cámara sigue la actividad al acercar. El panel de opciones tiene desplazamiento propio.

## Iluminación y reacciones

Los controles **Intensidad de luz** y **Temperatura de luz** permiten pasar de una luz tenue a una más luminosa y de tonos fríos a cálidos. Sus valores se guardan con cada habitación.

Mochi celebra los cambios de estilo y las habitaciones cargadas. Al colocar o mover un mueble se acerca, lo observa y vuelve a su actividad. Estas reacciones visuales respetan el movimiento reducido y no cambian el estado de una tarea que esté trabajando. Su tiempo de animación evita saltarse la reacción si algún fotograma tarda mucho en renderizarse.

## Apariencias y conjuntos

En **Guardarropa** hay siete apariencias nuevas: **Diamantes, Ópalo, Obsidiana, Oro, Galaxia, Gelatina y Lava**, además del aspecto clásico.

**Diamantes** conserva el cuerpo redondeado de Mochi: base negra, muchas piedras pequeñas individuales, reflejos blancos y azulados y destellos suaves. Las piedras rodean la cara sin ocultar los ojos. El movimiento reducido mantiene los destellos estáticos.

Combina el atuendo principal con **gafas y bufanda**, personaliza el color de los accesorios y guarda hasta **ocho conjuntos** con nombre. La vista 3D muestra los cambios en grande y conserva el mismo renderizador al cambiar de apariencia. Las apariencias y accesorios se mantienen en la barra, el escritorio y al sujetarse a ventanas. También existe dibujo Canvas de respaldo.

### Colores al sujetarse a ventanas

Se han recuperado los colores de los atuendos originales y eliminado el aclarado excesivo de sus telas en la vista del borde. El morado del sombrero, los rojos y los azules mantienen su tono. Las sombras suaves conservan el volumen y la coloración de accesorios usa el mismo giro de tono que el dibujo nativo. Los materiales de metal, gelatina y diamantes conservan sus reflejos.

La prueba del sombrero real detecta 12739 píxeles de morado saturado. En la muestra del material, exposiciones de 0,4, 1 y 2,5 producen el mismo RGB **90, 33, 181**, frente al original **91, 33, 182**. Esto comprueba el caso que antes se volvía blanquecino.

## Fotos y objetos de escritorio

En **Foto**, elige encuadre de habitación o personaje, pose, ángulo, zoom y fondo transparente. **Ocultar controles** amplía la vista; el botón flotante permite volver. **Guardar PNG** abre el diálogo nativo de guardado y exporta la escena a **1600 × 1600**, sin controles en la imagen. Si no está disponible la vista 3D, la exportación queda desactivada y los cambios se siguen guardando.

Desde **Habitación → Llevar al escritorio**, saca la taza, el cojín o la planta como pequeños objetos independientes. Arrástralos por el escritorio y usa clic derecho para guardarlos. La posición se conserva y se ajusta al área visible al restaurarla.

## Engancharse y saltar entre ventanas

Arrastra Mochi desde la barra o el escritorio hasta el **borde superior de una ventana** y suéltalo. Se engancha automáticamente con los brazos: **no requiere Alt ni Opción**. Una marca anticipa los bordes válidos y Mochi estira las manos al acercarse. Puede seguir una ventana que no tenga el foco, siempre que el borde sea visible y tenga espacio encima. Una ventana maximizada normalmente no deja ese espacio.

Clic derecho en el Mochi del escritorio → **Saltar a otra ventana** busca un destino visible y realiza el salto en arco, conservando apariencia y accesorios. Suelta las manos durante el salto y vuelve a sujetarse al aterrizar. No mueve ni activa las ventanas de otras aplicaciones. Sin destino válido permanece donde está; reducir movimiento elimina la animación. Doble clic lo devuelve a la barra.

## Verificación

- Windows: compilación Release; **618 pruebas de la app**, **35 del relay**, **569 de interfaz** y **22 de la escena y los datos compartidos** aprobadas. Siete pruebas de la app están ignoradas. Instaladores EXE/NSIS, MSI y portable generados, con recursos comparados con el código fuente.
- Ventanas reales de Windows: **7 comprobaciones aprobadas**, con un proceso auxiliar ejecutado por separado. Incluyen una ventana sin foco, oclusión, minimizar/restaurar, cierre, geometría, DPI y prioridad de un borde válido frente al retorno a la barra.
- Base 0.6: aprobadas las regresiones de WorkStreak, lanzamiento de sesiones, reglas de Antigravity, Flow, ejecución con herramientas de prueba, política de reseñas, 30 casos del filtro de revisión y motor Coucoudoro. También pasan localmente las pruebas modificadas de CLIRelay, actividad de GitHub y medidor del plan.
- macOS: app universal compilada con Xcode para ARM64 e Intel, recursos comparados, firma ad-hoc verificada y DMG verificado y montado para repetir la comprobación de recursos y firma.
- WebKit real de macOS: el estudio ampliado del paquete abre, renderiza la escena 3D y exporta un PNG válido de **275102 bytes** usando el mismo cargador local que la app.
- Interfaz en Chromium: apertura del estudio desde la barra, vista ampliable, sincronización de preferencias entre ventanas, cambios reales de luz y temperatura, arrastre físico de cámara y zoom con rueda, guardado y recuperación de cámara y luz, colisiones, reacción de celebración y exploración, movimiento reducido y restauración al reiniciar. El nuevo lanzador original abre junto a la pestaña de la habitación sin ejecutar una sesión real durante la prueba. También pasan las regresiones de siete apariencias, conjuntos, actividades, arrastre físico de muebles, deshacer y PNG transparente de 1600 × 1600. Sin errores de JavaScript.
- Color: el sombrero real conserva morado saturado; la muestra del material conserva RGB 90, 33, 181 con exposiciones 0,4, 1 y 2,5. Las pruebas reproducibles son `scripts/verify-mochi-colors.cjs`, `scripts/verify-mochi-studio-tools.cjs` y `scripts/verify-mochi-studio.cjs`.
- El control final exige que ambos paquetes terminen correctamente en la misma ejecución y con el mismo código de origen.

Las pruebas de interfaz usan un puente nativo simulado. Las APIs, la compilación, las ventanas reales de selección y la apertura del editor en WebKit se comprueban por separado en los trabajos nativos. No equivale a una prueba manual de todas las interacciones en el equipo del usuario.

## SHA-256

```text
7afc6145befc54b2dcc2f053facd5dfb15fed2b8fd2aa3ab5b099a3b54955fa2  Coucou-Mochi-macOS-universal.dmg
33c84359dddcc28d3819529cb1443f01a714a93d600aeab3e0a294aa57702449  Coucou-Mochi-Windows-x64-portable.zip
9c4daf1a16d2fe0c12ef55b89dfe3d0b2cb252796e1f2c46881e584a45b01dbe  Coucou-Mochi-Windows-x64-setup.exe
d1a1db76537a613b9860f25d448f81116537e54b783e1b9db0fe842f742adba9  Coucou-Mochi-Windows-x64.msi
```

Código base, personaje y recursos: Louis Raillé y colaboradores. El repositorio original y la rama principal de `CHAPAS939/Pruebas` no se han modificado.
