# ⏳ Línea de Tiempo Histórica Escalonada

Una aplicación web interactiva diseñada para visualizar y comparar las vidas y hitos de figuras históricas de manera vertical. El proyecto permite observar solapamientos temporales entre personajes, facilitando la comprensión del contexto histórico compartido.

## 🚀 Características

- **Visualización Escalonada:** Los personajes se muestran en columnas paralelas para comparar quiénes fueron contemporáneos.
- **Buscador Dinámico:** Filtra rápidamente entre decenas de personajes mediante una barra de búsqueda en tiempo real.
- **Control de Zoom:** Ajusta la escala vertical (altura en píxeles) para expandir o contraer la línea de tiempo, permitiendo ver detalles o una visión general de los siglos.
- **Base de Datos Flexible:** Todo el contenido se gestiona a través de un archivo `datos.json` fácil de editar.
- **Diseño Responsivo:** Interfaz limpia con una botonera interactiva para activar/desactivar figuras.

## 📋 Estructura de Datos

Para agregar nuevas figuras, simplemente edita el archivo `datos.json` siguiendo este formato:

```json
{
  "nombre": "Nombre del Personaje",
  "nacimiento": 1800,
  "eventos": [
    { "año": 1820, "descripcion": "Hito importante" },
    { "año": 1850, "descripcion": "Fallecimiento" }
  ]
}