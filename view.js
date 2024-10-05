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
					tag: 'h2',
					klass: 'm-2',
					content: `Γύρος ${round.index + 1}`,
				}),
				elem({
					klass: 'd-flex flex-row',
					content: [
						elem({
							tag: 'h3',
							klass: 'm-2',
							content: 'Μονάδες',
						}),
						elem({
							tag: 'button',
							klass: 'btn btn-success m-2',
							click: () => {
								contestantInsertUnit.value = '';
								const form = document.getElementById('contestant-insert-form');
								const modal = bootstrap.Modal.getOrCreateInstance(form);
								modal.show();
							},
							content: 'Προσθήκη',
						}),
					],
				}),
				elem({
					klass: 'd-flex flex-row flex-wrap',
					content: round.unitList.map((unit, unitIndex) => elem({
						klass: 'd-flex flex-row m-2 border p-1',
						content: [
							actionIcon({
								template: 'add',
								click: () => {
									contestantInsertUnit.value = unitIndex;
									const form = document.getElementById('contestant-insert-form');
									const modal = bootstrap.Modal.getOrCreateInstance(form);
									modal.show();
								},
							}),
							...unit.map((contestant, contestantIndex) => elem({
								klass: 'd-flex flex-row',
								content: [
									elem({
										klass: 'm-1 border-start',
									}),
									elem({
										klass: 'm-1',
										content: contestant.name,
									}),
									actionIcon({
										template: 'delete',
										click: () => {
											const round = championship.getLastRound();
											const unit = round.getUnit(unitIndex);
											if (unit === null)
												throw 'unit: not valid';
											unit.splice(contestantIndex, 1);
											if (unit.length === 0)
												round.unitList.splice(unitIndex, 1);
											// TODO unit methods
											organization.saveToLocalStorage();
											refresh();
										},
									}),
								],
							})),
						],
					})),
				}),
				elem({
					klass: 'd-flex flex-row',
					content: [
						elem({
							tag: 'button',
							klass: 'btn btn-secondary m-2',
							content: 'Ανάμιξη',
						}),
						elem({
							tag: 'button',
							klass: 'btn btn-primary m-2',
							content: 'Χωρισμός',
						}),
					],
				}),
			],
		}));
	});

	refreshContestantInsertSelect();

}

const contestantInsertUnit = document.getElementById('contestant-insert-unit');
const contestantInsertTeam = document.getElementById('contestant-insert-team');
const contestantInsertSelect = document.getElementById('contestant-insert-select');

contestantInsertTeam.appendChild(elem({tag: 'option', value: '', content: textDict.nullOption}));
organization.teamList.forEach(team => {
	contestantInsertTeam.appendChild(elem({tag: 'option', value: team.index, content: team.getTitle()}));
});
contestantInsertTeam.addEventListener('change', refreshContestantInsertSelect);

function refreshContestantInsertSelect() {
	Array.from(contestantInsertSelect.children).forEach(child => child.remove());
	contestantInsertSelect.appendChild(elem({tag: 'option', value: '', content: textDict.nullOption}));
	const team = organization.getTeam(contestantInsertTeam.value);
	organization.sortedContestantList().forEach(contestant => {
		if (team !== null && contestant.team !== team)
			return;
		const round = championship.getLastRound();
		if (round.unitList.flat().includes(contestant))
			return;
		contestantInsertSelect.appendChild(elem({tag: 'option', value: contestant.index, content: contestant.name}));
	});
}

document.getElementById('contestant-insert-form').addEventListener('submit', event => {
	event.preventDefault();
	const form = event.currentTarget;
	const contestant = organization.getContestant(contestantInsertSelect.value);
	const unit = championship.getLastRound().getUnit(contestantInsertUnit.value) ?? championship.getLastRound().appendUnit();
	unit.push(contestant);
	organization.saveToLocalStorage();
	const modal = bootstrap.Modal.getInstance(form);
	modal.hide();
	form.reset();
	refresh();
});

refresh();
