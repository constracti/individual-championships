const urlParams = new URLSearchParams(window.location.search);

if (!urlParams.has('championship'))
	throw 'championship: not defined';

const championship = organization.getChampionship(urlParams.get('championship'));

if (championship === null)
	throw 'championship: not valid';

document.title = [championship.name, textDict.siteName].join(textDict.separator);

document.getElementById('title').innerHTML = championship.name;

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
						tag: 'a',
						klass: 'btn btn-success m-2',
						href: '#contestant-add-form',
						// TODO data-bs-toggle="modal"
						content: 'Προσθήκη',
					}),
				],
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
