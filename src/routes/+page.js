export async function load({ fetch }) {
	let promise = await fetch('http://api.ctan.es/v1/Consorcios/3/lineas/926/paradas');
	let data = await promise.json();

	let nucleoPromise = await fetch('http://api.ctan.es/v1/Consorcios/3/nucleos');
	let nucleoData = await nucleoPromise.json();

	let paradas = data.paradas.filter((p) => p.sentido == '1');
	let idParadas = paradas.map((p) => p.idParada);

	let urlHorarios = idParadas.map((p) =>
		fetch('http://api.ctan.es/v1/Consorcios/3/paradas/' + p + '/servicios?horaIni=')
	);

	let promiseHorarios = await Promise.all(urlHorarios);
	let jsonHorarios = await Promise.all(promiseHorarios.map((p) => p.json()));

	// todos los servicios que cada parada tiene
	// servicios incluye el id de la parada y más info
	let servicios = jsonHorarios.map((h) => h.servicios);

	let paradasInfo = servicios.map((s) => {
		let exctractServiciosIda = [s[0], s[2]];
		let extractServiciosVuelta = [s[1], s[3]];

		let serviciosIda = exctractServiciosIda.map((s) => {
			let servicio = s.servicio;
			let sentido = s.sentido;
			let idParada = s.idParada;
			return {
				servicio: servicio,
				sentido: sentido,
				idParada: idParada
			};
		});

		let serviciosVuelta = extractServiciosVuelta.map((s) => {
			let servicio = s.servicio;
			let sentido = s.sentido;
			let idParada = s.idParada;
			return {
				servicio: servicio,
				sentido: sentido,
				idParada: idParada
			};
		});

		let idParada = s[0].idParada;
		let parada = paradas.find((p) => p.idParada == idParada);
		let nucleo = nucleoData.nucleos.find((n) => n.idMunicipio == parada.idNucleo);

		return {
			parada: parada,
			nucleo: nucleo,
			serviciosIda: serviciosIda,
			serviciosVuelta: serviciosVuelta
		};
	});

	paradasInfo.sort((a, b) => a.parada.orden - b.parada.orden);
	return { paradasInfo };
}
