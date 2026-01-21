@echo off
REM Script para actualizar la carpeta HTML en el repositorio público AeroDeck-HTML

REM Cambia al directorio de la carpeta HTML
cd /d "%~dp0HTML"

REM Agrega todos los cambios
git add .

REM Crea un commit con mensaje automático y fecha/hora
set FECHA=%DATE% %TIME%
git commit -m "Actualización automática %FECHA%"

REM Sube los cambios a la rama main
git push origin main

REM Mensaje final
echo HTML actualizado en GitHub Pages: https://claudio-arz.github.io/AeroDeck-HTML/
pause
