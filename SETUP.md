# Activar este perfil

El diseño está preparado para el repositorio público especial `CHAPAS939/CHAPAS939`. En la sesión actual ese repositorio no existe y la conexión no ofrece crear repositorios; no se ha cambiado la biografía, el avatar ni el perfil visible.

1. Crea un repositorio público llamado exactamente `CHAPAS939` en tu cuenta.
2. Copia `README.md` y `assets/` en su rama principal, o permite que el asistente los suba una vez creado.
3. En tu perfil, personaliza los repositorios fijados y selecciona Pruebas. Mochi Studio vive en otra rama del mismo repositorio; las dos tarjetas enlazan a proyectos distintos sin fingir que hay dos repositorios.

## Activador para Windows

Con [GitHub CLI](https://cli.github.com/) instalado, abre PowerShell en esta carpeta y ejecuta:

```powershell
./activate-profile.ps1
```

El archivo permite iniciar sesión mediante el navegador, comprueba que la cuenta sea CHAPAS939, crea el fork de Coucou si falta y aplica el perfil en el repositorio especial. Conserva una copia del README anterior y no modifica Pruebas ni el repositorio de Louis. El token permanece en GitHub CLI; no se pide pegarlo en el chat.

Puedes revisar las acciones sin aplicarlas con `./activate-profile.ps1 -WhatIf`, o usar `-SkipFork` para limitarlo al perfil. En esta sesión solo se ha preparado y comprobado la sintaxis del activador; la activación necesita una conexión de GitHub con esas operaciones disponibles o ejecutar este archivo en tu equipo.

`assets/avatar.svg` es una propuesta opcional de avatar; no se ha aplicado a tu cuenta. El diseño incluye variantes clara/oscura y reduce la animación cuando el sistema lo solicita. No usa contadores externos, estadísticas inventadas ni servicios de imágenes dinámicas.
