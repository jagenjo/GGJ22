var DECK = {};

//ALL CARDS
DECK.events = [
	{ id: "death", type: Card.TYPE_EVENT, name : "Muerte"},
	{ id: "pandemy", type: Card.TYPE_EVENT, name : "Pandemia"},
	{ id: "scholarship", type: Card.TYPE_EVENT, name : "Beca"} // ...
];

DECK.goals = [
	{ id: "olympics", type: Card.TYPE_GOAL, name: "Olimpiadas", score: 30, requisites: {"Atletismo": 2}, fase: 0},
	{ id: "nobel", type: Card.TYPE_GOAL, name: "Premio Nobel", score: 30, requisites: {"Cultura": 2}, fase: 0},
	{ id: "cancer", type: Card.TYPE_GOAL, name: "Cura contra el cancer", score: 30, requisites: {"Ciencia": 2}, fase: 0},
	{ id: "president", type: Card.TYPE_GOAL, name: "Presidente", score: 30, requisites: {"Carisma": 2}, fase: 0} // ...
];
