@echo off
REM Script para actualizar la carpeta HTML en el repositorio público AeroDeck-HTML

REM Cambia al directorio de la carpeta HTML



git add .
set /p COMENTARIO="Ingrese comentario para el commit: "
for /f "tokens=1-3 delims=/ " %%a in ("%DATE%") do set FECHA=%%a-%%b-%%c
set HORA=%TIME%
git commit -m "%COMENTARIO% [%FECHA% %HORA%]"
git push origin main



REM Mensaje final
echo HTML actualizado en GitHub Pages: https://claudio-arz.github.io/AeroDeck-HTML/
echo Esto sube los archivos que GitHub Pages utiliza para mostrar el sitio web.

pause
rem git add RPM.html variometer.html
rem git commit -m "Rescate de cambios desde HEAD detached"
rem git checkout main
rem git checkout main
rem git merge rescate_trabajo
rem git push origin main
