Array.from(document.getElementsByTagName('select')).forEach(select => {
	if (!['contestant-insert-team', 'contestant-update-team'].includes(select.id))
		return;
	select.appendChild(elem({tag: 'option', value: '', content: textDict.nullOption}));
	organization.teamList.forEach((team, index) => {
		select.appendChild(elem({tag: 'option', value: index, content: team.getTitle()}));
	});
});

document.getElementById('contestant-groupby').value = organization.contestantGroupBy;
document.getElementById('contestant-groupby').addEventListener('change', () => {
	organization.setContestantGroupBy(document.getElementById('contestant-groupby').value);
	refresh();
});

document.getElementById('contestant-sortby').value = organization.contestantSortBy;
document.getElementById('contestant-sortby').addEventListener('change', () => {
	organization.setContestantSortBy(document.getElementById('contestant-sortby').value);
	refresh();
});

function refresh() {
	const contestantListNode = document.getElementById('contestant-list');
	Array.from(contestantListNode.children).forEach(contestantNode => {
		contestantNode.remove();
	});
	if (organization.contestantList.length === 0)
		contestantListNode.appendChild(elem({klass: 'list-group-item list-group-item-warning', content: textDict.emptyList}));
	organization.contestantList.toSorted((contestant1, contestant2) => {
		if (organization.contestantGroupBy === 'teamwise') {
			const team1 = contestant1.team?.search() ?? -1;
			const team2 = contestant2.team?.search() ?? -1;
			const cmp = team1 - team2;
			if (cmp)
				return cmp;
		}
		if (organization.contestantSortBy === 'name') {
			const cmp = contestant1.name.localeCompare(contestant2.name);
			if (cmp)
				return cmp;
		}
		return 0;
	}).forEach(contestant => {
		contestantListNode.appendChild(elem({
			klass: 'list-group-item d-flex flex-row justify-content-between p-1',
			content: [
				elem({klass: 'd-flex flex-row flex-align-center', content: [
					elem({tag: 'span', klass: 'm-1', content: contestant.name}),
					elem({tag: 'span', klass: 'badge text-bg-secondary m-1', content: contestant.team?.getTitle() ?? null}),
				]}),
				elem({
					klass: 'd-flex flex-row',
					content: [
						actionIcon({
							template: 'edit',
							click: () => {
								const form = document.getElementById('contestant-update-form');
								const modal = bootstrap.Modal.getOrCreateInstance(form);
								document.getElementById('contestant-update-index').value = contestant.search();
								document.getElementById('contestant-update-name').value = contestant.name;
								document.getElementById('contestant-update-team').value = contestant.team?.search() ?? '';
								modal.show();
							},
						}),
						actionIcon({
							template: 'delete',
							click: () => {
								const form = document.getElementById('contestant-delete-form');
								const modal = bootstrap.Modal.getOrCreateInstance(form);
								document.getElementById('contestant-delete-index').value = contestant.search();
								document.getElementById('contestant-delete-name').innerHTML = contestant.name;
								modal.show();
							},
						}),
					],
				}),
			],
		}));
	});
}

document.getElementById('contestant-insert-form').addEventListener('submit', event => {
	event.preventDefault();
	const form = event.currentTarget;
	const name = document.getElementById('contestant-insert-name').value;
	const team = organization.getTeam(document.getElementById('contestant-insert-team').value);
	organization.appendContestant(name, team);
	const modal = bootstrap.Modal.getInstance(form);
	modal.hide();
	form.reset();
	refresh();
});

document.getElementById('contestant-update-form').addEventListener('submit', event => {
	event.preventDefault();
	const form = event.currentTarget;
	const contestant = organization.getContestant(document.getElementById('contestant-update-index').value);
	const name = document.getElementById('contestant-update-name').value;
	const team = organization.getTeam(document.getElementById('contestant-update-team').value);
	contestant.update(name, team);
	const modal = bootstrap.Modal.getInstance(form);
	modal.hide();
	form.reset();
	refresh();
});

document.getElementById('contestant-delete-form').addEventListener('submit', event => {
	event.preventDefault();
	const form = event.currentTarget;
	const contestant = organization.getContestant(document.getElementById('contestant-delete-index').value);
	contestant.delete();
	const modal = bootstrap.Modal.getInstance(form);
	modal.hide();
	form.reset();
	refresh();
});

refresh();
