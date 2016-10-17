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
		nn = new NeuralNetwork(+formData.numInputs, [+formData.numHidden, +formData.numOutputs]);
		nn.acceptableError = +formData.maxError;
		nn.maxLearnIterations = +formData.maxIterations;
		nn.epsilon = +formData.epsilon;
		let examples = parseLearnLines(formData.learnLines, +formData.numInputs, +formData.numOutputs);
		setTimeout(() => {
			nn.learn(examples);
			console.log(`*** Learned in ${nn.learnIteration} iterations, with an error of ${nn.learnError}`);
			$('#butlearn').text('Learn');
			$('#liters').val(nn.learnIteration);
			$('#lerror').val(fmtNum(nn.learnError, 9));
			$('#buttest').attr('disabled', <any>false);
		}, 10);
	});
	$('#buttest').click(_ => {
		let formData = getFormData();
		let tests = parseTestLines(formData.testLines, nn.numInputs);
		let testResults: number[][] = [];
		tests.forEach(test => testResults.push(nn.forward(test)));
		let strResult = testResults
			.map(result => result.map(x => fmtNum(x, 6)).join('  '))
			.join('\n');
		$('#tout').text(strResult);
	});
});

function getFormData() {
	return {
		numInputs: $('#nimputs').val(),
		numOutputs: $('#noutputs').val(),
		numHidden: $('#nhidden').val(),
		maxError: $('#maxerror').val(),
		maxIterations: $('#maxiters').val(),
		epsilon: $('#epsilon').val(),
		learnLines: $('#ldata').val(),
		testLines: $('#tdata').val()
	};
}

function parseLearnLines(allLines: string, numInputs: number, numOutputs: number): Example[] {
	let examples: Example[] = [];
	let lines = parseDataLines(allLines);
	lines.forEach((line, i) => {
		let example = parseExample(line);
		//TODO validate line by checking:
		//	- if example is null, then the / is missing
		//	- if the number of inputs or outputs is invalid, then some values are missing or exceeding
		//	- if some value is NaN, then there are invalid numbers
		if (example) examples.push(example);
	});
	return examples;
}

function parseExample(line: string): Example | null {
	let inout = line.split('/');
	if (inout.length < 2) return null;
	let inputs = parseNumbers(inout[0]);
	let outputs = parseNumbers(inout[1]);
	return { inputs, outputs };
}

function parseTestLines(allLines: string, numInputs: number): number[][] {
	let tests: number[][];
	tests = [];
	let lines = parseDataLines(allLines);
	lines.forEach((line, i) => {
		let inputs = parseNumbers(line);
		//TODO validate line by checking:
		//	- if the number of inputs is invalid, then some values are missing or exceeding
		//	- if some value is NaN, then there are invalid numbers
		tests.push(inputs);
	});
	return tests;
}

function parseDataLines(allLines: string): string[] {
	return allLines.split('\n').filter(line => {
		line = line.trim();
		return line.length > 0 && line[0] != '#';
	});
}

function parseNumbers(line: string): number[] {
	return line.split(' ').filter(s => s.length > 0).map(s => parseFloat(s));
}

function fmtNum(n: number, len = 5): string {
	return n.toString().substr(0, len);
}
