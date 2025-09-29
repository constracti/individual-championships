const params = new URLSearchParams(window.location.search);

let round = organization.getChampionship(params.get('championship')).getLastRound();

const championshipName = document.getElementById('championship-name');
const championshipInfo = document.getElementById('championship-info');
const roundTitle = document.getElementById('round-title');

const contestantInsertForm = document.getElementById('contestant-insert-form');
const contestantInsertUnit = document.getElementById('contestant-insert-unit');
const contestantInsertTeam = document.getElementById('contestant-insert-team');
const contestantInsertSelect = document.getElementById('contestant-insert-select');

const roundBackwardButton = document.getElementById('round-backward-button');
const roundDivideGroup = document.getElementById('round-divide-group');
const roundDivideButton = document.getElementById('round-divide-button');
const roundFillButton = document.getElementById('round-fill-button');
const roundPrintButton = document.getElementById('round-print-button');
const roundUniteButton = document.getElementById('round-unite-button');
const roundForwardButton = document.getElementById('round-forward-button');

const roundUnitList = document.getElementById('round-unit-list');
const roundGameList = document.getElementById('round-game-list');
const roundList = document.getElementById('round-list');

/**
 * @param {HTMLElement} node
 * @param {boolean} condition
 */
function nodeShowOn(node, condition) {
	if (condition)
		node.classList.remove('d-none');
	else
		node.classList.add('d-none');
}

/**
 * @param {HTMLElement} node
 * @param {boolean} condition
 */
function nodeEnableOn(node, condition) {
	if (condition)
		node.classList.remove('disabled');
	else
		node.classList.add('disabled');
}

