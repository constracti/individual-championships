// TODO affect only current championship

const urlParams = new URLSearchParams(window.location.search);

if (!urlParams.has('championship'))
	throw 'championship: not defined';

const championship = organization.getChampionship(urlParams.get('championship'));

if (championship === null)
	throw 'championship: not valid';

document.title = [championship.name, textDict.siteName].join(textDict.separator);

document.getElementById('title').innerHTML = championship.name;

const roundListNode = document.getElementById('round-list');

function refresh() {

	// round list
	Array.from(roundListNode.children).forEach(child => child.remove());
	championship.roundList.forEach(round => {
		document.getElementById('round-list').appendChild(elem({
			klass: 'd-flex flex-column',
			content: [
				elem({
					klass: 'd-flex flex-row justify-content-between',
					content: [
						elem({
							tag: 'h2',
							klass: 'm-2',
							content: `Γύρος ${round.index + 1}`,
						}),
						elem({
							klass: 'd-flex flex-row',
							content: [
								round.gameList.length === 0 ? elem({
									tag: 'button',
									klass: 'btn btn-success m-2',
									click: () => {
										contestantInsertUnit.value = '';
										const form = document.getElementById('contestant-insert-form');
										const modal = bootstrap.Modal.getOrCreateInstance(form);
										modal.show();
									},
									content: 'Προσθήκη',
								}) : null,
								round.unitList.length > 1 && round.gameList.length === 0 ? elem({
									tag: 'button',
									klass: 'btn btn-secondary m-2',
									click: () => {
										round.shuffleUnitList();
										organization.saveToLocalStorage();
										refresh();
									},
									content: 'Ανάμιξη',
								}) : null,
								round.unitList.length > 1 && round.gameList.length === 0 ? elem({
									tag: 'button',
									klass: 'btn btn-primary m-2',
									click: () => {
										let game = null;
										for (let unit of round.unitList) {
											if (game === null)
												game = round.appendGame();
											game.appendUnit(unit);
											if (game.unitList.length === 2)
												game = null;
										}
										organization.saveToLocalStorage();
										refresh();
									},
									content: 'Επόμενο',
								}) : null,
								round.gameList.length !== 0 ? elem({
									tag: 'button',
									klass: 'btn btn-danger m-2',
									click: () => {
										round.gameList = [];
										round.unitList.forEach(unit => unit.setPass(false));
										organization.saveToLocalStorage();
										refresh();
									},
									content: 'Προηγούμενο',
								}) : null,
								round.gameList.length !== 0 ? elem({
									tag: 'button',
									klass: 'btn btn-primary m-2',
									click: () => {
									},
									content: 'Επόμενο',
								}) : null,
							],
						}),
					],
				}),
				round.gameList.length === 0 ? elem({
					klass: 'd-flex flew-row flex-wrap',
					content: [
						round.unitList.length === 0 ? elem({
							klass: ' m-2 border border-warning-subtle bg-warning-subtle rounded p-1',
							content: [elem({klass: 'm-1', content: textDict.emptyList})],
						}) : null,
						...round.unitList.map(unit => elem({
							klass: 'm-2 border rounded d-flex flex-row p-1',
							content: [
								actionIcon({
									template: 'add',
									click: () => {
										contestantInsertUnit.value = unit.index;
										const form = document.getElementById('contestant-insert-form');
										const modal = bootstrap.Modal.getOrCreateInstance(form);
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
											unit.removeContestant(index);
											organization.saveToLocalStorage();
											refresh();
										},
									}),
								]).flat(),
							],
						})),
					],
				}) : null,
				elem({
					klass: 'm-2 list-group',
					content: round.gameList.map(game => elem({
						klass: 'list-group-item d-flex flex-row justify-content-center p-2',
						content: game.unitList.map(unit => elem({
							klass: 'm-2 border rounded d-flex flex-row p-1' + (unit.pass ? ' border-success-subtle bg-success-subtle' : ''),
							click: () => {
								unit.setPass(!unit.pass);
								organization.saveToLocalStorage();
								refresh();
							},
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
				}),
			],
		}));
	});

	// content insert form
	refreshContestantInsertSelect();

}

const contestantInsertUnit = document.getElementById('contestant-insert-unit');
const contestantInsertTeam = document.getElementById('contestant-insert-team');
const contestantInsertSelect = document.getElementById('contestant-insert-select');

contestantInsertTeam.appendChild(elem({tag: 'option', value: '', content: textDict.nullOption}));
organization.teamList.forEach(team => {
	contestantInsertTeam.appendChild(elem({tag: 'option', value: team.index, content: team.getNameWithIndex()}));
});
contestantInsertTeam.addEventListener('change', refreshContestantInsertSelect);

function refreshContestantInsertSelect() {
	Array.from(contestantInsertSelect.children).forEach(child => child.remove());
	contestantInsertSelect.appendChild(elem({tag: 'option', value: '', content: textDict.nullOption}));
	const team = organization.getTeamOrNull(contestantInsertTeam.value);
	organization.sortedContestantList().forEach(contestant => {
		if (team !== null && contestant.team !== team)
			return;
		const round = championship.getLastRound();
		if ([].concat(...round.unitList.map(unit => unit.contestantList)).includes(contestant))
			return;
		contestantInsertSelect.appendChild(elem({tag: 'option', value: contestant.index, content: contestant.name}));
	});
}

document.getElementById('contestant-insert-form').addEventListener('submit', event => {
	event.preventDefault();
	const form = event.currentTarget;
	const contestant = organization.getContestant(contestantInsertSelect.value);
	const unit = championship.getLastRound().getUnitOrNull(contestantInsertUnit.value) ?? championship.getLastRound().appendUnit(null);
	unit.appendContestant(contestant);
	organization.saveToLocalStorage();
	const modal = bootstrap.Modal.getInstance(form);
	modal.hide();
	form.reset();
	refresh();
});

refresh();
