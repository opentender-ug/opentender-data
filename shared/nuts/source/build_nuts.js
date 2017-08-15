let fs = require('fs');
let namelist = JSON.parse(fs.readFileSync('./NUTS_AT_2013.json').toString());

let names = {};
namelist.forEach(name => {
	names[name.NUTS_ID] = name.NAME_LATN;
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
	[1, 2, 3].forEach((level) => {
		buildGeoJson('./nuts_rg_' + resolution + 'M_2013_lvl_' + level + '.geo.json', resolution, level);
	});
});


