const socket = io();

let nombreJugador = "";
let salaActual = null;
let categoriaActual = "";
let dificultadActual = "";
let miRol = null;
let soyCreador = false;
let palabraActualMultijugador = "";
let jugadoresEnSala = []; // Para la votación
let votoEmitido = false; // Control para evitar múltiples votos

let configLocal = {
    jugadores: [],
    categoria: "Objetos",
    dificultad: "Fácil",
    impostores: 1,
    maxJugadores: 4,
    palabraActual: "",
    jugadorActual: 0,
    roles: [],
    impostoresIndices: []
};

let configGuardada = null;

function ocultarTodas() {
    document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
    document.getElementById("confirmModal").classList.add("hidden");
    document.getElementById("modalVotacion").classList.add("hidden");
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
            impostoresIndices: []
        };

        document.getElementById("cantidadJugadoresLocal").value = "4";
        document.getElementById("cantidadImpostoresLocal").value = "1";
        document.getElementById("categoriaLocal").value = "Objetos";
        document.getElementById("dificultadContainerLocal").style.display = "none";
        document.getElementById("dificultadLocal").value = "Fácil";

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

    if (cantidad < 3 || cantidad > 15) {
        alert("La cantidad debe estar entre 3 y 15 jugadores");
        return;
    }

    configLocal.maxJugadores = cantidad;
    configLocal.impostores = impostores;
    configLocal.categoria = categoria;
    configLocal.dificultad = dificultad;

    configLocal.jugadores = [];

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
    mostrar("pantalla-local-final");
    document.getElementById("impostorRevelado").classList.add("hidden");
    document.getElementById("palabraReveladaLocal").classList.add("hidden");
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

    document.getElementById("impostorReveladoTexto").innerHTML = impostoresTexto;
    document.getElementById("impostorRevelado").classList.remove("hidden");

    document.getElementById("palabraReveladaTextoLocal").textContent = configLocal.palabraActual;
    document.getElementById("palabraReveladaLocal").classList.remove("hidden");

    document.querySelector("#pantalla-local-final .revelar-container button").style.display = "none";
}

function volveraJugarLocal() {
    configLocal.palabraActual = generarPalabraLocal(configLocal.categoria, configLocal.dificultad);
    asignarRolesLocales();
    configLocal.jugadorActual = 0;

    document.getElementById("impostorRevelado").classList.add("hidden");
    document.getElementById("palabraReveladaLocal").classList.add("hidden");
    document.querySelector("#pantalla-local-final .revelar-container button").style.display = "block";

    mostrarJugadorLocal();
}

function volverConfiguracionLocal() {
    configGuardada = {
        maxJugadores: configLocal.maxJugadores,
        impostores: configLocal.impostores,
        categoria: configLocal.categoria,
        dificultad: configLocal.dificultad,
        jugadores: [...configLocal.jugadores]
    };

    if (configGuardada) {
        document.getElementById("cantidadJugadoresLocal").value = configGuardada.maxJugadores;
        document.getElementById("categoriaLocal").value = configGuardada.categoria;
        actualizarImpostoresLocal();
        document.getElementById("cantidadImpostoresLocal").value = configGuardada.impostores;
        configLocal.impostores = configGuardada.impostores;
    }

    mostrar("pantalla-local-config");
}

// ========== MODO MULTIJUGADOR ==========

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

// ========== SISTEMA DE VOTACIÓN ==========

function mostrarVotacion() {
    if (!salaActual) return;
    
    votoEmitido = false;
    const modal = document.getElementById("modalVotacion");
    const listaVotacion = document.getElementById("listaVotacion");
    
    // Limpiar lista anterior
    listaVotacion.innerHTML = "";
    
    // Crear opciones de votación para cada jugador (excluyendo al propio jugador)
    jugadoresEnSala.forEach(jugador => {
        // No permitir votarse a sí mismo
        if (jugador.nombre === nombreJugador) return;
        
        const div = document.createElement("div");
        div.className = "opcion-voto";
        div.setAttribute("data-jugador-id", jugador.id);
        div.setAttribute("data-jugador-nombre", jugador.nombre);
        div.setAttribute("data-posicion", jugador.posicion);
        
        div.innerHTML = `
            <div class="voto-jugador-info">
                <span class="voto-numero">${jugador.posicion}</span>
                <span class="voto-nombre">${jugador.nombre}</span>
            </div>
            <div class="voto-selector">
                <div class="voto-circulo"></div>
            </div>
        `;
        
        div.addEventListener("click", function() {
            seleccionarVoto(this);
        });
        
        listaVotacion.appendChild(div);
    });
    
    // Añadir opción "Abstenerse"
    const abstencionDiv = document.createElement("div");
    abstencionDiv.className = "opcion-voto";
    abstencionDiv.setAttribute("data-jugador-id", "abstencion");
    abstencionDiv.setAttribute("data-jugador-nombre", "Abstenerse");
    
    abstencionDiv.innerHTML = `
        <div class="voto-jugador-info">
            <span class="voto-nombre" style="color: #888; font-style: italic;">No votar / Abstenerse</span>
        </div>
        <div class="voto-selector">
            <div class="voto-circulo"></div>
        </div>
    `;
    
    abstencionDiv.addEventListener("click", function() {
        seleccionarVoto(this);
    });
    
    listaVotacion.appendChild(abstencionDiv);
    
    // Resetear botón de confirmar
    document.getElementById("btnConfirmarVoto").disabled = true;
    document.getElementById("btnConfirmarVoto").textContent = "CONFIRMAR VOTO";
    
    // Mostrar modal
    modal.classList.remove("hidden");
}

