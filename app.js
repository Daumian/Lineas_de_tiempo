// ==============================================
// 1. VARIABLES GLOBALES Y SETUP
// ==============================================
const botoneraElement = document.getElementById('botonera');
const lineaTiempoContenedor = document.getElementById('linea-tiempo');
const filtroInput = document.getElementById('filtro-figuras');
const zoomSlider = document.getElementById('zoom-slider');
const zoomValorLabel = document.getElementById('zoom-valor');
let alturaActualPx = 1200; // Ahora es variable, no constante

let figurasHistoricas = []; // Almacenará los datos del JSON
let figurasActivas = new Set(); // Conjunto para saber qué figuras están visibles

let mostrarTodo = false; // Estado para saber si expandimos la lista
const LIMITE_INICIAL = 30; // Cantidad de botones a mostrar al inicio

// Altura del contenedor para el mapeo de la escala de tiempo (debe coincidir con min-height en CSS)
const ALTURA_CONTENEDOR_PX = 1200; 


// ==============================================
// 2. FUNCIONES DE LÓGICA Y UTILIDAD
// ==============================================


/**
 * Filtra los botones de figuras históricas basándose en el texto del input.
 */
function filtrarBotonera() {
    // 1. Obtener el texto de búsqueda y convertirlo a minúsculas
    const textoFiltro = filtroInput.value.toLowerCase();
    
    // 2. Obtener todos los botones generados
    const botones = botoneraElement.querySelectorAll('.boton-figura');

    botones.forEach(boton => {
        const nombreFigura = boton.textContent.toLowerCase();
        
        // Si el nombre de la figura incluye el texto del filtro, lo muestra.
        if (nombreFigura.includes(textoFiltro)) {
            boton.style.display = ''; // Muestra el botón
        } else {
            boton.style.display = 'none'; // Oculta el botón
        }
    });
}


/**
 * Obtiene el rango de años global (min y max) de todas las figuras activas.
 */

function obtenerRangoAños(figuras) {
    let minYear = Infinity;
    let maxYear = -Infinity;

    if (figuras.length === 0) {
        return { min: 0, max: 0, rango: 0 };
    }

    figuras.forEach(figura => {
        figura.eventos.forEach(evento => {
            if (evento.año < minYear) minYear = evento.año;
            if (evento.año > maxYear) maxYear = evento.año;
        });
    });

    // Añade un buffer (10% del rango) para espacio superior e inferior
    const bufferAños = Math.ceil((maxYear - minYear) * 0.1); 
    minYear -= bufferAños;
    maxYear += bufferAños;

    return { 
        min: minYear, 
        max: maxYear, 
        rango: maxYear - minYear 
    };
}

/**
 * Mapea un año a una posición vertical (top en píxeles).
 */
function mapearAñoAPosicion(año, rango) {
    if (rango.rango === 0) return alturaActualPx / 2;
    
    // Calcula el porcentaje de avance del año en el rango (0 a 1)
    const porcentaje = (año - rango.min) / rango.rango;
    
    // Mapea el porcentaje a la altura total
    const posicionPx = porcentaje * alturaActualPx;
    return posicionPx;
}


// ==============================================
// 3. FUNCIONES DE RENDERIZADO
// ==============================================

/**
 * Genera los botones en la botonera a partir de los datos cargados.
 */
function generarBotonera() {
    botoneraElement.innerHTML = ''; // Limpia botones anteriores

    figurasHistoricas.forEach(figura => {
        const boton = document.createElement('button');
        boton.classList.add('boton-figura');
        boton.textContent = figura.nombre;
        boton.dataset.nombre = figura.nombre; 
        
        // Asocia el evento de click a la función toggleFigura
        boton.addEventListener('click', () => toggleFigura(figura.nombre));
        
        botoneraElement.appendChild(boton);
    });
}



