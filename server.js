const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static(__dirname));

const salas = {};
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

function generarPalabra(categoria, dificultad) {
    if (!categoria) return "Palabra";

    const sinDificultad = ["Objetos", "Animales", "Personas", "ClashRoyale"];

    if (sinDificultad.includes(categoria)) {
        const lista = palabras[categoria] || palabras["Objetos"];
        return lista[Math.floor(Math.random() * lista.length)];
    } else {
        const dificultades = palabras[categoria];
        if (!dificultades) return "Palabra";

        if (dificultad && dificultades[dificultad]) {
            const lista = dificultades[dificultad];
            return lista[Math.floor(Math.random() * lista.length)];
        } else {
            const todas = [].concat(...Object.values(dificultades));
            return todas[Math.floor(Math.random() * todas.length)];
        }
    }
}

io.on("connection", socket => {
    console.log(`Usuario conectado: ${socket.id}`);

    socket.on("crearSala", data => {
        if (!data.nombre || !data.codigo) {
            socket.emit("error", "Datos incompletos");
            return;
        }

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

    socket.on("modificarConfiguracion", data => {
        const sala = salas[data.sala];
        if (!sala || socket.id !== sala.creador) return;

        sala.maxJugadores = data.maxJugadores;
        sala.impostores = data.impostores;
        sala.categoria = data.categoria;
        sala.dificultad = data.dificultad;

        console.log(`Configuración modificada en ${data.sala}`);

        io.to(data.sala).emit("configuracionModificada", {
            maxJugadores: sala.maxJugadores,
            impostores: sala.impostores,
            categoria: sala.categoria,
            dificultad: sala.dificultad
        });

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

        const posicion = sala.jugadores.length + 1;
        sala.jugadores.push({ id: socket.id, nombre: data.nombre, posicion: posicion });
        socket.join(codigo);

        console.log(`${data.nombre} se unió a ${codigo} como jugador ${posicion}`);

        io.to(codigo).emit("jugadoresActualizados", {
            sala: codigo,
            creador: sala.creador,
            maxJugadores: sala.maxJugadores,
            impostores: sala.impostores,
            categoria: sala.categoria,
            dificultad: sala.dificultad,
            jugadores: sala.jugadores
        });

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

    socket.on("iniciarJuego", salaCodigo => {
        const sala = salas[salaCodigo];
        if (!sala) {
            console.log(`Sala ${salaCodigo} no encontrada`);
            return;
        }

        if (socket.id !== sala.creador) {
            socket.emit("error", "Solo el creador puede iniciar el juego");
            return;
        }

        if (sala.jugadores.length !== sala.maxJugadores) {
            const faltan = sala.maxJugadores - sala.jugadores.length;
            socket.emit("error", `Faltan ${faltan} jugador(es)`);
            return;
        }

        sala.estado = "jugando";
        sala.palabra = generarPalabra(sala.categoria, sala.dificultad);
        sala.listaParaVer = [...sala.jugadores.map(j => j.id)];
        sala.listos = [];
        sala.votosImpostor = 0;

        sala.jugadores.forEach(j => {
            j._haVotado = false;
            j._votoImpostor = false;
        });

        asignarRolesAleatorios(sala);

        console.log(`=== Partida iniciada en ${salaCodigo} ===`);
        console.log(`Palabra: ${sala.palabra}`);
        console.log(`Categoría: ${sala.categoria}`);
        console.log(`Jugadores: ${sala.jugadores.length}`);
        console.log(`Impostores: ${sala.impostores}`);
        console.log(`Roles asignados:`, sala.roles);

        io.to(salaCodigo).emit("irPantallaVerPalabra", {
            sala: salaCodigo,
            categoria: sala.categoria,
            dificultad: sala.dificultad || "No aplica",
            impostores: sala.impostores,
            totalJugadores: sala.jugadores.length,
            palabra: sala.palabra  // ENVIAR LA PALABRA AL CLIENTE
        });
    });

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

        if (sala.listaParaVer.includes(socket.id)) {
            sala.listaParaVer = sala.listaParaVer.filter(id => id !== socket.id);
        }

        socket.emit("resultadoPalabra", {
            rol: rol,
            palabra: texto,
            impostores: sala.impostores,
            totalJugadores: sala.jugadores.length,
            posicion: jugador.posicion,
            palabraReal: sala.palabra  // ENVIAR PALABRA REAL PARA MOSTRAR AL FINAL
        });
    });

    socket.on("marcarListo", salaCodigo => {
        const sala = salas[salaCodigo];
        if (!sala || sala.estado !== "jugando") return;

        const jugador = sala.jugadores.find(j => j.id === socket.id);
        if (!jugador) return;

        if (!sala.listos.includes(socket.id)) {
            sala.listos.push(socket.id);
            console.log(`${jugador.nombre} marcó como listo: ${sala.listos.length}/${sala.jugadores.length}`);
        }

        if (sala.listos.length >= sala.jugadores.length) {
            console.log(`Todos están listos en ${salaCodigo}`);

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
                palabra: sala.palabra  // ENVIAR PALABRA
            });
        } else {
            io.to(salaCodigo).emit("todosListos", {
                totalListos: sala.listos.length,
                totalJugadores: sala.jugadores.length,
                todosListos: false
            });
        }
    });

    socket.on("votarImpostor", salaCodigo => {
        const sala = salas[salaCodigo];
        if (!sala) return;

        const jugador = sala.jugadores.find(j => j.id === socket.id);
        if (!jugador) return;

        if (!jugador._votoImpostor) {
            sala.votosImpostor++;
            jugador._votoImpostor = true;
            console.log(`${jugador.nombre} votó impostor: ${sala.votosImpostor}/${sala.jugadores.length}`);
        }

        if (sala.votosImpostor >= sala.jugadores.length) {
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
                palabra: sala.palabra  // ENVIAR PALABRA
            });
        }
    });

    socket.on("revelarImpostor", salaCodigo => {
        const sala = salas[salaCodigo];
        if (!sala) return;

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
            palabra: sala.palabra  // ENVIAR PALABRA
        });
    });

    socket.on("volverAJugar", salaCodigo => {
        const sala = salas[salaCodigo];
        if (!sala || socket.id !== sala.creador) return;

        sala.estado = "jugando";
        sala.palabra = generarPalabra(sala.categoria, sala.dificultad);
        sala.listaParaVer = [...sala.jugadores.map(j => j.id)];
        sala.listos = [];
        sala.votosImpostor = 0;

        sala.jugadores.forEach(j => {
            j._haVotado = false;
            j._votoImpostor = false;
        });

        asignarRolesAleatorios(sala);

        console.log(`Partida reiniciada en ${salaCodigo}: ${sala.palabra}`);

        io.to(salaCodigo).emit("juegoReiniciado");
        io.to(salaCodigo).emit("irPantallaVerPalabra", {
            sala: salaCodigo,
            categoria: sala.categoria,
            dificultad: sala.dificultad || "No aplica",
            impostores: sala.impostores,
            totalJugadores: sala.jugadores.length,
            palabra: sala.palabra  // ENVIAR PALABRA
        });
    });

    socket.on("volverConfiguracion", salaCodigo => {
        const sala = salas[salaCodigo];
        if (!sala || socket.id !== sala.creador) return;

        sala.estado = "esperando";
        sala.palabra = null;
        sala.listaParaVer = [];
        sala.listos = [];
        sala.votosImpostor = 0;
        sala.roles = {};

        sala.jugadores.forEach(j => {
            j._haVotado = false;
            j._votoImpostor = false;
        });

        io.to(salaCodigo).emit("volverConfiguracionSala");
    });

    socket.on("abandonarSala", salaCodigo => {
        const sala = salas[salaCodigo];
        if (!sala) return;

        const jugador = sala.jugadores.find(j => j.id === socket.id);
        if (!jugador) return;

        sala.jugadores = sala.jugadores.filter(j => j.id !== socket.id);
        socket.leave(salaCodigo);

        console.log(`${jugador.nombre} abandonó ${salaCodigo}`);

        if (socket.id === sala.creador) {
            io.to(salaCodigo).emit("salaEliminada");
            delete salas[salaCodigo];
            console.log(`Sala ${salaCodigo} eliminada por el creador`);
        } else if (sala.jugadores.length > 0) {
            sala.jugadores.forEach((j, index) => {
                j.posicion = index + 1;
            });

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
            delete salas[salaCodigo];
            console.log(`Sala ${salaCodigo} eliminada (sin jugadores)`);
        }
    });

    socket.on("disconnect", () => {
        console.log(`Usuario desconectado: ${socket.id}`);

        for (const codigo in salas) {
            const sala = salas[codigo];
            const jugador = sala.jugadores.find(j => j.id === socket.id);

            if (jugador) {
                sala.jugadores = sala.jugadores.filter(j => j.id !== socket.id);

                if (socket.id === sala.creador) {
                    io.to(codigo).emit("salaEliminada");
                    delete salas[codigo];
                    console.log(`Sala ${codigo} eliminada por desconexión del creador`);
                } else if (sala.jugadores.length > 0) {
                    sala.jugadores.forEach((j, index) => {
                        j.posicion = index + 1;
                    });

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
                    delete salas[codigo];
                    console.log(`Sala ${codigo} eliminada (sin jugadores)`);
                }
                break;
            }
        }
    });
});

function asignarRolesAleatorios(sala) {
    sala.roles = {};

    let jugadoresIds = sala.jugadores.map(j => j.id);

    for (let i = jugadoresIds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [jugadoresIds[i], jugadoresIds[j]] = [jugadoresIds[j], jugadoresIds[i]];
    }

    for (let i = 0; i < jugadoresIds.length; i++) {
        if (i < sala.impostores) {
            sala.roles[jugadoresIds[i]] = "IMPOSTOR";
        } else {
            sala.roles[jugadoresIds[i]] = "INOCENTE";
        }
    }

    console.log(`Roles asignados:`, sala.roles);
}

const PORT = process.env.PORT || 5000;
http.listen(PORT, () => {
    console.log(`Servidor listo en puerto ${PORT}`);
});
