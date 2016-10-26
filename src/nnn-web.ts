import { NeuralNetwork, Example, map2 } from './neurons';
import { NeuralNetworkDiagram } from './diagram';

declare var _js_editor: any;
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
			(result, test) => formatNums(result) +
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
	// -------------------- Handle click on learn formula --------------------
	$('#samples').on('input', evt => {
		let numSamples = +(<HTMLInputElement>evt.target).value;
		let numInputs = +getFormData().numInputs;
		$('#tsamples').val(Math.pow(numSamples, numInputs).toLocaleString('es'));
	});
	$('#butformula').click(_ => {
		let code = _js_editor.getModel().getValue();
		let fun;
		// tslint:disable-next-line - Disables all rules for the following line
		eval('fun = ' + code);
		let learnData = generateLearnData(getFormData(), fun);
		let learnText = learnData.map(example =>
			formatNums(example.inputs) + '  /  ' + formatNums(example.outputs)
		).join('\n');
		$('#ldata').text(learnText);
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
		testLines: $('#tdata').val(),
		formulaSamples: $('#samples').val()
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


// -------------------- Learn data formula --------------------

function generateLearnData(formData: any, func: Function): Example[] {
	let numInputs = +formData.numInputs;
	let samplesPerInput = +formData.formulaSamples;
	let totalInputs = Math.pow(samplesPerInput, numInputs);
	let examples: Example[] = [];
	for (let i = 0; i < totalInputs; i++) examples.push({ inputs: [], outputs: [] });
	generateInputs(numInputs, samplesPerInput, examples);
	for (let example of examples)
		example.outputs = func.apply(null, example.inputs);
	return examples;
}

function generateInputs(numInputs: number, samplesPerInput: number,
	samples: Example[], startAt = 0) {
	let inc = 1 / (samplesPerInput - 1);
	let x = 0;
	let totalInputs = Math.pow(samplesPerInput, numInputs);
	let inputsPerStep = totalInputs / samplesPerInput;
	for (let i = 0; i < totalInputs; i++) {
		samples[i + startAt].inputs.push(x);
		if ((i + 1) % inputsPerStep == 0) {
			x += inc;
			if (numInputs > 1)
				generateInputs(numInputs - 1, samplesPerInput, samples,
					startAt + i + 1 - inputsPerStep);
		}
	}
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

function formatNums(nums: number[], len = 6): string {
	return nums.map(x => fmtNum(x, len)).join('  ');
}

function fmtNum(n: number, len = 5): string {
	return n.toLocaleString('en-US', {
		minimumFractionDigits: len,
		maximumFractionDigits: len,
		useGrouping: false
	});
}
