var DECK = {};

var TRAIT = {};

TRAIT.ATHLETICS = 0;
TRAIT.CHARISMA = 1;
TRAIT.EMPATHY = 2;
TRAIT.INTELLIGENCE = 3;
TRAIT.TECHNOLOGY = 4;
TRAIT.N_TRAIT_TYPES = 5;

TRAIT.TYPE_STR = ["ATH","CHA","EMP","INT","TEC"];
TRAIT.TYPES = {
	"ATH": TRAIT.ATHLETICS,
	"CHA": TRAIT.CHARISMA,
	"EMP": TRAIT.EMPATHY,
	"INT": TRAIT.INTELLIGENCE,
	"TEC": TRAIT.TECHNOLOGY
};

//ALL CARDS
DECK.events = [
	//Fase 1
	//el jugador escoge a que carta le afecta
	{ idc: "inventor",	type: Card.TYPE_EVENT, icon: null, name : "Inventor", scope: "I", phase: 0, power: {TEC: 1, INT: 1} },
	{ idc: "enfermo",	type: Card.TYPE_EVENT, icon: [0,0], name : "Enfermo", scope: "I",  phase: 0, power: {ATH: -1, EMP: 1} },
	{ idc: "te",			type: Card.TYPE_EVENT, icon: [1,0], name : "Fiesta del te", scope: "I",  phase: 0, power: {CHAR: 1, EMP: 1} },
	{ idc: "inundacion", type: Card.TYPE_EVENT, icon: [2,0], name : "Inundacion", scope: "I",  phase: 0, power: {TEC: -1} },
	{ idc: "cosecha",	type: Card.TYPE_EVENT, icon: [3,0], name : "Mala cosecha", scope: "I",  phase: 0, power: {EMP: -1} },
	{ idc: "alcalde",	type: Card.TYPE_EVENT, icon: null, name : "El alcalde", scope: "I",  phase: 0, power: {CHAR: 1} },
	{ idc: "misa",		type: Card.TYPE_EVENT, icon: null, name : "La misa", scope: "I",  phase: 0, power: {EMP: 1} },
	{ idc: "caza",		type: Card.TYPE_EVENT, icon: null, name : "De caza", scope: "I",  phase: 0, power: {ATH: 1} },

	//Fase 2
	{ idc: "jjoo",		type: Card.TYPE_EVENT, icon: [0,1], name : "Los JJOO", scope: "I", phase: 1, power: {ATH: 2 } },
	{ idc: "convencion", type: Card.TYPE_EVENT, icon: [1,1], name : "La Graan Convención", scope: "I",  phase: 1, power: {TEC: 2, INT: 1, ATH: -2, CHAR: -1} },
	{ idc: "compositor", type: Card.TYPE_EVENT, icon: null, name : "Compositor musical", scope: "I",  phase: 1, power: {CHAR: 2} },
	{ idc: "guerra",		type: Card.TYPE_EVENT, icon: [2,1], name : "A la guerra", scope: "I",  phase: 1, power: {EMP: -2, ATH: 1} },
	{ idc: "volar",		type: Card.TYPE_EVENT, icon: [3,1], name : "Volar en avion", scope: "I",  phase: 1, power: {TEC: 2} },
	{ idc: "profesor",	type: Card.TYPE_EVENT, icon: null, name : "El profesor", scope: "I",  phase: 1, power: {INT: 1} },
	{ idc: "poeta",		type: Card.TYPE_EVENT, icon: null, name : "El poeta", scope: "I",  phase: 1, power: {EMP: 1, CHAR:1} },
	{ idc: "borracho",	type: Card.TYPE_EVENT, icon: null, name : "El borracho", scope: "I",  phase: 1, power: {INT: -2, CHAR : 1} },

	//Fase 3
	{ idc: "ejercito",	type: Card.TYPE_EVENT, icon: null, name : "Al ejercito", scope: "I", phase: 2, power: {EMP: -2, ATH: 3} },
	{ idc: "telefono",	type: Card.TYPE_EVENT, icon: [0,2], name : "Telefono nuevo", scope: "I",  phase: 2, power: {CHAR: 3, INT: -2} },
	{ idc: "loteria",	type: Card.TYPE_EVENT, icon: null, name : "Ganar la loteria", scope: "I",  phase: 2, power: {CHAR: 2, EMP: 1, ATH: -2} },
	{ idc: "divino",		type: Card.TYPE_EVENT, icon: [2,2], name : "Toque divino", scope: "I",  phase: 2, power: {EMP: 1, TEC: 1, INT: 1, ATH: 1, CHAR: 1}},
	{ idc: "muerte",		type: Card.TYPE_EVENT, icon: [1,2], name : "La muerte", scope: "I",  phase: 2, action : "death"},
	{ idc: "internet",	type: Card.TYPE_EVENT, icon: null, name : "Internet", scope: "I",  phase: 2, power: {CHAR: -1, TEC: 2, ATH : -2} },
	{ idc: "uni",		type: Card.TYPE_EVENT, icon: [3,2], name : "La universidad", scope: "I",  phase: 2, power: {INT: 2, EMP: 1} },
	{ idc: "paz",		type: Card.TYPE_EVENT, icon: null, name : "La paz mundial", scope: "I",  phase: 2, power: {EMP: 3, TEC: -2} },

	//Globales
	//Afectan a todas las cartas
	{ idc: "internet",	type: Card.TYPE_EVENT, icon: [0,3], name : "Internet", scope: "G", power: {EMP: -1, ATH: 2, ATH : -2} },
	{ idc: "cura",		type: Card.TYPE_EVENT, icon: [1,3], name : "Nueva cura", scope: "G", power: {INT: 2, CHAR: -1, ATH : 1} },
	{ idc: "alien",		type: Card.TYPE_EVENT, icon: [3,3], name : "Invasion alien", scope: "G", power: {EMP: 1, TEC: 3, INT : -2} },
	{ idc: "galaxia",	type: Card.TYPE_EVENT, icon: [2,3], name : "Guerra contra otra galaxia", scope: "G", power: {EMP: -2, TEC: 1, INT : 2} }
];

