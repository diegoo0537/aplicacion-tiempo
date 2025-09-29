const input = document.getElementById("input-buscador");
const lupa = document.getElementById("img-lupa");

input.addEventListener("keypress", (event) => {
    if(event.key=="Enter" || eventoLupa){
        buscarCiudad();
    }
});

lupa.addEventListener("click", buscarCiudad);

function buscarCiudad(){
    if(input.value==""){
        return;
    }else{
        getWeather(input.value);
    }
}

async function getWeather(ciudad){
    const apiKey = "08b2137e7bdaa1665a2417321fe38d83";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=${apiKey}&units=metric&lang=es`;
    const urlExtendida = `https://api.openweathermap.org/data/2.5/forecast?q=${ciudad}&appid=${apiKey}&units=metric&lang=es`;

    try {
        // Obtener datos actuales
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            alert("Ciudad no encontrada");
            console.log("Ciudad " + ciudad + " no encontrada");
            return;
        }

        // Obtener pronóstico extendido
        const responseExtendido = await fetch(urlExtendida);
        const dataExtendido = await responseExtendido.json();

        if (responseExtendido.ok) {
            parsearJSON(data);
            datosPronosticoActual = dataExtendido;
            mostrarPronosticoDias(dataExtendido); // Mostrar pronóstico por días por defecto
        } else {
            alert("Error al obtener el pronóstico");
        }
    } catch (error) {
        console.log("Error:", error);
    }
}

let hora = new Date().toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
});

function parsearJSON(datos){
    document.getElementById("ciudad").textContent = datos.name;
    document.getElementById("estado").textContent = datos.weather[0].description;
    //document.getElementById("hora").textContent = "Ultima hora de actualización: "+obtenerHoraCiudad(datos.timezone).hora+" h";
    //document.getElementById("hora").textContent = "Ultima hora de actualización: "+convertirTimestampAHora(datos.timezone)+" h";
    document.getElementById("hora").textContent = "Hora: "+hora+" h";
    document.getElementById("amanecer").textContent = "Amanecer: "+convertirTimestampAHora(datos.sys.sunrise)+" h";
    document.getElementById("anochecer").textContent = "Anochecer: "+convertirTimestampAHora(datos.sys.sunset)+" h";
    document.getElementById("temperatura").textContent = Math.round(datos.main.temp)+"°";
    document.getElementById("icono").setAttribute("src", `https://openweathermap.org/img/wn/${datos.weather[0].icon}.png`);
    document.getElementById("viento").textContent = "Viento: "+Math.round(datos.wind.speed*3.6)+" km/h";
}

function convertirTimestampAHora(timestamp) {
    // Multiplicar por 1000 para convertir segundos a milisegundos
    const fecha = new Date(timestamp * 1000);
    
    // Formato: HH:MM
    return fecha.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false // Formato 24h
    });
}

/*function obtenerHoraCiudad(timezoneOffset) {
    // timezoneOffset viene de OpenWeatherMap (en segundos)
    // Ej: 7200 para UTC+2 (España)
    
    const ahoraUTC = Math.floor(Date.now() / 1000); // Timestamp actual en UTC
    const horaCiudad = new Date((ahoraUTC + timezoneOffset) * 1000);
    
    return {
        hora: horaCiudad.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        })
    };
}*/

const botonHoras = document.getElementById("input-horas");
const botonDias = document.getElementById("input-dias");
let datosPronosticoActual = null;

botonHoras.addEventListener("click", () => {
    if(input.value==""){
        alert("Busca un pais o ciudad");
        return;
    }
    if (datosPronosticoActual) {
        mostrarPronosticoHoras(datosPronosticoActual);
    }
});

botonDias.addEventListener("click", () => {
    if(input.value==""){
        alert("Busca un pais o ciudad");
        return;
    }
    if (datosPronosticoActual) {
        mostrarPronosticoDias(datosPronosticoActual);
    }
});

function mostrarPronosticoDias(datos) {
    const div = document.getElementById("panel-scroll");
    let html = `<table id="tabla2">`;
    
    // Agrupar por días (la API devuelve datos cada 3 horas)
    const pronosticoPorDias = {};
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    
    datos.list.forEach(item => {
        const fecha = new Date(item.dt * 1000);
        const dia = fecha.toLocaleDateString('es-ES', { weekday: 'long' });
        const fechaStr = fecha.toDateString();
        
        if (!pronosticoPorDias[fechaStr]) {
            pronosticoPorDias[fechaStr] = {
                tempMin: item.main.temp_min,
                tempMax: item.main.temp_max,
                icon: item.weather[0].icon,
                description: item.weather[0].description,
                fecha: fecha
            };
        } else {
            // Actualizar temperaturas mínimas y máximas
            if (item.main.temp_min < pronosticoPorDias[fechaStr].tempMin) {
                pronosticoPorDias[fechaStr].tempMin = item.main.temp_min;
            }
            if (item.main.temp_max > pronosticoPorDias[fechaStr].tempMax) {
                pronosticoPorDias[fechaStr].tempMax = item.main.temp_max;
            }
        }
    });
    
    // Generar tabla para los próximos 7 días
    let contador = 0;
    for (const fechaStr in pronosticoPorDias) {
        if (contador >= 7) break;
        
        const pronostico = pronosticoPorDias[fechaStr];
        const diaSemana = diasSemana[pronostico.fecha.getDay()];
        const fechaFormateada = pronostico.fecha.toLocaleDateString('es-ES', { 
            day: 'numeric', 
            month: 'short' 
        });
        
        html += `
            <tr>
                <th>${diaSemana}<br><span style="font-size: 0.8em; font-weight: normal;">${fechaFormateada}</span></th>
                <td><img src="https://openweathermap.org/img/wn/${pronostico.icon}.png" alt="${pronostico.description}"></td>
                <td>${Math.round(pronostico.tempMax)}° / ${Math.round(pronostico.tempMin)}°</td>
            </tr>
        `;
        contador++;
    }
    
    html += `</table>`;
    div.innerHTML = html;

    //div.style.width = "305px";
}

function mostrarPronosticoHoras(datos) {
    const div = document.getElementById("panel-scroll");
    let html = `<table id="tabla2">`;
    
    // Obtener pronóstico para las próximas 36 horas
    const pronosticos = datos.list.slice(0, 12);
    
    let diaActual = 'Hoy';
    let primerDia = true;
    let contadorFilas = 0;
    
    pronosticos.forEach((item, index) => {
        const fecha = new Date(item.dt * 1000);
        const hoy = new Date();
        const esHoy = fecha.getDate() === hoy.getDate() && fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear();
        
        // Cambiar a "Mañana" cuando no sea hoy
        if (!esHoy && diaActual === 'Hoy') {
            diaActual = 'Mañana';
            // Agregar fila de separación para el nuevo día
            html += `
                <tr>
                    <th colspan="3">${diaActual}</th>
                </tr>
            `;
            contadorFilas++;
        }
        
        // Si es el primer elemento, agregar el título "Hoy"
        if (index === 0) {
            html += `
                <tr>
                    <th colspan="3">${diaActual}</th>
                </tr>
            `;
            contadorFilas++;
        }
        
        html += `
            <tr>
                <td>${fecha.toLocaleTimeString('es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                })}</td>
                <td><img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="${item.weather[0].description}"></td>
                <td>${Math.round(item.main.temp)}°</td>
            </tr>
        `;
        contadorFilas++;
    });
    
    html += `</table>`;
    div.innerHTML = html;
    
    //div.style.width = "252px";
}