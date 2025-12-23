const socket = io();

/* ---------------- VARIABLES GLOBALES ---------------- */
let nombreJugador = "";
let salaActual = null;
let categoriaActual = "";
let dificultadActual = "";
let miRol = null;
let soyCreador = false;

// Variables para modo LOCAL
let configLocal = {
    jugadores: [],
    categoria: "Objetos",
    dificultad: "Fácil",
    impostores: 1,
    maxJugadores: 4,
    palabraActual: "",
    jugadorActual: 0,
    roles: [],
    impostoresIndices: []  // CAMBIADO: Ahora es un array para múltiples impostores
};

// Configuración guardada
let configGuardada = null;

/* ---------------- UTILIDADES ---------------- */
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
        Animales: ["Abeja", "Águila", "Alce", "Anaconda", "Anguila", "Araña", "Ardilla", "Armadillo", "Atún", "Avestruz", ],
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

/* ---------------- PANTALLAS PRINCIPALES ---------------- */
function mostrarModo(modo) {
    if (modo === "local") {
        // Resetear configuración
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
            impostoresIndices: []  // CAMBIADO: Array vacío
        };

        // Establecer valores por defecto
        document.getElementById("cantidadJugadoresLocal").value = "4";
        document.getElementById("cantidadImpostoresLocal").value = "1";
        document.getElementById("categoriaLocal").value = "Objetos";

        // Ocultar dificultad inicialmente
        document.getElementById("dificultadContainerLocal").style.display = "none";
        document.getElementById("dificultadLocal").value = "Fácil";

        mostrar("pantalla-local-config");
    } else {
        // Limpiar código anterior
        document.getElementById("codigoSalaUnirse").value = "";
        mostrar("multijugador-nombre");
    }
}

/* ========== MODO LOCAL COMPLETO ========== */
function actualizarDificultadLocal() {
    const categoria = document.getElementById("categoriaLocal").value;
    const dificultadContainer = document.getElementById("dificultadContainerLocal");
    const selectDificultad = document.getElementById("dificultadLocal");

    // Categorías sin dificultad
    const sinDificultad = ["Objetos", "Animales", "Personas", "ClashRoyale"];

    if (sinDificultad.includes(categoria)) {
        dificultadContainer.style.display = "none";
    } else {
        dificultadContainer.style.display = "block";
        // Restablecer a Fácil por defecto
        selectDificultad.value = "Fácil";
        configLocal.dificultad = "Fácil";
    }
}

function actualizarImpostoresLocal() {
    const cantidadJugadores = parseInt(document.getElementById("cantidadJugadoresLocal").value);
    const selectImpostores = document.getElementById("cantidadImpostoresLocal");

    // Limpiar opciones
    selectImpostores.innerHTML = "";

    // Calcular máximo de impostores (1 por cada 3 jugadores)
    const maxImpostores = Math.min(Math.floor(cantidadJugadores / 3), 5);

    // Agregar opciones
    for (let i = 1; i <= maxImpostores; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        selectImpostores.appendChild(option);
    }

    // Establecer valor por defecto
    selectImpostores.value = Math.min(1, maxImpostores);
    configLocal.impostores = parseInt(selectImpostores.value);
}

