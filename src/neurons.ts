const DEFAULT_ACTIVATION_FUNCTION = sigmoid;

export class Neuron {
	inputs: number[];
	weights: number[];
	bias: number;
	activationFuncton: (number) => number;
	numInputs: number;
	value: number;

	constructor(numInputs: number) {
		this.numInputs = numInputs;
		this.value = NaN;
		this.activationFuncton = DEFAULT_ACTIVATION_FUNCTION;
		this.weights = [];
		for (let i = 0; i < numInputs; i++)
			this.weights.push(1);
		this.bias = 0;
	}
}

export class NeuralNetwork {
}

function sigmoid(x: number): number {
	if (x < -45.0) return 0.0;
	else if (x > 45.0) return 1.0;
	else return 1.0 / (1.0 + Math.exp(-x));
}