function refresh() {

	document.title = [round.championship.name, textDict.siteName].join(textDict.separator);
	championshipName.innerHTML = round.championship.name;
	championshipInfo.innerHTML = round.championship.info;
	nodeShowOn(championshipInfo, round.championship.info.length)
	roundTitle.innerHTML = round.getTitle();

	contestantInsertTeam.innerHTML = '';
	contestantInsertTeam.appendChild(elem({tag: 'option', value: '', content: textDict.nullOption}));
	organization.teamList.forEach(team => {
		contestantInsertTeam.appendChild(elem({tag: 'option', value: team.index, content: team.getNameWithIndex()}));
	});
	refreshContestantInsertSelect();

	nodeShowOn(roundBackwardButton, round.gameList.length === 0 && !round.isFirst());
	nodeShowOn(roundDivideGroup, round.gameList.length === 0 && round.unitList.length > 1);
	nodeEnableOn(roundFillButton, round.gameList.length === 0 && round.unitList.length > 1 && round.championship.gameCap > 1);

	nodeShowOn(roundPrintButton, round.gameList.length !== 0);
	nodeShowOn(roundUniteButton, round.gameList.length !== 0);
	nodeShowOn(roundForwardButton, round.gameList.length !== 0);

	nodeShowOn(roundUnitList, round.gameList.length === 0);
	nodeShowOn(roundGameList, round.gameList.length !== 0);

	roundPrintButton.href = 'print.html' + window.location.search;

	roundUnitList.innerHTML = '';
	if (round.unitList.length === 0) {
		roundUnitList.appendChild(elem({
			klass: ' m-2 border border-warning-subtle bg-warning-subtle rounded flex-fill p-1',
			content: [elem({klass: 'm-1', content: textDict.emptyList})],
		}));
	}
	round.unitList.forEach(unit => {
		roundUnitList.appendChild(elem({
			klass: 'm-2 border rounded d-flex flex-row p-1',
			content: [
				actionIcon({
					template: 'add',
					enabled: unit.contestantList.length < unit.round.championship.unitCap,
					click: () => {
						contestantInsertUnit.value = unit.index;
						const modal = bootstrap.Modal.getOrCreateInstance(contestantInsertForm);
						modal.show();
					},
				}),
				...unit.contestantList.map((contestant, index) => [
					elem({
						klass: 'm-1 border-start',
					}),
					elem({
						klass: 'm-1',
						content: contestant.getNameWithTeam(),
					}),
					actionIcon({
						template: 'delete',
						click: () => {
							organization.compareWithLocalStorage();
							round = organization.getChampionship(round.championship.index).getLastRound();
							round.getUnit(unit.index).removeContestant(index);
							organization.saveToLocalStorage();
							refresh();
						},
					}),
				]).flat(),
			],
		}));
	});
	roundUnitList.appendChild(elem({
		klass: 'm-2 border rounded d-flex flex-row align-items-center p-1',
		content: [
			actionIcon({
				template: 'add',
				click: () => {
					contestantInsertUnit.value = '';
					const modal = bootstrap.Modal.getOrCreateInstance(contestantInsertForm);
					modal.show();
				},
			}),
		],
	}));

	roundGameList.innerHTML = '';
	round.gameList.forEach(game => {
		roundGameList.appendChild(elem({
			klass: 'list-group-item d-flex flex-row justify-content-center p-2',
			content: game.unitList.map(unit => elem({
				klass: 'm-2 border rounded d-flex flex-row p-1' + (unit.pass ? ' border-success-subtle bg-success-subtle' : ''),
				content: [
					actionIcon({
						icon: unit.pass ? 'bi-check-lg' : 'bi-x-lg',
						click: () => {
							organization.compareWithLocalStorage();
							round = organization.getChampionship(round.championship.index).getLastRound();
							round.getUnit(unit.index).setPass(!unit.pass);
							organization.saveToLocalStorage();
							refresh();
						},
					}),
					...unit.contestantList.map(contestant => [
						elem({
							klass: 'm-1 border-start' + (unit.pass ? ' border-success-subtle' : ''),
						}),
						elem({
							klass: 'm-1',
							content: contestant.getNameWithTeam(),
						}),
					]).flat(),
					elem({
						klass: 'm-1 border-start' + (unit.pass ? ' border-success-subtle' : ''),
					}),
					actionIcon({
						icon: 'bi-arrow-up link-secondary',
						click: () => {
							organization.compareWithLocalStorage();
							round = organization.getChampionship(round.championship.index).getLastRound();
							round.getUnit(unit.index).moveUp();
							organization.saveToLocalStorage();
							refresh();
						},
					}),
					actionIcon({
						icon: 'bi-arrow-down link-secondary',
						click: () => {
							organization.compareWithLocalStorage();
							round = organization.getChampionship(round.championship.index).getLastRound();
							round.getUnit(unit.index).moveDown();
							organization.saveToLocalStorage();
							refresh();
						},
					}),
				],
			})),
		}));
	});

	roundList.innerHTML = '';
	round.championship.reversedRoundList().forEach(rnd => {
		if (rnd.isLast())
			return;
		roundList.appendChild(elem({tag: 'h2', klass: 'm-2', content: rnd.getTitle()}));
		roundList.appendChild(elem({
			klass: 'm-2 list-group',
			content: rnd.gameList.map(game => elem({
				klass: 'list-group-item d-flex flex-row justify-content-center p-2',
				content: game.unitList.map(unit => elem({
					klass: 'm-2 border rounded d-flex flex-row p-1' + (unit.pass ? ' border-success-subtle bg-success-subtle' : ''),
					content: [
						elem({
							klass: 'm-1' + (unit.pass ? ' bi-check-lg' : ' bi-x-lg'),
						}),
						...unit.contestantList.map(contestant => [
							elem({
								klass: 'm-1 border-start' + (unit.pass ? ' border-success-subtle' : ''),
							}),
							elem({
								klass: 'm-1',
								content: contestant.getNameWithTeam(),
							}),
						]).flat(),
					],
				})),
			})),
		}));
	});

}

function refreshContestantInsertSelect() {
	contestantInsertSelect.innerHTML = '';
	contestantInsertSelect.appendChild(elem({tag: 'option', value: '', content: textDict.nullOption}));
	const team = organization.getTeamOrNull(contestantInsertTeam.value);
	organization.sortedContestantList().forEach(contestant => {
		if (team !== null && contestant.team !== team)
			return;
		if (round.unitList.map(unit => unit.contestantList).flat().includes(contestant))
			return;
		contestantInsertSelect.appendChild(elem({
			tag: 'option',
			value: contestant.index,
			content: contestant.name,
		}));
	});
}

contestantInsertTeam.addEventListener('change', refreshContestantInsertSelect);

contestantInsertForm.addEventListener('submit', event => {
	event.preventDefault();
	organization.compareWithLocalStorage();
	round = organization.getChampionship(round.championship.index).getLastRound();
	const contestant = organization.getContestant(contestantInsertSelect.value);
	const unit = round.getUnitOrNull(contestantInsertUnit.value) ?? round.appendUnit(null);
	unit.appendContestant(contestant);
	organization.saveToLocalStorage();
	const modal = bootstrap.Modal.getInstance(contestantInsertForm);
	modal.hide();
	contestantInsertForm.reset();
	refresh();
});

