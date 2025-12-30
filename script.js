const socket = io();

let nombreJugador = "";
let salaActual = null;
let categoriaActual = "";
let dificultadActual = "";
let miRol = null;
let soyCreador = false;
let palabraActualMultijugador = "";  // NUEVA VARIABLE

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

// Función para mostrar la pantalla de carga
function mostrarPantallaCarga() {
    ocultarTodas();
    document.getElementById("pantalla-carga").classList.remove("hidden");
}

// Función para ocultar la pantalla de carga
function ocultarPantallaCarga() {
    document.getElementById("pantalla-carga").classList.add("hidden");
}

function ocultarTodas() {
    document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
    document.getElementById("confirmModal").classList.add("hidden");
}

function mostrar(id) {
    ocultarTodas();
    document.getElementById(id).classList.remove("hidden");
}

// Simular carga inicial
function iniciarCarga() {
    mostrarPantallaCarga();
    
    // Simular tiempo de carga
    setTimeout(() => {
        ocultarPantallaCarga();
        mostrar("pantalla-principal");
    }, 2000);
}

// Función para mostrar pantalla con animación de carga
function mostrarConCarga(id) {
    mostrarPantallaCarga();
    
    setTimeout(() => {
        ocultarPantallaCarga();
        mostrar(id);
    }, 1000);
}