function irNombresLocal() {
    const cantidad = parseInt(document.getElementById("cantidadJugadoresLocal").value);
    const impostores = parseInt(document.getElementById("cantidadImpostoresLocal").value);
    const categoria = document.getElementById("categoriaLocal").value;
    const dificultad = document.getElementById("dificultadLocal").value;

    // Validar
    if (cantidad < 3 || cantidad > 15) {
        alert("La cantidad debe estar entre 3 y 15 jugadores");
        return;
    }

    // Guardar configuración
    configLocal.maxJugadores = cantidad;
    configLocal.impostores = impostores;
    configLocal.categoria = categoria;
    configLocal.dificultad = dificultad;

    // Crear array de jugadores (usar guardados si existen)
    configLocal.jugadores = [];

    // Si hay configuración guardada, usar esos nombres
    if (configGuardada && configGuardada.jugadores) {
        for (let i = 0; i < cantidad; i++) {
            if (i < configGuardada.jugadores.length) {
                configLocal.jugadores.push({
                    nombre: configGuardada.jugadores[i].nombre,
                    id: i
                });
            } else {
                configLocal.jugadores.push({
                    nombre: `Jugador ${i + 1}`,
                    id: i
                });
            }
        }
    } else {
        for (let i = 0; i < cantidad; i++) {
            configLocal.jugadores.push({
                nombre: `Jugador ${i + 1}`,
                id: i
            });
        }
    }

    // Mostrar campos para nombres
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
    // Actualizar nombres si se cambiaron
    document.querySelectorAll('.nombre-jugador-local').forEach(input => {
        const index = parseInt(input.getAttribute('data-index'));
        const nombre = input.value.trim() || `Jugador ${index + 1}`;
        configLocal.jugadores[index].nombre = nombre;
    });

    // Generar palabra
    configLocal.palabraActual = generarPalabraLocal(configLocal.categoria, configLocal.dificultad);

    // Asignar roles aleatorios
    asignarRolesLocales();

    // Mostrar primer jugador
    configLocal.jugadorActual = 0;
    mostrarJugadorLocal();
}

function asignarRolesLocales() {
    // Inicializar todos como inocentes
    configLocal.roles = new Array(configLocal.jugadores.length).fill("INOCENTE");
    configLocal.impostoresIndices = [];  // Reiniciar array de impostores

    // Seleccionar impostores aleatorios
    let indices = Array.from({length: configLocal.jugadores.length}, (_, i) => i);

    // Mezclar indices
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    // Asignar impostores (CORREGIDO: Guardar TODOS los índices de impostores)
    for (let i = 0; i < configLocal.impostores; i++) {
        const impostorIndex = indices[i];
        configLocal.roles[impostorIndex] = "IMPOSTOR";
        configLocal.impostoresIndices.push(impostorIndex);  // Guardar índice en el array
    }
}

function mostrarJugadorLocal() {
    const jugador = configLocal.jugadores[configLocal.jugadorActual];

    // Actualizar elementos
    document.getElementById("tituloJugadorLocal").textContent = `Turno del Jugador ${configLocal.jugadorActual + 1}`;
    document.getElementById("nombreJugadorLocal").textContent = jugador.nombre;
    document.getElementById("categoriaNombreLocal").textContent = configLocal.categoria;
    document.getElementById("dificultadNombreLocal").textContent = configLocal.dificultad;
    document.getElementById("impostoresNombreLocal").textContent = configLocal.impostores;
    document.getElementById("totalJugadoresLocal").textContent = configLocal.maxJugadores;

    // Mostrar u ocultar dificultad según categoría
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

    // Actualizar elementos
    document.getElementById("tituloJugadorPalabra").textContent = `Turno del Jugador ${configLocal.jugadorActual + 1}`;
    document.getElementById("nombreJugadorPalabra").textContent = jugador.nombre;
    document.getElementById("categoriaPalabra").textContent = configLocal.categoria;
    document.getElementById("dificultadPalabra").textContent = configLocal.dificultad;
    document.getElementById("impostoresPalabra").textContent = configLocal.impostores;
    document.getElementById("totalJugadoresPalabra").textContent = configLocal.maxJugadores;

    // Mostrar u ocultar dificultad según categoría
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

    // Mostrar botón correcto
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
    mostrar("pantalla-local-final");
    // Ocultar revelación del impostor y palabra
    document.getElementById("impostorRevelado").classList.add("hidden");
    document.getElementById("palabraReveladaLocal").classList.add("hidden");
}

