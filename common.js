const VERSION = '1.1';


/**
 * @typedef {Object} TeamObj
 * @property {number} index
 * @property {string} name
 */

class Team {

	/**
	 * @type {number}
	 */
	index;

	/**
	 * @type {string}
	 */
	name;

	/**
	 * @type {Organization}
	 */
	organization;

	/**
	 * @param {number} index
	 * @param {string} name
	 * @param {Organization} organization
	 */
	constructor(index, name, organization) {
		this.index = index;
		this.name = name;
		this.organization = organization;
	}

	/**
	 * @param {TeamObj} obj
	 * @param {Organization} organization
	 */
	static parse(obj, organization) {
		organization.appendTeam(obj.name);
	}

	/**
	 * @returns {TeamObj}
	 */
	build() {
		return {
			index: this.index,
			name: this.name,
		};
	}

	/**
	 * @param {string} name
	 */
	update(name) {
		this.name = name;
	}

	moveUp() {
		if (this.isFirst())
			throw 'Team::moveUp: team is first';
		const index = this.index;
		const other = this.organization.teamList[index - 1];
		other.index = index;
		this.index = index - 1;
		this.organization.teamList[index] = other;
		this.organization.teamList[index - 1] = this;
	}

	moveDown() {
		if (this.isLast())
			throw 'Team::moveDown: team is last';
		const index = this.index;
		const other = this.organization.teamList[index + 1];
		other.index = index;
		this.index = index + 1;
		this.organization.teamList[index] = other;
		this.organization.teamList[index + 1] = this;
	}

	delete() {
		let index = this.index;
		this.organization.teamList.splice(index, 1);
		while (index < this.organization.teamList.length) {
			this.organization.teamList[index].index--;
			index++;
		}
		this.organization.contestantList
			.filter(contestant => contestant.team === this)
			.forEach(contestant => contestant.team = null);
	}

	/**
	 * @returns boolean
	 */
	isFirst() {
		return this.index === 0;
	}

	/**
	 * @returns boolean
	 */
	isLast() {
		return this.index === this.organization.teamList.length - 1;
	}

	/**
	 * @returns {string}
	 */
	getNameWithIndex() {
		return `${this.index + 1}. ${this.name}`;
	}
}


/**
 * @typedef {Object} ContestantObj
 * @property {number} index
 * @property {string} name
 * @property {?number} team
 */

class Contestant {

	/**
	 * @type {number}
	 */
	index;

	/**
	 * @type {string}
	 */
	name;

	/**
	 * @type {?Team}
	 */
	team;

	/**
	 * @type {Organization}
	 */
	organization;

	/**
	 * @param {number} index
	 * @param {string} name
	 * @param {?Team} team
	 * @param {Organization} organization
	 */
	constructor(index, name, team, organization) {
		this.index = index;
		this.name = name;
		this.team = team;
		this.organization = organization;
	}

	/**
	 * @param {ContestantObj} obj
	 * @param {Organization} organization
	 */
	static parse(obj, organization) {
		organization.appendContestant(obj.name, organization.getTeam(obj.team));
	}

	/**
	 * @returns {ContestantObj}
	 */
	build() {
		return {
			index: this.index,
			name: this.name,
			team: this.team?.index ?? null,
		};
	}

	/**
	 * @param {string} name
	 * @param {?Team} team
	 */
	update(name, team) {
		this.name = name;
		this.team = team;
	}

	delete() {
		let index = this.index;
		this.organization.contestantList.splice(index, 1);
		while (index < this.organization.contestantList.length) {
			this.organization.contestantList[index].index--;
			index++;
		}
	}

	/**
	 * @returns {string}
	 */
	getNameWithTeam() {
		return this.name + (this.team !== null ? ` (${this.team.index + 1}${textDict.teamSuffix})` : '');
	}
}


/**
 * @typedef {Object} ChampionshipObj
 * @property {string} name
 * @property {number} unitCap
 * @property {number} gameCap
 * @property {RoundObj[]} roundList
 */

