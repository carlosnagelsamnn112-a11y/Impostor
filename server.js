const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static(__dirname));

const salas = {};
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

// Función para obtener una palabra según categoría y dificultad
function generarPalabra(categoria, dificultad) {
    if (!categoria) return "Palabra";

    // Categorías sin dificultad
    const sinDificultad = ["Objetos", "Animales", "Personas", "ClashRoyale"];

    if (sinDificultad.includes(categoria)) {
        const lista = palabras[categoria] || palabras["Objetos"];
        return lista[Math.floor(Math.random() * lista.length)];
    } else {
        // Categorías con dificultad
        const dificultades = palabras[categoria];
        if (!dificultades) return "Palabra";

        if (dificultad && dificultades[dificultad]) {
            const lista = dificultades[dificultad];
            return lista[Math.floor(Math.random() * lista.length)];
        } else {
            // Si no hay dificultad específica, usar todas las palabras mezcladas
            const todas = [].concat(...Object.values(dificultades));
            return todas[Math.floor(Math.random() * todas.length)];
        }
    }
}

io.on("connection", socket => {
    console.log(`Usuario conectado: ${socket.id}`);

    /* ----- CREAR SALA ----- */
    socket.on("crearSala", data => {
        if (!data.nombre || !data.codigo) {
            socket.emit("error", "Datos incompletos");
            return;
        }

        // Verificar que el código no exista
        if (salas[data.codigo]) {
            socket.emit("error", "El código ya existe");
            return;
        }

        salas[data.codigo] = {
            creador: socket.id,
            maxJugadores: data.maxJugadores,
            impostores: data.impostores,
            categoria: data.categoria,
            dificultad: data.dificultad,
            jugadores: [{ id: socket.id, nombre: data.nombre, posicion: 1 }],
            palabra: null,
            listaParaVer: [],
            listos: [],
            votosImpostor: 0,
            roles: {},
            estado: "esperando"
        };

        socket.join(data.codigo);
        console.log(`Sala creada: ${data.codigo} por ${data.nombre}`);

        socket.emit("salaCreada", {
            sala: data.codigo,
            creador: socket.id,
            maxJugadores: data.maxJugadores,
            impostores: data.impostores,
            categoria: data.categoria,
            dificultad: data.dificultad,
            jugadores: salas[data.codigo].jugadores
        });
    });

    /* ----- MODIFICAR CONFIGURACIÓN ----- */
    socket.on("modificarConfiguracion", data => {
        const sala = salas[data.sala];
        if (!sala || socket.id !== sala.creador) return;

        // Actualizar configuración
        sala.maxJugadores = data.maxJugadores;
        sala.impostores = data.impostores;
        sala.categoria = data.categoria;
        sala.dificultad = data.dificultad;

        console.log(`Configuración modificada en ${data.sala}: ${data.maxJugadores} jugadores, ${data.impostores} impostores, ${data.categoria}, ${data.dificultad}`);

        // Notificar a todos
        io.to(data.sala).emit("configuracionModificada", {
            maxJugadores: sala.maxJugadores,
            impostores: sala.impostores,
            categoria: sala.categoria,
            dificultad: sala.dificultad
        });

        // Actualizar lista de jugadores
        io.to(data.sala).emit("jugadoresActualizados", {
            sala: data.sala,
            creador: sala.creador,
            maxJugadores: sala.maxJugadores,
            impostores: sala.impostores,
            categoria: sala.categoria,
            dificultad: sala.dificultad,
            jugadores: sala.jugadores
        });
    });

    /* ----- UNIRSE A SALA ----- */
    socket.on("unirseSala", data => {
        if (!data.sala || !data.nombre) {
            socket.emit("errorUnirse", "Datos incompletos");
            return;
        }

        const codigo = data.sala.toUpperCase();
        const sala = salas[codigo];

        if (!sala) {
            socket.emit("errorUnirse", "La sala no existe");
            return;
        }

        if (sala.estado !== "esperando") {
            socket.emit("errorUnirse", "La partida ya comenzó");
            return;
        }

        if (sala.jugadores.length >= sala.maxJugadores) {
            socket.emit("errorUnirse", "La sala está llena");
            return;
        }

        if (sala.jugadores.some(j => j.nombre === data.nombre)) {
            socket.emit("errorUnirse", "Ese nombre ya está en uso");
            return;
        }

        // Asignar posición en orden de llegada
        const posicion = sala.jugadores.length + 1;
        sala.jugadores.push({ id: socket.id, nombre: data.nombre, posicion: posicion });
        socket.join(codigo);

        console.log(`${data.nombre} se unió a ${codigo} como jugador ${posicion}`);

        // Notificar a todos
        io.to(codigo).emit("jugadoresActualizados", {
            sala: codigo,
            creador: sala.creador,
            maxJugadores: sala.maxJugadores,
            impostores: sala.impostores,
            categoria: sala.categoria,
            dificultad: sala.dificultad,
            jugadores: sala.jugadores
        });

        // Notificar al nuevo jugador
        socket.emit("salaUnida", {
            sala: codigo,
            creador: sala.creador,
            maxJugadores: sala.maxJugadores,
            impostores: sala.impostores,
            categoria: sala.categoria,
            dificultad: sala.dificultad,
            jugadores: sala.jugadores
        });
    });

    /* ----- INICIAR JUEGO ----- */
    socket.on("iniciarJuego", salaCodigo => {
        const sala = salas[salaCodigo];
        if (!sala) {
            console.log(`Sala ${salaCodigo} no encontrada`);
            return;
        }

        // Solo el creador puede iniciar
        if (socket.id !== sala.creador) {
            socket.emit("error", "Solo el creador puede iniciar el juego");
            return;
        }

        // Verificar que estén todos los jugadores
        if (sala.jugadores.length !== sala.maxJugadores) {
            const faltan = sala.maxJugadores - sala.jugadores.length;
            socket.emit("error", `Faltan ${faltan} jugador(es)`);
            return;
        }

        // Cambiar estado
        sala.estado = "jugando";
        sala.palabra = generarPalabra(sala.categoria, sala.dificultad);
        sala.listaParaVer = [...sala.jugadores.map(j => j.id)];
        sala.listos = [];
        sala.votosImpostor = 0;

        // Resetear votos de jugadores
        sala.jugadores.forEach(j => {
            j._haVotado = false;
            j._votoImpostor = false;
        });

        // Asignar roles aleatorios
        asignarRolesAleatorios(sala);

        console.log(`=== Partida iniciada en ${salaCodigo} ===`);
        console.log(`Palabra: ${sala.palabra}`);
        console.log(`Categoría: ${sala.categoria}`);
        console.log(`Dificultad: ${sala.dificultad || 'No aplica'}`);
        console.log(`Jugadores: ${sala.jugadores.length}`);
        console.log(`Impostores: ${sala.impostores}`);
        console.log(`Roles asignados:`, sala.roles);

        // Enviar a todos la pantalla de "Ver Palabra" (con botón VER)
        io.to(salaCodigo).emit("irPantallaVerPalabra", {
            sala: salaCodigo,
            categoria: sala.categoria,
            dificultad: sala.dificultad,
            impostores: sala.impostores,
            totalJugadores: sala.jugadores.length
        });
    });

    /* ----- VER PALABRA ----- */
    socket.on("verPalabra", salaCodigo => {
        const sala = salas[salaCodigo];
        if (!sala || sala.estado !== "jugando") {
            console.log(`Error: Sala ${salaCodigo} no está jugando`);
            return;
        }

        const jugador = sala.jugadores.find(j => j.id === socket.id);
        if (!jugador) {
            console.log(`Error: Jugador ${socket.id} no encontrado en sala`);
            return;
        }

        const rol = sala.roles[socket.id];
        let texto = rol === "IMPOSTOR" ? "IMPOSTOR" : sala.palabra;

        // Agregar a lista de los que ya vieron
        if (sala.listaParaVer.includes(socket.id)) {
            sala.listaParaVer = sala.listaParaVer.filter(id => id !== socket.id);
        }

        socket.emit("resultadoPalabra", {
            rol: rol,
            palabra: texto,
            impostores: sala.impostores,
            totalJugadores: sala.jugadores.length,
            posicion: jugador.posicion
        });
    });

    /* ----- MARCAR COMO LISTO ----- */
    socket.on("marcarListo", salaCodigo => {
        const sala = salas[salaCodigo];
        if (!sala || sala.estado !== "jugando") return;

        const jugador = sala.jugadores.find(j => j.id === socket.id);
        if (!jugador) return;

        if (!sala.listos.includes(socket.id)) {
            sala.listos.push(socket.id);
            console.log(`${jugador.nombre} marcó como listo en ${salaCodigo}: ${sala.listos.length}/${sala.jugadores.length}`);
        }

        // Si todos están listos, mostrar botón de impostor/menú final
        if (sala.listos.length >= sala.jugadores.length) {
            console.log(`Todos están listos en ${salaCodigo}`);

            // Encontrar al/los impostor(es) - CORREGIDO: Buscar TODOS los impostores
            const impostores = [];
            for (const [id, rol] of Object.entries(sala.roles)) {
                if (rol === "IMPOSTOR") {
                    const impostor = sala.jugadores.find(j => j.id === id);
                    if (impostor) {
                        impostores.push({
                            nombre: impostor.nombre,
                            posicion: impostor.posicion
                        });
                    }
                }
            }

            console.log(`Impostores encontrados: ${impostores.length}`);

            io.to(salaCodigo).emit("todosListos", {
                totalListos: sala.listos.length,
                totalJugadores: sala.jugadores.length,
                todosListos: true,
                impostores: impostores,
                palabra: sala.palabra
            });
        } else {
            // Notificar a todos que alguien marcó listo
            io.to(salaCodigo).emit("todosListos", {
                totalListos: sala.listos.length,
                totalJugadores: sala.jugadores.length,
                todosListos: false
            });
        }
    });

    /* ----- VOTAR IMPOSTOR ----- */
    socket.on("votarImpostor", salaCodigo => {
        const sala = salas[salaCodigo];
        if (!sala) return;

        const jugador = sala.jugadores.find(j => j.id === socket.id);
        if (!jugador) return;

        // Verificar que no haya votado ya
        if (!jugador._votoImpostor) {
            sala.votosImpostor++;
            jugador._votoImpostor = true;
            console.log(`${jugador.nombre} votó impostor en ${salaCodigo}: ${sala.votosImpostor}/${sala.jugadores.length}`);
        }

        // Si todos votaron, revelar impostor automáticamente
        if (sala.votosImpostor >= sala.jugadores.length) {
            // Encontrar al/los impostor(es) - CORREGIDO: Buscar TODOS los impostores
            const impostores = [];
            for (const [id, rol] of Object.entries(sala.roles)) {
                if (rol === "IMPOSTOR") {
                    const impostor = sala.jugadores.find(j => j.id === id);
                    if (impostor) {
                        impostores.push({
                            nombre: impostor.nombre,
                            posicion: impostor.posicion
                        });
                    }
                }
            }

            console.log(`Revelando ${impostores.length} impostor(es) por votación`);

            io.to(salaCodigo).emit("impostorRevelado", {
                impostores: impostores,
                palabra: sala.palabra
            });
        }
    });

    /* ----- REVELAR IMPOSTOR ----- */
    socket.on("revelarImpostor", salaCodigo => {
        const sala = salas[salaCodigo];
        if (!sala) return;

        // Encontrar al/los impostor(es) - CORREGIDO: Buscar TODOS los impostores
        const impostores = [];
        for (const [id, rol] of Object.entries(sala.roles)) {
            if (rol === "IMPOSTOR") {
                const impostor = sala.jugadores.find(j => j.id === id);
                if (impostor) {
                    impostores.push({
                        nombre: impostor.nombre,
                        posicion: impostor.posicion
                    });
                }
            }
        }

        console.log(`Revelando ${impostores.length} impostor(es) manualmente`);

        io.to(salaCodigo).emit("impostorRevelado", {
            impostores: impostores,
            palabra: sala.palabra
        });
    });

    /* ----- VOLVER A JUGAR ----- */
    socket.on("volverAJugar", salaCodigo => {
        const sala = salas[salaCodigo];
        if (!sala || socket.id !== sala.creador) return;

        // Reiniciar estado del juego
        sala.estado = "jugando";
        sala.palabra = generarPalabra(sala.categoria, sala.dificultad);
        sala.listaParaVer = [...sala.jugadores.map(j => j.id)];
        sala.listos = [];
        sala.votosImpostor = 0;

        // Resetear votos de jugadores
        sala.jugadores.forEach(j => {
            j._haVotado = false;
            j._votoImpostor = false;
        });

        // Reasignar roles aleatorios
        asignarRolesAleatorios(sala);

        console.log(`Partida reiniciada en ${salaCodigo}: ${sala.palabra}`);

        // Enviar a todos la pantalla de "Ver Palabra" (con botón VER)
        io.to(salaCodigo).emit("juegoReiniciado");
        io.to(salaCodigo).emit("irPantallaVerPalabra", {
            sala: salaCodigo,
            categoria: sala.categoria,
            dificultad: sala.dificultad,
            impostores: sala.impostores,
            totalJugadores: sala.jugadores.length
        });
    });

    /* ----- VOLVER A CONFIGURACIÓN ----- */
    socket.on("volverConfiguracion", salaCodigo => {
        const sala = salas[salaCodigo];
        if (!sala || socket.id !== sala.creador) return;

        sala.estado = "esperando";
        sala.palabra = null;
        sala.listaParaVer = [];
        sala.listos = [];
        sala.votosImpostor = 0;
        sala.roles = {};

        // Resetear votos de jugadores
        sala.jugadores.forEach(j => {
            j._haVotado = false;
            j._votoImpostor = false;
        });

        // Volver a la configuración inicial
        io.to(salaCodigo).emit("volverConfiguracionSala");
    });

    /* ----- ABANDONAR SALA ----- */
    socket.on("abandonarSala", salaCodigo => {
        const sala = salas[salaCodigo];
        if (!sala) return;

        const jugador = sala.jugadores.find(j => j.id === socket.id);
        if (!jugador) return;

        // Eliminar jugador
        sala.jugadores = sala.jugadores.filter(j => j.id !== socket.id);
        socket.leave(salaCodigo);

        console.log(`${jugador.nombre} abandonó ${salaCodigo}`);

        // Si es el creador, eliminar sala para todos
        if (socket.id === sala.creador) {
            io.to(salaCodigo).emit("salaEliminada");
            delete salas[salaCodigo];
            console.log(`Sala ${salaCodigo} eliminada por el creador`);
        } else if (sala.jugadores.length > 0) {
            // Reasignar posiciones
            sala.jugadores.forEach((j, index) => {
                j.posicion = index + 1;
            });

            // Actualizar lista para los que quedan
            io.to(salaCodigo).emit("jugadoresActualizados", {
                sala: salaCodigo,
                creador: sala.creador,
                maxJugadores: sala.maxJugadores,
                impostores: sala.impostores,
                categoria: sala.categoria,
                dificultad: sala.dificultad,
                jugadores: sala.jugadores
            });
        } else {
            // Si no quedan jugadores, eliminar sala
            delete salas[salaCodigo];
            console.log(`Sala ${salaCodigo} eliminada (sin jugadores)`);
        }
    });

    /* ----- DESCONEXIÓN ----- */
    socket.on("disconnect", () => {
        console.log(`Usuario desconectado: ${socket.id}`);

        for (const codigo in salas) {
            const sala = salas[codigo];
            const jugador = sala.jugadores.find(j => j.id === socket.id);

            if (jugador) {
                sala.jugadores = sala.jugadores.filter(j => j.id !== socket.id);

                // Si es el creador, eliminar sala para todos
                if (socket.id === sala.creador) {
                    io.to(codigo).emit("salaEliminada");
                    delete salas[codigo];
                    console.log(`Sala ${codigo} eliminada por desconexión del creador`);
                } else if (sala.jugadores.length > 0) {
                    // Reasignar posiciones
                    sala.jugadores.forEach((j, index) => {
                        j.posicion = index + 1;
                    });

                    // Actualizar lista para los que quedan
                    io.to(codigo).emit("jugadoresActualizados", {
                        sala: codigo,
                        creador: sala.creador,
                        maxJugadores: sala.maxJugadores,
                        impostores: sala.impostores,
                        categoria: sala.categoria,
                        dificultad: sala.dificultad,
                        jugadores: sala.jugadores
                    });
                } else {
                    // Si no quedan jugadores, eliminar sala
                    delete salas[codigo];
                    console.log(`Sala ${codigo} eliminada (sin jugadores)`);
                }
                break;
            }
        }
    });
});

