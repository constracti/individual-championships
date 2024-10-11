const params = new URLSearchParams(window.location.search);

let round = organization.getChampionship(params.get('championship')).getLastRound();

const championshipName = document.getElementById('championship-name');
const roundTitle = document.getElementById('round-title');

const contestantInsertButton = document.getElementById('contestant-insert-button');
const contestantInsertForm = document.getElementById('contestant-insert-form');
const contestantInsertUnit = document.getElementById('contestant-insert-unit');
const contestantInsertTeam = document.getElementById('contestant-insert-team');
const contestantInsertSelect = document.getElementById('contestant-insert-select');

const roundShuffleButton = document.getElementById('round-shuffle-button');
const roundBackwardButton = document.getElementById('round-backward-button');
const roundDivideButton = document.getElementById('round-divide-button');
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

function refresh() {

	document.title = [round.championship.name, textDict.siteName].join(textDict.separator);
	championshipName.innerHTML = round.championship.name;
	roundTitle.innerHTML = round.getTitle();

	contestantInsertTeam.innerHTML = '';
	contestantInsertTeam.appendChild(elem({tag: 'option', value: '', content: textDict.nullOption}));
	organization.teamList.forEach(team => {
		contestantInsertTeam.appendChild(elem({tag: 'option', value: team.index, content: team.getNameWithIndex()}));
	});
	refreshContestantInsertSelect();

	nodeShowOn(contestantInsertButton, round.gameList.length === 0);
	nodeShowOn(roundShuffleButton, round.gameList.length === 0 && round.unitList.length > 1);
	nodeShowOn(roundBackwardButton, round.gameList.length === 0 && !round.isFirst());
	nodeShowOn(roundDivideButton, round.gameList.length === 0 && round.unitList.length > 1);

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
				actionIcon({
					template: 'moveup',
					enabled: !unit.isFirst(),
					click: () => {
						organization = Organization.loadFromLocalStorage();
						round = organization.getChampionship(round.championship.index).getLastRound();
						round.getUnit(unit.index).moveUp();
						organization.saveToLocalStorage();
						refresh();
					},
				}),
				actionIcon({
					template: 'movedown',
					enabled: !unit.isLast(),
					click: () => {
						organization = Organization.loadFromLocalStorage();
						round = organization.getChampionship(round.championship.index).getLastRound();
						round.getUnit(unit.index).moveDown();
						organization.saveToLocalStorage();
						refresh();
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
							organization = Organization.loadFromLocalStorage();
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
							organization = Organization.loadFromLocalStorage();
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

contestantInsertButton.addEventListener('click', event => {
	event.preventDefault();
	contestantInsertUnit.value = '';
	const modal = bootstrap.Modal.getOrCreateInstance(contestantInsertForm);
	modal.show();
});

contestantInsertForm.addEventListener('submit', event => {
	event.preventDefault();
	organization = Organization.loadFromLocalStorage();
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

roundShuffleButton.addEventListener('click', event => {
	event.preventDefault();
	organization = Organization.loadFromLocalStorage();
	round = organization.getChampionship(round.championship.index).getLastRound();
	round.shuffleUnitList();
	organization.saveToLocalStorage();
	refresh();
});

roundBackwardButton.addEventListener('click', event => {
	event.preventDefault();
	organization = Organization.loadFromLocalStorage();
	round = organization.getChampionship(round.championship.index).getLastRound();
	round.delete();
	round = round.getPrevious();
	organization.saveToLocalStorage();
	refresh();
});

roundDivideButton.addEventListener('click', event => {
	event.preventDefault();
	organization = Organization.loadFromLocalStorage();
	round = organization.getChampionship(round.championship.index).getLastRound();
	// TODO fairly select lucky unit
	let game = null;
	for (let unit of round.unitList) {
		if (game === null)
			game = round.appendGame();
		game.appendUnit(unit);
		if (game.unitList.length === round.championship.gameCap)
			game = null;
	}
	organization.saveToLocalStorage();
	refresh();
});

roundUniteButton.addEventListener('click', event => {
	event.preventDefault();
	organization = Organization.loadFromLocalStorage();
	round = organization.getChampionship(round.championship.index).getLastRound();
	round.gameList = [];
	round.unitList.forEach(unit => unit.setPass(false));
	organization.saveToLocalStorage();
	refresh();
});

roundForwardButton.addEventListener('click', event => {
	event.preventDefault();
	organization = Organization.loadFromLocalStorage();
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
