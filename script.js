const socket = io();

let nombreJugador = "";
let salaActual = null;
let categoriaActual = "";
let dificultadActual = "";
let miRol = null;
let soyCreador = false;
let palabraActualMultijugador = "";
let tipoPartida = "amistoso"; // NUEVO: "amistoso" o "votacion"

// Variables para modo votación LOCAL
let votacionLocal = {
    jugadoresVivos: [],
    jugadoresEliminados: [],
    puntuacionImpostor: 0,
    jugadorSeleccionadoVoto: null,
    votoRealizado: false,
    palabraActual: ""
};

// Variables para modo votación MULTIJUGADOR
let votacionMultijugador = {
    jugadorSeleccionadoVoto: null,
    votoRealizado: false
};

let configLocal = {
    jugadores: [],
    categoria: "Objetos",
    dificultad: "Fácil",
    impostores: 1,
    maxJugadores: 4,
    palabraActual: "",
    jugadorActual: 0,
    roles: [],
    impostoresIndices: [],
    tipoPartida: "amistoso", // NUEVO
    puntuacionImpostor: 0, // NUEVO
    jugadoresEliminados: [] // NUEVO
};

let configGuardada = null;

function ocultarTodas() {
    document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
    document.getElementById("confirmModal").classList.add("hidden");
}

function mostrar(id) {
    ocultarTodas();
    document.getElementById(id).classList.remove("hidden");
}

function generarPalabraLocal(categoria, dificultad) {
    const palabras = {
        Objetos: ["Agenda", "Alfombra", "Almohada", "Altavoz", "Antena", "Archivador", "Arena", "Armario", "Asiento", "Audífonos"],
        Animales: ["Abeja", "Águila", "Alce", "Anaconda", "Anguila", "Araña", "Ardilla", "Armadillo", "Atún", "Avestruz"],
        Personas: ["Catalina Puerto", "Ana Maria", "Katerin Cardona", "Maleja", "Katerin Becerra"],
        Países: {
            "Fácil": ["Alemania", "Argentina", "Australia", "Bolivia", "Brasil"],
            "Medio": ["Arabia Saudita", "Austria", "Bélgica", "Camerún", "Congo"],
            "Difícil": ["Andorra", "Bosnia y Herzegovina", "Bulgaria", "Burkina Faso", "Escocia"]
        },
        Futbolistas: {
            "Fácil": ["Achraf Hakimi", "Alfredo Di Stéfano", "Andrés Iniesta", "Arjen Robben", "Cristiano Ronaldo"],
            "Medio": ["Alessandro Nesta", "Alexis Sánchez", "Alisson Becker", "Alphonso Davies", "Claudio Bravo"],
            "Difícil": ["Alessandro Del Piero", "Álvaro Morata", "Andrés Guardado", "Ansu Fati", "Blaise Matuidi"]
        },
        Cantantes: {
            "Fácil": ["Adele", "Alci Acosta", "Ana Gabriel", "Andrés Cepeda", "Aventura"],
            "Medio": ["50 Cent", "AC/DC", "Alejandro Fernández", "Andrés Calamaro", "Anuel AA"],
            "Difícil": ["Adriana Lucía", "Andrea Bocelli", "Aterciopelados", "Avicii", "Binomio de Oro de América"]
        },
        ClashRoyale: ["Cocinero Real", "Duquesa de dagas", "Cañonero", "Princesa de torre", "Caballero"]
    };

    if (categoria === "Objetos" || categoria === "Animales" || categoria === "Personas" || categoria === "ClashRoyale") {
        const lista = palabras[categoria] || palabras["Objetos"];
        return lista[Math.floor(Math.random() * lista.length)];
    } else {
        const dificultades = palabras[categoria];
        if (dificultades && dificultades[dificultad]) {
            const lista = dificultades[dificultad];
            return lista[Math.floor(Math.random() * lista.length)];
        } else if (dificultades && typeof dificultades === 'object') {
            const todas = [].concat(...Object.values(dificultades));
            return todas[Math.floor(Math.random() * todas.length)];
        } else {
            return "Palabra";
        }
    }
}

function mostrarModo(modo) {
    if (modo === "local") {
        configGuardada = null;
        configLocal = {
            jugadores: [],
            categoria: "Objetos",
            dificultad: "Fácil",
            impostores: 1,
            maxJugadores: 4,
            palabraActual: "",
            jugadorActual: 0,
            roles: [],
            impostoresIndices: [],
            tipoPartida: "amistoso",
            puntuacionImpostor: 0,
            jugadoresEliminados: []
        };

        document.getElementById("cantidadJugadoresLocal").value = "4";
        document.getElementById("cantidadImpostoresLocal").value = "1";
        document.getElementById("categoriaLocal").value = "Objetos";
        document.getElementById("dificultadContainerLocal").style.display = "none";
        document.getElementById("dificultadLocal").value = "Fácil";
        document.getElementById("tipoPartidaLocal").value = "amistoso"; // NUEVO

        mostrar("pantalla-local-config");
    } else {
        document.getElementById("codigoSalaUnirse").value = "";
        mostrar("multijugador-nombre");
    }
}

function actualizarDificultadLocal() {
    const categoria = document.getElementById("categoriaLocal").value;
    const dificultadContainer = document.getElementById("dificultadContainerLocal");
    const selectDificultad = document.getElementById("dificultadLocal");

    const sinDificultad = ["Objetos", "Animales", "Personas", "ClashRoyale"];

    if (sinDificultad.includes(categoria)) {
        dificultadContainer.style.display = "none";
    } else {
        dificultadContainer.style.display = "block";
        selectDificultad.value = "Fácil";
        configLocal.dificultad = "Fácil";
    }
}

function actualizarImpostoresLocal() {
    const cantidadJugadores = parseInt(document.getElementById("cantidadJugadoresLocal").value);
    const selectImpostores = document.getElementById("cantidadImpostoresLocal");

    selectImpostores.innerHTML = "";
    const maxImpostores = Math.min(Math.floor(cantidadJugadores / 3), cantidadJugadores - 1);

    for (let i = 1; i <= maxImpostores; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        selectImpostores.appendChild(option);
    }

    selectImpostores.value = Math.min(1, maxImpostores);
    configLocal.impostores = parseInt(selectImpostores.value);
}

