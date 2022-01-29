//Encapsulates a full Game with its players, cards, etc
//NO RENDER OR INTERACTION HERE, JUST DATA AND RULES

var GAME = null;

function Game()
{
	GAME = this;
	this.players = []; //leave it as array to have the possibility to have more than two players
	this.turn = 0;
	this.cards = {
		mountM: [],
		mountF: [],
		pool: [],
		mountGoals: [],
		mountEvents: []
	};
	this.current_player = 0; //index

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
}


Game.prototype.fillStacks = function()
{
	// Rellenar los montones del game a partir del mazo
	for (const card_key in DECK.persons) //DECK.persons me da undefined
	{
		const card_JSON = DECK.persons[card_key];
		var card = new Card;
		card.fromJSON(card_JSON);
		console.log(card);
		card.game = this;
		card.gender === "F" ? this.cards.mountF.push(card) : card.gender === "M" ? this.cards.mountM.push(card) : console.log("Error: Gender not recognized:" + card.gender);
	}
	for (const card_key in DECK.event_card_key)
	{
		const card_JSON = DECK.events[card_key];
		var card = new Card;
		card.fromJSON(card_JSON);
		console.log(card);
		card.game = this;
		this.cards.mountEvents.push(card);
	}
	for (const goal_card_key in DECK.goals)
	{
		const card_JSON = DECK.goals[card_key];
		var card = new Card;
		card.fromJSON(card_JSON);
		console.log(card);
		card.game = this;
		this.cards.mountGoals.push(card);
	}

	//dar cartas a los jugadores hasta que tengan N cartas
	//...
	var N_CARDS_IN_HAND = 4;
	for (var i = 0; i < this.players.length; ++i)
	{
		for (var j = 0; j < N_CARDS_IN_HAND; ++j)
		{
			// y si this.cards.mountF/mountM.length == 0?
			var card = j % 2 == 0 ? this.cards.mountF[Math.floor(Math.random() * this.cards.mountF.length)] : this.cards.mountM[Math.floor(Math.random() * this.cards.mountM.length)];
			this.players[i].hand.push(card);
		}
	}

	//rellenar el pool de la mesa hasta que haya Nx2 cartas

	//rellenar los objetivos de la mesa
}

Game.prototype.endTurn = function()
{
	//evaluate results
		//create child cards
		//
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

Game.prototype.generatePersonCard = function( type )
{
	var card = new Card();
	//fill name
	//fill attributes
	return card;
}


Game.prototype.toJSON = function()
{
	return {};
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
Player.prototype.addAction = function()
{
	
}

Player.prototype.toJSON = function()
{
	return {};
}

Player.prototype.fromJSON = function(json)
{
	
}


//represent any card of the game, very generic
function Card()
{
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
	return { type: this.type, name: this.name, gender: this.gender, visuals: this.visuals, traits: this.traits };
}

Card.prototype.fromJSON = function(json)
{
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
