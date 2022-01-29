var DECK = {};

//ALL CARDS
DECK.events = {
	"Muerte": { type: Card.TYPE_EVENT, name : "Muerte", visuals: {}},
	"Pandemia": { type: Card.TYPE_EVENT, name : "Pandemia", visuals: {}},
	"Beca": { type: Card.TYPE_EVENT, name : "Beca", visuals: {}} // ...
};

DECK.goals = {
	"Olimpiadas": { type: Card.TYPE_GOAL, name: "Olimpiadas", visuals: {}},
	"Premio Nobel": { type: Card.TYPE_GOAL, name: "Premio Nobel", visuals: {}},
	"Cura contra el cancer": { type: Card.TYPE_GOAL, name: "Cura contra el cancer", visuals: {}},
	"Presidente": { type: Card.TYPE_GOAL, name: "Presidente", visuals: {}} // ...
};