function irNombresLocal() {
    const cantidad = parseInt(document.getElementById("cantidadJugadoresLocal").value);
    const impostores = parseInt(document.getElementById("cantidadImpostoresLocal").value);
    const categoria = document.getElementById("categoriaLocal").value;
    const dificultad = document.getElementById("dificultadLocal").value;
    const tipoPartida = document.getElementById("tipoPartidaLocal").value; // NUEVO

    if (cantidad < 3 || cantidad > 15) {
        alert("La cantidad debe estar entre 3 y 15 jugadores");
        return;
    }

    configLocal.maxJugadores = cantidad;
    configLocal.impostores = impostores;
    configLocal.categoria = categoria;
    configLocal.dificultad = dificultad;
    configLocal.tipoPartida = tipoPartida; // NUEVO

    configLocal.jugadores = [];

    if (configGuardada && configGuardada.jugadores) {
        for (let i = 0; i < cantidad; i++) {
            if (i < configGuardada.jugadores.length) {
                configLocal.jugadores.push({
                    nombre: configGuardada.jugadores[i].nombre,
                    id: i,
                    eliminado: false
                });
            } else {
                configLocal.jugadores.push({
                    nombre: `Jugador ${i + 1}`,
                    id: i,
                    eliminado: false
                });
            }
        }
    } else {
        for (let i = 0; i < cantidad; i++) {
            configLocal.jugadores.push({
                nombre: `Jugador ${i + 1}`,
                id: i,
                eliminado: false
            });
        }
    }

    mostrarJugadoresLocales();
}

function mostrarJugadoresLocales() {
    const contenedor = document.getElementById("contenedorNombresLocal");
    contenedor.innerHTML = "";

    configLocal.jugadores.forEach((jugador, index) => {
        const div = document.createElement("div");
        div.className = "jugador-input";
        div.innerHTML = `
            <div class="jugador-numero">Jugador ${index + 1}</div>
            <input type="text" 
                   class="nombre-jugador-local" 
                   data-index="${index}"
                   value="${jugador.nombre}"
                   placeholder="Nombre del jugador">
        `;
        contenedor.appendChild(div);
    });

    document.querySelectorAll('.nombre-jugador-local').forEach(input => {
        input.addEventListener('input', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const nuevoNombre = this.value.trim() || `Jugador ${index + 1}`;
            configLocal.jugadores[index].nombre = nuevoNombre;
        });
    });

    mostrar("pantalla-local-nombres");
}

function volverConfigLocal() {
    mostrar("pantalla-local-config");
}

function iniciarJuegoLocal() {
    document.querySelectorAll('.nombre-jugador-local').forEach(input => {
        const index = parseInt(input.getAttribute('data-index'));
        const nombre = input.value.trim() || `Jugador ${index + 1}`;
        configLocal.jugadores[index].nombre = nombre;
    });

    configLocal.palabraActual = generarPalabraLocal(configLocal.categoria, configLocal.dificultad);
    configLocal.jugadoresEliminados = [];
    configLocal.puntuacionImpostor = 0;
    
    // Inicializar jugadores vivos para votación
    configLocal.jugadores.forEach(j => j.eliminado = false);
    
    asignarRolesLocales();
    configLocal.jugadorActual = 0;
    mostrarJugadorLocal();
}

function asignarRolesLocales() {
    configLocal.roles = new Array(configLocal.jugadores.length).fill("INOCENTE");
    configLocal.impostoresIndices = [];

    let indices = Array.from({length: configLocal.jugadores.length}, (_, i) => i);

    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    for (let i = 0; i < configLocal.impostores; i++) {
        const impostorIndex = indices[i];
        configLocal.roles[impostorIndex] = "IMPOSTOR";
        configLocal.impostoresIndices.push(impostorIndex);
    }
}

function mostrarJugadorLocal() {
    const jugador = configLocal.jugadores[configLocal.jugadorActual];

    document.getElementById("tituloJugadorLocal").textContent = `Turno del Jugador ${configLocal.jugadorActual + 1}`;
    document.getElementById("nombreJugadorLocal").textContent = jugador.nombre;
    document.getElementById("categoriaNombreLocal").textContent = configLocal.categoria;
    document.getElementById("dificultadNombreLocal").textContent = configLocal.dificultad;
    document.getElementById("impostoresNombreLocal").textContent = configLocal.impostores;
    document.getElementById("totalJugadoresLocal").textContent = configLocal.maxJugadores;
    document.getElementById("tipoPartidaDisplayLocal").textContent = 
        configLocal.tipoPartida === "amistoso" ? "Amistoso" : "Con Votación";

    const sinDificultad = ["Objetos", "Animales", "Personas", "ClashRoyale"];
    const dificultadItem = document.getElementById("dificultadItemLocal");
    if (sinDificultad.includes(configLocal.categoria)) {
        dificultadItem.style.display = "none";
    } else {
        dificultadItem.style.display = "flex";
    }

    mostrar("pantalla-local-jugador");
}

function verPalabraLocal() {
    const jugador = configLocal.jugadores[configLocal.jugadorActual];
    const rol = configLocal.roles[configLocal.jugadorActual];

    document.getElementById("tituloJugadorPalabra").textContent = `Turno del Jugador ${configLocal.jugadorActual + 1}`;
    document.getElementById("nombreJugadorPalabra").textContent = jugador.nombre;
    document.getElementById("categoriaPalabra").textContent = configLocal.categoria;
    document.getElementById("dificultadPalabra").textContent = configLocal.dificultad;
    document.getElementById("impostoresPalabra").textContent = configLocal.impostores;
    document.getElementById("totalJugadoresPalabra").textContent = configLocal.maxJugadores;
    document.getElementById("tipoPartidaDisplayPalabra").textContent = 
        configLocal.tipoPartida === "amistoso" ? "Amistoso" : "Con Votación";

    const sinDificultad = ["Objetos", "Animales", "Personas", "ClashRoyale"];
    const dificultadItem = document.getElementById("dificultadItemPalabra");
    if (sinDificultad.includes(configLocal.categoria)) {
        dificultadItem.style.display = "none";
    } else {
        dificultadItem.style.display = "flex";
    }

    const palabraElem = document.getElementById("palabraJugadorLocal");

    if (rol === "IMPOSTOR") {
        palabraElem.textContent = "IMPOSTOR";
        palabraElem.className = "palabra-display palabra-impostor";
    } else {
        palabraElem.textContent = configLocal.palabraActual;
        palabraElem.className = "palabra-display palabra-inocente";
    }

    const esUltimo = configLocal.jugadorActual === configLocal.jugadores.length - 1;
    document.getElementById("btnSiguienteLocal").classList.toggle("hidden", esUltimo);
    document.getElementById("btnFinalizarLocal").classList.toggle("hidden", !esUltimo);

    mostrar("pantalla-local-palabra");
}

function siguienteJugadorLocal() {
    configLocal.jugadorActual++;
    mostrarJugadorLocal();
}

