let fs = require('fs');
let namelist = JSON.parse(fs.readFileSync('./NUTS_AT_2013.json').toString());
let tabbedlist = fs.readFileSync('./NUTS_2013L.csv').toString().split('\n');


let names = {};
namelist.forEach(name => {
	names[name.NUTS_ID] = name.NAME_LATN;
});

tabbedlist.forEach(line => {
	let col = line.split('|');
	if (col[4]) {
		let nut = col[4].slice(1, col[4].length - 1);
		let name = col[5].slice(1, col[5].length - 1);
		names[nut] = name;
	}
});

let list = Object.keys(names).map(key => {
	return {name: key, value: names[key]};
}).sort((a, b) => {
	if (a.name < b.name) return -1;
	if (a.name > b.name) return 1;
	return 0;
});
names = {};
list.forEach(item => {
	names[item.name] = item.value;
});

fs.writeFileSync('../nuts_names.json', JSON.stringify(names, null, '\t'));

let buildGeoJson = (filename, resolution, level) => {
	console.log('file', filename);
	let geo = JSON.parse(fs.readFileSync(filename).toString());
	geo.features.forEach(feature => {
		let name = names[feature.properties.NUTS_ID];
		if (!name) {
			console.log('warning, unnamed NUTS code', feature.properties.NUTS_ID);
			name = 'NUTS-' + feature.properties.NUTS_ID;
		}
		feature.properties = {id: feature.properties.NUTS_ID, name};
		// console.log(feature);
	});

	fs.writeFileSync('../nuts_' + resolution + 'M_lvl' + level + '.geo.json', JSON.stringify(geo));//, null, '\t'));
};

['20', '60'].forEach((resolution) => {
	[0, 1, 2, 3].forEach((level) => {
		buildGeoJson('./nuts_rg_' + resolution + 'M_2013_lvl_' + level + '.geojson', resolution, level);
	});
});


