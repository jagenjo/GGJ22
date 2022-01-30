var DECK = {};

var TRAIT = {};

TRAIT.ATHLETICS = 0;
TRAIT.CHARISMA = 1;
TRAIT.EMPATHY = 2;
TRAIT.INTELLIGENCE = 3;
TRAIT.TECHNOLOGY = 4;
TRAIT.N_TRAIT_TYPES = 5;

TRAIT.TYPE_STR = ["ATH","CHA","EMP","INT","TEC"];

//ALL CARDS
DECK.events = [
	//Fase 1
	//el jugador escoge a que carta le afecta
	{ id: "inventor", type: Card.TYPE_EVENT, name : "Inventor", scope: "I", phase: 0, power: {TEC: 1, INT: 1} },
	{ id: "enfermo", type: Card.TYPE_EVENT, name : "Enfermo", scope: "I",  phase: 0, power: {ATH: -1, EMP: 1} },
	{ id: "te", type: Card.TYPE_EVENT, name : "Fiesta del te", scope: "I",  phase: 0, power: {CHAR: 1, EMP: 1} },
	{ id: "cosecha", type: Card.TYPE_EVENT, name : "Mala cosecha", scope: "I",  phase: 0, power: {EMP: -1} },
	{ id: "inundacion", type: Card.TYPE_EVENT, name : "Inundacion", scope: "I",  phase: 0, power: {TEC: -1} },
	{ id: "alcalde", type: Card.TYPE_EVENT, name : "El alcalde", scope: "I",  phase: 0, power: {CHAR: 1} },
	{ id: "misa", type: Card.TYPE_EVENT, name : "La misa", scope: "I",  phase: 0, power: {EMP: 1} },
	{ id: "caza", type: Card.TYPE_EVENT, name : "De caza", scope: "I",  phase: 0, power: {ATH: 1} },

	//Fase 2
	{ id: "jjoo", type: Card.TYPE_EVENT, name : "Los JJOO", scope: "I", phase: 1, power: {ATH: 2 } },
	{ id: "convencion", type: Card.TYPE_EVENT, name : "La Graan Convención", scope: "I",  phase: 1, power: {TEC: 2, INT: 1, ATH: -2, CHAR: -1} },
	{ id: "compositor", type: Card.TYPE_EVENT, name : "Compositor musical", scope: "I",  phase: 1, power: {CHAR: 2} },
	{ id: "guerra", type: Card.TYPE_EVENT, name : "A la guerra", scope: "I",  phase: 1, power: {EMP: -2, ATH: 1} },
	{ id: "volar", type: Card.TYPE_EVENT, name : "Volar en avion", scope: "I",  phase: 1, power: {TEC: 2} },
	{ id: "profesor", type: Card.TYPE_EVENT, name : "El profesor", scope: "I",  phase: 1, power: {INT: 1} },
	{ id: "poeta", type: Card.TYPE_EVENT, name : "El poeta", scope: "I",  phase: 1, power: {EMP: 1, CHAR:1} },
	{ id: "borracho", type: Card.TYPE_EVENT, name : "El borracho", scope: "I",  phase: 1, power: {INT: -2, CHAR : 1} },

	//Fase 3
	{ id: "ejercito", type: Card.TYPE_EVENT, name : "Al ejercito", scope: "I", phase: 2, power: {EMP: -2, ATH: 3} },
	{ id: "telefono", type: Card.TYPE_EVENT, name : "Telefono nuevo", scope: "I",  phase: 2, power: {CHAR: 3, INT: -2} },
	{ id: "loteria", type: Card.TYPE_EVENT, name : "Ganar la loteria", scope: "I",  phase: 2, power: {CHAR: 2, EMP: 1, ATH: -2} },
	{ id: "divino", type: Card.TYPE_EVENT, name : "Toque divino", scope: "I",  phase: 2, power: {EMP: 1, TEC: 1, INT: 1, ATH: 1, CHAR: 1}},
	{ id: "muerte", type: Card.TYPE_EVENT, name : "La muerte", scope: "I",  phase: 2, action : "death"},
	{ id: "internet", type: Card.TYPE_EVENT, name : "Internet", scope: "I",  phase: 2, power: {CHAR: -1, TEC: 2, ATH : -2} },
	{ id: "uni", type: Card.TYPE_EVENT, name : "La universidad", scope: "I",  phase: 2, power: {INT: 2, EMP: 1} },
	{ id: "paz", type: Card.TYPE_EVENT, name : "La paz mundial", scope: "I",  phase: 2, power: {EMP: 3, TEC: -2} },

	//Globales
	//Afectan a todas las cartas
	{ id: "internet", type: Card.TYPE_EVENT, name : "Internet", scope: "G", power: {EMP: -1, ATH: 2, ATH : -2} },
	{ id: "cura", type: Card.TYPE_EVENT, name : "Nueva cura", scope: "G", power: {INT: 2, CHAR: -1, ATH : 1} },
	{ id: "alien", type: Card.TYPE_EVENT, name : "Invasion alien", scope: "G", power: {EMP: 1, TEC: 3, INT : -2} },
	{ id: "galaxia", type: Card.TYPE_EVENT, name : "Guerra contra otra galaxia", scope: "G", power: {EMP: -2, TEC: 1, INT : 2} }
];