DECK.goals = [
	// FASE 1
	{ idc: "first",		type: Card.TYPE_GOAL, icon: [0,0], name: "Primero de equipo", score: 1, requisites: {ATH: 3}, phase: 0},
	{ idc: "sobresale",	type: Card.TYPE_GOAL, icon: [1,0], name: "Sobresaliente", score: 1, requisites: {INT: 3}, phase: 0},
	{ idc: "mecanic",	type: Card.TYPE_GOAL, icon: [2,0], name: "Mecanico", score: 1, requisites: {TEC: 3}, phase: 0},
	{ idc: "goodface",	type: Card.TYPE_GOAL, icon: [3,0], name: "Buena Cara", score: 1, requisites: {CHA: 3}, phase: 0},
	{ idc: "goodboy",	type: Card.TYPE_GOAL, icon: [0,1], name: "Bonachon", score: 1, requisites: {EMP: 3}, phase: 0},
	{ idc: "noble",		type: Card.TYPE_GOAL, icon: [2,2], name: "Galan noble", score: 3, requisites: {EMP: 2, CHA: 3}, phase: 0},
	{ idc: "intelect",	type: Card.TYPE_GOAL, icon: [1,1], name: "Fuerte Intelecto", score: 4, requisites: {ATH: 3, TEC: 3}, phase: 0},
	
	// FASE 2
	{ idc: "olympistic",	type: Card.TYPE_GOAL, icon: [1,2], name: "Deportista olimpico", score: 4, requisites: {ATH: 5}, phase: 1},
	{ idc: "delegat",		type: Card.TYPE_GOAL, icon: [1,1], name: "Delegado", score: 4, requisites: {INT: 5}, phase: 1},
	{ idc: "manitas",		type: Card.TYPE_GOAL, icon: [2,0], name: "Manitas", score: 4, requisites: {TEC: 5}, phase: 1},
	{ idc: "entrepeneur",	type: Card.TYPE_GOAL, icon: [2,1], name: "Emprendedor", score: 4, requisites: {CHA: 5}, phase: 1},
	{ idc: "goodman",		type: Card.TYPE_GOAL, icon: [3,1], name: "Buen samaritano", score: 4, requisites: {EMP: 5}, phase: 1},
	{ idc: "calmmind",		type: Card.TYPE_GOAL, icon: [0,2], name: "Mente saludable, Cuerpo fuerte", score: 6, requisites: {ATH: 4, INT: 4}, phase: 1},
	{ idc: "shenergy",		type: Card.TYPE_GOAL, icon: [3,2], name: "Compartir energia", score: 8, requisites: {INT: 4, CHA: 4, EMP: 3}, phase: 1},
	
	// FASE 3
	{ idc: "olegend",		type: Card.TYPE_GOAL, icon: [1,2], name: "Leyenda Deportista", score: 6, requisites: {ATH: 4, INT: 4}, phase: 2},
	{ idc: "intleader",		type: Card.TYPE_GOAL, icon: [1,3], name: "Liderazgo intelectual", score: 10, requisites: {INT: 5, CHA: 4}, phase: 2},
	{ idc: "empathology",	type: Card.TYPE_GOAL, icon: [2,3], name: "Empatia tecnologica", score: 12, requisites: {TEC: 6, EMP: 3}, phase: 2},
	{ idc: "goodlead",		type: Card.TYPE_GOAL, icon: [2,2], name: "Lider bondadoso", score: 20, requisites: {CHA: 6, EMP: 4}, phase: 2},
	{ idc: "simpatlet",		type: Card.TYPE_GOAL, icon: [1,2], name: "Atleta educado", score: 20, requisites: {EMP: 6, ATH: 4}, phase: 2},
	{ idc: "pionero",		type: Card.TYPE_GOAL, icon: [1,1], name: "Pionero de clase", score: 10, requisites: {EMP: 4, INT: 4, CHA: 4}, phase: 2},
	{ idc: "listillo",		type: Card.TYPE_GOAL, icon: [1,3], name: "Listillo", score: 15, requisites: {INT: 4, ATH: 5, TEC: 3}, phase: 2},

	// FASE 4
	{ idc: "charisport",	type: Card.TYPE_GOAL, icon: [1,2], name: "Deportista Caritativo", score: 20, requisites: {ATH: 6, EMP: 4}, phase: 3},
	{ idc: "powerintelect",	type: Card.TYPE_GOAL, icon: [1,3], name: "Potencia intelectual", score: 25, requisites: {INT: 6, CHA: 5}, phase: 3},
	{ idc: "innovintelect",	type: Card.TYPE_GOAL, icon: [1,3], name: "Innovador intelectual", score: 20, requisites: {TEC: 6, INT: 4}, phase: 3},
	{ idc: "ppotencia",		type: Card.TYPE_GOAL, icon: [2,2], name: "Primera potencia", score: 25, requisites: {CHA: 6, ATH: 5}, phase: 3},
	{ idc: "carisoul",		type: Card.TYPE_GOAL, icon: [0,1], name: "Alma caritativa", score: 30, requisites: {EMP: 6, TEC: 6}, phase: 3},
	{ idc: "highbond",		type: Card.TYPE_GOAL, icon: [0,1], name: "Persona bondadosa de alto rango", score: 15, requisites: {CHA: 5, EMP: 5}, phase: 3},
	{ idc: "strongcalm",	type: Card.TYPE_GOAL, icon: [2,3], name: "Ingeniero con fuerza y calma", score: 30, requisites: {ATH: 5, EMP: 5, TEC: 5}, phase: 3},
	{ idc: "grancaridad",	type: Card.TYPE_GOAL, icon: [3,3], name: "Gran caridad", score: 45, requisites: {TEC: 5, INT: 6, EMP: 6}, phase: 3}
];