function generarPalabraLocal(categoria, dificultad) {
    const palabras = {
        Objetos: ["Agenda", "Alfombra", "Almohada", "Altavoz", "Antena", "Archivador", "Arena", "Armario", "Asiento", "Audífonos", "Balón", "Bandeja", "Basurero", "Batería", "Batidora", "Bicicleta", "Billete", "Boleto", "Bolígrafo", "Bolillo", "Bolsa", "Bomba", "Bombillo", "Borrador", "Botella", "Brocha", "Brújula", "Bufanda", "Cable", "Caja", "Cajón", "Calcetin", "Calculadora", "Cámara", "Camisa", "Candado", "Carpeta", "Carro", "Cartera", "Casco", "Cemento", "Cepillo", "Cerradura", "Cerrillo", "Chapa", "Chaqueta", "Cilindro", "Cinta", "Cinturón", "Clip", "Cobija", "Codo", "Colador", "Colchón", "Computador", "Congelador", "Consola", "Cordón", "Cortina", "Cuaderno", "Cuadro", "Cubeta", "Cubo", "Cuchara", "Cuchillo", "Cuerda", "Dado", "Destornillador", "Detergente", "Disco", "Ducha", "Enchufe", "Envase", "Escalera", "Escoba", "Escritorio", "Esfera", "Espejo", "Esponja", "Estante", "Estufa", "Etiqueta", "Flauta", "Flecha", "Funda", "Gafas", "Gorra", "Grapadora", "Grifo", "Guantes", "Hebilla", "Heladera", "Hoja", "Horno", "Imán", "Impresora", "Interruptor", "Jabón", "Juguete", "Ladrillo", "Lámpara", "Lana", "Lápiz", "Lata", "Libreta", "Licuadora", "Linterna", "Llanta", "Llave", "Llavero", "Madera", "Maleta", "Mapa", "Marcador", "Marco", "Martillo", "Memoria", "Metal", "Microondas", "Mochila", "Moneda", "Monitor", "Motor", "Mouse", "Olla", "Paño", "Papel", "Paraguas", "Parlante", "Pasta", "Pedal", "Pegante", "Peinilla", "Pelador", "Pelota", "Peluche", "Perfume", "Persiana", "Pila", "Pincel", "Plástico", "Plato", "Poster", "Puerta", "Pulsera", "Punzón", "Radio", "Recipiente", "Recogedor", "Refrigerador", "Regla", "Reloj", "Retrovisor", "Roca", "Rodillo", "Rollo", "Sábana", "Sartén", "Serrucho", "Servilleta", "Shampoo", "Sierra", "Silla", "Sobre", "Sofá", "Soga", "Sombrero", "Sudader", "Tablero", "Taladro", "Tapa", "Tapete", "Tarjeta", "Taza", "Teclado", "Teléfono", "Televisor", "Tenedor", "Tenis", "Termo", "Termómetro", "Tetera", "Tijeras", "Toalla", "Tornillo", "Torre", "Trapeador", "Trípode", "Trompeta", "Tubería", "Tubo", "Tuerca", "Vajilla", "Vaso", "Ventana", "Ventilador", "Vidrio", "Vinilo", "Volante", "Zapatos"],
        Animales: ["Abeja", "Águila", "Alce", "Anaconda", "Anguila", "Araña", "Ardilla", "Armadillo", "Atún", "Avestruz", "Avispa", "Babosa", "Bagre", "Ballena", "Boa", "Búfalo", "Búho", "Caballito de mar", "Caballo", "Cabra", "Cachalote", "Caimán", "Calamar", "Camaleón", "Camarón", "Camello", "Canario", "Cangrejo", "Canguro", "Caracol", "Castor", "Cebra", "Cerdo", "Chimpancé", "Cigüeña", "Cisne", "Cobra", "Cocodrilo", "Codorniz", "Comadreja", "Cóndor", "Conejo", "Cuervo", "Delfín", "Elefante", "Erizo", "Escarabajo", "Escorpión", "Estrella de mar", "Flamenco", "Foca", "Gallina", "Gallo", "Ganso", "Garrapata", "Garza", "Gato", "Gaviota", "Gorila", "Gorrión", "Grillo", "Guacamayo", "Guepardo", "Gusano", "Halcón", "Hámster", "Hiena", "Hipopótamo", "Hormiga", "Iguana", "Jabalí", "Jaguar", "Jirafa", "Koala", "Lagarto", "Langosta", "Lechuza", "Lémur", "León", "Leopardo", "Libélula", "Lince", "Llama", "Lobo", "Lombriz", "Loro", "Manatí", "Mandril", "Mantarraya", "Mantis", "Mapache", "Mariposa", "Mariquita", "Medusa", "Mofeta", "Mono", "Morsa", "Mosca", "Mosquito", "Murciélago", "Nutria", "Orangután", "Orca", "Oruga", "Oso", "Oso hormiguero", "Oso negro", "Oso pardo", "Oso polar", "Oveja", "Paloma", "Panda", "Pato", "Pavo", "Pavo real", "Pelícano", "Perezoso", "Perico", "Perro", "Pez", "Pingüino", "Pitón", "Polilla", "Puercoespín", "Pulpo", "Puma", "Rana", "Rata", "Ratón", "Raya", "Reno", "Rinoceronte", "Salamandra", "Salmón", "Saltamontes", "Sapo", "Sardina", "Serpiente", "Suricata", "Tarántula", "Tiburón", "Tigre", "Topo", "Tortuga", "Tucán", "Vaca", "Venado", "Víbora", "Zorrillo", "Zorro"],
        Personas: ["Catalina Puerto", "Ana Maria", "Katerin Cardona", "Maleja", "Katerin Becerra", "Natalia Ortega (la india)", "Danna Amaya", "Karol Rueda", "Jennifer Merchan", "Jeanpi", "Steven", "Badillo", "Checho", "Marbello", "Pez", "Yamid", "Juan Esteban", "Daniel", "Joseph", "Rosado", "Julian", "Vanesa Castellanos", "Lisarazo", "Camila Jaimes", "Juan David", "Alexa", "Mafe", "Lili", "Burgos", "Bolas", "Marcos", "Ana Mercedes", "Parra", "Nuñez (el negro)", "Topo", "Erick Morantes", "Velandia", "Viviana Eugenio", "Luz Marina", "Gustavo", "Rafael", "Cala", "Snedy", "Reyes", "Yalile", "Fernanda Jerez", "Camila Arenas", "Fifi", "Nene", "Nicolas Tellez", "Yordan"],
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

        mostrarConCarga("pantalla-local-config");
    } else {
        document.getElementById("codigoSalaUnirse").value = "";
        mostrarConCarga("multijugador-nombre");
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
    mostrarPantallaCarga();
    
    setTimeout(() => {
        document.querySelectorAll('.nombre-jugador-local').forEach(input => {
            const index = parseInt(input.getAttribute('data-index'));
            const nombre = input.value.trim() || `Jugador ${index + 1}`;
            configLocal.jugadores[index].nombre = nombre;
        });

        configLocal.palabraActual = generarPalabraLocal(configLocal.categoria, configLocal.dificultad);
        asignarRolesLocales();
        configLocal.jugadorActual = 0;
        
        ocultarPantallaCarga();
        mostrarJugadorLocal();
    }, 1500);
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
    mostrarPantallaCarga();
    
    setTimeout(() => {
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

        ocultarPantallaCarga();
        mostrar("pantalla-local-palabra");
    }, 1000);
}

function siguienteJugadorLocal() {
    mostrarPantallaCarga();
    
    setTimeout(() => {
        configLocal.jugadorActual++;
        ocultarPantallaCarga();
        mostrarJugadorLocal();
    }, 800);
}

function finalizarJuegoLocal() {
    mostrarConCarga("pantalla-local-final");
    document.getElementById("impostorRevelado").classList.add("hidden");
    document.getElementById("palabraReveladaLocal").classList.add("hidden");
}

function revelarImpostorLocal() {
    mostrarPantallaCarga();
    
    setTimeout(() => {
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
        ocultarPantallaCarga();
    }, 1000);
}

function volveraJugarLocal() {
    mostrarPantallaCarga();
    
    setTimeout(() => {
        configLocal.palabraActual = generarPalabraLocal(configLocal.categoria, configLocal.dificultad);
        asignarRolesLocales();
        configLocal.jugadorActual = 0;

        document.getElementById("impostorRevelado").classList.add("hidden");
        document.getElementById("palabraReveladaLocal").classList.add("hidden");
        document.querySelector("#pantalla-local-final .revelar-container button").style.display = "block";

        ocultarPantallaCarga();
        mostrarJugadorLocal();
    }, 1500);
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
    mostrarConCarga("multijugador-elegir");
}

function mostrarCrearSala() {
    mostrarPantallaCarga();
    
    setTimeout(() => {
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

        ocultarPantallaCarga();
        mostrar("multijugador-crear");
    }, 1000);
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
    mostrarConCarga("multijugador-nombre");
}

function volverElegirMultijugador() {
    if (salaActual) {
        socket.emit("abandonarSala", salaActual);
        salaActual = null;
    }
    mostrarConCarga("multijugador-elegir");
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

    mostrarPantallaCarga();
    
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

    mostrarPantallaCarga();
    
    const btn = document.getElementById("btnIniciarJuego");
    btn.disabled = true;
    btn.textContent = "Iniciando...";

    setTimeout(() => {
        btn.disabled = false;
        btn.textContent = "🚀 Iniciar Juego";
        ocultarPantallaCarga();
    }, 2000);

    socket.emit("iniciarJuego", salaActual);
}

function verPalabraMultijugador() {
    console.log("Solicitando palabra para sala:", salaActual);
    if (!salaActual) return;
    
    mostrarPantallaCarga();
    setTimeout(() => {
        ocultarPantallaCarga();
        socket.emit("verPalabra", salaActual);
    }, 1000);
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
    
    mostrarPantallaCarga();
    setTimeout(() => {
        console.log("Votando impostor en sala:", salaActual);
        socket.emit("votarImpostor", salaActual);
        ocultarPantallaCarga();
    }, 1000);
}

function volveraJugarMultijugador() {
    if (!salaActual) return;
    
    mostrarPantallaCarga();
    setTimeout(() => {
        console.log("Volviendo a jugar en sala:", salaActual);
        socket.emit("volverAJugar", salaActual);
        ocultarPantallaCarga();
    }, 1500);
}

function volverConfiguracionMultijugador() {
    if (!salaActual) return;
    
    mostrarPantallaCarga();
    setTimeout(() => {
        console.log("Volviendo a configuración en sala:", salaActual);
        socket.emit("volverConfiguracion", salaActual);
        ocultarPantallaCarga();
    }, 1000);
}

function confirmarSalirSala() {
    document.getElementById("confirmModal").classList.remove("hidden");
}

function confirmSalir(ok) {
    document.getElementById("confirmModal").classList.add("hidden");

    if (ok) {
        mostrarPantallaCarga();
        
        setTimeout(() => {
            if (salaActual) {
                socket.emit("abandonarSala", salaActual);
                salaActual = null;
            }
            ocultarPantallaCarga();
            mostrar("pantalla-principal");
        }, 800);
    }
}

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
    ocultarPantallaCarga();
    actualizarLobbyUnido(data);
});