function generarBotonera(filtro = "") {
    botoneraElement.innerHTML = ''; 
    const textoFiltro = filtro.toLowerCase();

    // 1. Filtramos los datos según la búsqueda
    let figurasFiltradas = figurasHistoricas.filter(f => 
        f.nombre.toLowerCase().includes(textoFiltro)
    );

    // 2. Si no hay búsqueda, aplicamos el límite de 30
    let figurasAMostrar = figurasFiltradas;
    let mostrarBotonMas = false;

    if (textoFiltro === "" && !mostrarTodo && figurasFiltradas.length > LIMITE_INICIAL) {
        figurasAMostrar = figurasFiltradas.slice(0, LIMITE_INICIAL);
        mostrarBotonMas = true;
    }

    // 3. Crear los botones
    figurasAMostrar.forEach(figura => {
        const boton = document.createElement('button');
        boton.classList.add('boton-figura');
        if (figurasActivas.has(figura.nombre)) boton.classList.add('activo');
        
        boton.textContent = figura.nombre;
        boton.dataset.nombre = figura.nombre; 
        boton.addEventListener('click', () => toggleFigura(figura.nombre));
        botoneraElement.appendChild(boton);
    });

    // 4. Añadir botón "+" si es necesario
    if (mostrarBotonMas) {
        const botonMas = document.createElement('button');
        botonMas.classList.add('boton-expandir'); // Clase para darle estilo
        botonMas.textContent = `+${figurasFiltradas.length - LIMITE_INICIAL} más`;
        botonMas.onclick = () => {
            mostrarTodo = true;
            generarBotonera(); // Recarga la botonera completa
        };
        botoneraElement.appendChild(botonMas);
    }
}

/**
 * Actualizamos el buscador para que llame a generarBotonera
 */
function filtrarBotonera() {
    const texto = filtroInput.value;
    // Si el usuario borra la búsqueda, volvemos al estado de "no mostrar todo"
    if (texto === "") mostrarTodo = false; 
    generarBotonera(texto);
}

// Asegúrate de que en cargarDatos() se llame a generarBotonera() sin cambios



/**
 * Genera las etiquetas de año en el lado izquierdo (Eje Y) para la escala compartida.
 */
function generarEscalaAños(rango) {
    const intervalo = 10; // Intervalo de la escala (ej: 1800, 1850, 1900)
    const minAñoRedondeado = Math.floor(rango.min / intervalo) * intervalo;
    
    if (rango.rango < intervalo * 2) return;

    for (let año = minAñoRedondeado; año <= rango.max; año += intervalo) {
        if (año < rango.min) continue;

        const posicionTop = mapearAñoAPosicion(año, rango);
        
        const escalaDiv = document.createElement('div');
        escalaDiv.classList.add('escala-año');
        escalaDiv.textContent = año;
        escalaDiv.style.top = `${posicionTop}px`;

        lineaTiempoContenedor.appendChild(escalaDiv);
    }
}

/**
 * Renderiza todas las figuras activas, alineando sus eventos según la escala de años.
 */
/**
 * Renderiza todas las figuras activas, alineando sus eventos según la escala de años.
 */
