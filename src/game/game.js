//Encapsulates a full Game with its players, cards, etc
//NO RENDER OR INTERACTION HERE, JUST DATA AND RULES

Array.prototype.random = function()
{
	var v = Math.floor( Math.random() * this.length );
	return this[v];
}

Array.prototype.randomPop = function()
{
	var v = Math.floor( Math.random() * this.length );
	var c = this.splice(v,1);
	return c[0];
}

//GAME *******************************************
var GAME = null;

function Game()
{
	GAME = this;
	this.players = []; //leave it as array to have the possibility to have more than two players
	this.turn = 0;
	this.era = 0;
	this.cards = {
		persons: { F: [], M: []},
		pool: [],
		mountGoals: [],
		activeGoals: [],
		mountEvents: []
	};
	this.current_player = 0; //index
	this.last_card_id = 0;

	this.onNewTurn = null;
}


Game.prototype.init = function()
{
	//reset all
	this.players = [];

	var player1 = new Player(0);
	this.players.push( player1 );
	player1._game = this;

	var player2 = new Player(1);
	this.players.push( player2 );
	player2._game = this;

	this.last_card_id = 0;

	this.fillStacks();
}


Game.prototype.fillStacks = function()
{
	// Rellenar los montones del game a partir del mazo
	const N_PERSON_CARDS = 16; // Multiple de 2
	for (const gender of ["F", "M"])
	{
		for (var i = 0; i < N_PERSON_CARDS / 2; ++i)
		{
			var card = this.generatePersonCard(gender);
			card._game = this;
			this.cards.persons[gender].push(card);
		}
	}
	for (var card_key in DECK.events)
	{
		var card = new Card(this);
		card.fromJSON(DECK.events[card_key]);
		card._game = this;
		this.cards.mountEvents.push(card);
	}
	for (const card_key in DECK.goals)
	{
		var card = new Card(this);
		card.fromJSON(DECK.goals[card_key]);
		card._game = this;
		this.cards.mountGoals.push(card);
	}

	//dar cartas a los jugadores hasta que tengan N cartas
	var N_CARDS_IN_HAND = 4; // Multiple de 2
	for (var i = 0; i < this.players.length; ++i)
	{
		for (const gender of ["F", "M"])
		{
			for (var j = 0; j < N_CARDS_IN_HAND / 2; ++j)
			{
				var card = this.cards.persons[gender].randomPop();
				card.__owner = this.players[i];
				this.players[i].hand.push(card);
			}
		}
	}

	//rellenar el pool de la mesa hasta que haya Nx2 cartas
	for (const gender of ["F", "M"])
	{
		for (var i = 0; i < N_CARDS_IN_HAND; ++i)
		{
			var card = this.cards.persons[gender].randomPop();
			this.cards.pool.push(card);
		}
	}

	//rellenar los objetivos de la mesa
	const N_ACTIVE_GOALS = 3;
	for (var i = 0; i < N_ACTIVE_GOALS; ++i)
	{
		var card = this.cards.mountGoals.randomPop();
		this.cards.activeGoals.push(card);
	}
}

Game.prototype.endTurn = function()
{
	//evaluate results
		//create child cards
		//
	
	for (var i = 0; i = this.players[current_player].actions.length; ++i)
	{
		this.players[current_player].actions[i].execute();
	}
	current_player = (current_player+1) % 2;
	if (this.players[current_player].hand.length == 0)
	{
		// nueva ronda, las cartas en frontline de ambos players se hacen adultas y pasan a la mano
		++this.turn;
		if (this.turn % 3 == 0)
		{
			this.startEra();
		}
	}
}

Game.prototype.startEra = function()
{
	++this.era;
	// update goal pile
	// evento global
}

Game.prototype.getCurrentPlayer = function()
{
	return this.players[ this.current_player ];
}

Game.prototype.demoGame = function()
{
	this.init();
	//create playrs
	//hago accion
	//paso turno

}

Game.prototype.generatePersonCard = function( gender )
{
	const names_DB = { F: ["Laura", "Julia", "Miriam"], M: ["Antonio", "Marc", "Pablo"] };
	const trait_DB = { positive: ["Deportista", "Culto", "Lider"], negative: ["Timido", "Torpe", "Egoista"] };

	var card = new Card(this);
	card.type = Card.TYPE_PERSON;
	card.name = names_DB[gender].random();
	card.gender = gender;
	// card.visuals...
	card.traits.push(trait_DB.positive.random());
	card.traits.push(trait_DB.negative.random());
	return card;
}

