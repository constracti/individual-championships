function refresh() {
	const teamListNode = document.getElementById('team-list');
	Array.from(teamListNode.children).forEach(teamNode => {
		teamNode.remove();
	});
	if (organization.teamList.length === 0)
		teamListNode.appendChild(elem({klass: 'list-group-item list-group-item-warning', content: textDict.emptyList}));
	organization.teamList.forEach((team, index) => {
		teamListNode.appendChild(elem({
			klass: 'list-group-item d-flex flex-row justify-content-between p-1',
			content: [
				elem({klass: 'm-1', content: team.getTitle()}),
				elem({
					klass: 'd-flex flex-row',
					content: [
						actionIcon({
							template: 'edit',
							click: () => {
								const form = document.getElementById('team-update-form');
								const modal = bootstrap.Modal.getOrCreateInstance(form);
								document.getElementById('team-update-index').value = index;
								document.getElementById('team-update-name').value = team.name;
								modal.show();
							},
						}),
						actionIcon({
							template: 'moveup',
							enabled: !team.isFirst(),
							click: () => {team.moveUp(); refresh();},
						}),
						actionIcon({
							template: 'movedown',
							enabled: !team.isLast(),
							click: () => {team.moveDown(); refresh();},
						}),
						actionIcon({
							template: 'delete',
							click: () => {
								const form = document.getElementById('team-delete-form');
								const modal = bootstrap.Modal.getOrCreateInstance(form);
								document.getElementById('team-delete-index').value = index;
								document.getElementById('team-delete-name').innerHTML = team.name;
								modal.show();
							},
						}),
					],
				})
			],
		}));
	});
}

document.getElementById('team-insert-form').addEventListener('submit', event => {
	event.preventDefault();
	const form = event.currentTarget;
	const name = document.getElementById('team-insert-name').value;
	organization.appendTeam(name);
	const modal = bootstrap.Modal.getInstance(form);
	modal.hide();
	form.reset();
	refresh();
});

document.getElementById('team-update-form').addEventListener('submit', event => {
	event.preventDefault();
	const form = event.currentTarget;
	const team = organization.getTeam(document.getElementById('team-update-index').value);
	const name = document.getElementById('team-update-name').value;
	team.update(name);
	const modal = bootstrap.Modal.getInstance(form);
	modal.hide();
	form.reset();
	refresh();
});

document.getElementById('team-delete-form').addEventListener('submit', event => {
	event.preventDefault();
	const form = event.currentTarget;
	const team = organization.getTeam(document.getElementById('team-delete-index').value);
	team.delete();
	const modal = bootstrap.Modal.getInstance(form);
	modal.hide();
	form.reset();
	refresh();
});

refresh();
