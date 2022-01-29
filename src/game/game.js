//Encapsulates a full Game with its players, carsds, etc
//NO RENDER OR INTERACTION HERE, JUST DATA AND RULES

function Game()
{
	this.players = []; //leave it as array to have the possibility to have more than two players
	this.round = 0;
	this.cards = {
		mountM: [],
		mountF: [],
		pool: [],
		mountGoals: [],
		mountEvents: []
	};
	this.current_player = 0; //index
}

Game.prototype.init = function()
{
	//reset all
	this.players = [];

	var player1 = new Player(0);
	this.players.push( player1 );

	var player2 = new Player(1);
	this.players.push( player2 );
}

Game.prototype.getCurrentPlayer = function()
{
	return this.players[ this.current_player ];
}

//player state
function Player(index)
{
	this.index = index;
	this.hand = [];
	this.frontline = [];
	this.won = [];
	this.score = 0;
}

//represent any card of the game, very generic
function Card()
{
	this.type = 0;
	this.visuals = {};
	this.traits = [];
}

Card.TYPE_PERSON = 1;
Card.TYPE_EVENT = 2;
Card.TYPE_GOAL = 3;