DECK.goals = [
	// FASE 1
	{ id: "first", type: Card.TYPE_GOAL, name: "Primero de equipo", score: 1, requisites: {ATH: 3}, phase: 0},
	{ id: "sobresale", type: Card.TYPE_GOAL, name: "Sobresaliente", score: 1, requisites: {INT: 3}, phase: 0},
	{ id: "mecanic", type: Card.TYPE_GOAL, name: "Mecanico", score: 1, requisites: {TEC: 3}, phase: 0},
	{ id: "goodface", type: Card.TYPE_GOAL, name: "Buena Cara", score: 1, requisites: {CHA: 3}, phase: 0},
	{ id: "goodboy", type: Card.TYPE_GOAL, name: "Bonachon", score: 1, requisites: {EMP: 3}, phase: 0},
	{ id: "noble", type: Card.TYPE_GOAL, name: "Galan noble", score: 3, requisites: {EMP: 2, CHA: 3}, phase: 0},
	{ id: "intelect", type: Card.TYPE_GOAL, name: "Fuerte Intelecto", score: 4, requisites: {ATH: 3, TEC: 3}, phase: 0},
	
	// FASE 2
	{ id: "olympistic", type: Card.TYPE_GOAL, name: "Deportista olimpico", score: 4, requisites: {ATH: 5}, phase: 1},
	{ id: "delegat", type: Card.TYPE_GOAL, name: "Delegado", score: 4, requisites: {INT: 5}, phase: 1},
	{ id: "manitas", type: Card.TYPE_GOAL, name: "Manitas", score: 4, requisites: {TEC: 5}, phase: 1},
	{ id: "entrepeneur", type: Card.TYPE_GOAL, name: "Emprendedor", score: 4, requisites: {CHA: 5}, phase: 1},
	{ id: "goodman", type: Card.TYPE_GOAL, name: "Buen samaritano", score: 4, requisites: {EMP: 5}, phase: 1},
	{ id: "calmmind", type: Card.TYPE_GOAL, name: "Mente saludable, Cuerpo fuerte", score: 6, requisites: {ATH: 4, INT: 4}, phase: 1},
	{ id: "shenergy", type: Card.TYPE_GOAL, name: "Compartir energia", score: 8, requisites: {INT: 4, CHA: 4, EMP: 3}, phase: 1},
	
	// FASE 3
	{ id: "olegend", type: Card.TYPE_GOAL, name: "Leyenda Deportista", score: 6, requisites: {ATH: 4, INT: 4}, phase: 2},
	{ id: "intleader", type: Card.TYPE_GOAL, name: "Liderazgo intelectual", score: 10, requisites: {INT: 5, CHA: 4}, phase: 2},
	{ id: "empathology", type: Card.TYPE_GOAL, name: "Empatia tecnologica", score: 12, requisites: {TEC: 6, EMP: 3}, phase: 2},
	{ id: "goodlead", type: Card.TYPE_GOAL, name: "Lider bondadoso", score: 20, requisites: {CHA: 6, EMP: 4}, phase: 2},
	{ id: "simpatlet", type: Card.TYPE_GOAL, name: "Atleta educado", score: 20, requisites: {EMP: 6, ATH: 4}, phase: 2},
	{ id: "pionero", type: Card.TYPE_GOAL, name: "Pionero de clase", score: 10, requisites: {EMP: 4, INT: 4, CHA: 4}, phase: 2},
	{ id: "listillo", type: Card.TYPE_GOAL, name: "Listillo", score: 15, requisites: {INT: 4, ATH: 5, TEC: 3}, phase: 2},

	// FASE 4
	{ id: "charisport", type: Card.TYPE_GOAL, name: "Deportista Caritativo", score: 20, requisites: {ATH: 6, EMP: 4}, phase: 3},
	{ id: "powerintelect", type: Card.TYPE_GOAL, name: "Potencia intelectual", score: 25, requisites: {INT: 6, CHA: 5}, phase: 3},
	{ id: "innovintelect", type: Card.TYPE_GOAL, name: "Innovador intelectual", score: 20, requisites: {TEC: 6, INT: 4}, phase: 3},
	{ id: "ppotencia", type: Card.TYPE_GOAL, name: "Primera potencia", score: 25, requisites: {CHA: 6, ATH: 5}, phase: 3},
	{ id: "carisoul", type: Card.TYPE_GOAL, name: "Alma caritativa", score: 30, requisites: {EMP: 6, TEC: 6}, phase: 3},
	{ id: "highbond", type: Card.TYPE_GOAL, name: "Persona bondadosa de alto rango", score: 15, requisites: {CHA: 5, EMP: 5}, phase: 3},
	{ id: "strongcalm", type: Card.TYPE_GOAL, name: "Ingeniero con fuerza y calma", score: 30, requisites: {ATH: 5, EMP: 5, TEC: 5}, phase: 3},
	{ id: "grancaridad", type: Card.TYPE_GOAL, name: "Gran caridad", score: 45, requisites: {TEC: 5, INT: 6, EMP: 6}, phase: 3}
];
