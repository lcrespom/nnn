import { NeuralNetwork } from './neurons';


export class NeuralNetworkDiagram {
	ctx: CanvasRenderingContext2D;
	r: number;
	numCols: number;

	constructor(public net: NeuralNetwork, public canvas: HTMLCanvasElement) {
		let ctx = canvas.getContext('2d');
		if (ctx) this.ctx = ctx;
		this.numCols = this.net.layerSizes.length + 1;
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
		for (let w = 0; w < neuron.weights.length; w++) {
			let nw = neuron.weights[w];
			let div = nw < 0 ? minW : maxW;
			let hue = nw < 0 ? 0 : 240;
			let lightness = 100 - 66 * (nw / div);
			this.ctx.strokeStyle = `hsl(${hue}, 100%, ${lightness}%)`;
			let [x1, y1] = this.getCenter(i, w);
			let [x2, y2] = this.getCenter(i + 1, j);
			this.ctx.beginPath();
			this.ctx.moveTo(x1, y1);
			this.ctx.lineTo(x2, y2);
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
			let [x, y] = this.getCenter(col, row);
			this.drawNode(x, y, this.r, isInput, isBias);
		}
	}

	drawNode(x: number, y: number, r: number, isInput: boolean, isBias: boolean) {
		this.ctx.strokeStyle = 'black';
		if (isBias)
			this.ctx.fillStyle = '#2DD';
		else
			this.ctx.fillStyle = '#337AB7';
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
}