function revelarImpostorLocal() {
    // CORREGIDO: Obtener TODOS los impostores
    const impostores = configLocal.impostoresIndices.map(index => configLocal.jugadores[index]);

    let impostoresTexto = "";

    if (impostores.length === 1) {
        // Un solo impostor
        impostoresTexto = impostores[0].nombre;
        document.getElementById("impostorTituloLocal").textContent = "EL IMPOSTOR ES:";
    } else {
        // Múltiples impostores
        const nombresImpostores = impostores.map((imp, i) => `Impostor ${i + 1}: ${imp.nombre}`).join("<br>");
        impostoresTexto = nombresImpostores;
        document.getElementById("impostorTituloLocal").textContent = "LOS IMPOSTORES SON:";
    }

    // Mostrar impostor(es)
    document.getElementById("impostorReveladoTexto").innerHTML = impostoresTexto;
    document.getElementById("impostorRevelado").classList.remove("hidden");

    // Mostrar palabra
    document.getElementById("palabraReveladaTexto").textContent = configLocal.palabraActual;
    document.getElementById("palabraReveladaLocal").classList.remove("hidden");

    // Ocultar botón de revelar
    document.querySelector("#pantalla-local-final .revelar-container button").style.display = "none";
}

function volveraJugarLocal() {
    // Regenerar palabra
    configLocal.palabraActual = generarPalabraLocal(configLocal.categoria, configLocal.dificultad);

    // Reasignar roles aleatorios
    asignarRolesLocales();

    // Reiniciar jugador actual
    configLocal.jugadorActual = 0;

    // Ocultar revelación
    document.getElementById("impostorRevelado").classList.add("hidden");
    document.getElementById("palabraReveladaLocal").classList.add("hidden");

    // Mostrar botón de revelar
    document.querySelector("#pantalla-local-final .revelar-container button").style.display = "block";

    // Mostrar primer jugador
    mostrarJugadorLocal();
}

function volverConfiguracionLocal() {
    // Guardar configuración actual con nombres
    configGuardada = {
        maxJugadores: configLocal.maxJugadores,
        impostores: configLocal.impostores,
        categoria: configLocal.categoria,
        dificultad: configLocal.dificultad,
        jugadores: [...configLocal.jugadores]
    };

    // Restaurar valores guardados
    if (configGuardada) {
        document.getElementById("cantidadJugadoresLocal").value = configGuardada.maxJugadores;
        document.getElementById("categoriaLocal").value = configGuardada.categoria;

        // Actualizar opciones de impostores
        actualizarImpostoresLocal();

        // Establecer impostores guardados
        document.getElementById("cantidadImpostoresLocal").value = configGuardada.impostores;
        configLocal.impostores = configGuardada.impostores;
    }

    mostrar("pantalla-local-config");
}

/* ========== MODO MULTIJUGADOR ========== */
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

    // Generar código de sala
    const codigo = generarCodigoSala();
    document.getElementById("codigoSalaCreador").textContent = codigo;
    salaActual = codigo;

    // Actualizar select de impostores y dificultad
    actualizarImpostoresMultijugador();
    actualizarDificultadMultijugador();

    // Limpiar lista de jugadores
    document.getElementById("listaJugadoresLobby").innerHTML = "";
    document.getElementById("jugadoresActuales").textContent = "0";

    // Crear sala en servidor
    socket.emit("crearSala", {
        nombre: nombreJugador,
        codigo: codigo,
        maxJugadores: parseInt(document.getElementById("cantidadJugadoresMultijugador").value),
        impostores: parseInt(document.getElementById("cantidadImpostoresMultijugador").value),
        categoria: document.getElementById("categoriaMultijugador").value,
        dificultad: document.getElementById("dificultadMultijugador").value
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

    // Categorías sin dificultad
    const sinDificultad = ["Objetos", "Animales", "Personas", "ClashRoyale"];

    if (sinDificultad.includes(categoria)) {
        dificultadContainer.style.display = "none";
        // NO cambiar el valor, solo ocultar
    } else {
        dificultadContainer.style.display = "block";
        // Solo establecer valor si está vacío
        if (!selectDificultad.value) {
            selectDificultad.value = "Fácil";
        }
    }
}

function actualizarImpostoresMultijugador() {
    const cantidadJugadores = parseInt(document.getElementById("cantidadJugadoresMultijugador").value);
    const selectImpostores = document.getElementById("cantidadImpostoresMultijugador");

    // Limpiar opciones
    selectImpostores.innerHTML = "";

    // Calcular máximo de impostores (1 por cada 3 jugadores)
    const maxImpostores = Math.floor(cantidadJugadores / 3);

    // Agregar opciones
    for (let i = 1; i <= maxImpostores; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        selectImpostores.appendChild(option);
    }

    // Establecer valor por defecto
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

    // Deshabilitar botón momentáneamente
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

/* ---------------- SALIR / CONFIRM ---------------- */
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

/* ------------------- SOCKET EVENTS ------------------- */
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
        // Actualizar selects con la nueva configuración
        document.getElementById("cantidadJugadoresMultijugador").value = data.maxJugadores;
        document.getElementById("categoriaMultijugador").value = data.categoria;

        // Actualizar impostores
        actualizarImpostoresMultijugador();
        document.getElementById("cantidadImpostoresMultijugador").value = data.impostores;

        // Actualizar dificultad
        if (data.dificultad) {
            document.getElementById("dificultadMultijugador").value = data.dificultad;
        }

        // Actualizar display
        document.getElementById("maxJugadoresDisplay").textContent = data.maxJugadores;
    }
});