Game.prototype.pairCards = function ( hand_id, pool_id )
{
	// new_card = merge_cards(hand, pool)
	// remove card from player hand
	// remove card from pool
	// add new_card to player frontline
	// add random card from game.cards.persons to pool
}

Game.prototype.applyEvent = function ( hand_id, event_id )
{
	// "boost" hand card according to event card (necesita stats la clase Card?)
}

Game.prototype.submitGoal = function ( hand_id, goal_id )
{
	// remove card from player hand
	// remove card_g from game.cards.activeGoals
	// add card_g to player.won
	// add score to player (las cartas de objetivo necesitan atributo score?)
}

Game.prototype.toJSON = function()
{
	return { 
		players: this.players.toJSON(),
		card_piles: this.cards.toJSON(),
		turn: this.turn,
		current_player_idx: this.current_player,
		last_card_id: this.last_card_id
	};
}

Game.demogame = {};

Game.prototype.fromJSON = function(json)
{
}

//player state
function Player(index)
{
	this.index = index;
	this.hand = [];
	this.frontline = [];
	this.won = [];
	this.score = 0;

	this.actions = [];

	this._game = null;
}

Player.prototype.addCard = function( card, target )
{
	//add and flag
}

//select couple, select goal
Player.prototype.addAction = function( action_str, hand_card_id, secondary_card_id )
{
	var action = new Action;
	action.type = Action.TYPE_STR.indexOf(action_str.toUpperCase());
	action.hand_card = hand_card_id;
	action.secondary_card = secondary_card_id;
	action._owner = this;
	action._game = this._game;
	switch (action.type)
	{
		case Action.TYPE_PAIR_CARDS:
		{
			action.execute = function () { this._game.pairCards(this.hand_card, this.secondary_card); };
			break;
		}
		case Action.TYPE_APPLY_EVENT:
		{
			action.execute = function () { this._game.applyEvent(this.hand_card, this.secondary_card); };
			break;
		}
		case Action.TYPE_SUBMIT_GOAL:
		{
			action.execute = function () { this._game.submitGoal(this.hand_card, this.secondary_card); };
			break;
		}
		default:
		{
			var accepted_actions = "";
			for (var i = 1; i < Action.TYPE_STR.length; ++i)
			{
				accepted_actions += Action.TYPE_STR[i] + (i < Action.TYPE_STR.length - 1 ? ", " : "");
			}
			console.log("Error: Unrecognized action.\nList of accepted actions: " + accepted_actions);
		}
	}
}

Player.prototype.toJSON = function()
{
	return {index: this.index, hand: this.hand.toJSON(), frontline: this.frontline.toJSON(), won: won.toJSON(), score: this.score, actions: actions.toJSON()};
}

Player.prototype.fromJSON = function(json)
{
	
}


//represent any card of the game, very generic
function Card( game )
{
	if(!game)
		throw("no game specified");

	this.id = game.last_card_id++;
	this.type = 0;
	this.name = "";
	this.gender = "";
	this.visuals = {};
	this.traits = [];

	this._owner = null;
	this._game = null;
}

Card.TYPE_PERSON = 1;
Card.TYPE_EVENT = 2;
Card.TYPE_GOAL = 3;

Card.TYPE_STR = ["NONE","PERSON","EVENT","GOAL"];

Card.prototype.toJSON = function()
{
	return { id: this.id, type: this.type, name: this.name, gender: this.gender, visuals: this.visuals, traits: this.traits };
}

Card.prototype.fromJSON = function(json)
{
	this.id = json.id || this.id;
	this.type = json.type || this.type;
	this.name = json.name || this.name;
	this.gender = json.gender || this.gender;
	this.visuals = json.visuals || this.visuals;
	this.traits = json.traits || this.traits;
}

Card.prototype.toString = function()
{
	return "CARD: ["+Card.TYPE_STR[this.type]+"]";
}

function Action()
{
	this.type = 0;

	// Ids of the cards involved in the action
	this.hand_card = -1;
	this.secondary_card = -1;

	this._owner = null;
	this._game = null;
}

Action.TYPE_PAIR_CARDS = 1;
Action.TYPE_APPLY_EVENT = 2;
Action.TYPE_SUBMIT_GOAL = 3;

Action.TYPE_STR = ["NONE","PAIR_CARDS","APPLY_EVENT","SUBMIT_GOAL"];

Action.prototype.toJSON = function()
{
	var ret = {type: Action.TYPE_STR[this.type], player_index: this._owner.index, hand_card_id: this.hand_card};
	if (this.type > 0)
	{
		ret[["pool_card_id","event_card_id","goal_card_id"][this.type-1]] = this.secondary_card;
	}
	return ret;
}

Action.prototype.fromJSON = function(json)
{
	
}
