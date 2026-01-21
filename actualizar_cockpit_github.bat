@echo off
REM Script para actualizar el repositorio Claudio-Arz/AeroDeck_001

REM Cambia al directorio del repositorio CockPit (ajusta la ruta si es necesario)
cd /d "C:\ESPLab\ZZZTmpTests\LuisSystems\Instrumentos_Calibración_Versión002\AeroDeck_001"

REM Agrega todos los cambios
git add .

REM Crea un commit con mensaje automático y fecha/hora
set FECHA=%DATE% %TIME%
git commit -m "Actualización automática %FECHA%"

REM Sube los cambios a la rama main
git push origin main

REM Mensaje final
echo CockPit actualizado en GitHub: https://github.com/Claudio-Arz/CockPit
pause