function finalizarJuegoLocal() {
    if (configLocal.tipoPartida === "amistoso") {
        mostrar("pantalla-local-final-amistoso");
        document.getElementById("impostorReveladoLocal").classList.add("hidden");
        document.getElementById("palabraReveladaLocal").classList.add("hidden");
    } else {
        // Modo con votación
        iniciarVotacionLocal();
    }
}

function revelarImpostorLocal() {
    const impostores = configLocal.impostoresIndices.map(index => configLocal.jugadores[index]);

    let impostoresTexto = "";

    if (impostores.length === 1) {
        impostoresTexto = impostores[0].nombre;
        document.getElementById("impostorTituloLocal").textContent = "EL IMPOSTOR ES:";
    } else {
        const nombresImpostores = impostores.map((imp, i) => `Impostor ${i + 1}: ${imp.nombre}`).join("<br>");
        impostoresTexto = nombresImpostores;
        document.getElementById("impostorTituloLocal").textContent = "LOS IMPOSTORES SON:";
    }

    document.getElementById("impostorReveladoTextoLocal").innerHTML = impostoresTexto;
    document.getElementById("impostorReveladoLocal").classList.remove("hidden");

    document.getElementById("palabraReveladaTextoLocal").textContent = configLocal.palabraActual;
    document.getElementById("palabraReveladaLocal").classList.remove("hidden");

    document.querySelector("#pantalla-local-final-amistoso .revelar-container button").style.display = "none";
}

function volveraJugarLocal() {
    configLocal.palabraActual = generarPalabraLocal(configLocal.categoria, configLocal.dificultad);
    asignarRolesLocales();
    configLocal.jugadorActual = 0;

    if (configLocal.tipoPartida === "amistoso") {
        document.getElementById("impostorReveladoLocal").classList.add("hidden");
        document.getElementById("palabraReveladaLocal").classList.add("hidden");
        document.querySelector("#pantalla-local-final-amistoso .revelar-container button").style.display = "block";
        mostrarJugadorLocal();
    } else {
        // En modo votación, reiniciar eliminados pero mantener puntuación
        configLocal.jugadores.forEach(j => j.eliminado = false);
        configLocal.jugadoresEliminados = [];
        mostrarJugadorLocal();
    }
}

function volverConfiguracionLocal() {
    configGuardada = {
        maxJugadores: configLocal.maxJugadores,
        impostores: configLocal.impostores,
        categoria: configLocal.categoria,
        dificultad: configLocal.dificultad,
        jugadores: [...configLocal.jugadores],
        tipoPartida: configLocal.tipoPartida
    };

    if (configGuardada) {
        document.getElementById("cantidadJugadoresLocal").value = configGuardada.maxJugadores;
        document.getElementById("categoriaLocal").value = configGuardada.categoria;
        document.getElementById("tipoPartidaLocal").value = configGuardada.tipoPartida;
        actualizarImpostoresLocal();
        document.getElementById("cantidadImpostoresLocal").value = configGuardada.impostores;
        configLocal.impostores = configGuardada.impostores;
    }

    mostrar("pantalla-local-config");
}

// ========== FUNCIONES PARA VOTACIÓN LOCAL ==========