socket.on("irPantallaVerPalabra", (data) => {
    console.log("Yendo a pantalla de ver palabra en sala:", data.sala);
    categoriaActual = data.categoria;
    dificultadActual = data.dificultad || "";
    salaActual = data.sala;

    // Actualizar elementos
    document.getElementById("tituloJugadorMultijugadorVer").textContent = `ID: ${salaActual}`;
    document.getElementById("nombreJugadorMultijugadorVer").textContent = nombreJugador;
    document.getElementById("categoriaJugadorMultijugadorVer").textContent = categoriaActual;

    // Mostrar "No aplica" para categorías sin dificultad
    const sinDificultad = ["Objetos", "Animales", "Personas", "ClashRoyale"];
    if (sinDificultad.includes(categoriaActual) || !dificultadActual) {
        document.getElementById("dificultadJugadorMultijugadorVer").textContent = "No aplica";
    } else {
        document.getElementById("dificultadJugadorMultijugadorVer").textContent = dificultadActual;
    }

    document.getElementById("impostoresJugadorMultijugadorVer").textContent = data.impostores;
    document.getElementById("totalJugadoresMultijugadorVer").textContent = data.totalJugadores;

    // Resetear botón de ver
    document.getElementById("btnVerPalabraMultijugador").disabled = false;
    document.getElementById("btnVerPalabraMultijugador").textContent = "👁️ Ver";

    mostrar("multijugador-ver-palabra");
});

socket.on("resultadoPalabra", (data) => {
    console.log("Recibiendo palabra para jugador");
    miRol = data.rol;

    // Actualizar elementos
    document.getElementById("tituloJugadorMultijugadorRevelado").textContent = `ID: ${salaActual}`;
    document.getElementById("nombreJugadorMultijugadorRevelado").textContent = nombreJugador;
    document.getElementById("categoriaJugadorMultijugadorRevelado").textContent = categoriaActual;

    // Mostrar "No aplica" para categorías sin dificultad
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

    // Resetear botón de listo
    document.getElementById("btnListoMultijugador").disabled = false;
    document.getElementById("btnListoMultijugador").textContent = "✅ Listo";
    document.getElementById("btnListoMultijugador").style.display = "block";

    mostrar("multijugador-palabra-revelada");
});

socket.on("todosListos", (data) => {
    console.log("Estado de listos:", data);

    if (data.todosListos) {
        console.log("TODOS están listos en sala:", salaActual);
        // Mostrar pantalla final
        mostrar("multijugador-final");
        document.getElementById("codigoTextoFinal").textContent = salaActual;

        // Mostrar opciones del creador si es creador
        if (soyCreador) {
            document.getElementById("opcionesCreador").style.display = "flex";
        } else {
            document.getElementById("opcionesCreador").style.display = "none";
        }

        // Ocultar revelación del impostor y palabra
        document.getElementById("impostorReveladoMultijugador").classList.add("hidden");
        document.getElementById("palabraReveladaMultijugador").classList.add("hidden");

        // Mostrar botón de impostor para todos
        document.getElementById("btnVotarImpostor").style.display = "block";
        document.getElementById("btnVotarImpostor").disabled = false;
        document.getElementById("btnVotarImpostor").textContent = "🔍 Revelar Impostor";
    }
});

