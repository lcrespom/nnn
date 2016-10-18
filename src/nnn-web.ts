import { NeuralNetwork, Example } from './neurons';

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
			$('#buttest').attr('disabled', <any>false);
		}, 10);
	});
	// -------------------- Handle click on "Test" button --------------------
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
	// -------------------- Handle click on "Test" button --------------------
	$('#butdiagram').click(_ => {
		if (!nn) return;
		let nnd = new NeuralNetworkDiagram(nn, <HTMLCanvasElement>$('#nn-diagram').get(0));
		nnd.draw();
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


// ------------------------- Diagram drawing -------------------------

class NeuralNetworkDiagram {
	ctx: CanvasRenderingContext2D | null;
	r: number;
	numCols: number;

	constructor(public net: NeuralNetwork, public canvas: HTMLCanvasElement) {
		this.ctx = canvas.getContext('2d');
		this.numCols = this.net.layerSizes.length + 1
		let colW = this.canvas.width / this.numCols;
		this.r = Math.min(20, colW / 4);
	}

	draw() {
		this.drawWeights();
		this.drawNodes();
	}

	drawWeights() {
	}

	drawNodes() {
		if (!this.ctx) return;
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		for (let col = 0; col < this.numCols; col++) {
			this.drawCol(col);
		}
	}

	drawCol(col: number) {
		let numRows = col == 0 ? nn.numInputs : this.net.layerSizes[col - 1];
		for (let row = 0; row < numRows; row++) {
			let isInput = col == 0;
			let isBias = false;	//TODO draw bias
			let [x, y] = this.getCenter(col, row);
			this.drawNode(x, y, this.r, isInput, isBias);
		}
	}

	drawNode(x: number, y: number, r: number, isInput: boolean, isBias: boolean) {
		if (!this.ctx) return;
		this.ctx.strokeStyle = 'black';
		if (isBias)
			this.ctx.fillStyle = '#2DD';
		else
			this.ctx.fillStyle = '#337AB7';
		if (isInput) {
			let x1 = x - r / 2;
			let y1 = y - r / 2;
			let dxy = r * 2;
			this.ctx.fillRect(x1, y1, dxy, dxy);
			this.ctx.strokeRect(x1, y1, dxy, dxy);
		}
		else {
			this.ctx.beginPath();
			this.ctx.arc(x, y, r, 0, Math.PI * 2);
			this.ctx.fill();
			this.ctx.beginPath();
			this.ctx.arc(x, y, r, 0, Math.PI * 2);
			this.ctx.stroke();
		}
	}

	getCenter(col: number, row: number): [number, number] {
		let numRows = col == 0 ? nn.numInputs : this.net.layerSizes[col - 1];
		let colW = this.canvas.width / this.numCols;
		let rowH = this.canvas.height / numRows;
		let x = col * colW + colW / 2;
		let y = row * rowH + rowH / 2;
		return [x, y];
	}
}