function iniciarVotacionLocal() {
    // Inicializar jugadores vivos
    const jugadoresVivos = configLocal.jugadores.filter(j => !j.eliminado);
    
    // Actualizar lista de eliminados
    actualizarListaEliminadosLocal();
    
    // Actualizar puntuación
    actualizarPuntuacionLocal();
    
    // Crear lista de votación
    const listaVotacion = document.getElementById("listaVotacionLocal");
    listaVotacion.innerHTML = "";
    
    jugadoresVivos.forEach((jugador, index) => {
        const div = document.createElement("div");
        div.className = "jugador-lista";
        div.style.cursor = "pointer";
        div.style.padding = "10px";
        div.style.margin = "5px 0";
        div.style.borderRadius = "5px";
        div.style.border = "1px solid #333";
        div.style.backgroundColor = "#222";
        div.style.transition = "all 0.2s";
        
        div.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <span>${jugador.nombre}</span>
                <span id="checkVotoLocal${index}" style="color: #4CAF50; display: none;">✓</span>
            </div>
        `;
        
        div.addEventListener("click", () => {
            // Deseleccionar todos
            document.querySelectorAll("#listaVotacionLocal > div").forEach(item => {
                item.style.backgroundColor = "#222";
                item.style.borderColor = "#333";
                const check = item.querySelector("span[id^='checkVotoLocal']");
                if (check) check.style.display = "none";
            });
            
            // Seleccionar este
            div.style.backgroundColor = "#2a2a2a";
            div.style.borderColor = "#4CAF50";
            document.getElementById(`checkVotoLocal${index}`).style.display = "inline";
            
            // Habilitar botón de votar
            document.getElementById("btnVotarLocal").disabled = false;
            votacionLocal.jugadorSeleccionadoVoto = jugador;
        });
        
        listaVotacion.appendChild(div);
    });
    
    // Resetear estado de voto
    votacionLocal.jugadorSeleccionadoVoto = null;
    votacionLocal.votoRealizado = false;
    document.getElementById("btnVotarLocal").disabled = true;
    
    mostrar("pantalla-local-votacion");
}

function actualizarListaEliminadosLocal() {
    const eliminados = configLocal.jugadores.filter(j => j.eliminado);
    const listaEliminados = document.getElementById("listaEliminadosLocal");
    const contador = document.getElementById("contadorEliminadosLocal");
    
    contador.textContent = eliminados.length;
    
    if (eliminados.length === 0) {
        listaEliminados.innerHTML = "<div style='color: #777; font-style: italic;'>Ningún jugador eliminado</div>";
    } else {
        listaEliminados.innerHTML = eliminados.map(j => 
            `<div style="margin: 5px 0; padding: 5px; background: rgba(255,0,0,0.1); border-radius: 3px;">${j.nombre}</div>`
        ).join("");
    }
}

function actualizarPuntuacionLocal() {
    document.getElementById("puntuacionLocal").textContent = `Impostor: ${configLocal.puntuacionImpostor} puntos`;
}

function procesarVotoLocal() {
    if (!votacionLocal.jugadorSeleccionadoVoto) {
        alert("Selecciona un jugador para votar");
        return;
    }
    
    const jugadorVotado = votacionLocal.jugadorSeleccionadoVoto;
    const jugadorVotadoIndex = configLocal.jugadores.findIndex(j => j.id === jugadorVotado.id);
    const esImpostor = configLocal.roles[jugadorVotadoIndex] === "IMPOSTOR";
    
    const resultadoDiv = document.getElementById("resultadoVotacionLocal");
    const opcionesDiv = document.getElementById("opcionesVotacionLocal");
    
    if (esImpostor) {
        // Se encontró al impostor
        resultadoDiv.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 24px; color: #ff3333; margin-bottom: 10px;">🎉 ¡IMPOSTOR ENCONTRADO!</div>
                <div style="font-size: 18px; color: white; margin-bottom: 15px;">El impostor era: <strong>${jugadorVotado.nombre}</strong></div>
                <div style="font-size: 18px; color: #4CAF50; margin-bottom: 15px;">La palabra era: <strong>${configLocal.palabraActual}</strong></div>
                <div style="font-size: 16px; color: #ccc;">Puntuación final del impostor: <strong>${configLocal.puntuacionImpostor} puntos</strong></div>
            </div>
        `;
        
        opcionesDiv.innerHTML = `
            <button onclick="volveraJugarLocal()">VOLVER A JUGAR</button>
            <button onclick="volverConfiguracionLocal()">CONFIGURACIÓN</button>
        `;
    } else {
        // Se eliminó a un inocente
        jugadorVotado.eliminado = true;
        configLocal.jugadoresEliminados.push(jugadorVotado);
        
        // Calcular jugadores restantes
        const jugadoresVivos = configLocal.jugadores.filter(j => !j.eliminado);
        const impostoresVivos = jugadoresVivos.filter((j, idx) => 
            configLocal.roles[configLocal.jugadores.findIndex(j2 => j2.id === j.id)] === "IMPOSTOR"
        );
        const inocentesVivos = jugadoresVivos.length - impostoresVivos.length;
        
        // Determinar puntos
        if (jugadoresVivos.length === 3 && impostoresVivos.length === 1 && inocentesVivos === 2) {
            // Última ronda: impostor sobrevive con 2 inocentes → +2 puntos
            configLocal.puntuacionImpostor += 2;
            resultadoDiv.innerHTML = `
                <div style="text-align: center;">
                    <div style="font-size: 24px; color: #ff3333; margin-bottom: 10px;">🏆 ¡IMPOSTOR GANA!</div>
                    <div style="font-size: 18px; color: white; margin-bottom: 15px;">Se eliminó a: <strong>${jugadorVotado.nombre}</strong> (INOCENTE)</div>
                    <div style="font-size: 18px; color: #ff3333; margin-bottom: 15px;">Quedan 2 jugadores: 1 impostor + 1 inocente</div>
                    <div style="font-size: 18px; color: #4CAF50; margin-bottom: 15px;">La palabra era: <strong>${configLocal.palabraActual}</strong></div>
                    <div style="font-size: 16px; color: #ffcc00;">El impostor gana 2 puntos por sobrevivir la última ronda</div>
                    <div style="font-size: 16px; color: #ccc; margin-top: 10px;">Puntuación total: <strong>${configLocal.puntuacionImpostor} puntos</strong></div>
                </div>
            `;
            
            opcionesDiv.innerHTML = `
                <button onclick="volveraJugarLocal()">VOLVER A JUGAR</button>
                <button onclick="volverConfiguracionLocal()">CONFIGURACIÓN</button>
            `;
        } else {
            // Ronda normal: impostor sobrevive → +1 punto
            configLocal.puntuacionImpostor += 1;
            resultadoDiv.innerHTML = `
                <div style="text-align: center;">
                    <div style="font-size: 24px; color: #ff3333; margin-bottom: 10px;">❌ ¡ERROR!</div>
                    <div style="font-size: 18px; color: white; margin-bottom: 15px;">Se eliminó a: <strong>${jugadorVotado.nombre}</strong> (INOCENTE)</div>
                    <div style="font-size: 16px; color: #ffcc00;">El impostor gana 1 punto por sobrevivir esta ronda</div>
                    <div style="font-size: 16px; color: #ccc; margin-top: 10px;">Puntuación actual: <strong>${configLocal.puntuacionImpostor} puntos</strong></div>
                    <div style="margin-top: 15px; color: #777;">Quedan ${jugadoresVivos.length} jugadores vivos</div>
                </div>
            `;
            
            opcionesDiv.innerHTML = `
                <button onclick="continuarVotacionLocal()">CONTINUAR VOTACIÓN</button>
                <button onclick="volverConfiguracionLocal()">CONFIGURACIÓN</button>
            `;
        }
    }
    
    mostrar("pantalla-local-resultado-votacion");
}

function continuarVotacionLocal() {
    // Verificar si quedan suficientes jugadores
    const jugadoresVivos = configLocal.jugadores.filter(j => !j.eliminado);
    const impostoresVivos = jugadoresVivos.filter((j, idx) => 
        configLocal.roles[configLocal.jugadores.findIndex(j2 => j2.id === j.id)] === "IMPOSTOR"
    );
    
    if (jugadoresVivos.length <= 2 || impostoresVivos.length === 0) {
        // Juego terminado
        const resultadoDiv = document.getElementById("resultadoVotacionLocal");
        const opcionesDiv = document.getElementById("opcionesVotacionLocal");
        
        resultadoDiv.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 24px; color: #ff3333; margin-bottom: 10px;">🎮 JUEGO TERMINADO</div>
                <div style="font-size: 18px; color: #4CAF50; margin-bottom: 15px;">La palabra era: <strong>${configLocal.palabraActual}</strong></div>
                <div style="font-size: 16px; color: #ccc;">Puntuación final del impostor: <strong>${configLocal.puntuacionImpostor} puntos</strong></div>
            </div>
        `;
        
        opcionesDiv.innerHTML = `
            <button onclick="volveraJugarLocal()">VOLVER A JUGAR</button>
            <button onclick="volverConfiguracionLocal()">CONFIGURACIÓN</button>
        `;
    } else {
        // Continuar votación
        iniciarVotacionLocal();
    }
}

// ========== MULTIJUGADOR ==========

function continuarMultijugador() {
    const nombre = document.getElementById("nombreJugadorMultijugador").value.trim();

    if (!nombre) {
        alert("Debes ingresar un nombre");
        return;
    }

    if (nombre.length > 20) {
        alert("El nombre no puede tener más de 20 caracteres");
        return;
    }

    nombreJugador = nombre;
    mostrar("multijugador-elegir");
}

function mostrarCrearSala() {
    soyCreador = true;
    const codigo = generarCodigoSala();
    document.getElementById("codigoSalaCreador").textContent = codigo;
    salaActual = codigo;

    actualizarImpostoresMultijugador();
    actualizarDificultadMultijugador();

    document.getElementById("listaJugadoresLobby").innerHTML = "";
    document.getElementById("jugadoresActuales").textContent = "0";

    socket.emit("crearSala", {
        nombre: nombreJugador,
        codigo: codigo,
        maxJugadores: parseInt(document.getElementById("cantidadJugadoresMultijugador").value),
        impostores: parseInt(document.getElementById("cantidadImpostoresMultijugador").value),
        categoria: document.getElementById("categoriaMultijugador").value,
        dificultad: document.getElementById("dificultadMultijugador").value,
        tipoPartida: document.getElementById("tipoPartidaMultijugador").value // NUEVO
    });

    mostrar("multijugador-crear");
}

function mostrarUnirseSala() {
    soyCreador = false;
    mostrar("multijugador-unirse");
}

function volverPrincipal() {
    if (salaActual) {
        socket.emit("abandonarSala", salaActual);
        salaActual = null;
    }
    mostrar("pantalla-principal");
}

function volverMultijugadorPrincipal() {
    if (salaActual) {
        socket.emit("abandonarSala", salaActual);
        salaActual = null;
    }
    mostrar("multijugador-nombre");
}

function volverElegirMultijugador() {
    if (salaActual) {
        socket.emit("abandonarSala", salaActual);
        salaActual = null;
    }
    mostrar("multijugador-elegir");
}

function generarCodigoSala() {
    const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let codigo = "";
    for (let i = 0; i < 5; i++) {
        codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return codigo;
}

function actualizarDificultadMultijugador() {
    const categoria = document.getElementById("categoriaMultijugador").value;
    const dificultadContainer = document.getElementById("dificultadContainerMultijugador");
    const selectDificultad = document.getElementById("dificultadMultijugador");

    const sinDificultad = ["Objetos", "Animales", "Personas", "ClashRoyale"];

    if (sinDificultad.includes(categoria)) {
        dificultadContainer.style.display = "none";
    } else {
        dificultadContainer.style.display = "block";
        if (!selectDificultad.value) {
            selectDificultad.value = "Fácil";
        }
    }
}

function actualizarImpostoresMultijugador() {
    const cantidadJugadores = parseInt(document.getElementById("cantidadJugadoresMultijugador").value);
    const selectImpostores = document.getElementById("cantidadImpostoresMultijugador");

    selectImpostores.innerHTML = "";
    const maxImpostores = Math.min(Math.floor(cantidadJugadores / 3), cantidadJugadores - 1);

    for (let i = 1; i <= maxImpostores; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        selectImpostores.appendChild(option);
    }

    selectImpostores.value = Math.min(1, maxImpostores);
}

function unirseSala() {
    const codigo = document.getElementById("codigoSalaUnirse").value.trim().toUpperCase();

    if (!codigo) {
        alert("Ingresa el código de la sala");
        return;
    }

    if (codigo.length !== 5) {
        alert("El código debe tener 5 caracteres");
        return;
    }

    socket.emit("unirseSala", { 
        sala: codigo, 
        nombre: nombreJugador 
    });
}

function iniciarJuegoMultijugador() {
    console.log("Iniciando juego en sala:", salaActual);
    if (!salaActual) {
        alert("No hay sala activa");
        return;
    }

    const btn = document.getElementById("btnIniciarJuego");
    btn.disabled = true;
    btn.textContent = "Iniciando...";

    setTimeout(() => {
        btn.disabled = false;
        btn.textContent = "🚀 Iniciar Juego";
    }, 2000);

    socket.emit("iniciarJuego", salaActual);
}

function verPalabraMultijugador() {
    console.log("Solicitando palabra para sala:", salaActual);
    if (!salaActual) return;
    socket.emit("verPalabra", salaActual);
}

function marcarListo() {
    if (!salaActual) return;

    console.log("Marcando como listo en sala:", salaActual);
    socket.emit("marcarListo", salaActual);
    document.getElementById("btnListoMultijugador").disabled = true;
    document.getElementById("btnListoMultijugador").textContent = "✅ Listo";
}

function votarImpostor() {
    if (!salaActual) return;
    console.log("Votando impostor en sala:", salaActual);
    socket.emit("votarImpostor", salaActual);
}

function volveraJugarMultijugador() {
    if (!salaActual) return;
    console.log("Volviendo a jugar en sala:", salaActual);
    socket.emit("volverAJugar", salaActual);
}

function volverConfiguracionMultijugador() {
    if (!salaActual) return;
    console.log("Volviendo a configuración en sala:", salaActual);
    socket.emit("volverConfiguracion", salaActual);
}

// ========== FUNCIONES PARA VOTACIÓN MULTIJUGADOR ==========

function procesarVotoMultijugador() {
    if (!votacionMultijugador.jugadorSeleccionadoVoto) {
        alert("Selecciona un jugador para votar");
        return;
    }
    
    if (!salaActual) return;
    
    console.log("Votando a:", votacionMultijugador.jugadorSeleccionadoVoto.nombre);
    socket.emit("votarJugador", {
        sala: salaActual,
        jugadorId: votacionMultijugador.jugadorSeleccionadoVoto.id
    });
    
    document.getElementById("btnVotarMultijugador").disabled = true;
    document.getElementById("btnVotarMultijugador").textContent = "Votado ✓";
    votacionMultijugador.votoRealizado = true;
}

function confirmarSalirSala() {
    document.getElementById("confirmModal").classList.remove("hidden");
}

function confirmSalir(ok) {
    document.getElementById("confirmModal").classList.add("hidden");

    if (ok) {
        if (salaActual) {
            socket.emit("abandonarSala", salaActual);
            salaActual = null;
        }
        mostrar("pantalla-principal");
    }
}

// ========== SOCKET EVENTOS ==========

socket.on("connect", () => {
    console.log("Conectado al servidor");
});

socket.on("connect_error", (error) => {
    console.error("Error de conexión:", error);
    alert("No se pudo conectar al servidor. Revisa tu conexión.");
});

socket.on("disconnect", () => {
    console.log("Desconectado del servidor");
});

socket.on("salaCreada", (data) => {
    console.log("Sala creada:", data.sala);
    actualizarLobbyCreador(data);
});

socket.on("salaUnida", (data) => {
    console.log("Unido a sala:", data.sala);
    salaActual = data.sala;
    soyCreador = false;
    actualizarLobbyUnido(data);
});

socket.on("errorUnirse", (msg) => {
    alert("Error: " + msg);
});

socket.on("error", (msg) => {
    alert("Error: " + msg);
    document.getElementById("btnIniciarJuego").disabled = false;
    document.getElementById("btnIniciarJuego").textContent = "🚀 Iniciar Juego";
});

socket.on("jugadoresActualizados", (data) => {
    console.log("Jugadores actualizados en sala:", data.sala);
    if (soyCreador) {
        actualizarLobbyCreador(data);
    } else {
        actualizarLobbyUnido(data);
    }
});

socket.on("configuracionModificada", (data) => {
    if (soyCreador) {
        document.getElementById("cantidadJugadoresMultijugador").value = data.maxJugadores;
        document.getElementById("categoriaMultijugador").value = data.categoria;
        document.getElementById("tipoPartidaMultijugador").value = data.tipoPartida;
        actualizarImpostoresMultijugador();
        document.getElementById("cantidadImpostoresMultijugador").value = data.impostores;
        if (data.dificultad) {
            document.getElementById("dificultadMultijugador").value = data.dificultad;
        }
        document.getElementById("maxJugadoresDisplay").textContent = data.maxJugadores;
    }
});

socket.on("irPantallaVerPalabra", (data) => {
    console.log("Yendo a pantalla de ver palabra en sala:", data.sala);
    categoriaActual = data.categoria;
    dificultadActual = data.dificultad || "";
    tipoPartida = data.tipoPartida || "amistoso";
    salaActual = data.sala;
    palabraActualMultijugador = data.palabra;

    document.getElementById("tituloJugadorMultijugadorVer").textContent = `ID: ${salaActual}`;
    document.getElementById("nombreJugadorMultijugadorVer").textContent = nombreJugador;
    document.getElementById("categoriaJugadorMultijugadorVer").textContent = categoriaActual;
    document.getElementById("tipoPartidaDisplayVer").textContent = 
        tipoPartida === "amistoso" ? "Amistoso" : "Con Votación";

    const sinDificultad = ["Objetos", "Animales", "Personas", "ClashRoyale"];
    if (sinDificultad.includes(categoriaActual) || !dificultadActual) {
        document.getElementById("dificultadJugadorMultijugadorVer").textContent = "No aplica";
    } else {
        document.getElementById("dificultadJugadorMultijugadorVer").textContent = dificultadActual;
    }

    document.getElementById("impostoresJugadorMultijugadorVer").textContent = data.impostores;
    document.getElementById("totalJugadoresMultijugadorVer").textContent = data.totalJugadores;

    document.getElementById("btnVerPalabraMultijugador").disabled = false;
    document.getElementById("btnVerPalabraMultijugador").textContent = "👁️ Ver";

    mostrar("multijugador-ver-palabra");
});

socket.on("resultadoPalabra", (data) => {
    console.log("Recibiendo palabra para jugador");
    miRol = data.rol;

    document.getElementById("tituloJugadorMultijugadorRevelado").textContent = `ID: ${salaActual}`;
    document.getElementById("nombreJugadorMultijugadorRevelado").textContent = nombreJugador;
    document.getElementById("categoriaJugadorMultijugadorRevelado").textContent = categoriaActual;
    document.getElementById("tipoPartidaDisplayRevelado").textContent = 
        tipoPartida === "amistoso" ? "Amistoso" : "Con Votación";

    const sinDificultad = ["Objetos", "Animales", "Personas", "ClashRoyale"];
    if (sinDificultad.includes(categoriaActual) || !dificultadActual) {
        document.getElementById("dificultadJugadorMultijugadorRevelado").textContent = "No aplica";
    } else {
        document.getElementById("dificultadJugadorMultijugadorRevelado").textContent = dificultadActual;
    }

    document.getElementById("impostoresJugadorMultijugadorRevelado").textContent = data.impostores;
    document.getElementById("totalJugadoresMultijugadorRevelado").textContent = data.totalJugadores;

    const palabraElem = document.getElementById("textoPalabraRevelada");

    if (data.rol === "IMPOSTOR") {
        palabraElem.textContent = "IMPOSTOR";
        palabraElem.className = "palabra-display palabra-impostor";
    } else {
        palabraElem.textContent = data.palabra;
        palabraElem.className = "palabra-display palabra-inocente";
    }

    document.getElementById("btnListoMultijugador").disabled = false;
    document.getElementById("btnListoMultijugador").textContent = "✅ Listo";
    document.getElementById("btnListoMultijugador").style.display = "block";

    mostrar("multijugador-palabra-revelada");
});

socket.on("todosListos", (data) => {
    console.log("Estado de listos:", data);

    if (data.todosListos) {
        console.log("TODOS están listos en sala:", salaActual);
        palabraActualMultijugador = data.palabra;
        
        if (tipoPartida === "amistoso") {
            mostrar("multijugador-final-amistoso");
            document.getElementById("codigoTextoFinalAmistoso").textContent = salaActual;

            if (soyCreador) {
                document.getElementById("opcionesCreadorAmistoso").style.display = "flex";
            } else {
                document.getElementById("opcionesCreadorAmistoso").style.display = "none";
            }

            document.getElementById("impostorReveladoMultijugadorAmistoso").classList.add("hidden");
            document.getElementById("palabraReveladaMultijugadorAmistoso").classList.add("hidden");

            document.getElementById("btnVotarImpostorAmistoso").style.display = "block";
            document.getElementById("btnVotarImpostorAmistoso").disabled = false;
            document.getElementById("btnVotarImpostorAmistoso").textContent = "🔍 Revelar Impostor y Palabra";
        } else {
            // Modo con votación
            socket.emit("iniciarVotacion", salaActual);
        }
    }
});

socket.on("impostorRevelado", (data) => {
    console.log("Impostor(es) revelado(s):", data.impostores);
    palabraActualMultijugador = data.palabra;

    let impostoresTexto = "";

    if (data.impostores.length === 1) {
        impostoresTexto = `Jugador ${data.impostores[0].posicion}: ${data.impostores[0].nombre}`;
        document.getElementById("impostorTituloMultijugadorAmistoso").textContent = "👤 El impostor es:";
    } else {
        const impostoresList = data.impostores.map(i => `Jugador ${i.posicion}: ${i.nombre}`).join("<br>");
        impostoresTexto = impostoresList;
        document.getElementById("impostorTituloMultijugadorAmistoso").textContent = "👤 Los impostores son:";
    }

    document.getElementById("impostorReveladoTextoMultijugadorAmistoso").innerHTML = impostoresTexto;

    if (data.palabra) {
        document.getElementById("palabraReveladaTextoMultijugadorAmistoso").textContent = data.palabra;
        document.getElementById("palabraReveladaMultijugadorAmistoso").classList.remove("hidden");
    }

    document.getElementById("impostorReveladoMultijugadorAmistoso").classList.remove("hidden");
    document.getElementById("btnVotarImpostorAmistoso").style.display = "none";
});

socket.on("iniciarVotacionMultijugador", (data) => {
    console.log("Iniciando votación multijugador:", data);
    mostrar("multijugador-votacion");
    
    // Actualizar lista de eliminados
    actualizarListaEliminadosMultijugador(data);
    
    // Actualizar puntuación
    actualizarPuntuacionMultijugador(data);
    
    // Crear lista de votación
    const listaVotacion = document.getElementById("listaVotacionMultijugador");
    listaVotacion.innerHTML = "";
    
    data.jugadoresVivos.forEach((jugador, index) => {
        const div = document.createElement("div");
        div.className = "jugador-lista";
        div.style.cursor = "pointer";
        div.style.padding = "10px";
        div.style.margin = "5px 0";
        div.style.borderRadius = "5px";
        div.style.border = "1px solid #333";
        div.style.backgroundColor = "#222";
        div.style.transition = "all 0.2s";
        
        div.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <span>${jugador.nombre}</span>
                <span id="checkVotoMultijugador${index}" style="color: #4CAF50; display: none;">✓</span>
            </div>
        `;
        
        div.addEventListener("click", () => {
            if (votacionMultijugador.votoRealizado) return;
            
            // Deseleccionar todos
            document.querySelectorAll("#listaVotacionMultijugador > div").forEach(item => {
                item.style.backgroundColor = "#222";
                item.style.borderColor = "#333";
                const check = item.querySelector("span[id^='checkVotoMultijugador']");
                if (check) check.style.display = "none";
            });
            
            // Seleccionar este
            div.style.backgroundColor = "#2a2a2a";
            div.style.borderColor = "#4CAF50";
            document.getElementById(`checkVotoMultijugador${index}`).style.display = "inline";
            
            // Habilitar botón de votar
            document.getElementById("btnVotarMultijugador").disabled = false;
            votacionMultijugador.jugadorSeleccionadoVoto = jugador;
        });
        
        listaVotacion.appendChild(div);
    });
    
    // Resetear estado de voto
    votacionMultijugador.jugadorSeleccionadoVoto = null;
    votacionMultijugador.votoRealizado = false;
    document.getElementById("btnVotarMultijugador").disabled = true;
    document.getElementById("btnVotarMultijugador").textContent = "🗳️ Votar";
    
    // Actualizar estado de votación
    document.getElementById("estadoVotacionMultijugador").textContent = 
        `Esperando votos... (${data.votosRealizados}/${data.totalJugadores})`;
});

