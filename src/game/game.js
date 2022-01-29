//Encapsulates a full Game with its players, carsds, etc
//NO RENDER OR INTERACTION HERE, JUST DATA AND RULES

var GAME = null;
var DECK = {};

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
	//dar cartas a los jugadores hasta que tengan N cartas
	//...

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
	
}

Game.prototype.generateCard = function( type )
{
	var card = new Card();
	//fill
	return card;
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

//represent any card of the game, very generic
function Card()
{
	this.type = 0;
	this.name = "";
	this.visuals = {};
	this.traits = [];

	this._owner = null;
	this._game = null;
}

Card.TYPE_PERSON = 1;
Card.TYPE_EVENT = 2;
Card.TYPE_GOAL = 3;

Card.TYPE_STR = ["NONE","PERSON","EVENT","GOAL"];

Card.prototype.fromJSON = function(json)
{
		
}

Card.prototype.toString = function()
{
	return "CARD: ["+Card.TYPE_STR[this.type]+"]";
}


DECK.events = {
	"death": { type: Card.TYPE_EVENT }
};