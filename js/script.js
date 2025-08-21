// Variables globales
let map;
let pointsLayer;
let heatmapLayer;
let showingPoints = false;    // Cambiado: ahora inicia en false
let showingHeatmap = true;    // Cambiado: ahora inicia en true

// Función para inicializar el mapa
function initializeMap() {
    // Crear el mapa centrado en Michoacán
    map = L.map('map').setView([19.0, -102.0], 8);

    // Capa base estándar
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    });

    // Capa base estética
    const cartoLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors © CARTO'
    });

    // Usar la capa estética por defecto
    cartoLayer.addTo(map);

    // Control de capas base
    const baseMaps = {
        "Mapa Estándar": osmLayer,
        "Mapa Estético": cartoLayer
    };

    L.control.layers(baseMaps).addTo(map);
    L.control.scale().addTo(map);
}

// Función para crear las capas de datos
function createDataLayers() {
    // Verificar si los datos existen
    if (typeof accidentes === 'undefined') {
        console.error('Los datos de accidentes no están disponibles');
        return;
    }

    // Crear grupo de capas para los puntos
    pointsLayer = L.layerGroup();
    
    // Array para datos del mapa de calor
    const heatmapData = [];

    // Procesar cada accidente
    accidentes.features.forEach(function(feature, index) {
        const lat = feature.geometry.coordinates[1];
        const lng = feature.geometry.coordinates[0];
        const altitude = feature.geometry.coordinates[2] || 0;

        // Crear marcador rojo para cada accidente
        const marker = L.circleMarker([lat, lng], {
            radius: 8,
            fillColor: "#ff0000",
            color: "#darkred",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        });

        // Crear contenido del popup simple
        let popupContent = `
            <div style="font-family: Arial, sans-serif; min-width: 250px;">
                <h3 style="color: #d32f2f; margin-top: 0;">🚨 Accidente ${index + 1}</h3>
                <p><strong>📍 Coordenadas:</strong><br>${lat.toFixed(5)}, ${lng.toFixed(5)}</p>
                <p><strong>🏔️ Altitud:</strong> ${altitude} metros</p>
                <p><strong>📋 Descripción:</strong><br>${feature.properties.desc}</p>
            </div>
        `;
        
        marker.bindPopup(popupContent);
        pointsLayer.addLayer(marker);

        // Agregar datos para el mapa de calor con mayor intensidad
        heatmapData.push([lat, lng, 2]); // Intensidad aumentada para mejor visualización
    });

    // Crear capa de mapa de calor optimizada para pocos puntos dispersos
    heatmapLayer = L.heatLayer(heatmapData, {
        radius: 10,      // Radio más grande para cubrir más área
        blur: 10,        // Mayor difuminado para mejor visualización
        max: 1.0,        // Valor máximo para normalizar intensidades
        minOpacity: 0.7, // Opacidad mínima para que sea visible
        maxZoom: 18,     // Zoom máximo donde se ve el efecto
        gradient: {
            0.0: '#0000FF',  // Azul
            0.25: '#00FF00', // Verde
            0.5: '#FFFF00',  // Amarillo
            0.75: '#FFA500', // Naranja
            1.0: '#FF0000'   // Rojo
        }
    });

    // Agregar capa de mapa de calor por defecto
    heatmapLayer.addTo(map);   // Cambiado: ahora se agrega el heatmap por defecto
    // pointsLayer.addTo(map); // Comentado: ya no se agrega la capa de puntos por defecto
}

// Función para configurar los event listeners
function setupEventListeners() {
    document.getElementById('togglePoints').addEventListener('click', function() {
        if (!showingPoints) {
            map.addLayer(pointsLayer);
            showingPoints = true;
        }
        if (showingHeatmap) {
            map.removeLayer(heatmapLayer);
            showingHeatmap = false;
        }
        updateButtonStates('points');
    });

    document.getElementById('toggleHeatmap').addEventListener('click', function() {
        if (!showingHeatmap) {
            map.addLayer(heatmapLayer);
            showingHeatmap = true;
        }
        if (showingPoints) {
            map.removeLayer(pointsLayer);
            showingPoints = false;
        }
        updateButtonStates('heatmap');
    });

    document.getElementById('showBoth').addEventListener('click', function() {
        if (!showingPoints) {
            map.addLayer(pointsLayer);
            showingPoints = true;
        }
        if (!showingHeatmap) {
            map.addLayer(heatmapLayer);
            showingHeatmap = true;
        }
        updateButtonStates('both');
    });
}

// Función para actualizar el estado de los botones
function updateButtonStates(active) {
    document.querySelectorAll('.controls button').forEach(btn => btn.classList.remove('active'));
    
    if (active === 'points') {
        document.getElementById('togglePoints').classList.add('active');
    } else if (active === 'heatmap') {
        document.getElementById('toggleHeatmap').classList.add('active');
    } else if (active === 'both') {
        document.getElementById('showBoth').classList.add('active');
    }
}

// Función principal de inicialización
function init() {
    try {
        // Verificar si los datos están disponibles
        if (typeof accidentes === 'undefined') {
            console.error('Error: Los datos de accidentes no están cargados');
            alert('Error: No se pudieron cargar los datos de accidentes. Verifique que el archivo "accidentes altura.js" esté presente.');
            return;
        }
        
        // Inicializar mapa
        initializeMap();
        
        // Crear capas de datos
        createDataLayers();
        
        // Configurar event listeners
        setupEventListeners();
        
        // Ajustar tamaño del mapa después de un breve delay
        setTimeout(function() {
            map.invalidateSize();
        }, 100);

        updateButtonStates('heatmap'); // <-- Agrega esta línea    
        console.log('Aplicación inicializada correctamente con', accidentes.features.length, 'accidentes');
        
    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
        alert('Error al inicializar la aplicación. Revise la consola para más detalles.');
    }
}

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);