socket.on("actualizarVotacionMultijugador", (data) => {
    document.getElementById("estadoVotacionMultijugador").textContent = 
        `Votos: ${data.votosRealizados}/${data.totalJugadores}`;
});

socket.on("resultadoVotacionMultijugador", (data) => {
    console.log("Resultado votación:", data);
    
    const resultadoDiv = document.getElementById("resultadoVotacionMultijugador");
    const opcionesDiv = document.getElementById("opcionesVotacionMultijugador");
    
    if (data.jugadorEliminado) {
        if (data.esImpostor) {
            // Se encontró al impostor
            resultadoDiv.innerHTML = `
                <div style="text-align: center;">
                    <div style="font-size: 24px; color: #ff3333; margin-bottom: 10px;">🎉 ¡IMPOSTOR ENCONTRADO!</div>
                    <div style="font-size: 18px; color: white; margin-bottom: 15px;">El impostor era: <strong>${data.jugadorEliminado.nombre}</strong></div>
                    <div style="font-size: 18px; color: #4CAF50; margin-bottom: 15px;">La palabra era: <strong>${data.palabra}</strong></div>
                    <div style="font-size: 16px; color: #ccc;">Puntuación final del impostor: <strong>${data.puntuacionImpostor} puntos</strong></div>
                </div>
            `;
        } else {
            // Se eliminó a un inocente
            resultadoDiv.innerHTML = `
                <div style="text-align: center;">
                    <div style="font-size: 24px; color: #ff3333; margin-bottom: 10px;">❌ ¡ERROR!</div>
                    <div style="font-size: 18px; color: white; margin-bottom: 15px;">Se eliminó a: <strong>${data.jugadorEliminado.nombre}</strong> (INOCENTE)</div>
                    <div style="font-size: 16px; color: #ffcc00;">El impostor gana ${data.puntosGanados} punto${data.puntosGanados > 1 ? 's' : ''}</div>
                    <div style="font-size: 16px; color: #ccc; margin-top: 10px;">Puntuación actual: <strong>${data.puntuacionImpostor} puntos</strong></div>
                    <div style="margin-top: 15px; color: #777;">Quedan ${data.jugadoresRestantes} jugadores vivos</div>
                </div>
            `;
        }
    }
    
    if (data.juegoTerminado) {
        opcionesDiv.innerHTML = `
            <button onclick="volveraJugarMultijugador()">VOLVER A JUGAR</button>
            <button onclick="volverConfiguracionMultijugador()">CONFIGURACIÓN</button>
        `;
    } else {
        opcionesDiv.innerHTML = `
            <button onclick="socket.emit('continuarVotacion', '${salaActual}')">CONTINUAR VOTACIÓN</button>
        `;
    }
    
    mostrar("multijugador-resultado-votacion");
});

