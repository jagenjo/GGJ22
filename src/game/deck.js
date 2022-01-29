var DECK = {};

//ALL CARDS
DECK.persons = {
	"Antonio": { type: Card.TYPE_PERSON, name: "Antonio", gender: "M", visuals: {}, traits: ["Deportista", "Torpe" /* ... */]},
	"Maria": { type: Card.TYPE_PERSON, name: "Maria", gender: "F", visuals: {}, traits: ["Rata de biblioteca", "Egoísta" /* ... */]} // ...
};

DECK.events = {
	"Death": { type: Card.TYPE_EVENT, name : "Death", visuals: {}} // ...
};

DECK.goals = {
	"Olimpiadas": { type: Card.TYPE_GOAL, name: "Olimpiadas", visuals: {}} // ...
};
