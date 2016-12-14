import { NeuralNetwork, Neuron } from './neurons';


const BORDER_COLOR = 'black';
const NEURON_COLOR = '#337AB7';
const DISABLED_COLOR = '#AAA';
const INPUT_COLOR = NEURON_COLOR;
const BIAS_COLOR = '#2DD';
const NEGATIVE_WEIGHT_HUE = 0;
const POSITIVE_WEIGHT_HUE = 240;
const SELECT_CLASS = 'diagram-select';


class Synapse {
	constructor(public neuron: Neuron, public weightNum: number) {}

	toggle() {
		if (this.isDisabled()) {
			let w = this.neuron.disabledWeights[this.weightNum];
			this.neuron.weights[this.weightNum] = w;
			this.neuron.disabledWeights[this.weightNum] = Number.NaN;
		}
		else {
			let w = this.neuron.weights[this.weightNum];
			this.neuron.disabledWeights[this.weightNum] = w;
			this.neuron.weights[this.weightNum] = 0;
		}
	}

	isDisabled(): boolean {
		return !isNaN(this.neuron.disabledWeights[this.weightNum]);
	}
}


export class NeuralNetworkDiagram {
	ctx: CanvasRenderingContext2D;
	r: number;
	numCols: number;
	mouseX = -1;
	mouseY = -1;
	mouseNeuron: Neuron | null;
	mouseSynapse: Synapse | null;

	constructor(public net: NeuralNetwork, public canvas: HTMLCanvasElement) {
		let ctx = canvas.getContext('2d');
		if (ctx) this.ctx = ctx;
		this.numCols = this.net.layerSizes.length + 1;
		this.registerMouse();
		// Calculate radius
		let maxRows = net.numInputs;
		net.layers.forEach(layer => maxRows = Math.max(maxRows, layer.length));
		let colH = this.canvas.height / maxRows;
		this.r = Math.min(20, colH / 3);
	}

	draw() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.drawWeights();
		this.drawNodes();
	}

	drawWeights() {
		let gco = this.ctx.globalCompositeOperation;
		this.ctx.globalCompositeOperation  = 'darken';
		let minW = 0, maxW = 0;
		this.net.layers.forEach(l => l.forEach(n => n.weights.forEach(w => {
			if (w < minW) minW = w;
			if (w > maxW) maxW = w;
		})));
		if (minW == 0) minW = 1;
		if (maxW == 0) maxW = 1;
		for (let i = 0; i < this.net.layers.length; i++)
			for (let j = 0; j < this.net.layers[i].length; j++)
				this.drawNodeWeights(i, j, minW, maxW);
		this.ctx.globalCompositeOperation  = gco;
	}

	drawNodeWeights(i: number, j: number, minW: number, maxW: number) {
		let neuron = this.net.layers[i][j];
		this.ctx.lineWidth = 2;
		for (let w = 0; w < neuron.weights.length; w++) {
			let nw = neuron.weights[w];
			let synapse = new Synapse(neuron, w);
			if (synapse.isDisabled()) {
				this.ctx.strokeStyle = DISABLED_COLOR;
			}
			else {
				let div = nw < 0 ? minW : maxW;
				let hue = nw < 0 ? NEGATIVE_WEIGHT_HUE : POSITIVE_WEIGHT_HUE;
				let lightness = 100 - 66 * (nw / div);
				this.ctx.strokeStyle = `hsl(${hue}, 100%, ${lightness}%)`;
			}
			let [x1, y1] = this.getCenter(i, w);
			let [x2, y2] = this.getCenter(i + 1, j);
			this.ctx.beginPath();
			this.ctx.moveTo(x1, y1);
			this.ctx.lineTo(x2, y2);
			this.checkMouseInSynapse(neuron, w);
			this.ctx.stroke();
		}
	}

	drawNodes() {
		for (let col = 0; col < this.numCols; col++) {
			this.drawCol(col);
		}
	}

	drawCol(col: number) {
		let numRows = this.getNumRows(col);
		let isOutput = this.isOutput(col);
		for (let row = 0; row < numRows; row++) {
			let isInput = col == 0;
			let isBias = !isOutput && row == numRows - 1;
			let isDisabled = !isInput && !isOutput && !isBias
				&& this.net.layers[col - 1][row].disabled;
			let [x, y] = this.getCenter(col, row);
			this.drawNode(x, y, this.r, isInput, isBias, isDisabled);
			if (!isInput && !isOutput && !isBias)
				this.checkMouseInNeuron(x, y, this.r, col, row);
		}
	}

	drawNode(x: number, y: number, r: number,
		isInput: boolean, isBias: boolean, isDisabled) {
		this.ctx.strokeStyle = BORDER_COLOR;
		if (isBias)
			this.ctx.fillStyle = BIAS_COLOR;
		else if (isInput)
			this.ctx.fillStyle = INPUT_COLOR;
		else if (isDisabled)
			this.ctx.fillStyle = DISABLED_COLOR;
		else
			this.ctx.fillStyle = NEURON_COLOR;
		if (isInput || isBias) {
			let x1 = x - r;
			let y1 = y - r;
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
		let numRows = this.getNumRows(col);
		let colW = this.canvas.width / this.numCols;
		let rowH = this.canvas.height / numRows;
		let x = col * colW + colW / 2;
		let y = row * rowH + rowH / 2;
		return [x, y];
	}

	getNumRows(col: number): number {
		let numRows = col == 0 ? this.net.numInputs : this.net.layerSizes[col - 1];
		if (!this.isOutput(col)) numRows++;
		return numRows;
	}

	isOutput(col: number): boolean {
		return col == this.net.layerSizes.length;
	}

	// ---------- Neuron/synapse enable/disable ---------------

	registerMouse() {
		$(this.canvas)
		.on('mousemove', evt => {
			this.mouseX = evt.offsetX;
			this.mouseY = evt.offsetY;
			this.mouseNeuron = null;
			this.mouseSynapse = null;
			this.draw();
			if (this.mouseNeuron || this.mouseSynapse)
				this.canvas.classList.add(SELECT_CLASS);
			else
				this.canvas.classList.remove(SELECT_CLASS);
		})
		.on('click', evt => {
			if (this.mouseNeuron)
				this.mouseNeuron.disabled = !this.mouseNeuron.disabled;
			else if (this.mouseSynapse)
				this.mouseSynapse.toggle();
			this.draw();
		});
	}

	checkMouseInNeuron(x: number, y: number, r: number,
		col: number, row: number) {
		if (this.mouseNeuron) return;
		let dx = this.mouseX - x;
		let dy = this.mouseY - y;
		if (dx * dx + dy * dy < r * r)
			this.mouseNeuron = this.net.layers[col - 1][row];
	}

	checkMouseInSynapse(neuron: Neuron, weightNum: number) {
		if (this.mouseSynapse) return;
		let ctx = this.ctx as any;
		if (ctx.isPointInStroke(this.mouseX, this.mouseY))
			this.mouseSynapse = new Synapse(neuron, weightNum);
	}

}
