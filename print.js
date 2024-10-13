const params = new URLSearchParams(window.location.search);

let round = organization.getChampionship(params.get('championship')).getLastRound();

const championshipName = document.getElementById('championship-name');
const roundTitle = document.getElementById('round-title');
const roundGameList = document.getElementById('round-game-list');

document.title = [round.championship.name, textDict.siteName].join(textDict.separator);
championshipName.innerHTML = round.championship.name;
roundTitle.innerHTML = round.getTitle();

round.gameList.forEach(game => {
	roundGameList.appendChild(elem({
		klass: 'm-2 text-center',
		content: game.unitList.map(unit => {
			const qualify = unit.contestantList.length === 1 ?
				textDict.qualifySingular :
				textDict.qualifyPlural;
			return unit.contestantList.map(contestant => contestant.getNameWithTeam()).join(', ') +
				(unit.pass ?  ' ' + qualify : '');
		}).join(' - '),
	}));
});

window.print();
