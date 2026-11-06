# Coucou · Mochi Studio ampliado + Perch

Habitación 3D editable, guardarropa combinable y Mochi sujeto a ventanas reales, integrados en Coucou para macOS y Windows. Los dos proyectos originales se conservan por separado en `docs/mochi-home` y `docs/mochi-perch`.

La base se ha actualizado a la rama oficial de Coucou 0.6 (`b1bc09de7f7c24a80bd8eca5729b8bee60f66402`, 6 de noviembre de 2026). Conserva todas las novedades originales en sus plataformas: lanzamiento de sesiones desde la isla, archivos sobre sesiones, Coucoudoro y cansancio de Mochi en Mac, mejoras de Flow y voz, permisos de agentes y las correcciones de memoria y superposición de ventanas en Windows. El lanzador y la habitación tienen sus propias pestañas. Studio y los objetos nativos de Windows siguen ahora el ciclo de vida de WebView2 de la nueva base.

## Qué incluye

- Ventana independiente redimensionable para decorar en grande, con giro de cámara, altura y zoom suave. Cámara y luz se guardan en cada habitación.
- Guías de alineación y colisiones entre huellas de muebles, búsqueda de sitio al añadir piezas y reacciones de Mochi al decorar.
- Intensidad y temperatura de iluminación regulables.
- Corrección de los atuendos que perdían saturación al sujetarse a ventanas; se conservan los morados, rojos, azules y los tonos de accesorios.
- Cuatro estilos: Acogedor, Gamer, Minimalista y Mediterráneo, con decoración independiente y zoom del 100 % al 200 %.
- Muebles que se arrastran y giran, deshacer y hasta cuatro habitaciones guardadas con nombre.
- Cama, consola y estantería: Mochi puede dormir, jugar con un mando y leer.
- Siete apariencias además de la clásica: Diamantes, Ópalo, Obsidiana, Oro, Galaxia, Gelatina y Lava. Diamantes conserva la forma normal del personaje, con cuerpo negro y muchas piedras pequeñas brillantes.
- Atuendo principal, gafas y bufanda combinables, color de accesorios y hasta ocho conjuntos guardados.
- Estudio de fotos con poses, cámara, encuadre, controles ocultables y PNG de 1600 × 1600 con fondo transparente opcional.
- Taza, cojín y planta como objetos nativos independientes que se arrastran por el escritorio y recuerdan su posición.
- Enganche automático al soltar Mochi en un borde superior válido, sin Alt ni Opción, con marca de previsualización y movimiento de brazos. Conserva los saltos entre ventanas y las apariencias al sujetarse.

Los cambios se guardan localmente. El movimiento reducido detiene destellos y elimina desplazamientos animados. Si falla WebGL, sigue disponible el dibujo de respaldo y la personalización; las fotos 3D quedan desactivadas.

## Instaladores

Los paquetes de la revisión `4562eb6fe3384bccf188d19c252e7e643491a1d8` están compilados y verificados en ambos sistemas. Descargas, uso y sumas SHA-256 en [INSTALLERS.md](INSTALLERS.md).

- macOS 15+, Apple Silicon e Intel: DMG universal, firma ad-hoc sin notarizar.
- Windows 10/11 x64: EXE, MSI y ZIP portable, sin firma comercial.

Cierra Coucou antes de actualizar. Los paquetes mantienen sus identificadores y sustituyen la app al instalarse en la misma ubicación. Son compilaciones de prueba; los avisos de reputación pueden continuar.

## Compilar

El workflow `.github/workflows/mochi-installers.yml` ejecuta las pruebas de ventanas reales de Windows, las pruebas de datos y UI, la compilación de ambas plataformas, la apertura del editor empaquetado en WebKit y la comparación de recursos. Guarda los instaladores con su commit y sus sumas SHA-256, y exige que terminen correctamente los dos sistemas. No crea releases ni etiquetas.

```sh
# macOS, con Xcode, XcodeGen y Node 24:
bash scripts/build-mochi-macos.sh
```

```powershell
# Windows, con Rust/MSVC, WebView2 y Node 24:
./scripts/build-mochi-windows.ps1
```

La prueba reproducible de la interfaz es `scripts/verify-mochi-studio.cjs` y requiere Vite, Playwright y Chromium. El puente nativo se simula en esa prueba de navegador; la compilación, las APIs y las ventanas reales se comprueban por separado. No automatiza todas las interacciones en el equipo del usuario.

## Origen

Integración sobre Coucou `b1bc09de7f7c24a80bd8eca5729b8bee60f66402`, conservando las contribuciones Home `006aa4d` y Perch `b815bc6`. Se ha compilado en la rama autorizada `build/coucou-mochi-installers` de `CHAPAS939/Pruebas`. El repositorio de Louis y la rama principal de Pruebas no se han modificado. Código base, personaje y recursos: Louis Raillé y colaboradores; no es una release oficial del proyecto.