class Championship {

	/**
	 * @type {number}
	 */
	index;

	/**
	 * @type {string}
	 */
	name;

	/**
	 * @type {number}
	 */
	unitCap;

	/**
	 * @type {number}
	 */
	gameCap;

	/**
	 * @type {Round[]}
	 */
	roundList = [];

	/**
	 * @type {Organization}
	 */
	organization;

	/**
	 * @param {number} index
	 * @param {string} name
	 * @param {number} unitCap
	 * @param {number} gameCap
	 * @param {Organization} organization
	 */
	constructor(index, name, unitCap, gameCap, organization) {
		this.index = index;
		this.name = name;
		this.unitCap = unitCap;
		this.gameCap = gameCap;
		this.organization = organization;
	}

	/**
	 * @param {ChampionshipObj} obj
	 * @param {Organization} organization
	 */
	static parse(obj, organization) {
		const championship = organization.appendChampionship(obj.name, obj.unitCap, obj.gameCap);
		obj.roundList.forEach(round => Round.parse(round, championship));
	}

	/**
	 * @returns {ChampionshipObj}
	 */
	build() {
		return {
			name: this.name,
			unitCap: this.unitCap,
			gameCap: this.gameCap,
			roundList: this.roundList.map(round => round.build()),
		};
	}

	/**
	 * @param {string} name
	 * @param {number} unitCap
	 * @param {number} gameCap
	 */
	update(name, unitCap, gameCap) {
		this.name = name;
		this.unitCap = unitCap;
		this.gameCap = gameCap;
	}

	delete() {
		let index = this.index;
		this.organization.championshipList.splice(index, 1);
		while (index < this.organization.championshipList.length) {
			this.organization.championshipList[index].index--;
			index++;
		}
	}

	/**
	 * @param {number} index
	 * @returns {?Round}
	 */
	getRoundOrNull(index) {
		return this.roundList[index] ?? null;
	}

	/**
	 * @param {number} index
	 * @returns {Round}
	 */
	getRound(index) {
		const round = this.getRoundOrNull(index);
		if (round === null)
			throw 'Championship::getRound: invalid index';
		return round;
	}

	/**
	 * @returns {Round}
	 */
	getLastRound() {
		return this.getRound(this.roundList.length - 1);
	}

	/**
	 * @returns {Round}
	 */
	appendRound() {
		const round = new Round(this.roundList.length, this);
		this.roundList.push(round);
		return round;
	}

	/**
	 * @returns {Round[]}
	 */
	reversedRoundList() {
		return this.roundList.toReversed();
	}
}


/**
 * @typedef {Object} RoundObj
 * @property {UnitObj[]} unitList
 * @property {GameObj[]} gameList
 */

class Round {

	/**
	 * @type {Number}
	 */
	index;

	/**
	 * @type {Unit[]}
	 */
	unitList = [];

	/**
	 * @type {Game[]}
	 */
	gameList = [];

	/**
	 * @type {Championship}
	 */
	championship;

	/**
	 * @param {Number} index
	 * @param {Championship} championship
	 */
	constructor(index, championship) {
		this.index = index;
		this.championship = championship;
	}

	/**
	 * @param {RoundObj} obj
	 * @param {Championship} championship
	 */
	static parse(obj, championship) {
		const round = championship.appendRound();
		obj.unitList.forEach(unit => Unit.parse(unit, round));
		obj.gameList.forEach(game => Game.parse(game, round));
	}

	/**
	 * @returns {RoundObj}
	 */
	build() {
		return {
			unitList: this.unitList.map(unit => unit.build()),
			gameList: this.gameList.map(game => game.build()),
		};
	}

	delete() {
		this.championship.roundList.splice(this.index);
	}

	/**
	 * @returns {boolean}
	 */
	isFirst() {
		return this.index === 0;
	}

	/**
	 * @returns {boolean}
	 */
	isLast() {
		return this.index === this.championship.roundList.length - 1;
	}