function seleccionarVoto(elemento) {
    // Quitar selección de todos
    document.querySelectorAll(".opcion-voto").forEach(opcion => {
        opcion.classList.remove("seleccionado");
    });
    
    // Marcar como seleccionado
    elemento.classList.add("seleccionado");
    
    // Habilitar botón de confirmar
    document.getElementById("btnConfirmarVoto").disabled = false;
}

function confirmarVoto() {
    if (votoEmitido) {
        alert("Ya has emitido tu voto");
        return;
    }
    
    const opcionSeleccionada = document.querySelector(".opcion-voto.seleccionado");
    if (!opcionSeleccionada) {
        alert("Selecciona un jugador o abstente");
        return;
    }
    
    const jugadorId = opcionSeleccionada.getAttribute("data-jugador-id");
    const jugadorNombre = opcionSeleccionada.getAttribute("data-jugador-nombre");
    const posicion = opcionSeleccionada.getAttribute("data-posicion");
    
    console.log(`Votando por: ${jugadorNombre} (ID: ${jugadorId})`);
    
    // Enviar voto al servidor
    socket.emit("votarJugador", {
        sala: salaActual,
        jugadorVotadoId: jugadorId,
        jugadorVotadoNombre: jugadorNombre,
        posicion: posicion
    });
    
    // Deshabilitar botón y cambiar texto
    document.getElementById("btnConfirmarVoto").disabled = true;
    document.getElementById("btnConfirmarVoto").textContent = "✅ VOTO EMITIDO";
    
    // Marcar que ya votó
    votoEmitido = true;
    
    // Ocultar modal después de 1.5 segundos
    setTimeout(() => {
        document.getElementById("modalVotacion").classList.add("hidden");
        
        // Mostrar pantalla de espera de resultados
        mostrar("multijugador-esperando-votos");
        document.getElementById("codigoTextoEspera").textContent = salaActual;
    }, 1500);
}

function cancelarVoto() {
    document.getElementById("modalVotacion").classList.add("hidden");
}

function votarImpostor() {
    if (!salaActual) return;
    console.log("Iniciando votación en sala:", salaActual);
    
    // Mostrar pantalla de votación
    mostrar("multijugador-votacion");
    document.getElementById("codigoTextoVotacion").textContent = salaActual;
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

// ========== EVENTOS SOCKET.IO ==========

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
    jugadoresEnSala = data.jugadores;
    actualizarLobbyCreador(data);
});

socket.on("salaUnida", (data) => {
    console.log("Unido a sala:", data.sala);
    salaActual = data.sala;
    soyCreador = false;
    jugadoresEnSala = data.jugadores;
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
    jugadoresEnSala = data.jugadores;
    
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
    salaActual = data.sala;
    palabraActualMultijugador = data.palabra;

    document.getElementById("tituloJugadorMultijugadorVer").textContent = `ID: ${salaActual}`;
    document.getElementById("nombreJugadorMultijugadorVer").textContent = nombreJugador;
    document.getElementById("categoriaJugadorMultijugadorVer").textContent = categoriaActual;

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
        
        // Mostrar pantalla de votación
        mostrar("multijugador-votacion");
        document.getElementById("codigoTextoVotacion").textContent = salaActual;
        
        // Actualizar contador de votos
        document.getElementById("votosEmitidos").textContent = "0";
        document.getElementById("totalVotosEsperados").textContent = data.totalJugadores;
    }
});

// Evento cuando un jugador vota
socket.on("votoRegistrado", (data) => {
    console.log("Voto registrado:", data);
    
    // Actualizar contador en pantalla de votación
    if (document.getElementById("multijugador-votacion").classList.contains("hidden") === false) {
        document.getElementById("votosEmitidos").textContent = data.votosEmitidos;
    }
    
    // Actualizar contador en pantalla de espera
    if (document.getElementById("multijugador-esperando-votos").classList.contains("hidden") === false) {
        document.getElementById("votosEmitidosEspera").textContent = data.votosEmitidos;
        document.getElementById("totalVotosEspera").textContent = data.totalJugadores;
    }
});