socket.on("impostorRevelado", (data) => {
    console.log("Impostor(es) revelado(s):", data.impostores);

    let impostoresTexto = "";

    if (data.impostores.length === 1) {
        // Un solo impostor
        impostoresTexto = `Jugador ${data.impostores[0].posicion}: ${data.impostores[0].nombre}`;
        document.getElementById("impostorTituloMultijugador").textContent = "👤 El impostor es:";
    } else {
        // Múltiples impostores
        const impostoresList = data.impostores.map(i => `Jugador ${i.posicion}: ${i.nombre}`).join("<br>");
        impostoresTexto = impostoresList;
        document.getElementById("impostorTituloMultijugador").textContent = "👤 Los impostores son:";
    }

    document.getElementById("impostorReveladoTextoMultijugador").innerHTML = impostoresTexto;

    // Mostrar palabra revelada
    if (data.palabra) {
        document.getElementById("palabraReveladaTextoMultijugador").textContent = data.palabra;
        document.getElementById("palabraReveladaMultijugador").classList.remove("hidden");
    }

    document.getElementById("impostorReveladoMultijugador").classList.remove("hidden");
    document.getElementById("btnVotarImpostor").style.display = "none";
});

socket.on("juegoReiniciado", () => {
    console.log("Juego reiniciado en sala:", salaActual);
    // El servidor enviará irPantallaVerPalabra automáticamente
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

/* ---------------- FUNCIONES AUXILIARES MULTIJUGADOR ---------------- */
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

    // Actualizar configuración
    const configResumen = document.getElementById("configResumen");
    let configHTML = `
        <div style="margin-bottom: 8px;">Jugadores: ${data.jugadores.length} / ${data.maxJugadores}</div>
        <div style="margin-bottom: 8px;">Impostores: ${data.impostores}</div>
        <div style="margin-bottom: 8px;">Categoría: ${data.categoria}</div>
    `;

    // Mostrar dificultad solo para categorías que la tienen
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

/* ---------------- INICIALIZACIÓN ---------------- */
document.addEventListener("DOMContentLoaded", () => {
    // Event listeners para modo local
    document.getElementById("cantidadJugadoresLocal")?.addEventListener("change", function() {
        actualizarImpostoresLocal();
    });

    document.getElementById("cantidadImpostoresLocal")?.addEventListener("change", function() {
        configLocal.impostores = parseInt(this.value);
    });

    document.getElementById("categoriaLocal")?.addEventListener("change", function() {
        actualizarDificultadLocal();
    });

    // Event listeners para modo multijugador
    document.getElementById("cantidadJugadoresMultijugador")?.addEventListener("change", function() {
        actualizarImpostoresMultijugador();
        if (salaActual && soyCreador) {
            socket.emit("modificarConfiguracion", {
                sala: salaActual,
                maxJugadores: parseInt(this.value),
                impostores: parseInt(document.getElementById("cantidadImpostoresMultijugador").value),
                categoria: document.getElementById("categoriaMultijugador").value,
                dificultad: document.getElementById("dificultadMultijugador").value
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
                dificultad: document.getElementById("dificultadMultijugador").value
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
                dificultad: document.getElementById("dificultadMultijugador").value
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
                dificultad: this.value
            });
        }
    });

    // Inicializar selects
    actualizarImpostoresLocal();
    actualizarDificultadLocal();
    actualizarImpostoresMultijugador();
    actualizarDificultadMultijugador();

    // Permitir Enter en inputs
    document.getElementById("nombreJugadorMultijugador")?.addEventListener("keypress", function(e) {
        if (e.key === "Enter") continuarMultijugador();
    });

    document.getElementById("codigoSalaUnirse")?.addEventListener("keypress", function(e) {
        if (e.key === "Enter") unirseSala();
    });
});