/* ----- FUNCIONES UTILITARIAS ----- */
function asignarRolesAleatorios(sala) {
    // Reiniciar roles
    sala.roles = {};

    // Crear array de IDs de jugadores
    let jugadoresIds = sala.jugadores.map(j => j.id);

    // Mezclar IDs aleatoriamente
    for (let i = jugadoresIds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [jugadoresIds[i], jugadoresIds[j]] = [jugadoresIds[j], jugadoresIds[i]];
    }

    // Asignar roles (los primeros N son impostores) - CORREGIDO: Asignar a TODOS los impostores
    for (let i = 0; i < jugadoresIds.length; i++) {
        if (i < sala.impostores) {
            sala.roles[jugadoresIds[i]] = "IMPOSTOR";
        } else {
            sala.roles[jugadoresIds[i]] = "INOCENTE";
        }
    }

    console.log(`Roles asignados:`, sala.roles);
}

/* ----- INICIAR SERVIDOR ----- */
const PORT = process.env.PORT || 5000;
http.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor escuchando en http://0.0.0.0:${PORT}`);
    console.log("Juego del Impostor - Multijugador");
    console.log("Categorías con dificultad: Países, Futbolistas, Cantantes");
    console.log("Categorías sin dificultad: Objetos, Animales, Personas, Clash Royale");
});