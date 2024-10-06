const contestantList = document.getElementById('contestant-list');

const contestantGroupBySelect = document.getElementById('contestant-groupby');
const contestantSortBySelect = document.getElementById('contestant-sortby');

const contestantInsertForm = document.getElementById('contestant-insert-form');
const contestantInsertName = document.getElementById('contestant-insert-name');
const contestantInsertTeam = document.getElementById('contestant-insert-team');

const contestantUpdateForm = document.getElementById('contestant-update-form');
const contestantUpdateIndex = document.getElementById('contestant-update-index');
const contestantUpdateName = document.getElementById('contestant-update-name');
const contestantUpdateTeam = document.getElementById('contestant-update-team');

const contestantDeleteForm = document.getElementById('contestant-delete-form');
const contestantDeleteIndex = document.getElementById('contestant-delete-index');
const contestantDeleteName = document.getElementById('contestant-delete-name');

function refresh() {
	[contestantInsertTeam, contestantUpdateTeam].forEach(select => {
		select.appendChild(elem({tag: 'option', value: '', content: textDict.nullOption}));
		organization.teamList.forEach(team => {
			select.appendChild(elem({tag: 'option', value: team.index, content: team.getNameWithIndex()}));
		});
	});
	contestantGroupBySelect.value = organization.contestantGroupBy;
	contestantSortBySelect.value = organization.contestantSortBy;
	contestantList.innerHTML = '';
	if (organization.contestantList.length === 0) {
		contestantList.appendChild(elem({
			klass: 'list-group-item list-group-item-warning',
			content: textDict.emptyList,
		}));
	}
	organization.sortedContestantList().forEach(contestant => {
		contestantList.appendChild(elem({
			klass: 'list-group-item d-flex flex-row justify-content-between p-1',
			content: [
				elem({klass: 'm-1', content: contestant.getNameWithTeam()}),
				elem({
					klass: 'd-flex flex-row',
					content: [
						actionIcon({
							template: 'edit',
							click: () => {
								const modal = bootstrap.Modal.getOrCreateInstance(contestantUpdateForm);
								contestantUpdateIndex.value = contestant.index;
								contestantUpdateName.value = contestant.name;
								contestantUpdateTeam.value = contestant.team?.index ?? '';
								modal.show();
							},
						}),
						actionIcon({
							template: 'delete',
							click: () => {
								const modal = bootstrap.Modal.getOrCreateInstance(contestantDeleteForm);
								contestantDeleteIndex.value = contestant.index;
								contestantDeleteName.innerHTML = contestant.name;
								modal.show();
							},
						}),
					],
				}),
			],
		}));
	});
}

contestantGroupBySelect.addEventListener('change', () => {
	organization = Organization.loadFromLocalStorage();
	organization.setContestantGroupBy(contestantGroupBySelect.value);
	organization.saveToLocalStorage();
	refresh();
});

contestantSortBySelect.addEventListener('change', () => {
	organization = Organization.loadFromLocalStorage();
	organization.setContestantSortBy(contestantSortBySelect.value);
	organization.saveToLocalStorage();
	refresh();
});

contestantInsertForm.addEventListener('submit', event => {
	event.preventDefault();
	organization = Organization.loadFromLocalStorage();
	const name = contestantInsertName.value;
	const team = organization.getTeamOrNull(contestantInsertTeam.value);
	organization.appendContestant(name, team);
	organization.saveToLocalStorage();
	const modal = bootstrap.Modal.getInstance(contestantInsertForm);
	modal.hide();
	contestantInsertForm.reset();
	refresh();
});

contestantUpdateForm.addEventListener('submit', event => {
	event.preventDefault();
	organization = Organization.loadFromLocalStorage();
	const contestant = organization.getContestant(contestantUpdateIndex.value);
	const name = contestantUpdateName.value;
	const team = organization.getTeamOrNull(contestantUpdateTeam.value);
	contestant.update(name, team);
	organization.saveToLocalStorage();
	const modal = bootstrap.Modal.getInstance(contestantUpdateForm);
	modal.hide();
	contestantUpdateForm.reset();
	refresh();
});

contestantDeleteForm.addEventListener('submit', event => {
	event.preventDefault();
	organization = Organization.loadFromLocalStorage();
	const contestant = organization.getContestant(contestantDeleteIndex.value);
	contestant.delete();
	organization.saveToLocalStorage();
	const modal = bootstrap.Modal.getInstance(contestantDeleteForm);
	modal.hide();
	contestantDeleteForm.reset();
	refresh();
});

refresh();
