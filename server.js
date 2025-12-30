const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static(__dirname));

const salas = {};
const palabras = {
    Objetos: ["Agenda", "Alfombra", "Almohada", "Altavoz", "Antena", "Archivador", "Arena", "Armario", "Asiento", "Audífonos", "Balón", "Bandeja", "Basurero", "Batería", "Batidora", "Bicicleta", "Billete", "Boleto", "Bolígrafo", "Bolillo", "Bolsa", "Bomba", "Bombillo", "Borrador", "Botella", "Brocha", "Brújula", "Bufanda", "Cable", "Caja", "Cajón", "Calcetin", "Calculadora", "Cámara", "Camisa", "Candado", "Carpeta", "Carro", "Cartera", "Casco", "Cemento", "Cepillo", "Cerradura", "Cerrillo", "Chapa", "Chaqueta", "Cilindro", "Cinta", "Cinturón", "Clip", "Cobija", "Codo", "Colador", "Colchón", "Computador", "Congelador", "Consola", "Cordón", "Cortina", "Cuaderno", "Cuadro", "Cubeta", "Cubo", "Cuchara", "Cuchillo", "Cuerda", "Dado", "Destornillador", "Detergente", "Disco", "Ducha", "Enchufe", "Envase", "Escalera", "Escoba", "Escritorio", "Esfera", "Espejo", "Esponja", "Estante", "Estufa", "Etiqueta", "Flauta", "Flecha", "Funda", "Gafas", "Gorra", "Grapadora", "Grifo", "Guantes", "Hebilla", "Heladera", "Hoja", "Horno", "Imán", "Impresora", "Interruptor", "Jabón", "Juguete", "Ladrillo", "Lámpara", "Lana", "Lápiz", "Lata", "Libreta", "Licuadora", "Linterna", "Llanta", "Llave", "Llavero", "Madera", "Maleta", "Mapa", "Marcador", "Marco", "Martillo", "Memoria", "Metal", "Microondas", "Mochila", "Moneda", "Monitor", "Motor", "Mouse", "Olla", "Paño", "Papel", "Paraguas", "Parlante", "Pasta", "Pedal", "Pegante", "Peinilla", "Pelador", "Pelota", "Peluche", "Perfume", "Persiana", "Pila", "Pincel", "Plástico", "Plato", "Poster", "Puerta", "Pulsera", "Punzón", "Radio", "Recipiente", "Recogedor", "Refrigerador", "Regla", "Reloj", "Retrovisor", "Roca", "Rodillo", "Rollo", "Sábana", "Sartén", "Serrucho", "Servilleta", "Shampoo", "Sierra", "Silla", "Sobre", "Sofá", "Soga", "Sombrero", "Sudader", "Tablero", "Taladro", "Tapa", "Tapete", "Tarjeta", "Taza", "Teclado", "Teléfono", "Televisor", "Tenedor", "Tenis", "Termo", "Termómetro", "Tetera", "Tijeras", "Toalla", "Tornillo", "Torre", "Trapeador", "Trípode", "Trompeta", "Tubería", "Tubo", "Tuerca", "Vajilla", "Vaso", "Ventana", "Ventilador", "Vidrio", "Vinilo", "Volante", "Zapatos"],
    Animales: ["Abeja", "Águila", "Alce", "Anaconda", "Anguila", "Araña", "Ardilla", "Armadillo", "Atún", "Avestruz", "Avispa", "Babosa", "Bagre", "Ballena", "Boa", "Búfalo", "Búho", "Caballito de mar", "Caballo", "Cabra", "Cachalote", "Caimán", "Calamar", "Camaleón", "Camarón", "Camello", "Canario", "Cangrejo", "Canguro", "Caracol", "Castor", "Cebra", "Cerdo", "Chimpancé", "Cigüeña", "Cisne", "Cobra", "Cocodrilo", "Codorniz", "Comadreja", "Cóndor", "Conejo", "Cuervo", "Delfín", "Elefante", "Erizo", "Escarabajo", "Escorpión", "Estrella de mar", "Flamenco", "Foca", "Gallina", "Gallo", "Ganso", "Garrapata", "Garza", "Gato", "Gaviota", "Gorila", "Gorrión", "Grillo", "Guacamayo", "Guepardo", "Gusano", "Halcón", "Hámster", "Hiena", "Hipopótamo", "Hormiga", "Iguana", "Jabalí", "Jaguar", "Jirafa", "Koala", "Lagarto", "Langosta", "Lechuza", "Lémur", "León", "Leopardo", "Libélula", "Lince", "Llama", "Lobo", "Lombriz", "Loro", "Manatí", "Mandril", "Mantarraya", "Mantis", "Mapache", "Mariposa", "Mariquita", "Medusa", "Mofeta", "Mono", "Morsa", "Mosca", "Mosquito", "Murciélago", "Nutria", "Orangután", "Orca", "Oruga", "Oso", "Oso hormiguero", "Oso negro", "Oso pardo", "Oso polar", "Oveja", "Paloma", "Panda", "Pato", "Pavo", "Pavo real", "Pelícano", "Perezoso", "Perico", "Perro", "Pez", "Pingüino", "Pitón", "Polilla", "Puercoespín", "Pulpo", "Puma", "Rana", "Rata", "Ratón", "Raya", "Reno", "Rinoceronte", "Salamandra", "Salmón", "Saltamontes", "Sapo", "Sardina", "Serpiente", "Suricata", "Tarántula", "Tiburón", "Tigre", "Topo", "Tortuga", "Tucán", "Vaca", "Venado", "Víbora", "Zorrillo", "Zorro"],
    Personas: ["Catalina Puerto", "Ana Maria", "Katerin Cardona", "Maleja", "Katerin Becerra", "Natalia Ortega (la india)", "Danna Amaya", "Karol Rueda", "Jennifer Merchan", "Jeanpi"],
    Países: {
        "Fácil": ["Alemania", "Argentina", "Australia", "Bolivia", "Brasil", "Canadá", "Catar", "Chile", "China", "Colombia", "Cuba", "Egipto", "España", "Estados Unidos", "Francia", "Grecia", "Haití", "India", "Ingleterra", "Israel", "Italia", "Jamaica", "Japón", "Madagascar", "Marruecos", "México", "Mónaco", "Nueva Zelanda", "Países Bajos", "Palestina", "Panamá", "Perú", "Portugal", "República Dominicana", "Rusia", "Suiza", "Turquía", "Ucrania", "Uruguay", "Venezuela"],
        "Medio": ["Arabia Saudita", "Austria", "Bélgica", "Camerún", "Congo", "Corea del Norte", "Corea del Sur", "Costa de Marfil", "Costa Rica", "Croacia", "Dinamarca", "Ecuador", "El Salvador", "Emiratos Árabes Unidos", "Filipinas", "Guatemala", "Honduras", "Irak", "Irán", "Nicaragua", "Nigeria", "Noruega", "Paraguay", "Polonia", "Rumania", "Senegal", "Sudáfrica", "Suecia", "Túnez", "Vietnam"],
        "Difícil": ["Andorra", "Bosnia y Herzegovina", "Bulgaria", "Burkina Faso", "Escocia", "Eslovaquia", "Eslovenia", "Finlandia", "Gales", "Georgia", "Ghana", "Hungría", "Indonesia", "Irlanda", "Islandia", "Kazajistán", "Kenia", "Líbano", "Mongolia", "Pakistán", "República Checa", "San Marino", "Serbia", "Singapur", "Siria", "Tailandia", "Taiwan", "Turkmenistán", "Uzbekistán", "Vaticano"]
    },
    Futbolistas: {
        "Fácil": ["Achraf Hakimi", "Alfredo Di Stéfano", "Andrés Iniesta", "Arjen Robben", "Cristiano Ronaldo", "David Beckham", "Diego Maradona", "Eden Hazard", "Fernando Torres", "Francesco Totti", "Franck Ribéry", "Gareth Bale", "Gerard Piqué", "Gianluigi Buffon", "Harry Kane", "Iker Casillas", "Javier Zanetti", "Karim Benzema", "Kevin De Bruyne", "Lionel Messi", "Luis Suárez", "Luka Modrić", "Manuel Neuer", "Marco Reus", "Mohamed Salah", "Neymar Jr", "Paul Pogba", "Pedro", "Pepe", "Philipp Lahm", "Radamel Falcao", "Raúl González", "Robert Lewandowski", "Robin van Persie", "Ronaldinho", "Ronaldo Nazário", "Sergio Agüero", "Sergio Ramos", "Steven Gerrard", "Thomas Müller", "Thiago Silva", "Wayne Rooney", "Xabi Alonso", "Xavi Hernández", "Zlatan Ibrahimović", "Andrea Pirlo", "Ángel Di María", "Antoine Griezmann", "Arturo Vidal", "Cafu", "Carles Puyol", "Carlos Tevez", "Carlos Valderrama", "Casemiro", "Chicharito Hernández", "Dani Alves", "Dani Carvajal", "David Luiz", "David Ospina", "Diego Forlán", "Erling Haaland", "Faustino Asprilla", "Franz Beckenbauer", "Garrincha", "Hugo Sánchez", "Hulk", "Isco", "Jamal Musiala", "James Rodríguez", "Johan Cruyff", "Jordi Alba", "Juan Fernando Quintero", "Juan Román Riquelme", "Jude Bellingham", "Kaká", "Keylor Navas", "Kylian Mbappé", "Lamine Yamal", "Luis Díaz", "Marcelo", "Mesut Özil", "Ousmane Dembélé", "Pele", "Raphinha", "René Higuita", "Roberto Carlos", "Samuel Eto'o", "Sergio Busquets", "Ter Stegen", "Thibaut Courtois", "Toni Kroos", "Vinícius Jr", "Zico"],
        "Medio": ["Alessandro Nesta", "Alexis Sánchez", "Alisson Becker", "Alphonso Davies", "Claudio Bravo", "Deco", "Didier Drogba", "Diego Costa", "Douglas Costa", "Ederson", "Edinson Cavani", "Eusebio", "Franco Armani", "Frenkie de Jong", "Gerd Müller", "Giorgio Chiellini", "Gonzalo Higuaín", "Ivan Rakitić", "Jérôme Boateng", "Joshua Kimmich", "Juan Guillermo Cuadrado", "Julián Álvarez", "Karl-Heinz Rummenigge", "Lev Yashin", "Mario Balotelli", "Mario Mandžukić", "Marquinhos", "Memphis Depay", "Michel Platini", "Miroslav Klose", "Nani", "Óscar", "Paolo Guerrero", "Paolo Maldini", "Petr Čech", "Rafa Márquez", "Raheem Sterling", "Raphaël Varane", "Rivaldo", "Rodri", "Rodrygo", "Romario", "Romelu Lukaku", "Ruud van Nistelrooy", "Sadio Mané", "Son Heung-min", "Stephan El Shaarawy", "Teófilo Gutiérrez", "Thiago Alcántara", "Virgil van Dijk", "Yaya Touré", "Yerry Mina"],
        "Difícil": ["Alessandro Del Piero", "Álvaro Morata", "Andrés Guardado", "Ansu Fati", "Blaise Matuidi", "Bobby Charlton", "Bukayo Saka", "Cesc Fàbregas", "David de Gea", "David Silva", "David Villa", "Dida", "Diego Milito", "Diego Simeone", "Elias Figueroa", "Fabio Coentrão", "Florian Wirtz", "Frank Lampard", "Gabriel Batistuta", "Gavi", "Gennaro Gattuso", "George Best", "Giovani dos Santos", "Hernán Crespo", "Hugo Lloris", "Ilkay Gündoğan", "Jan Oblak", "Jefferson Farfán", "João Cancelo", "João Félix", "John Terry", "Jorginho", "José Luis Chilavert", "José María Giménez", "Juan Mata", "Julian Draxler", "Julio César", "Just Fontaine", "Kevin-Prince Boateng", "Kingsley Coman", "Koke", "Leonardo Bonucci", "Leroy Sané", "Lothar Matthäus", "Marco van Basten", "Marco Verratti", "Mario Kempes", "Mauro Icardi", "N'Golo Kanté", "Oliver Kahn", "Phil Foden", "Rio Ferdinand", "Rúben Dias", "Ruud Gullit", "Salomón Rondón", "Sami Khedira", "Socrates", "Teófilo Cubillas", "Vincent Kompany", "Wesley Sneijder"]
    },
    Cantantes: {
        "Fácil": ["Adele", "Alci Acosta", "Ana Gabriel", "Andrés Cepeda", "Aventura", "Bad Bunny", "Bob Marley", "Bruno Mars", "BTS", "Calle 13", "Camilo Sesto", "Canserbero", "Carlos Vives", "Celia Cruz", "Chayanne", "Daddy Yankee", "Diomedes Díaz", "Don Omar", "El General", "Elvis Presley", "Eminem", "Enrique Iglesias", "Feid", "Freddie Mercury", "Fruko y sus Tesos", "Galy Galiano", "Grupo Niche", "Guns N' Roses", "Gustavo Cerati", "Héctor Lavoe", "Hombres G", "J Balvin", "Jesse & Joy", "Joan Sebastian", "Joe Arroyo", "Juan Gabriel", "Juanes", "Julio Iglesias", "Julio Jaramillo", "Justin Bieber", "Karol G", "Katy Perry", "Kendrick Lamar", "La Oreja de Van Gogh", "Lady Gaga", "Laura Pausini", "Linkin Park", "Los Bukis", "Luis Miguel", "Madonna", "Mägo de Oz", "Maluma", "Maná", "Marc Anthony", "Marco Antonio Solís", "Martin Garrix", "Metallica", "Michael Jackson", "Morat", "Myke Towers", "One Direction", "Paquita la del Barrio", "Pink Floyd", "Queen", "Residente", "Ricky Martin", "Rocío Dúrcal", "Romeo Santos", "Rubén Blades", "Selena Quintanilla", "Shakira", "Snoop Dogg", "Soda Stereo", "Taylor Swift", "The Beatles", "The Rolling Stones", "The Weeknd", "Vicente Fernández", "Willie Colón", "Wisin & Yandel"],
        "Medio": ["50 Cent", "AC/DC", "Alejandro Fernández", "Andrés Calamaro", "Anuel AA", "Arcángel", "Ariana Grande", "Beyoncé", "Billie Eilish", "Bizarrap", "Bon Jovi", "Calvin Harris", "Camilo", "Cardi B", "ChocQuibTown", "Coldplay", "Daft Punk", "David Guetta", "Drake", "Dua Lipa", "Duki", "Ed Sheeran", "Eladio Carrión", "Enanitos Verdes", "Eros Ramazzotti", "Farruko", "Fonseca", "Gusttavo Lima", "Harry Styles", "Jhayco", "Kanye West", "Lana Del Rey", "Led Zeppelin", "Los Prisioneros", "Los Tigres del Norte", "Luciano Pavarotti", "Manuel Turizo", "Maroon 5", "Miranda", "Mon Laferte", "Nicki Minaj", "Nicki Nicole", "Nicky Jam", "Nirvana", "Ozuna", "Pedro Infante", "Peso Pluma", "Porta", "Prince Royce", "Radiohead", "Rammstein", "Rauw Alejandro", "Reik", "Rihanna", "Rosalía", "Silvestre Dangond", "Skrillex", "System of a Down", "Tego Calderón", "Zion & Lennox"],
        "Difícil": ["Adriana Lucía", "Andrea Bocelli", "Aterciopelados", "Avicii", "Binomio de Oro de América", "Black Sabbath", "Bomba Estéreo", "C. Tangana", "Café Tacuba", "Caifanes", "Charly García", "Chris Brown", "Danny Ocean", "Darío Gómez", "Duncan Dhu", "Elton John", "Emmanuel", "Fanny Lu", "Fito Páez", "Frank Sinatra", "Gloria Estefan", "Ice Cube", "Imagine Dragons", "Inspector", "Iron Maiden", "Jarabe de Palo", "Jorge Celedón", "José José", "Kase.O", "Lennox", "Los Ángeles Azules", "Los Auténticos Decadentes", "Los Fabulosos Cadillacs", "Mercedes Sosa", "Miguel Bosé", "Milo J", "Monsieur Periné", "Mora", "Nach", "Natanael Cano", "Paulo Londra", "Pxndx", "Quevedo", "Rafael Orozco", "Raphael", "Rels B", "Sean Paul", "Sebastián Yatra", "Shaggy", "Silvio Rodríguez", "Sin Bandera", "Totó la Momposina", "Trueno", "Tupac Shakur", "Whitney Houston", "Wisin", "Yandel", "Young Miko", "Yuri", "Zion"]
    },
    ClashRoyale: ["Cocinero Real", "Duquesa de dagas", "Cañonero", "Princesa de torre", "Caballero", "Mosquetera", "Mini P.E.K.K.A.", "Gigante", "Esqueletos", "Espíritu de fuego", "Espíritu eléctrico", "Espíritu de hielo", "Espíritu sanador", "Espejo", "Duendes", "Duendes con lanza", "Bombardero", "Murciélagos", "Descarga", "Bola de nieve", "Gólem de hielo", "Berserker", "Barril de barbaros", "Tronco", "Rompemuros", "Arbusto sospechoso", "Furia", "Maldición duende", "Arqueras", "Esbirros", "Flechas", "Lápida", "Cañón", "Megaesbirro", "Ejercito de esqueletos", "Guardias", "Barril de duendes", "Enredadera", "Pandilla de duendes", "Barril de Esqueletos", "Duende lanza dardos", "Princesa", "Minero", "Lanza fuegos", "Terremoto", "Mago de hielo", "Fantasma", "Bandida", "Paquete real", "Gólem de elixir", "Tornado", "Espejo", "Vacío", "Pescador", "Principito", "Choza de duendes", "Jaula del forzudo", "Bola de fuego", "Valquiria", "Ariete de batalla", "Dragones esqueletos", "Torre bombardera", "Morero", "Montapuercos", "Maquina Voladora", "Bebe dragón", "Príncipe oscuro", "Curandera", "Hielo", "Gigante Rúnica", "Veneno", "Torre tesla", "Electrocutadores", "Horno", "Cazador", "Dragon infernal", "Mago Eléctrico", "Demoledor Duende", "Fénix", "Arquero mágico", "Taladradora de duendes", "Leñador", "Bruja nocturna", "Bruja madre", "Rey esqueleto", "Caballero dorado", "Gran minero", "Barbaros", "Mago de fuego", "Torre infernal", "Bruja", "Puercos reales", "Globo Bombástico", "Príncipe", "Horda de esbirros", "Montacarnera", "Dragon eléctrico", "Cementerio", "Pillos", "Lanzarocas", "Verdugo", "Cañón con ruedas", "Maquina de duende", "Reina arquera", "Monje", "Duendenstein", "Cohete", "Gigante noble", "Esqueleto gigante", "Rayo", "Choza de barbaros", "Duende Gigante", "Barbaros de elite", "Ballesta", "Chispitas", "Recolector de elixir", "Emperatriz espiritual", "Bandida líder", "P.E.K.K.A.", "Reclutas reales", "Megacaballero", "Gigante Eléctrico", "Sabueso", "Gólem", "Trio de mosqueteras"]
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