	/**
	 * @returns {string}
	 */
	getTitle() {
		return `${textDict.round} ${this.index + 1}`;
	}

	/**
	 * @returns {?Round}
	 */
	getPrevious() {
		if (this.index === 0)
			return null;
		return this.championship.getRound(this.index - 1);
	}

	/**
	 * @param {number|string|null} index
	 * @returns {?Unit}
	 */
	getUnitOrNull(index) {
		if (index === null || index === '')
			return null;
		if (typeof(index) === 'string')
			index = parseInt(index);
		return this.unitList[index] ?? null;
	}

	/**
	 * @param {number} index
	 * @returns {Unit}
	 */
	getUnit(index) {
		const unit = this.getUnitOrNull(index);
		if (unit === null)
			throw 'Round::getUnit: invalid index';
		return unit;
	}

	/**
	 * @param {?Unit} parent
	 * @returns {Unit}
	 */
	appendUnit(parent) {
		const unit = new Unit(this.unitList.length, parent, this);
		this.unitList.push(unit);
		return unit;
	}

	/**
	 * Fisher-Yates shuffle
	 */
	shuffleUnitList() {
		let curr = this.unitList.length;
		while (curr !== 0) {
			const rand = Math.floor(Math.random() * curr);
			curr--;
			const temp = this.unitList[curr];
			this.unitList[curr] = this.unitList[rand];
			this.unitList[rand] = temp;
		}
		for (curr = 0; curr < this.unitList.length; curr++)
			this.unitList[curr].index = curr;
	}

	/**
	 * @returns {Game}
	 */
	appendGame() {
		const game = new Game(this);
		this.gameList.push(game);
		return game;
	}
}


/**
 * @typedef {Object} UnitObj
 * @property {number[]} contestantList
 * @property {boolean} pass
 * @property {?number} parent
 */

class Unit {

	/**
	 * @type {number}
	 */
	index;

	/**
	 * @type {Contestant[]}
	 */
	contestantList = [];

	/**
	 * @type {boolean}
	 */
	pass = false;

	/**
	 * @type {?Unit}
	 */
	parent;

	/**
	 * @type {Round}
	 */
	round;

	/**
	 * @param {number} index
	 * @param {?Unit} parent
	 * @param {Round} round
	 */
	constructor(index, parent, round) {
		this.index = index;
		this.parent = parent;
		this.round = round;
	}

	/**
	 * @param {UnitObj} obj
	 * @param {Round} round
	 */
	static parse(obj, round) {
		const parent = obj.parent !== null ? round.getPrevious()?.getUnit(obj.parent) ?? null : null;
		const unit = round.appendUnit(parent);
		obj.contestantList.forEach(contestant => {
			unit.appendContestant(round.championship.organization.getContestant(contestant));
		});
		unit.pass = obj.pass;
	}

	/**
	 * @returns {UnitObj}
	 */
	build() {
		return {
			contestantList: this.contestantList.map(contestant => contestant.index),
			pass: this.pass,
			parent: this.parent?.index ?? null,
		};
	}

	moveUp() {
		if (this.isFirst())
			throw 'Unit::moveUp: unit is first';
		const index = this.index;
		const other = this.round.unitList[index - 1];
		other.index = index;
		this.index = index - 1;
		this.round.unitList[index] = other;
		this.round.unitList[index - 1] = this;
	}

	moveDown() {
		if (this.isLast())
			throw 'Unit::moveDown: unit is last';
		const index = this.index;
		const other = this.round.unitList[index + 1];
		other.index = index;
		this.index = index + 1;
		this.round.unitList[index] = other;
		this.round.unitList[index + 1] = this;
	}

	delete() {
		let index = this.index;
		this.round.unitList.splice(index, 1);
		while (index < this.round.unitList.length) {
			this.round.unitList[index].index--;
			index++;
		}
	}

	/**
	 * @returns {boolean}
	 */
	isFirst() {
		return this.index === 0;
	}