function renderizarLineasTiempo() {
    lineaTiempoContenedor.innerHTML = ''; 

    const figurasParaMostrar = figurasHistoricas.filter(f => figurasActivas.has(f.nombre));

    if (figurasParaMostrar.length === 0) {
        lineaTiempoContenedor.style.minHeight = '0';
        return;
    }

    const rangoAños = obtenerRangoAños(figurasParaMostrar);
    
    // 1. Usar alturaActualPx para permitir el Zoom
    lineaTiempoContenedor.style.minHeight = `${alturaActualPx}px`;

    // Generar la escala de años (Eje Y)
    generarEscalaAños(rangoAños);

    // 2. Generar las columnas de figuras
    figurasParaMostrar.forEach(figuraData => {
        const columna = document.createElement('div');
        columna.classList.add('columna-figura');
        
        // Nombre de la figura
        const nombre = document.createElement('div');
        nombre.classList.add('nombre-figura');
        nombre.textContent = figuraData.nombre;
        columna.appendChild(nombre);

        // Línea vertical
        const lineaVertical = document.createElement('div');
        lineaVertical.classList.add('linea-vertical');
        columna.appendChild(lineaVertical);
        
        // Eventos
        figuraData.eventos.forEach(evento => {
            const posicionTop = mapearAñoAPosicion(evento.año, rangoAños);

            const eventoDiv = document.createElement('div');
            eventoDiv.classList.add('evento');
            eventoDiv.style.top = `${posicionTop}px`;

            // --- Lógica para traer al frente al hacer clic ---
            eventoDiv.addEventListener('click', function() {
                // Quitar la clase 'seleccionado' de cualquier otro evento activo
                document.querySelectorAll('.evento.seleccionado').forEach(el => {
                    el.classList.remove('seleccionado');
                });
                // Añadir la clase al evento actual para subir su z-index
                this.classList.add('seleccionado');
            });
            



            const caja = document.createElement('div');
            caja.classList.add('caja-evento');


            // 1. Buscamos el nacimiento. 
            // Si "figuraData.nacimiento" no existe (o es undefined), usamos el año del primer evento.
            const nacimiento = figuraData.nacimiento ? figuraData.nacimiento : figuraData.eventos[0].año;
            
            // 2. Calculamos la edad
            const edad = evento.año - nacimiento;
            
            let htmlEdad = '';
            // Solo mostramos si la edad es un número válido y mayor a 0
            if (!isNaN(edad) && edad > 0) {
                htmlEdad = `<br><span class="edad-texto">(${edad} años)</span>`;
            }

            caja.innerHTML = `<strong>${evento.año}:</strong> ${evento.descripcion}${htmlEdad}`;
            
            // --- FIN DEL CÓDIGO ---

            eventoDiv.appendChild(caja);
            columna.appendChild(eventoDiv);
        });

        lineaTiempoContenedor.appendChild(columna);
    });
}

// ==============================================
// 4. FUNCIONES DE CONTROL Y ARRANQUE
// ==============================================

/**
 * Función que se ejecuta al hacer clic en un botón para alternar la visibilidad de la figura.
 */
function toggleFigura(nombre) {
    const boton = botoneraElement.querySelector(`[data-nombre="${nombre}"]`);
    
    // 1. Alternar estado activo
    if (figurasActivas.has(nombre)) {
        figurasActivas.delete(nombre);
        boton.classList.remove('activo');
    } else {
        figurasActivas.add(nombre);
        boton.classList.add('activo');
    }

    // 2. Volver a renderizar la línea de tiempo completa
    renderizarLineasTiempo();
}


// ==============================================
// 4.5 CONTROL DE ZOOM (Añadir esto)
// ==============================================
if (zoomSlider) {
    zoomSlider.addEventListener('input', (e) => {
        // Actualizamos el valor de la altura con lo que diga el slider
        alturaActualPx = parseInt(e.target.value);
        
        // Actualizamos el texto que ve el usuario (ej: "1500px")
        if (zoomValorLabel) {
            zoomValorLabel.textContent = `${alturaActualPx}px`;
        }
        
        // ¡IMPORTANTE! Volvemos a renderizar para que todo se mueva a su nueva posición
        renderizarLineasTiempo(); 
    });
}



/**
 * Función principal para cargar los datos e iniciar la interfaz.
 */

async function cargarDatos() {
    try {
        const response = await fetch('datos.json');
        if (!response.ok) {
            // Maneja errores de red o archivo no encontrado
            throw new Error(`Error al cargar datos.json: ${response.statusText}`);
        }
        figurasHistoricas = await response.json();
        
        // 1. Genera los botones a partir de los datos.
        generarBotonera(); 
        
        // 2. CONECTA EL BUSCADOR (NUEVO AGREGADO)
        // La función 'filtrarBotonera' se ejecuta cada vez que el usuario suelta una tecla.
        if (filtroInput) { 
            filtroInput.addEventListener('keyup', filtrarBotonera);
        }
        
    } catch (error) {
        console.error('Fallo en la carga de datos:', error);
        // Muestra un mensaje de error visible
        lineaTiempoContenedor.innerHTML = '<p style="color: red;">Error al cargar los datos históricos. Asegúrate de usar un servidor local (como Live Server) o de revisar la ruta del archivo "datos.json".</p>';
    }
}

// ==============================================
// 5. INICIO DE LA APLICACIÓN
// ==============================================

cargarDatos();