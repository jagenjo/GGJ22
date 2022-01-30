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
	this.phase = 0;
	this.cards = {
		persons: { F: [], M: []},
		pool: [],
		mountGoals: [],
		activeGoals: [],
		mountEvents: []
	};
	this.current_player = 0; //index
	this.last_card_id = 0;

	this.onCardDestroyed = null; //called when a card dissapears from the game (used to free memory)

	this.names_DB =
	{
		F: ["Maria", "Carmen", "Isabel", "Ana", "Laura", "Cristina", "Marta", "Pilar", "Emma", "Elizabeth", "Margaret", "Alice", "Sarah", "Bertha", "Mabel", "Bessie", "Yinuo", "Xinyi", "Zihan", "Yutong", "Xinyan", "Kexin", "Yuxi", "Mengyao", "Sunita", "Anita", "Gita", "Rekha", "Lakshmi", "Manju", "Shanti", "Usha"],
		M: ["Antonio", "Jose", "Manuel", "Francisco", "Juan", "David", "Javier", "Pedro", "John", "William", "James", "Charles", "George", "Frank", "Thomas", "Henry", "Yichen", "Yuxuan", "Haouyu", "Zimo", "Yuhang", "Haoran", "Zihao", "Zizhuo", "Ram", "Mohammed", "Sri", "Santosh", "Sanjay", "Sunil", "Rajesh", "Ramesh"],
		surnames: ["Perez", "Garcia", "Gonzalez", "Rodriguez", "Fernandez", "Martin", "Jimenez", "Ruiz", "Smith", "Johnson", "Brown", "Jones", "Miller", "Wilson", "Moore", "Walker", "Wang", "Li", "Zhang", "Liu", "Chen", "Yang", "Huang", "Zhao", "Devi", "Singh", "Kumar", "Das", "Kaur", "Ram", "Yadav", "Kumari"]
	};
}

Game.verbose = true;


