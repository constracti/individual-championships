function refresh() {

	// team list
	const teamListNode = document.getElementById('team-list');
	Array.from(teamListNode.children).forEach(teamNode => {
		teamNode.remove();
	});
	if (organization.teamList.length === 0)
		teamListNode.appendChild(elem({klass: 'list-group-item list-group-item-warning', content: textDict.emptyList}));
	organization.teamList.forEach(team => {
		teamListNode.appendChild(elem({klass: 'list-group-item', content: team.getTitle()}));
	});

	// contestant list
	const contestantListNode = document.getElementById('contestant-list');
	Array.from(contestantListNode.children).forEach(contestantNode => {
		contestantNode.remove();
	});
	if (organization.contestantList.length === 0)
		contestantListNode.appendChild(elem({klass: 'list-group-item list-group-item-warning', content: textDict.emptyList}));
	organization.contestantList.forEach(contestant => {
		contestantListNode.appendChild(elem({klass: 'list-group-item', content: contestant.name}));
	});

	// export modal
	document.getElementById('export-textarea').value = organization.toJSON();

}

document.getElementById('import-form').addEventListener('submit', event => {
	event.preventDefault();
	const form = event.currentTarget;
	const textarea = document.getElementById('import-textarea');
	organization = Organization.fromJSON(textarea.value);
	organization.saveToLocalStorage();
	const modal = bootstrap.Modal.getInstance(form);
	modal.hide();
	form.reset();
	refresh();
});

refresh();