// Evento cuando todos han votado
socket.on("todosVotaron", (data) => {
    console.log("Todos han votado:", data);
    
    // Mostrar resultados de la votación
    mostrarResultadosVotacion(data);
});

// Evento para mostrar resultados de votación
socket.on("mostrarResultadosVotacion", (data) => {
    mostrarResultadosVotacion(data);
});

function mostrarResultadosVotacion(data) {
    console.log("Mostrando resultados de votación:", data);
    
    // Actualizar datos en pantalla de resultados
    document.getElementById("codigoTextoResultados").textContent = salaActual;
    
    // Mostrar ganador de la votación
    const ganadorElem = document.getElementById("ganadorVotacion");
    
    if (data.ganadorVotacion === "abstencion" || data.ganadorVotacion === "empate") {
        ganadorElem.innerHTML = `
            <div class="resultado-titulo">RESULTADO DE VOTACIÓN</div>
            <div class="resultado-detalle" style="color: #888; font-style: italic;">
                ${data.ganadorVotacion === "abstencion" ? 
                    "La mayoría se abstuvo o no hubo consenso" : 
                    "¡Empate! No hay un sospechoso claro"}
            </div>
        `;
    } else {
        const jugadorGanador = data.detalleVotos.find(v => v.jugadorId === data.ganadorVotacion);
        if (jugadorGanador) {
            ganadorElem.innerHTML = `
                <div class="resultado-titulo">SOSPECHOSO ELEGIDO</div>
                <div class="resultado-detalle">
                    <div class="jugador-sospechoso">
                        <span class="sospechoso-posicion">${jugadorGanador.posicion}</span>
                        <span class="sospechoso-nombre">${jugadorGanador.nombre}</span>
                    </div>
                    <div class="votos-recibidos">Votos: ${jugadorGanador.votos}</div>
                </div>
            `;
        }
    }
    
    // Mostrar detalle de votos
    const detalleVotosElem = document.getElementById("detalleVotos");
    detalleVotosElem.innerHTML = "";
    
    data.detalleVotos.forEach(voto => {
        const div = document.createElement("div");
        div.className = "voto-detalle-item";
        
        div.innerHTML = `
            <div class="voto-detalle-info">
                <span class="voto-detalle-posicion">${voto.posicion}</span>
                <span class="voto-detalle-nombre">${voto.nombre}</span>
            </div>
            <div class="voto-detalle-cantidad">
                <span class="voto-contador">${voto.votos}</span>
                <span class="voto-texto">votos</span>
            </div>
        `;
        
        detalleVotosElem.appendChild(div);
    });
    
    // Mostrar pantalla de resultados
    mostrar("multijugador-resultados-votacion");
    
    // Si el creador, mostrar opciones adicionales
    if (soyCreador) {
        document.getElementById("opcionesCreadorResultados").style.display = "flex";
    } else {
        document.getElementById("opcionesCreadorResultados").style.display = "none";
    }
}

socket.on("impostorRevelado", (data) => {
    console.log("Impostor(es) revelado(s):", data.impostores);
    palabraActualMultijugador = data.palabra;

    let impostoresTexto = "";

    if (data.impostores.length === 1) {
        impostoresTexto = `Jugador ${data.impostores[0].posicion}: ${data.impostores[0].nombre}`;
        document.getElementById("impostorTituloMultijugador").textContent = "👤 El impostor es:";
    } else {
        const impostoresList = data.impostores.map(i => `Jugador ${i.posicion}: ${i.nombre}`).join("<br>");
        impostoresTexto = impostoresList;
        document.getElementById("impostorTituloMultijugador").textContent = "👤 Los impostores son:";
    }

    document.getElementById("impostorReveladoTextoMultijugador").innerHTML = impostoresTexto;

    if (data.palabra) {
        document.getElementById("palabraReveladaTextoMultijugador").textContent = data.palabra;
        document.getElementById("palabraReveladaMultijugador").classList.remove("hidden");
    }

    document.getElementById("impostorReveladoMultijugador").classList.remove("hidden");
    document.getElementById("btnVotarImpostor").style.display = "none";
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

// ========== FUNCIONES AUXILIARES ==========

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

    // Event listeners para votación
    document.getElementById("btnMostrarVotacion")?.addEventListener("click", mostrarVotacion);
    document.getElementById("btnConfirmarVoto")?.addEventListener("click", confirmarVoto);
    document.getElementById("btnCancelarVoto")?.addEventListener("click", cancelarVoto);
    document.getElementById("btnRevelarResultados")?.addEventListener("click", function() {
        if (!salaActual) return;
        socket.emit("revelarImpostor", salaActual);
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
