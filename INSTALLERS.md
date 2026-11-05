# Coucou · Mochi Home + Perch — instaladores de prueba

Ambas funciones integradas en la app completa de Coucou. Compilación nativa y empaquetado verificados en macOS y Windows en [GitHub Actions](https://github.com/CHAPAS939/Pruebas/actions/runs/41944673119).

Origen de ambos paquetes: `f57be14981ffc300c7ce8151e2b8c0575ba6b4b7`, sobre Coucou `74363634b037108393e450428e5f207515c2c29b`.

| Sistema | Descargar | Instalar |
| --- | --- | --- |
| macOS 15+, Apple Silicon e Intel | [ZIP con DMG universal](https://github.com/CHAPAS939/Pruebas/actions/runs/41944673119/artifacts/13378587562) | Descomprimir, abrir el DMG y arrastrar Coucou a Aplicaciones. |
| Windows 10/11 x64 | [ZIP con EXE, MSI y portable](https://github.com/CHAPAS939/Pruebas/actions/runs/41944673119/artifacts/13377499889) | Descomprimir y ejecutar `Coucou-Mochi-Windows-x64-setup.exe`, o elegir el MSI. |

GitHub requiere iniciar sesión para descargar artefactos. Estos enlaces caducan el 5 de diciembre de 2026. Los ZIP incluyen `build-manifest.json` y `SHA256SUMS.txt`.

Son builds de prueba: el DMG tiene firma ad-hoc y no está notarizado; los instaladores de Windows no llevan firma comercial. Mantienen los identificadores de Coucou y reemplazan su app cuando se instalan en la misma ubicación.

## Verificación

- macOS: app universal compilada, arquitecturas ARM64 e Intel verificadas; recursos compartidos comparados con el código fuente; firma ad-hoc verificada; DMG verificado y montado para repetir la comprobación de recursos y firma.
- Windows: compilación Release, 575 pruebas de la app y 30 del relay aprobadas (6 pruebas ignoradas); 40 archivos de pruebas del frontend aprobados; instaladores NSIS y MSI generados y recursos comparados con el código fuente.
- Ambos trabajos nativos y el control final de las dos plataformas terminaron correctamente en la misma ejecución.
- Estas comprobaciones no equivalen a una prueba interactiva de todas las funciones en el equipo del usuario.

## SHA-256 de los instaladores

```text
d805f97ccedaba88733c226382be0d791d380a17348890751469f51cdc6fb6f1  Coucou-Mochi-macOS-universal.dmg
a4cc266575c463cc90e3ecb1bf2e6a1775cdb1e9722a1c9e7df41a2d2bec8af4  Coucou-Mochi-Windows-x64-setup.exe
40ec71d144df095fa6e9d92396381c26a989196bca250971fbed644295c2d425  Coucou-Mochi-Windows-x64.msi
fdf397885703503d913a2d81726a23d82c174dc0f685c98f22367e4f9772b20c  Coucou-Mochi-Windows-x64-portable.zip
```

Código base, personaje y recursos: Louis Raillé y colaboradores. No es una release oficial de Louis-CFM/coucou. La rama principal de `CHAPAS939/Pruebas` y el repositorio original no se han modificado.
