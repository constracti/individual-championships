const teamList = document.getElementById('team-list');

const teamInsertForm = document.getElementById('team-insert-form');
const teamInsertName = document.getElementById('team-insert-name');

const teamUpdateForm = document.getElementById('team-update-form');
const teamUpdateIndex = document.getElementById('team-update-index');
const teamUpdateName = document.getElementById('team-update-name');

const teamDeleteForm = document.getElementById('team-delete-form');
const teamDeleteIndex = document.getElementById('team-delete-index');
const teamDeleteName = document.getElementById('team-delete-name');

function refresh() {
	teamList.innerHTML = '';
	if (organization.teamList.length === 0) {
		teamList.appendChild(elem({
			klass: 'list-group-item list-group-item-warning',
			content: textDict.emptyList,
		}));
	}
	organization.teamList.forEach(team => {
		teamList.appendChild(elem({
			klass: 'list-group-item d-flex flex-row justify-content-between p-1',
			content: [
				elem({klass: 'm-1', content: team.getNameWithIndex()}),
				elem({
					klass: 'd-flex flex-row',
					content: [
						actionIcon({
							template: 'edit',
							click: () => {
								const modal = bootstrap.Modal.getOrCreateInstance(teamUpdateForm);
								teamUpdateIndex.value = team.index;
								teamUpdateName.value = team.name;
								modal.show();
							},
						}),
						actionIcon({
							template: 'moveup',
							enabled: !team.isFirst(),
							click: () => {
								organization = Organization.loadFromLocalStorage();
								organization.getTeam(team.index).moveUp();
								organization.saveToLocalStorage();
								refresh();
							},
						}),
						actionIcon({
							template: 'movedown',
							enabled: !team.isLast(),
							click: () => {
								organization = Organization.loadFromLocalStorage();
								organization.getTeam(team.index).moveDown();
								organization.saveToLocalStorage();
								refresh();
							},
						}),
						actionIcon({
							template: 'delete',
							click: () => {
								const modal = bootstrap.Modal.getOrCreateInstance(teamDeleteForm);
								teamDeleteIndex.value = team.index;
								teamDeleteName.innerHTML = team.name;
								modal.show();
							},
						}),
					],
				})
			],
		}));
	});
}

teamInsertForm.addEventListener('submit', event => {
	event.preventDefault();
	organization = Organization.loadFromLocalStorage();
	organization.appendTeam(teamInsertName.value);
	organization.saveToLocalStorage();
	const modal = bootstrap.Modal.getInstance(teamInsertForm);
	modal.hide();
	teamInsertForm.reset();
	refresh();
});

teamUpdateForm.addEventListener('submit', event => {
	event.preventDefault();
	organization = Organization.loadFromLocalStorage();
	organization.getTeam(teamUpdateIndex.value).update(teamUpdateName.value);
	organization.saveToLocalStorage();
	const modal = bootstrap.Modal.getInstance(teamUpdateForm);
	modal.hide();
	teamUpdateForm.reset();
	refresh();
});

teamDeleteForm.addEventListener('submit', event => {
	event.preventDefault();
	organization = Organization.loadFromLocalStorage();
	organization.getTeam(teamDeleteIndex.value).delete();
	organization.saveToLocalStorage();
	const modal = bootstrap.Modal.getInstance(teamDeleteForm);
	modal.hide();
	teamDeleteForm.reset();
	refresh();
});

refresh();
