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
							content: 'Διαγωνιζόμενοι',
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
					content: round.unitList.map(unit => elem({
						klass: 'd-flex flex-row m-2 border p-1',
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
							...unit.contestantList.map((contestant, index) => elem({
								klass: 'd-flex flex-row',
								content: [
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
								],
							})),
						],
					})).concat(round.unitList.length === 0 ? [elem({
						klass: ' m-2 border border-warning-subtle p-1 bg-warning-subtle',
						content: [elem({klass: 'm-1', content: textDict.emptyList})],
					})] : []),
				}),
				elem({
					klass: 'd-flex flex-row',
					content: [
						elem({
							tag: 'button',
							klass: 'btn btn-secondary m-2',
							click: () => {
								round.shuffleUnitList();
								organization.saveToLocalStorage();
								refresh();
							},
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

	// content insert form
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
		if ([].concat(...round.unitList.map(unit => unit.contestantList)).includes(contestant))
			return;
		contestantInsertSelect.appendChild(elem({tag: 'option', value: contestant.index, content: contestant.name}));
	});
}

document.getElementById('contestant-insert-form').addEventListener('submit', event => {
	event.preventDefault();
	const form = event.currentTarget;
	const contestant = organization.getContestant(contestantInsertSelect.value);
	const unit = championship.getLastRound().getUnit(contestantInsertUnit.value) ?? championship.getLastRound().appendUnit();
	unit.appendContestant(contestant);
	organization.saveToLocalStorage();
	const modal = bootstrap.Modal.getInstance(form);
	modal.hide();
	form.reset();
	refresh();
});

refresh();