socket.on("errorUnirse", (msg) => {
    alert("Error: " + msg);
    ocultarPantallaCarga();
});

socket.on("error", (msg) => {
    alert("Error: " + msg);
    document.getElementById("btnIniciarJuego").disabled = false;
    document.getElementById("btnIniciarJuego").textContent = "🚀 Iniciar Juego";
    ocultarPantallaCarga();
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
    palabraActualMultijugador = data.palabra;  // GUARDAR LA PALABRA

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
        palabraActualMultijugador = data.palabra;  // GUARDAR PALABRA PARA MOSTRAR
        mostrar("multijugador-final");
        document.getElementById("codigoTextoFinal").textContent = salaActual;

        if (soyCreador) {
            document.getElementById("opcionesCreador").style.display = "flex";
        } else {
            document.getElementById("opcionesCreador").style.display = "none";
        }

        document.getElementById("impostorReveladoMultijugador").classList.add("hidden");
        document.getElementById("palabraReveladaMultijugador").classList.add("hidden");

        document.getElementById("btnVotarImpostor").style.display = "block";
        document.getElementById("btnVotarImpostor").disabled = false;
        document.getElementById("btnVotarImpostor").textContent = "🔍 Revelar Impostor y Palabra";
    }
});

socket.on("impostorRevelado", (data) => {
    console.log("Impostor(es) revelado(s):", data.impostores);
    palabraActualMultijugador = data.palabra;  // ACTUALIZAR PALABRA

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
        // CORREGIDO: Usar el ID correcto
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

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
    // Mostrar pantalla de carga al inicio
    iniciarCarga();
    
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
