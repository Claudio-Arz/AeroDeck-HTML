# AeroDeck-HTML

Panel de instrumentos aeronáuticos virtual para banco de prueba y calibración.

## 🌐 ¿Cómo acceder a estos archivos?

Existen varias formas de acceder y visualizar estos archivos HTML:

### Opción 1: GitHub Pages (Recomendado para acceso público)

Este repositorio puede ser accedido públicamente mediante GitHub Pages. Sigue estos pasos para habilitarlo:

1. Ve a la página del repositorio en GitHub: `https://github.com/Claudio-Arz/AeroDeck-HTML`
2. Haz clic en **Settings** (Configuración)
3. En el menú lateral, haz clic en **Pages**
4. En **Source** (Origen), selecciona la rama `copilot/access-file-url` (o la rama principal que desees)
5. Haz clic en **Save** (Guardar)

Una vez habilitado, los archivos estarán disponibles en:
```
https://claudio-arz.github.io/AeroDeck-HTML/mainHTML.html
```

**Nota:** La primera vez puede tardar unos minutos en estar disponible.

### Opción 2: Servidor Local

Para probar los archivos localmente:

1. **Usando Python:**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Luego abre en tu navegador:
   # http://localhost:8000/mainHTML.html
   ```

2. **Usando Node.js (http-server):**
   ```bash
   npx http-server -p 8000
   
   # Luego abre en tu navegador:
   # http://localhost:8000/mainHTML.html
   ```

3. **Usando PHP:**
   ```bash
   php -S localhost:8000
   
   # Luego abre en tu navegador:
   # http://localhost:8000/mainHTML.html
   ```

### Opción 3: Netlify (Alternativa a GitHub Pages)

1. Ve a [netlify.com](https://www.netlify.com/)
2. Arrastra la carpeta del proyecto a la zona de "Drop"
3. Netlify generará una URL como: `https://tu-sitio.netlify.app/mainHTML.html`

### Opción 4: Abrir directamente desde el sistema de archivos

**⚠️ Advertencia:** Algunos navegadores tienen restricciones de seguridad (CORS) al abrir archivos locales directamente. Esta opción puede no funcionar completamente.

```
file:///ruta/completa/al/proyecto/mainHTML.html
```

## 📁 Estructura del Proyecto

```
AeroDeck-HTML/
├── mainHTML.html       # Archivo principal del panel de instrumentos
├── CSS/
│   └── mainHTML.css    # Estilos del panel
├── JS/
│   └── functions.js    # Funciones JavaScript
├── RPM.data            # Datos de RPM
├── mainHTML.cpp        # Archivo de referencia C++
└── _headers            # Configuración de CORS para hosting
```

## 🎯 Descripción

Este proyecto es un banco de prueba y calibración virtual que muestra instrumentos aeronáuticos, incluyendo:

- Indicador de velocidad del aire (AirSpeed)
- Control de actitud (Attitude)
- Altímetro (Altimeter)
- Indicador de RPM
- Indicador de velocidad vertical
- Indicador de flujo de combustible

## 🔌 Conexión WebSocket

El panel está diseñado para conectarse a un ESP32 mediante WebSocket en el puerto 81:
```javascript
ws://<hostname>:81/
```

## 🛠️ Configuración

El archivo `_headers` está configurado para permitir CORS (Cross-Origin Resource Sharing):
```
Access-Control-Allow-Origin: *
```

Esto permite que los archivos CSS, JS y HTML se carguen correctamente cuando se alojan en diferentes servicios.

## 📝 Notas

- El proyecto está en idioma español
- Diseñado para visualización en navegadores modernos
- Requiere conexión a un servidor WebSocket para funcionalidad completa
- Algunos recursos externos se cargan desde `https://cl4udio.netlify.app/`

## 👨‍💻 Autor

Claudio-Arz

## 📄 Licencia

Este proyecto está disponible como código abierto.
