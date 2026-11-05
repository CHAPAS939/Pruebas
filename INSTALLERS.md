# Coucou · Mochi Home + Perch — instaladores de prueba

Ambas funciones integradas en la app completa de Coucou. Compilación nativa y empaquetado verificados en macOS y Windows en [GitHub Actions](https://github.com/CHAPAS939/Pruebas/actions/runs/42001904699).

Origen de ambos paquetes: `d77866afa21d6ad146cb1e189b75dad76166ea9b`, sobre Coucou `74363634b037108393e450428e5f207515c2c29b`.

| Sistema | Descargar | Instalar |
| --- | --- | --- |
| macOS 15+, Apple Silicon e Intel | [ZIP con DMG universal](https://github.com/CHAPAS939/Pruebas/actions/runs/42001904699/artifacts/13403366183) | Descomprimir, abrir el DMG y arrastrar Coucou a Aplicaciones. |
| Windows 10/11 x64 | [ZIP con EXE, MSI y portable](https://github.com/CHAPAS939/Pruebas/actions/runs/42001904699/artifacts/13403198667) | Descomprimir y ejecutar `Coucou-Mochi-Windows-x64-setup.exe`, o elegir el MSI. |

GitHub requiere iniciar sesión para descargar artefactos. Estos enlaces caducan el 5 de diciembre de 2026. Los ZIP incluyen `build-manifest.json` y `SHA256SUMS.txt`.

Son builds de prueba: el DMG tiene firma ad-hoc y no está notarizado; los instaladores de Windows no llevan firma comercial. Mantienen los identificadores de Coucou y reemplazan su app cuando se instalan en la misma ubicación.

## Personalizar la habitación

Abre la pestaña de la lámpara. En **Decorar** puedes elegir Arena, Salvia, Rosa o Medianoche y mostrar u ocultar la planta y la alfombra. En **Guardarropa** puedes probar y guardar los atuendos, incluidos los nuevos auriculares, gorro de rana y flor. La decoración se guarda localmente; la ropa también se lleva en la barra y en el escritorio.

Al enganchar a Mochi al borde de una ventana, conserva su atuendo y apoya las dos manos en el borde. La escena 3D se mantiene al cambiar de ropa; el dibujo nativo actúa como respaldo si falla el renderizado gráfico.

## Probar Alt en Windows

Cierra la versión anterior de Coucou desde el icono junto al reloj antes de instalar el nuevo EXE. Abre una ventana sin maximizar y deja espacio por encima. Arrastra a Mochi desde la barra, mantén Alt y suelta el ratón cerca del borde superior de esa ventana; después suelta Alt.

La corrección permite elegir una ventana visible aunque no tenga el foco, conserva Alt durante una liberación casi simultánea de tecla y ratón, y da prioridad a una caída válida sobre la ventana frente a la zona invisible de retorno a la barra. Usa la posición real del cursor al soltar. Una ventana maximizada no deja el espacio necesario para sentar a Mochi.

## Verificación

- macOS: app universal compilada, arquitecturas ARM64 e Intel verificadas; recursos compartidos comparados con el código fuente; firma ad-hoc verificada; DMG verificado y montado para repetir la comprobación de recursos y firma.
- Windows: compilación Release, 578 pruebas de la app y 30 del relay aprobadas (7 pruebas ignoradas, incluido el proceso auxiliar de la prueba nativa); 534 pruebas del frontend y 7 de la escena compartida aprobadas; instaladores NSIS y MSI generados y recursos comparados con el código fuente.
- Ambos trabajos nativos y el control final de las dos plataformas terminaron correctamente en la misma ejecución.
- Windows Alt: 7 comprobaciones aprobadas en un trabajo nativo independiente; captura de una ventana real sin foco, oclusión, minimizar/restaurar y cierre, además de la conservación de Alt y la prioridad frente a la zona de retorno de la barra. El proceso auxiliar se ejecuta por separado.
- Interfaz en Chromium con el puente nativo simulado: 16 opciones de vestuario sin reemplazar el renderizador, preferencias restauradas al recargar, selección mediante teclado y respaldo tras perder el contexto WebGL. El personaje sobre el borde se ha renderizado con 9 atuendos/estados de vestuario, incluidos los tres nuevos y el estado sin ropa, con las manos en el borde y movimiento reducido. La vista de habitación también se ha comprobado dentro de la barra completa.
- Estas comprobaciones no equivalen a una prueba interactiva de todas las funciones en el equipo del usuario.

## SHA-256 de los instaladores

```text
3881e7cbbe00e827cbaa6c56a1f9f19141f3d8d2b53c46d51b758ae5106e5e8a  Coucou-Mochi-macOS-universal.dmg
efdada1bc5f0f20f4c87a4677ef7461e8ce36c65fb12cdada0c8c8a132c88515  Coucou-Mochi-Windows-x64-setup.exe
b63d8be47e77d6f4a305472a3ea7e0f8f9d4d0723ff7924eb1986f0270e1c313  Coucou-Mochi-Windows-x64.msi
c18aab4d6131feca727a72d6e27fa2a57f6d9e7c3277b8e8b71c3990d2ab8a44  Coucou-Mochi-Windows-x64-portable.zip
```

Código base, personaje y recursos: Louis Raillé y colaboradores. No es una release oficial de Louis-CFM/coucou. La rama principal de `CHAPAS939/Pruebas` y el repositorio original no se han modificado.
