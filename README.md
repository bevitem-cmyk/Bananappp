# Bananapp 🍌

Aplicación web informativa para el monitoreo climático y el manejo del cultivo de banano en Ecuador.

## Funciones
- Clima actual y pronóstico de 7 días mediante Open-Meteo.
- Selector de ubicaciones ecuatorianas.
- Resumen de patrones estacionales de la Costa ecuatoriana.
- Fichas de condiciones agronómicas, cuidados, plagas y enfermedades.
- Modelo 3D interactivo ilustrativo de una planta de banano (Three.js).
- Simulador de escenario con controles de temperatura, humedad y disponibilidad de agua.

## Ejecutar localmente
Como `app.js` usa módulos ES, abre el proyecto mediante un servidor local, no directamente con `file://`.

Con Python:
```bash
python -m http.server 8000
```
Abre `http://localhost:8000`.

O usa la extensión **Live Server** de Visual Studio Code.

## Publicar en GitHub Pages
1. Crea un repositorio llamado `bananapp`.
2. Sube `index.html`, `styles.css`, `app.js` y `README.md` a la rama `main`.
3. En GitHub entra a **Settings → Pages**.
4. En **Build and deployment**, elige **Deploy from a branch**.
5. Selecciona `main` y la carpeta `/ (root)`, guarda.
6. Espera la publicación y abre la URL que GitHub Pages te indique.

## APIs y dependencias
- **Open-Meteo**: API meteorológica pública sin clave para clima actual y pronóstico. La conexión requiere internet.
- **Three.js**: biblioteca 3D cargada desde jsDelivr CDN. La conexión requiere internet.

## Importante sobre la información agrícola
Los rangos y recomendaciones son referencias generales y educativas, no sustituyen análisis de suelo/agua, diagnóstico fitosanitario ni asesoría de un ingeniero agrónomo. La época lluviosa y menos lluviosa son patrones generales de la Costa ecuatoriana y pueden variar por zona, año y eventos ENSO. La simulación 3D es ilustrativa: no es un gemelo digital, no usa sensores de finca y no predice cosechas. Ante sospecha de Fusarium Raza 4 Tropical o Moko, evita mover material vegetal o suelo y contacta a Agrocalidad para seguir el protocolo oficial.

## Estructura
```text
bananapp/
├── index.html
├── styles.css
├── app.js
└── README.md
```
