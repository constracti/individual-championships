const championshipList = document.getElementById('championship-list');

const championshipInsertForm = document.getElementById('championship-insert-form');
const championshipInsertName = document.getElementById('championship-insert-name');
const championshipInsertInfo = document.getElementById('championship-insert-info');
const championshipInsertUnitCap = document.getElementById('championship-insert-unit-cap');
const championshipInsertGameCap = document.getElementById('championship-insert-game-cap');

const championshipUpdateForm = document.getElementById('championship-update-form');
const championshipUpdateIndex = document.getElementById('championship-update-index');
const championshipUpdateName = document.getElementById('championship-update-name');
const championshipUpdateInfo = document.getElementById('championship-update-info');
const championshipUpdateUnitCap = document.getElementById('championship-update-unit-cap');
const championshipUpdateGameCap = document.getElementById('championship-update-game-cap');

const championshipDeleteForm = document.getElementById('championship-delete-form');
const championshipDeleteIndex = document.getElementById('championship-delete-index');
const championshipDeleteName = document.getElementById('championship-delete-name');

const createForm = document.getElementById('create-form');
const createTextarea = document.getElementById('create-textarea');

const importForm = document.getElementById('import-form');
const importTextarea = document.getElementById('import-textarea');

const exportTextarea = document.getElementById('export-textarea');

document.getElementById('version').innerHTML = VERSION;

function refresh() {
	championshipList.innerHTML = '';
	if (organization.championshipList.length === 0) {
		championshipList.appendChild(elem({
			klass: 'list-group-item list-group-item-warning',
			content: textDict.emptyList,
		}));
	}
	organization.sortedChampionshipList().forEach(championship => {
		championshipList.appendChild(elem({
			klass: 'list-group-item d-flex flex-row justify-content-between p-1',
			content: [
				elem({
					klass: 'd-flex flex-row align-items-baseline',
					content: [
						elem({
							tag: 'a',
							klass: 'm-1',
							href: `view.html?championship=${championship.index}`,
							content: championship.name,
						}),
						championship.info.length ? elem({
							tag: 'small',
							klass: 'm-1 fst-italic',
							content: championship.info,
						}) : null,
					],
				}),
				elem({
					klass: 'd-flex flex-row',
					content: [
						actionIcon({
							template: 'edit',
							click: () => {
								const modal = bootstrap.Modal.getOrCreateInstance(championshipUpdateForm);
								championshipUpdateIndex.value = championship.index;
								championshipUpdateName.value = championship.name;
								championshipUpdateInfo.value = championship.info;
								championshipUpdateUnitCap.value = championship.unitCap;
								championshipUpdateGameCap.value = championship.gameCap;
								modal.show();
							},
						}),
						actionIcon({
							template: 'delete',
							click: () => {
								const modal = bootstrap.Modal.getOrCreateInstance(championshipDeleteForm);
								championshipDeleteIndex.value = championship.index;
								championshipDeleteName.innerHTML = championship.name;
								modal.show();
							},
						}),
					],
				}),
			],
		}));
	});
	exportTextarea.value = organization.toJSON(true);
}

championshipInsertForm.addEventListener('submit', event => {
	event.preventDefault();
	organization.compareWithLocalStorage();
	const championship = organization.appendChampionship(
		championshipInsertName.value,
		championshipInsertInfo.value,
		parseInt(championshipInsertUnitCap.value),
		parseInt(championshipInsertGameCap.value),
	);
	championship.appendRound();
	organization.saveToLocalStorage();
	const modal = bootstrap.Modal.getInstance(championshipInsertForm);
	modal.hide();
	championshipInsertForm.reset();
	refresh();
});

championshipUpdateForm.addEventListener('submit', event => {
	event.preventDefault();
	organization.compareWithLocalStorage();
	organization.getChampionship(championshipUpdateIndex.value).update(
		championshipUpdateName.value,
		championshipUpdateInfo.value,
		parseInt(championshipUpdateUnitCap.value),
		parseInt(championshipUpdateGameCap.value),
	);
	organization.saveToLocalStorage();
	const modal = bootstrap.Modal.getInstance(championshipUpdateForm);
	modal.hide();
	championshipUpdateForm.reset();
	refresh();
});

championshipDeleteForm.addEventListener('submit', event => {
	event.preventDefault();
	organization.compareWithLocalStorage();
	organization.getChampionship(championshipDeleteIndex.value).delete();
	organization.saveToLocalStorage();
	const modal = bootstrap.Modal.getInstance(championshipDeleteForm);
	modal.hide();
	championshipDeleteForm.reset();
	refresh();
});

createForm.addEventListener('submit', event => {
	event.preventDefault();
	organization = Organization.fromTXT(createTextarea.value);
	organization.saveToLocalStorage();
	const modal = bootstrap.Modal.getInstance(createForm);
	modal.hide();
	createForm.reset();
	refresh();
});

importForm.addEventListener('submit', event => {
	event.preventDefault();
	organization = Organization.fromJSON(importTextarea.value);
	organization.saveToLocalStorage();
	const modal = bootstrap.Modal.getInstance(importForm);
	modal.hide();
	importForm.reset();
	refresh();
});

refresh();