roundBackwardButton.addEventListener('click', event => {
	event.preventDefault();
	organization.compareWithLocalStorage();
	round = organization.getChampionship(round.championship.index).getLastRound();
	round.delete();
	round = round.getPrevious();
	organization.saveToLocalStorage();
	refresh();
});

// TODO add and delete units in game state
// TODO create games with decreased capacity

roundDivideButton.addEventListener('click', event => {
	event.preventDefault();
	organization.compareWithLocalStorage();
	round = organization.getChampionship(round.championship.index).getLastRound();
	// fairly select lucky units
	const probList = round.getProbList();
	const unitList = round.unitList.map((unit, i) => {
		return {
			unit: unit,
			prob: Math.log(probList[i]),
			seed: Math.random(),
		};
	}).sort((u1, u2) => {
		if (u1.prob !== u2.prob)
			return u2.prob - u1.prob; // sort by prob descending
		return u1.seed - u2.seed; // sort by seed ascending
	}).map(tuple => tuple.unit);
	// fill games
	const count = round.unitList.length;
	const base = round.championship.gameCap;
	const full = Math.floor(count / base) * base;
	const lucky = count - full;
	let game = null;
	for (let unit of shuffle(unitList.slice(0, full))) {
		if (game === null)
			game = round.appendGame();
		game.appendUnit(unit);
		if (game.unitList.length === base)
			game = null;
	}
	for (let unit of shuffle(unitList.slice(full))) {
		if (game === null)
			game = round.appendGame();
		game.appendUnit(unit);
		if (game.unitList.length === base)
			game = null;
	}
	organization.saveToLocalStorage();
	refresh();
});

roundFillButton.addEventListener('click', event => {
	event.preventDefault();
	organization.compareWithLocalStorage();
	round = organization.getChampionship(round.championship.index).getLastRound();
	// fairly select lucky units
	const probList = round.getProbList();
	const unitList = round.unitList.map((unit, i) => {
		return {
			unit: unit,
			prob: Math.log(probList[i]),
			seed: Math.random(),
		};
	}).sort((u1, u2) => {
		if (u1.prob !== u2.prob)
			return u2.prob - u1.prob; // sort by prob descending
		return u1.seed - u2.seed; // sort by seed ascending
	}).map(tuple => tuple.unit);
	// fill tree, assuming only one unit advances to the next round
	const count = round.unitList.length;
	const base = round.championship.gameCap;
	const order = Math.ceil(Math.log(count) / Math.log(base));
	const power = Math.pow(base, order);
	const lucky = Math.floor((power - count) / (base - 1));
	const full = Math.floor((count - lucky) / base) * base;
	let game = null;
	for (let unit of shuffle(unitList.slice(0, full))) {
		if (game === null)
			game = round.appendGame();
		game.appendUnit(unit);
		if (game.unitList.length === base)
			game = null;
	}
	for (let unit of shuffle(unitList.slice(full, count - lucky))) {
		if (game === null)
			game = round.appendGame();
		game.appendUnit(unit);
		if (game.unitList.length === base)
			game = null;
	}
	for (let unit of unitList.slice(count - lucky)) {
		game = round.appendGame();
		game.appendUnit(unit);
		unit.setPass(true);
		game = null;
	}
	organization.saveToLocalStorage();
	refresh();
});

roundUniteButton.addEventListener('click', event => {
	event.preventDefault();
	organization.compareWithLocalStorage();
	round = organization.getChampionship(round.championship.index).getLastRound();
	round.gameList = [];
	round.unitList.forEach(unit => unit.setPass(false));
	organization.saveToLocalStorage();
	refresh();
});

roundForwardButton.addEventListener('click', event => {
	event.preventDefault();
	organization.compareWithLocalStorage();
	round = organization.getChampionship(round.championship.index).appendRound();
	round.getPrevious().unitList.forEach(unit => {
		if (!unit.pass)
			return;
		const newUnit = round.appendUnit(unit);
		unit.contestantList.forEach(contestant => newUnit.appendContestant(contestant));
	});
	organization.saveToLocalStorage();
	refresh();
});

refresh();
