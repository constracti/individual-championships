function refresh() {
	const championshipListNode = document.getElementById('championship-list');
	Array.from(championshipListNode.children).forEach(championshipNode => {
		championshipNode.remove();
	});
	if (organization.championshipList.length === 0)
		championshipListNode.appendChild(elem({klass: 'list-group-item list-group-item-warning', content: textDict.emptyList}));
	organization.championshipList.toSorted((championship1, championship2) => {
		return championship1.name.localeCompare(championship2.name);
	}).forEach(championship => {
		championshipListNode.appendChild(elem({
			klass: 'list-group-item d-flex flex-row justify-content-between p-1',
			content: [
				elem({klass: 'm-1', content: championship.name}),
				elem({
					klass: 'd-flex flex-row',
					content: [
						actionIcon({
							template: 'edit',
							click: () => {
								const form = document.getElementById('championship-update-form');
								const modal = bootstrap.Modal.getOrCreateInstance(form);
								document.getElementById('championship-update-index').value = championship.search();
								document.getElementById('championship-update-name').value = championship.name;
								modal.show();
							},
						}),
						actionIcon({
							template: 'delete',
							click: () => {
								const form = document.getElementById('championship-delete-form');
								const modal = bootstrap.Modal.getOrCreateInstance(form);
								document.getElementById('championship-delete-index').value = championship.search();
								document.getElementById('championship-delete-name').innerHTML = championship.name;
								modal.show();
							},
						}),
					],
				}),
			],
		}));
	});
}

document.getElementById('championship-insert-form').addEventListener('submit', event => {
	event.preventDefault();
	const form = event.currentTarget;
	const name = document.getElementById('championship-insert-name').value;
	organization.appendChampionship(name);
	const modal = bootstrap.Modal.getInstance(form);
	modal.hide();
	form.reset();
	refresh();
});

document.getElementById('championship-update-form').addEventListener('submit', event => {
	event.preventDefault();
	const form = event.currentTarget;
	const championship = organization.getChampionship(document.getElementById('championship-update-index').value);
	const name = document.getElementById('championship-update-name').value;
	championship.update(name);
	const modal = bootstrap.Modal.getInstance(form);
	modal.hide();
	form.reset();
	refresh();
});

document.getElementById('championship-delete-form').addEventListener('submit', event => {
	event.preventDefault();
	const form = event.currentTarget;
	const championship = organization.getChampionship(document.getElementById('championship-delete-index').value);
	championship.delete();
	const modal = bootstrap.Modal.getInstance(form);
	modal.hide();
	form.reset();
	refresh();
});

refresh();
