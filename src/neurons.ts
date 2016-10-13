const DEFAULT_ACTIVATION_FUNCTION = sigmoid;

export class Neuron {
	weights: number[];
	bias: number;
	activationFuncton: (number) => number;
	numInputs: number;
	value: number;

	constructor(numInputs: number, actFun = DEFAULT_ACTIVATION_FUNCTION) {
		this.numInputs = numInputs;
		this.value = NaN;
		this.activationFuncton = actFun;
		this.weights = [];
		for (let i = 0; i < numInputs; i++)
			this.weights.push(1);
		this.bias = 0;
	}

	calculate(inputs: number[]): number {
		if (inputs.length != this.numInputs)
			throw new Error(`Invalid size of input array: expecting ${this.numInputs}, got ${inputs.length}`);
		let weightedSum = inputs.reduce(
			(accum, input, i) => accum + input * this.weights[i], 0);
		this.value = this.activationFuncton(weightedSum + this.bias);
		return this.value;
	}
}

export class NeuralNetwork {
	hiddenLayer: Neuron[];
	outputs: Neuron[];

	constructor(private numInputs: number, private numHidden: number, private numOutputs: number) {
		this.hiddenLayer = [];
		for (let i = 0; i < numHidden; i++)
			this.hiddenLayer.push(new Neuron(this.numInputs));
		this.outputs = [];
		for (let i = 0; i < numOutputs; i++)
			this.outputs.push(new Neuron(this.numHidden));
	}

	calculate(inputs: number[]): number[] {
		let hlValues: number[] = [];
		let outValues: number[] = [];
		this.hiddenLayer.forEach(neuron =>
			hlValues.push(neuron.calculate(inputs))
		);
		this.outputs.forEach(neuron =>
			outValues.push(neuron.calculate(hlValues))
		);
		return outValues;
	}
}

function sigmoid(x: number): number {
	if (x < -45.0) return 0.0;
	else if (x > 45.0) return 1.0;
	else return 1.0 / (1.0 + Math.exp(-x));
}
