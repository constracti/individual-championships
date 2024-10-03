const VERSION = '0.1';


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
	 * @returns {Team}
	 */
	static parse(obj, organization) {
		return new Team(obj.index, obj.name, organization);
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
		this.organization.saveToLocalStorage();
	}

	moveUp() {
		const index = this.index;
		if (index === 0)
			throw 'Team::moveUp: team is first';
		const other = this.organization.teamList[index - 1];
		other.index = index;
		this.index = index - 1;
		this.organization.teamList[index] = other;
		this.organization.teamList[index - 1] = this;
		this.organization.saveToLocalStorage();
	}

	moveDown() {
		const index = this.index;
		if (index === this.organization.teamList.length - 1)
			throw 'Team::moveDown: team is last';
		const other = this.organization.teamList[index + 1];
		other.index = index;
		this.index = index + 1;
		this.organization.teamList[index] = other;
		this.organization.teamList[index + 1] = this;
		this.organization.saveToLocalStorage();
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
		this.organization.saveToLocalStorage();
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
	 * Get Team name with index.
	 * @returns {string}
	 */
	getTitle() {
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
	 * @returns {Contestant}
	 */
	static parse(obj, organization) {
		return new Contestant(obj.index, obj.name, organization.getTeam(obj.team), organization);
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
		this.organization.saveToLocalStorage();
	}

	delete() {
		let index = this.index;
		this.organization.contestantList.splice(index, 1);
		while (index < this.organization.contestantList.length) {
			this.organization.contestantList[index].index--;
			index++;
		}
		this.organization.saveToLocalStorage();
	}
}


/**
 * @typedef {Object} ChampionshipObj
 * @property {number} index
 * @property {string} name
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
	 * @param {Organization} organization
	 */
	constructor(index, name, organization) {
		this.index = index;
		this.name = name;
		this.organization = organization;
	}

	/**
	 * @param {ChampionshipObj} obj
	 * @param {Organization} organization
	 * @returns {Championship}
	 */
	static parse(obj, organization) {
		return new Championship(obj.index, obj.name, organization);
	}

	/**
	 * @returns {ChampionshipObj}
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
		this.organization.saveToLocalStorage();
	}

	delete() {
		let index = this.index;
		this.organization.championshipList.splice(index, 1);
		while (index < this.organization.championshipList.length) {
			this.organization.championshipList[index]--;
			index++;
		}
		this.organization.saveToLocalStorage();
	}
}


class Round {

	/**
	 * @type {Number}
	 */
	index;

	/**
	 * @type {Contestant[]}
	 */
	contestantList = [];

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
}


class Game {}


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
		this.teamList = obj.teamList.map(team => Team.parse(team, this));
		this.contestantList = obj.contestantList.map(contestant => Contestant.parse(contestant, this));
		this.championshipList = obj.championshipList.map(championship => Championship.parse(championship, this));
		this.contestantGroupBy = obj.contestantGroupBy ?? Organization.CONTESTANT_GROUP_BY;
		this.contestantSortBy = obj.contestantSortBy ?? Organization.CONTESTANT_SORT_BY;
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
	 * @returns {string}
	 */
	toJSON() {
		const json = JSON.stringify(this.build());
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
	getTeam(index) {
		if (index === null || index === '')
			return null;
		if (typeof(index) === 'string')
			index = parseInt(index);
		if (index >= 0 && index < this.teamList.length)
			return this.teamList[index];
		throw 'Organization::getTeam: invalid index';
	}

	/**
	 * @param {string} name
	 * @returns {Team}
	 */
	appendTeam(name) {
		const team = new Team(this.teamList.length, name, this);
		this.teamList.push(team);
		this.saveToLocalStorage();
	}

	/**
	 * @param {number|string|null} index
	 * @returns {?Contestant}
	 */
	getContestant(index) {
		if (index === null || index === '')
			return null;
		if (typeof(index) === 'string')
			index = parseInt(index);
		if (index >= 0 && index < this.contestantList.length)
			return this.contestantList[index];
		throw 'Organization::getContestant: invalid index';
	}

	/**
	 * @param {string} name
	 * @param {?Team} team
	 * @returns {Contestant}
	 */
	appendContestant(name, team) {
		const contestant = new Contestant(this.contestantList.length, name, team, this);
		this.contestantList.push(contestant);
		this.saveToLocalStorage();
	}

	/**
	 * @param {string} groupby
	 */
	setContestantGroupBy(groupby) {
		this.contestantGroupBy = groupby;
		this.saveToLocalStorage();
	}

	/**
	 * @param {string} sortby
	 */
	setContestantSortBy(sortby) {
		this.contestantSortBy = sortby;
		this.saveToLocalStorage();
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
	getChampionship(index) {
		if (index === null || index === '')
			return null;
		if (typeof(index) === 'string')
			index = parseInt(index);
		if (index >= 0 && index < this.championshipList.length)
			return this.championshipList[index];
		throw 'Organization::getChampionship: invalid index';
	}

	/**
	 * @param {string} name
	 * @returns {Team}
	 */
	appendChampionship(name) {
		const championship = new Championship(this.championshipList.length, name, this);
		this.championshipList.push(championship);
		this.saveToLocalStorage();
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
 * @param {?(string|HTMLElement[])} args.content
 * @returns {HTMLElement}
 */
function elem(args) {
	if (args.tag === undefined)
		args.tag = 'div';
	if (args.klass === undefined)
		args.klass = null;
	if (args.value === undefined)
		args.value = null;
	if (args.content === undefined)
		args.content = null;
	const node = document.createElement(args.tag);
	if (args.klass !== null)
		node.className = args.klass;
	if (args.value !== null)
		node.value = args.value;
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
 * @param {*} args.click
 * @returns {HTMLElement}
 */
function actionIcon(args) {
	switch (args.template) {
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

Array.from(document.getElementsByClassName('modal')).forEach(modal => {
	modal.addEventListener('hide.bs.modal', event => {
		const form = event.currentTarget;
		if (!['export-form'].includes(form.id))
			form.reset();
	});
});

const textDict = {
	emptyList: '(Κενή Λίστα)',
	nullOption: '(Χωρίς Επιλογή)',
};

let organization = Organization.loadFromLocalStorage();

// TODO check if "database" is "dirty" from another tab
// TODO undo and redo functionality
// TODO display app version in the import modal