	/**
	 * @returns {boolean}
	 */
	isLast() {
		return this.index === this.round.unitList.length - 1;
	}

	/**
	 * @param {Contestant} contestant
	 */
	appendContestant(contestant) {
		this.contestantList.push(contestant);
	}

	/**
	 * @param {number} index
	 */
	removeContestant(index) {
		if (index < 0 || index >= this.contestantList.length)
			throw 'Unit::removeContestant: invalid index';
		this.contestantList.splice(index, 1);
		if (this.contestantList.length === 0)
			this.delete();
	}

	/**
	 * @param {boolean} pass
	 */
	setPass(pass) {
		this.pass = pass;
	}
}


/**
 * @typedef {number[]} GameObj
 */

class Game {

	/**
	 * @type {Unit[]}
	 */
	unitList = [];

	/**
	 * @type {Round}
	 */
	round;

	/**
	 * @param {Round} round
	 */
	constructor(round) {
		this.round = round;
	}

	/**
	 * @param {GameObj} obj
	 * @param {Round} round
	 */
	static parse(obj, round) {
		const game = round.appendGame();
		obj.forEach(unit => game.appendUnit(round.getUnit(unit)));
	}

	/**
	 * @returns {GameObj}
	 */
	build() {
		return this.unitList.map(unit => unit.index);
	}

	/**
	 * @param {Unit} unit
	 */
	appendUnit(unit) {
		this.unitList.push(unit);
	}
}


/**
 * @typedef {Object} OrganizationObj
 * @property {TeamObj[]} teamList
 * @property {ContestantObj[]} contestantList
 * @property {ChampionshipObj[]} championshipList
 * @property {?string} contestantGroupBy
 * @property {?string} contestantSortBy
 * @property {?string} version
 */

class Organization {

	/**
	 * @type {string}
	 */
	static key = 'individual-championships';

	/**
	 * @type {Team[]}
	 */
	teamList = [];

	/**
	 * @type {Contestant[]}
	 */
	contestantList = [];

	/**
	 * @type {Championship[]}
	 */
	championshipList = [];

	/**
	 * @constant
	 * @type {string}
	 */
	static CONTESTANT_GROUP_BY = 'unified';

	/**
	 * @type {string}
	 */
	contestantGroupBy = Organization.CONTESTANT_GROUP_BY;

	/**
	 * @constant
	 * @type {string}
	 */
	static CONTESTANT_SORT_BY = 'index';

	/**
	 * @type {string}
	 */
	contestantSortBy = Organization.CONTESTANT_SORT_BY;

	/**
	 * @type {string}
	 */
	version = VERSION;

	constructor() {}

	/**
	 * @param {OrganizationObj} obj
	 */
	parse(obj) {
		obj.teamList.forEach(team => Team.parse(team, this));
		obj.contestantList.forEach(contestant => Contestant.parse(contestant, this));
		obj.championshipList.forEach(championship => Championship.parse(championship, this));
		this.setContestantGroupBy(obj.contestantGroupBy ?? Organization.CONTESTANT_GROUP_BY);
		this.setContestantSortBy(obj.contestantSortBy ?? Organization.CONTESTANT_SORT_BY);
	}

	/**
	 * @returns {OrganizationObj}
	 */
	build() {
		return {
			teamList: this.teamList.map(team => team.build()),
			contestantList: this.contestantList.map(contestant => contestant.build()),
			championshipList: this.championshipList.map(championship => championship.build()),
			contestantGroupBy: this.contestantGroupBy,
			contestantSortBy: this.contestantSortBy,
			version: this.version,
		};
	}

	/**
	 * Build an Organization from a JSON string.
	 * @param {?string} json
	 * @returns {Organization}
	 */
	static fromJSON(json) {
		const organization = new Organization();
		if (json !== null)
			organization.parse(JSON.parse(json));
		return organization;
	}

	/**
	 * Serialize the Organization to a JSON string.
	 * @param {boolean} [pretty=false]
	 * @returns {string}
	 */
	toJSON(pretty) {
		const json = JSON.stringify(this.build(), null, (pretty ?? false) ? '\t' : null);
		return json;
	}