socket.on("juegoReiniciado", () => {
    console.log("Juego reiniciado en sala:", salaActual);
});

socket.on("volverConfiguracionSala", () => {
    console.log("Volviendo a configuración de sala:", salaActual);
    if (soyCreador) {
        mostrar("multijugador-crear");
    } else {
        mostrar("multijugador-sala-unido");
    }
});

socket.on("salaEliminada", () => {
    alert("El creador ha abandonado la sala. Todos serán desconectados.");
    salaActual = null;
    mostrar("pantalla-principal");
});

function actualizarLobbyCreador(data) {
    console.log("Actualizando lobby creador para sala:", data.sala);
    document.getElementById("codigoSalaCreador").textContent = data.sala;
    document.getElementById("jugadoresActuales").textContent = data.jugadores.length;
    document.getElementById("maxJugadoresDisplay").textContent = data.maxJugadores;

    const lista = document.getElementById("listaJugadoresLobby");
    lista.innerHTML = "";

    data.jugadores.forEach((jugador) => {
        const div = document.createElement("div");
        div.className = "jugador-lista";

        let jugadorTexto = `Jugador ${jugador.posicion}: ${jugador.nombre}`;

        if (jugador.id === data.creador) {
            const creadorSpan = document.createElement("span");
            creadorSpan.className = "creador-indicator";
            creadorSpan.textContent = "(Creador)";

            div.textContent = jugadorTexto;
            div.appendChild(document.createTextNode(" "));
            div.appendChild(creadorSpan);
        } else {
            div.textContent = jugadorTexto;
        }

        lista.appendChild(div);
    });

    const btnIniciar = document.getElementById("btnIniciarJuego");
    const puedeIniciar = data.jugadores.length === data.maxJugadores;
    btnIniciar.disabled = !puedeIniciar;

    console.log(`Puede iniciar: ${puedeIniciar} (${data.jugadores.length}/${data.maxJugadores} jugadores)`);
}

