# Estructura de Gyro_Control.html

## División principal
- **.gyro-main-grid**
  - Grid de 2 filas:
    1. Fila 1 (32px): Título "GYRO" (`.gyro-title`)
    2. Fila 2 (restante): Grid de controles (`.gyro-grid-final`)

## Grid de controles: .gyro-grid-final
- **Grid de 2 columnas**
  - **Columnas: 1**
    - **Grid de 2 filas**
    1. Fila 1 (90%): Slider (`input.gyro-slider`, grid-column: 1, grid-row: 1)
    2. Fila 2 (10%): Valor del slider (`.gyro-slider-value`, grid-column: 1, grid-row: 2)

### Distribución de los botones (columna 2):
- **Grid de 4 filas**
    - Fila 1: Botón 0° (`#gyr-btn-0`), label North
    - Fila 2: Botón 90° (`#gyr-btn-90`), label East
    - Fila 3: Botón 180° (`#gyr-btn-180`), label South
    - Fila 4: Botón 270° (`#gyr-btn-270`), label West

---

## Resumen visual actualizado

```
+-------------------+-------------------+
|                   | 0° (North)        |
|                   +-------------------+
|                   | 90° (East)        |
|   Slider (90%)    +-------------------+
|                   | 180° (South)      |
|                   +-------------------+
|                   | 270° (West)       |
+-------------------+-------------------+
| Valor (10%)       |                   |
+-------------------+-------------------+
```

- La primera fila del grid principal es el título (no mostrado arriba).
- La segunda fila es el grid de controles:
  - Columna 1: Slider vertical (90% de alto) y debajo el valor (10% de alto).
  - Columna 2: Cuatro filas, cada una con un botón y su label (0°, 90°, 180°, 270°).
- Todo está alineado y proporcionado para un panel compacto y claro.