	/**
	 * Load an Organization from the Local Storage.
	 * @returns {Organization}
	 */
	static loadFromLocalStorage() {
		return Organization.fromJSON(localStorage.getItem(Organization.key));
	}

	/**
	 * Save the Organization to the Local Storage.
	 */
	saveToLocalStorage() {
		localStorage.setItem(Organization.key, this.toJSON());
	}

	/**
	 * @param {number|string|null} index
	 * @returns {?Team}
	 */
	getTeamOrNull(index) {
		if (index === null || index === '')
			return null;
		if (typeof(index) === 'string')
			index = parseInt(index);
		return this.teamList[index] ?? null;
	}

	/**
	 * @param {number|string|null} index
	 * @returns {Team}
	 */
	getTeam(index) {
		const team = this.getTeamOrNull(index);
		if (team === null)
			throw 'Organization::getTeam: invalid index';
		return team;
	}

	/**
	 * @param {string} name
	 */
	appendTeam(name) {
		const team = new Team(this.teamList.length, name, this);
		this.teamList.push(team);
	}

	/**
	 * @param {number|string|null} index
	 * @returns {?Contestant}
	 */
	getContestantOrNull(index) {
		if (index === null || index === '')
			return null;
		if (typeof(index) === 'string')
			index = parseInt(index);
		return this.contestantList[index] ?? null;
	}

	/**
	 * @param {number|string|null} index
	 * @returns {Contestant}
	 */
	getContestant(index) {
		const contestant = this.getContestantOrNull(index);
		if (contestant === null)
			throw 'Organization::getContestant: invalid index';
		return contestant;
	}

	/**
	 * @param {string} name
	 * @param {?Team} team
	 */
	appendContestant(name, team) {
		const contestant = new Contestant(this.contestantList.length, name, team, this);
		this.contestantList.push(contestant);
	}

	/**
	 * @param {string} groupby
	 */
	setContestantGroupBy(groupby) {
		this.contestantGroupBy = groupby;
	}

	/**
	 * @param {string} sortby
	 */
	setContestantSortBy(sortby) {
		this.contestantSortBy = sortby;
	}

	/**
	 * @param {Contestant} contestant1
	 * @param {Contestant} contestant2
	 * @returns {number}
	 */
	compareContestantPair(contestant1, contestant2) {
		if (this.contestantGroupBy === 'teamwise') {
			const team1 = contestant1.team?.index ?? -1;
			const team2 = contestant2.team?.index ?? -1;
			const cmp = team1 - team2;
			if (cmp)
				return cmp;
		}
		if (this.contestantSortBy === 'name') {
			const cmp = contestant1.name.localeCompare(contestant2.name);
			if (cmp)
				return cmp;
		}
		return 0;
	}

	/**
	 * @returns {Contestant[]}
	 */
	sortedContestantList() {
		return this.contestantList.toSorted(this.compareContestantPair.bind(this));
	}

	/**
	 * @param {number|string|null} index
	 * @returns {?Championship}
	 */
	getChampionshipOrNull(index) {
		if (index === null || index === '')
			return null;
		if (typeof(index) === 'string')
			index = parseInt(index);
		return this.championshipList[index] ?? null;
	}

	/**
	 * @param {number|string|null} index
	 * @returns {Championship}
	 */
	getChampionship(index) {
		const championship = this.getChampionshipOrNull(index);
		if (championship === null)
			throw 'Organization::getChampionship: invalid index';
		return championship;
	}

	/**
	 * @param {string} name
	 * @param {number} unitCap
	 * @param {number} gameCap
	 * @returns {Championship}
	 */
	appendChampionship(name, unitCap, gameCap) {
		const championship = new Championship(
			this.championshipList.length, name, unitCap, gameCap, this
		);
		this.championshipList.push(championship);
		return championship;
	}