function actualizarLobbyUnido(data) {
    console.log("Actualizando lobby unido para sala:", data.sala);
    document.getElementById("codigoSalaUnido").textContent = data.sala;
    document.getElementById("jugadoresActualesUnido").textContent = data.jugadores.length;
    document.getElementById("maxJugadoresDisplayUnido").textContent = data.maxJugadores;

    const configResumen = document.getElementById("configResumen");
    let configHTML = `
        <div style="margin-bottom: 8px;">Tipo: ${data.tipoPartida === "amistoso" ? "Amistoso" : "Con Votación"}</div>
        <div style="margin-bottom: 8px;">Jugadores: ${data.jugadores.length} / ${data.maxJugadores}</div>
        <div style="margin-bottom: 8px;">Impostores: ${data.impostores}</div>
        <div style="margin-bottom: 8px;">Categoría: ${data.categoria}</div>
    `;

    const sinDificultad = ["Objetos", "Animales", "Personas", "ClashRoyale"];
    if (data.dificultad && !sinDificultad.includes(data.categoria)) {
        configHTML += `<div>Dificultad: ${data.dificultad}</div>`;
    }

    configResumen.innerHTML = configHTML;

    const lista = document.getElementById("listaJugadoresUnido");
    lista.innerHTML = "";

    data.jugadores.forEach((jugador) => {
        const div = document.createElement("div");
        div.className = "jugador-lista";

        let jugadorTexto = `Jugador ${jugador.posicion}: ${jugador.nombre}`;

        if (jugador.id === data.creador) {
            const creadorSpan = document.createElement("span");
            creadorSpan.className = "creador-indicator";
            creadorSpan.textContent = "(Creador)";

            div.textContent = jugadorTexto;
            div.appendChild(document.createTextNode(" "));
            div.appendChild(creadorSpan);
        } else {
            div.textContent = jugadorTexto;
        }

        lista.appendChild(div);
    });

    mostrar("multijugador-sala-unido");
}

