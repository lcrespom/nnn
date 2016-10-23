import { NeuralNetwork, Example, map2 } from './neurons';
import { NeuralNetworkDiagram } from './diagram';


let nn: NeuralNetwork;

$(function() {
	// $('input,textarea').on('input', evt => {
	// 	let formData = getFormData();
	// 	//TODO: validate and activate buttons
	// });
	// -------------------- Handle click on "Learn" button --------------------
	$('#butlearn').click(_ => {
		$('#butlearn').text('Learning...');
		let formData = getFormData();
		let numLayers = parseNumbers(formData.numHidden);
		numLayers.push(+formData.numOutputs);
		nn = new NeuralNetwork(+formData.numInputs, numLayers);
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
			$('#buttest, #butdiagram').attr('disabled', <any>false);
			new NeuralNetworkDiagram(nn, <HTMLCanvasElement>$('#nn-diagram').get(0)).draw();
		}, 10);
	});
	// -------------------- Handle click on "Test" button --------------------
	$('#buttest').click(_ => {
		let formData = getFormData();
		let tests = parseLearnLines(formData.testLines, nn.numInputs);
		let testResults: number[][] = [];
		tests.forEach(test => testResults.push(nn.forward(test.inputs)));
		let ranges = getRanges(tests.map(test => test.outputs));
		let strResult = map2(testResults, tests,
			(result, test) => result.map(x => fmtNum(x, 6)).join('  ') +
				compareResult(result, test.outputs, ranges)).join('\n');
		$('#tout').text(strResult);
	});
	// -------------------- Handle click on diagram button --------------------
	$('#butdiagram').click(_ => {
		if (!nn) return;
		let $diagram = $('#nn-diagram');
		let hidden = ($diagram.css('display') == 'none');
		let title = hidden ? 'Hide diagram' : 'Show diagram';
		$('#butdiagram').text(title);
		if (hidden)
			new NeuralNetworkDiagram(nn, <HTMLCanvasElement>$diagram.get(0)).draw();
		$diagram.slideToggle();
	});
	// -------------------- Enable bootstrap-styled tooltips --------------------
	$('[data-toggle="tooltip"]').tooltip();
});


// ------------------------- User input parsing -------------------------

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

function parseLearnLines(allLines: string, numInputs: number, numOutputs?: number): Example[] {
	let examples: Example[] = [];
	let lines = parseDataLines(allLines);
	lines.forEach((line, i) => {
		let example = parseExample(line);
		//TODO validate line by checking:
		//	- if example.outputs is [], then the / is missing (that is OK for tests, not OK for learning)
		//	- if the number of inputs or outputs is invalid, then some values are missing or exceeding
		//	- if some value is NaN, then there are invalid numbers
		if (example) examples.push(example);
	});
	return examples;
}

function parseExample(line: string): Example | null {
	let inout = line.split('/');
	let inputs = parseNumbers(inout[0]);
	let outputs = inout.length < 2 ? [] : parseNumbers(inout[1]);
	return { inputs, outputs };
}

function parseDataLines(allLines: string): string[] {
	return allLines.split('\n').filter(line => {
		line = line.trim();
		return line.length > 0 && line[0] != '#';
	}).map(line => line.replace(/\t/g, ' '));
}

function parseNumbers(line: string): number[] {
	return line.split(' ').filter(s => s.length > 0).map(s => parseFloat(s));
}

// -------------------- Misc --------------------

function getRanges(nums: number[][]): number[] {
	if (nums.length == 0) return [];
	let MAX_START = nums[0].map(x => Number.MAX_VALUE);
	let MIN_START = MAX_START.map(x => -x);
	let mins = nums.reduce((prevs, currs) =>
		map2(prevs, currs, (p, c) => Math.min(p, c)), MAX_START);
	let maxs = nums.reduce((prevs, currs) =>
		map2(prevs, currs, (p, c) => Math.max(p, c)), MIN_START);
	let ranges = map2(mins, maxs, (min, max) => max - min);
	if (ranges.filter(x => isNaN(x)).length > 0) ranges = [];
	return ranges;
}

function compareResult(actual: number[], expected: number[], ranges: number[]): string {
	if (ranges.length == 0 || expected.length == 0) return '';
	return '  /  (' +
		actual.map((act, i) => numError(act, expected[i], ranges[i]).toLocaleString('en-US', {
			style: 'percent',
			maximumFractionDigits: 3
		})).join('  ') + ')';
}

function numError(actual: number, expected: number, range: number): number {
	return Math.abs((actual - expected) / range);
}

function fmtNum(n: number, len = 5): string {
	return n.toLocaleString('en-US', {
		minimumFractionDigits: len,
		maximumFractionDigits: len,
		useGrouping: false
	});
}