Game.prototype.init = function()
{
	if(Game.verbose)
		console.log(" + NEW GAME ");

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
	if(Game.verbose)
		console.log(" + Fill Stacks ");

	// Rellenar los montones del game a partir del mazo
	const N_PERSON_CARDS = 64; // Multiple de 2
	for (const gender of ["F", "M"])
	{
		for (var i = 0; i < N_PERSON_CARDS / 2; ++i)
		{
			var card = this.generatePersonCard(gender);
			card._game = this;
			this.cards.persons[gender].push(card);
		}
	}
	for (var i = 0; i < DECK.events.length; ++i)
	{
		var card = new Card(this);
		card._template = DECK.events[i];
		card.fromJSON(card._template);
		card._game = this;
		this.cards.mountEvents.push(card);
	}
	for (var i = 0; i < DECK.goals.length; ++i)
	{
		var card = new Card(this);
		card._template = DECK.goals[i];
		card.fromJSON(card._template);
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
				card._owner = this.players[i];
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
	this.updateGoals(0);
}

Game.prototype.endTurn = function()
{
	if(Game.verbose)
		console.log(" + End Turn");

	var player = this.getCurrentPlayer();

	// Ejecutamos las acciones pendientes del jugador actual
	for (var i = 0; i < player.actions.length; ++i)
		player.actions[i].execute();
	player.actions = [];

	// El turno pasa al siguiente jugador
	this.current_player = (this.current_player+1) % 2;

	player = this.getCurrentPlayer();


	// Si quedan cartas en la mano nada mas que hacer
	if (player.hand.length != 0)
		return;

	//sino es que se ha terminado la ronda y debemos empezar una nueva
	++this.turn;
	if (this.turn % 3 == 0)
	{
		this.startPhase();
	}

	// Nueva ronda, las cartas en frontline de ambos players se hacen adultas y pasan a la mano
	for (var i = 0; i < this.players.length; ++i)
	{
		player = this.players[i];
		for (var j = 0; j < player.frontline.length; ++j )
		{
			//this.players[i].frontline[j].growUp();
			var card = player.frontline[j];
			player.hand.push( card );
		}

		player.frontline = [];

		// Dar carta de evento scope=="I" a jugador y que haga lo que sea
		var indiviudal_events = [];
		for (var j = 0; j < this.cards.mountEvents.length; ++j)
		{
			if (this.cards.mountEvents[j].scope == "I" && this.cards.mountEvents[j].phase == this.phase)
			{
				indiviudal_events.push(this.cards.mountEvents[j]);
			}
		}
		this.getCurrentPlayer().offered_event_card = indiviudal_events.random();
	}
}

Game.prototype.startPhase = function()
{
	if(Game.verbose)
		console.log(" + Start phase");
	++this.phase;
	// Cambiamos las cartas de objetivo de la mesa descartando las previas
	this.updateGoals(this.phase);
	// Evento global
}

Game.prototype.updateGoals = function( phase )
{
	this.cards.activeGoals = [];
	var phase_goals = [];
	for (var i = 0; i < this.cards.mountGoals.length; ++i)
	{
		if (this.cards.mountGoals[i].phase == phase)
		{
			phase_goals.push(this.cards.mountGoals[i]);
		}
	}

	const N_ACTIVE_GOALS = 3;
	for (var i = 0; i < N_ACTIVE_GOALS; ++i)
	{
		var card = phase_goals.randomPop();
		this.cards.activeGoals.push(card);
	}
}

Game.prototype.getCurrentPlayer = function()
{
	return this.players[ this.current_player ];
}

Game.prototype.getCurrentPlayerCardInHand = function( card_id )
{
	var player = this.getCurrentPlayer();
	for (var i = 0; i < player.hand.length; ++i)
	{
		if (player.hand[i].id == card_id)
		{
			return player.hand[i];
		}
	}
	
	if(Game.verbose)
		console.log("Error: Card " + card_id + " doesn't exist in player " + (player.index) + "'s hand");
}

Game.prototype.getPoolCard = function( card_id )
{
	for (var i = 0; i < this.cards.pool.length; ++i)
	{
		if (this.cards.pool[i].id == card_id)
		{
			return this.cards.pool[i];
		}
	}
	
	if(Game.verbose)
		console.log("Error: Card " + card_id + " doesn't exist in game pool.");
}

Game.prototype.isGoalValid = function( hand_id, goal_id )
{
	var requisites_met = 0;
	var n_requisites = 0;
	var hand_card = this.getCurrentPlayerCardInHand(hand_id);
	var goal_card = this.getActiveGoalCard(goal_id);
	for (requisite_type in goal_card.requisites)
	{
		++n_requisites;
		for (var i = 0; i < hand_card.traits.length; ++i)
		{
			var trait = hand_card.traits[i];
			if (TRAIT.TYPE_STR[trait.type] == requisite_type && trait.level >= goal_card.requisites[requisite_type])
			{
				++requisites_met;
				break;
			}
		}
	}
	return requisites_met == n_requisites;
}

Game.prototype.getActiveGoalCard = function( card_id )
{
	for (var i = 0; i < this.cards.activeGoals.length; ++i)
	{
		if (this.cards.activeGoals[i].id == card_id)
		{
			return this.cards.activeGoals[i];
		}
	}
	
	if(Game.verbose)
		console.log("Error: Card " + card_id + " doesn't exist as a current active goal.");
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
	if(Game.verbose)
		console.log(" + Generating Card: " + gender );

	var card = new Card(this);
	card.type = Card.TYPE_PERSON;
	card.gender = gender;
	card.name = this.names_DB[card.gender].random() + " " + this.names_DB.surnames.random();
	// card.visuals...
	// Asignamos traits
	var tmp_traits = [];
	for (var i = 0; i < TRAIT.N_TRAIT_TYPES; ++i)
	{
		tmp_traits.push(i);
	}

	var n_traits = [1,2].random();
	for (var i = 0; i < n_traits; ++i)
	{
		card.traits.push({type: tmp_traits.randomPop(), level: [1,2].random()});
	}

	// Ordenamos los traits por nivel decrecientemente
	card.traits.sort(function (a,b) {
		return b.level - a.level;
	})

	return card;
}

Game.prototype.pairCards = function ( hand_id, pool_id )
{
	if(Game.verbose)
		console.log(" + Pairing: " + hand_id + " with " + pool_id);
	var new_card = this.mergeCards(hand_id, pool_id);
	var player = this.getCurrentPlayer();
	new_card._owner = player;
	// Quitamos la carta que hemos emparejado de la mano del jugador
	for (var i = 0; i < player.hand.length; ++i)
	{
		var card = player.hand[i];
		if (card.id == hand_id)
		{
			player.hand.splice(i, 1);
			if( this.onCardDestroyed )
				this.onCardDestroyed( player, "hand", card, i );
			break;
		}
	}
	// Quitamos la carta que hemos emparejado de la pool del tablero
	for (var i = 0; i < this.cards.pool.length; ++i)
	{
		if (this.cards.pool[i].id == pool_id)
		{
			// Además, suplimos el hueco que queda en la pool con una carta más del mazo del género que se acabe de sacar
			var card = this.cards.pool[i];
			if( this.onCardDestroyed )
				this.onCardDestroyed( player, "pool", card, i );
			this.cards.pool[i] = this.cards.persons[ this.cards.pool[i].gender ].randomPop();
			break;
		}
	}
	// Añadimos la nueva carta fruto de emparejamiento en la frontline del jugador
	player.frontline.push(new_card);
	if(Game.verbose)
		console.log(" = Result: " + new_card.id );
}

Game.prototype.mergeCards = function ( hand_id, pool_id )
{
	if(Game.verbose)
		console.log(" + Merging cards: " +  hand_id + " + " + pool_id );

	var hand_card = this.getCurrentPlayerCardInHand( hand_id );
	var pool_card = this.getPoolCard( pool_id );

	var new_card = new Card(this);
	new_card.type = Card.TYPE_PERSON;
	new_card.gender = ["F","M"].random();
	new_card.name = this.names_DB[new_card.gender].random() + " " + [hand_card, pool_card].random().name.split(" ")[1];

	var trait_pool = [];
	for (var trait_type = 0; trait_type < TRAIT.N_TRAIT_TYPES; ++trait_type)
	{
		var trait_level = 0;
		for (var i = 0; i < hand_card.traits.length; ++i)
		{
			if (hand_card.traits[i].type == trait_type)
			{
				trait_level += hand_card.traits[i].level;
			}
		}
		for (var i = 0; i < pool_card.traits.length; ++i)
		{
			if (pool_card.traits[i].type == trait_type)
			{
				trait_level += pool_card.traits[i].level;
			}
		}
		trait_pool.push({type: trait_type, level: Math.ceil(0.6*trait_level)});
	}

	// Ordenamos decrecientemente la trait pool por level; si tienen el mismo level, el orden es random
	trait_pool.sort(function (a,b) {
		var ret = b.level - a.level;
		return ret != 0 ? ret : [-1,1].random();
	})

	// Le añadimos 1 al atributo mas fuerte
	++trait_pool[0].level;

	for (var i = 3; i < TRAIT.N_TRAIT_TYPES; ++i)
	{
		trait_pool[i]
	}

	new_card.traits = trait_pool.filter(trait => trait.level > 0);

	return new_card;
}

Game.prototype.applyEvent = function ( hand_id, event_id )
{
	var hand_card = this.getCurrentPlayer().hand.filter(card => card.id == hand_id)[0];
	var event_card = this.cards.mountEvents.filter(card => card.id == event_id)[0];

	for (power_type in event_card.power)
	{
		const power_idx = TRAIT.TYPE_STR.indexOf(power_type);
		var traits = hand_card.traits.filter(trait => trait.type == power_idx);
		if (traits.length == 0)
		{
			hand_card.traits.push({type: power_idx, level: event_card.power[power_type]});
			console.log(" + Adding Trait " + power_type + " of level " + event_card.power[power_type] + " to card " + hand_id);
		}
		else
		{
			hand_card.traits[hand_card.traits.indexOf(traits[0])].level += event_card.power[power_type];
			console.log(" + Updating Trait " + power_type + " of level " + event_card.power[power_type] + " to card " + hand_id);
		}
		hand_card.traits = hand_card.traits.filter(trait => trait.level > 0);
		
		hand_card.traits.sort(function (a,b) {
			var ret = b.level - a.level;
			return ret != 0 ? ret : [-1,1].random();
		});
		
		var MAX_TRAITS = 4;
		if (hand_card.traits.length > MAX_TRAITS)
			hand_card.traits.splice(MAX_TRAITS, hand_card.traits.length - MAX_TRAITS);
	}
	hand_card._must_update = true;
	
	var player = this.getCurrentPlayer();
	if( this.onCardDestroyed )
		this.onCardDestroyed( player, "event", event_card );
	player.offered_event_card = null;
}

Game.prototype.submitGoal = function ( hand_id, goal_id )
{
	if(Game.verbose)
		console.log(" + Submit goals: " +  hand_id + " -> " + goal_id );

	var goal_card = this.getGoalCard( goal_id );
	var player = this.getCurrentPlayer();
	
	// Si cumple el goal, quitamos la carta de objetivo de la pila de cartas de objetivo activas y la sustituimos por otra del mazo
	// Ademas, la añadimos al mazo de cartas ganadas del jugador
	if (this.isGoalValid(hand_id, goal_id))
	{
		var phase_goals = [];
		for (var i = 0; i < this.cards.mountGoals.length; ++i)
		{
			if (this.cards.mountGoals[i].phase == this.phase)
			{
				phase_goals.push(this.cards.mountGoals[i]);
			}
		}
		for (var i = 0; i < this.cards.activeGoals.length; ++i)
		{
			if (this.cards.activeGoals[i].id == goal_card.id)
			{
				this.cards.activeGoals[i] = phase_goals.random();
				break;
			}
		}
		player.won.push(goal_card);
		// Sumamos la puntuación del jugador
		for (var i = 0; i < player.hand.length; ++i)
		{
			if (player.hand[i].id == hand_id)
			{
				player.score += goal_card.score;
				break;
			}
		}
	}
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

Game.prototype.toString = function()
{
	var str = "";	
	str += this.players[0].toString();
	str += this.players[1].toString();
	str += "  # Table Pool ("+this.cards.pool.length+"):\n";
	for(var i = 0; i < this.cards.pool.length; ++i)
		str += "     . " + this.cards.pool[i].toString() + "\n";
	str += "  # GOALS ("+this.cards.activeGoals.length+"):\n";
	for(var i = 0; i < this.cards.activeGoals.length; ++i)
		str += "     . " + this.cards.activeGoals[i].toString() + "\n";
	return str;
}

Game.prototype.toConsole = function()
{
	GAME.toString().split("\n").forEach( a=>console.log("%c " + a, "color: #111; background-color: #EEE") );
}

//player state
function Player(index)
{
	this.index = index;
	this.hand = [];
	this.frontline = [];
	this.won = [];
	this.score = 0;
	this.offered_event_card = null;

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
	this.actions.push( action );
}

Player.prototype.toJSON = function()
{
	return {index: this.index, hand: this.hand.toJSON(), frontline: this.frontline.toJSON(), won: won.toJSON(), score: this.score, actions: actions.toJSON()};
}

Player.prototype.fromJSON = function(json)
{
	
}

Player.prototype.toString = function()
{
	var str = " - Player [" + this.index + "]\n";
	str += "   Hand ("+this.hand.length+"):\n";
	for(var i = 0; i < this.hand.length; ++i)
		str += "     . " + this.hand[i].toString() + "\n";
	str += "   Front ("+this.frontline.length+"):\n";
	for(var i = 0; i < this.frontline.length; ++i)
		str += "     . " + this.frontline[i].toString() + "\n";
	str += "   Won ("+this.frontline.length+") Score: "+this.score+"\n";
	return str;
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
	this.scope = "";
	this.phase = -1;
	this.power = {};
	this.requisites = {};
	this.score = -1;
	this.slot = -1;

	this._owner = null;
	this._game = null;
	this._template = null;
}

Card.TYPE_PERSON = 1;
Card.TYPE_EVENT = 2;
Card.TYPE_GOAL = 3;

Card.TYPE_STR = ["NONE","PERSON","EVENT","GOAL"];

Card.prototype.toJSON = function()
{
	return { id: this.id, idc: this.idc, type: this.type, name: this.name, gender: this.gender, visuals: this.visuals, traits: this.traits };
}

Card.prototype.fromJSON = function(json)
{
	if (json.id!=undefined) this.id = json.id;
	if (json.idc!=undefined) this.idc = json.idc;
	if (json.type!=undefined) this.type = json.type;
	if (json.name!=undefined) this.name = json.name;
	if (json.gender!=undefined) this.gender = json.gender;
	if (json.visuals!=undefined) this.visuals = json.visuals;
	if (json.traits!=undefined) this.traits = json.traits;
	if (json.scope!=undefined) this.scope = json.scope;
	if (json.phase!=undefined) this.phase = json.phase;
	if (json.power!=undefined) this.power = json.power;
	if (json.requisites!=undefined) this.requisites = json.requisites;
	if (json.score!=undefined) this.score = json.score;
}

Card.prototype.toString = function()
{
	var str = "CARD "+this.id+": ["+Card.TYPE_STR[this.type]+"] ";
	if(this.idc)
		str += "'"+this.idc+"' ";
	else if(this.name)
		str += "'"+this.name+"' ";
	if(this.gender != "")
		str += "Gender:" + this.gender + " ";

	if( this.type == Card.TYPE_PERSON )
		for(var i = 0; i < this.traits.length; ++i)
		{
			var t = this.traits[i];
			str += TRAIT.TYPE_STR[ t.type ] + ":" + t.level + " ";
		}
	if( this.type == Card.TYPE_EVENT )
	{
		for(var i = 0; i < this.power.length; ++i)
			str += i + ":" + this.power[i] + " ";
	}
	if( this.type == Card.TYPE_GOAL )
	{
		for(var i = 0; i < this.power.length; ++i)
			str += i + ":" + this.power[i] + " ";
	}
	return str;
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
	this.type = Math.max(0, Action.TYPE_STR.indexOf(json.type || "NONE"));
	this.hand_card = json.hand_card_id;
	this.secondary_card = json.pool_card_id || json.event_card_id || json.goal_card_id || -1;
	this._owner = GAME.players[Math.min(json.player_index, GAME.players.length-1)];
	this._game = GAME;
}

Action.prototype.execute = function()
{
	console.log(" + executing action: " + this.type );
	switch (this.type)
	{
		case Action.TYPE_PAIR_CARDS:
			this._game.pairCards(this.hand_card, this.secondary_card);
			break;
		case Action.TYPE_APPLY_EVENT:
			this._game.applyEvent(this.hand_card, this.secondary_card);
			break;
		case Action.TYPE_SUBMIT_GOAL:
			this._game.submitGoal(this.hand_card, this.secondary_card);
			break;
		default:
			var accepted_actions = "";
			for (var i = 1; i < Action.TYPE_STR.length; ++i)
				accepted_actions += Action.TYPE_STR[i] + (i < Action.TYPE_STR.length - 1 ? ", " : "");
			console.log("Error: Unrecognized action.\nList of accepted actions: " + accepted_actions);
	}
}