function actualizarListaEliminadosMultijugador(data) {
    const eliminados = data.jugadoresEliminados || [];
    const listaEliminados = document.getElementById("listaEliminadosMultijugador");
    const contador = document.getElementById("contadorEliminadosMultijugador");
    
    contador.textContent = eliminados.length;
    
    if (eliminados.length === 0) {
        listaEliminados.innerHTML = "<div style='color: #777; font-style: italic;'>Ningún jugador eliminado</div>";
    } else {
        listaEliminados.innerHTML = eliminados.map(j => 
            `<div style="margin: 5px 0; padding: 5px; background: rgba(255,0,0,0.1); border-radius: 3px;">${j.nombre}</div>`
        ).join("");
    }
}

function actualizarPuntuacionMultijugador(data) {
    document.getElementById("puntuacionMultijugador").textContent = 
        `Impostor: ${data.puntuacionImpostor || 0} puntos`;
}

// ========== EVENT LISTENERS ==========

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("cantidadJugadoresLocal")?.addEventListener("change", function() {
        actualizarImpostoresLocal();
    });

    document.getElementById("cantidadImpostoresLocal")?.addEventListener("change", function() {
        configLocal.impostores = parseInt(this.value);
    });

    document.getElementById("categoriaLocal")?.addEventListener("change", function() {
        actualizarDificultadLocal();
    });

    document.getElementById("tipoPartidaLocal")?.addEventListener("change", function() {
        configLocal.tipoPartida = this.value;
    });

    document.getElementById("cantidadJugadoresMultijugador")?.addEventListener("change", function() {
        actualizarImpostoresMultijugador();
        if (salaActual && soyCreador) {
            socket.emit("modificarConfiguracion", {
                sala: salaActual,
                maxJugadores: parseInt(this.value),
                impostores: parseInt(document.getElementById("cantidadImpostoresMultijugador").value),
                categoria: document.getElementById("categoriaMultijugador").value,
                dificultad: document.getElementById("dificultadMultijugador").value,
                tipoPartida: document.getElementById("tipoPartidaMultijugador").value
            });
        }
    });

    document.getElementById("cantidadImpostoresMultijugador")?.addEventListener("change", function() {
        if (salaActual && soyCreador) {
            socket.emit("modificarConfiguracion", {
                sala: salaActual,
                maxJugadores: parseInt(document.getElementById("cantidadJugadoresMultijugador").value),
                impostores: parseInt(this.value),
                categoria: document.getElementById("categoriaMultijugador").value,
                dificultad: document.getElementById("dificultadMultijugador").value,
                tipoPartida: document.getElementById("tipoPartidaMultijugador").value
            });
        }
    });

    document.getElementById("categoriaMultijugador")?.addEventListener("change", function() {
        actualizarDificultadMultijugador();
        if (salaActual && soyCreador) {
            socket.emit("modificarConfiguracion", {
                sala: salaActual,
                maxJugadores: parseInt(document.getElementById("cantidadJugadoresMultijugador").value),
                impostores: parseInt(document.getElementById("cantidadImpostoresMultijugador").value),
                categoria: this.value,
                dificultad: document.getElementById("dificultadMultijugador").value,
                tipoPartida: document.getElementById("tipoPartidaMultijugador").value
            });
        }
    });

    document.getElementById("dificultadMultijugador")?.addEventListener("change", function() {
        if (salaActual && soyCreador) {
            socket.emit("modificarConfiguracion", {
                sala: salaActual,
                maxJugadores: parseInt(document.getElementById("cantidadJugadoresMultijugador").value),
                impostores: parseInt(document.getElementById("cantidadImpostoresMultijugador").value),
                categoria: document.getElementById("categoriaMultijugador").value,
                dificultad: this.value,
                tipoPartida: document.getElementById("tipoPartidaMultijugador").value
            });
        }
    });

    document.getElementById("tipoPartidaMultijugador")?.addEventListener("change", function() {
        if (salaActual && soyCreador) {
            socket.emit("modificarConfiguracion", {
                sala: salaActual,
                maxJugadores: parseInt(document.getElementById("cantidadJugadoresMultijugador").value),
                impostores: parseInt(document.getElementById("cantidadImpostoresMultijugador").value),
                categoria: document.getElementById("categoriaMultijugador").value,
                dificultad: document.getElementById("dificultadMultijugador").value,
                tipoPartida: this.value
            });
        }
    });

    actualizarImpostoresLocal();
    actualizarDificultadLocal();
    actualizarImpostoresMultijugador();
    actualizarDificultadMultijugador();

    document.getElementById("nombreJugadorMultijugador")?.addEventListener("keypress", function(e) {
        if (e.key === "Enter") continuarMultijugador();
    });

    document.getElementById("codigoSalaUnirse")?.addEventListener("keypress", function(e) {
        if (e.key === "Enter") unirseSala();
    });
});