	/**
	 * @param {Championship} championship1
	 * @param {Championship} championship2
	 * @returns {number}
	 */
	compareChampionshipPair(championship1, championship2) {
		return championship1.name.localeCompare(championship2.name);
	}

	/**
	 * @returns {Championship[]}
	 */
	sortedChampionshipList() {
		return this.championshipList.toSorted(this.compareChampionshipPair.bind(this));
	}
}


/**
 * @param {Object} args
 * @param {?string} args.tag
 * @param {?string} args.klass
 * @param {?string} args.value
 * @param {?string} args.href
 * @param {?{(): void}} args.click
 * @param {?(string|(HTMLElement)[])} args.content
 * @returns {HTMLElement}
 */
function elem(args) {
	if (args.tag === undefined)
		args.tag = 'div';
	if (args.klass === undefined)
		args.klass = null;
	if (args.value === undefined)
		args.value = null;
	if (args.href === undefined)
		args.href = null;
	if (args.click === undefined)
		args.click = null;
	if (args.content === undefined)
		args.content = null;
	const node = document.createElement(args.tag);
	if (args.klass !== null)
		node.className = args.klass;
	if (args.value !== null)
		node.value = args.value;
	if (args.href !== null)
		node.href = args.href;
	if (args.click !== null) {
		node.addEventListener('click', event => {
			event.preventDefault();
			args.click();
		});
	}
	if (args.content === null)
		;
	else if (typeof(args.content) === 'string')
		node.innerHTML = args.content;
	else
		for (let child of args.content)
			node.appendChild(child);
	return node;
}

/**
 * @param {Object} args
 * @param {?string} args.template
 * @param {?string} args.color
 * @param {?string} args.icon
 * @param {?boolean} args.enabled
 * @param {{(): void}} args.click
 * @returns {HTMLElement}
 */
function actionIcon(args) {
	switch (args.template) {
		case 'add':
			if (args.color === undefined)
				args.color = 'link-success';
			if (args.icon === undefined)
				args.icon = 'bi-plus-lg';
			break;
		case 'edit':
			if (args.icon === undefined)
				args.icon = 'bi-pencil';
			break;
		case 'moveup':
			if (args.icon === undefined)
				args.icon = 'bi-arrow-up';
			break;
		case 'movedown':
			if (args.icon === undefined)
				args.icon = 'bi-arrow-down';
			break;
		case 'delete':
			if (args.color === undefined)
				args.color = 'link-danger';
			if (args.icon === undefined)
				args.icon = 'bi-trash';
			break;
	}
	if (args.color === undefined)
		args.color = 'link-primary';
	if (args.icon === undefined)
		throw 'actionIcon: args.icon';
	if (args.enabled === undefined)
		args.enabled = true;
	if (args.click === undefined)
		throw 'actionIcon: args.click';
	const link = document.createElement('a');
	const color = args.enabled ? args.color : 'link-secondary';
	link.className = `${args.icon} ${color} m-1`;
	if (args.enabled)
		link.href = '#';
	if (args.enabled) {
		link.addEventListener('click', event => {
			event.preventDefault()
			args.click();
		});
	}
	return link;
}

const textDict = {
	separator: ' | ',
	siteName: 'Ατομικά Πρωταθλήματα',
	emptyList: '(Κενή Λίστα)',
	nullOption: '(Χωρίς Επιλογή)',
	teamSuffix: 'η',
	round: 'Γύρος',
	errorDetails: 'Προέκυψε σφάλμα:',
	errorMessage: 'Ανανέωσε την σελίδα.',
};

window.onerror = error => {
	alert(`${textDict.errorDetails}\n${error}\n\n${textDict.errorMessage}`);
	return false;
};

Array.from(document.getElementsByClassName('modal')).forEach(modal => {
	modal.addEventListener('hide.bs.modal', event => {
		const form = event.currentTarget;
		if (!['export-form'].includes(form.id))
			form.reset();
	});
});

let organization = Organization.loadFromLocalStorage();
