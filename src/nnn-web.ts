import { NeuralNetwork, Example } from './neurons';

let nn: NeuralNetwork;

$(function() {
	// $('input,textarea').on('input', evt => {
	// 	let formData = getFormData();
	// 	//TODO: validate and activate buttons
	// });
	$('#butlearn').click(_ => {
		$('#butlearn').text('Learning...');
		let formData = getFormData();
		nn = new NeuralNetwork(+formData.numInputs, +formData.numHidden, +formData.numOutputs);
		nn.acceptableError = formData.maxError;
		nn.maxLearnIterations = formData.maxIterations;
		let examples = parseLearnLines(formData.learnLines, +formData.numInputs, +formData.numOutputs);
		setTimeout(() => {
			nn.learn(examples);
			console.log(`*** Learned in ${nn.learnIteration} iterations, with an error of ${nn.learnError}`);
			$('#butlearn').text('Learn');
			$('#liters').val(nn.learnIteration);
			$('#lerror').val(nn.learnError.toString().substr(0, 9));
			$('#buttest').attr('disabled', <any>false);
		}, 10);
	});
	$('#buttest').click(_ => {
		//TODO: test
	});
});

function getFormData() {
	return {
		numInputs: $('#nimputs').val(),
		numOutputs: $('#noutputs').val(),
		numHidden: $('#nhidden').val(),
		maxError: $('#maxerror').val(),
		maxIterations: $('#maxiters').val(),
		learnLines: $('#ldata').val(),
		testLines: $('#tdata').val()
	};
}

function parseLearnLines(allLines: string, numInputs: number, numOutputs: number): Example[] {
	let examples: Example[] = [];
	let lines = allLines.split('\n');
	lines.forEach((line, i) => {
		if (line.length == 0) return;
		let example = parseExample(line);
		//TODO validate line by checking:
		//	- if example is null, then the / is missing
		//	- if the number of inputs or outputs is invalid, then some data is missing
		//	- if some value is NaN, then there are invalid numbers
		if (example) examples.push(example);
	});
	return examples;
}

function parseExample(line: string): Example | null {
	let inout = line.split('/');
	if (inout.length < 2) return null;
	let str2numarr = str => str.split(' ').filter(s => s.length > 0).map(s => parseFloat(s));
	let inputs = str2numarr(inout[0]);
	let outputs = str2numarr(inout[1]);
	return { inputs, outputs };
}
