const DEFAULT_ACTIVATION_FUNCTION = sigmoid;
const DEFAULT_ACTIVATION_DERIVATIVE = sigmoidPrime;

type ActivationFunction = (number) => number;


export class Neuron {
	weights: number[];
	bias: number;
	output: number;

	constructor(numInputs: number) {
		this.output = NaN;
		this.weights = [];
		for (let i = 0; i < numInputs; i++)
			this.weights.push(1);
		this.bias = 0;
	}
}


export class NeuralNetwork {
	hiddenLayer: Neuron[];
	outputs: Neuron[];
	activationFunc: ActivationFunction;
	activationPrime: ActivationFunction;

	constructor(private numInputs: number, private numHidden: number, private numOutputs: number) {
		this.activationFunc = DEFAULT_ACTIVATION_FUNCTION;
		this.activationPrime = DEFAULT_ACTIVATION_DERIVATIVE;
		this.hiddenLayer = [];
		for (let i = 0; i < numHidden; i++)
			this.hiddenLayer.push(new Neuron(this.numInputs));
		this.outputs = [];
		for (let i = 0; i < numOutputs; i++)
			this.outputs.push(new Neuron(this.numHidden));
	}

	// -------------------- Forward propagation --------------------

	runNeuron(neuron: Neuron, inputs: number[]): number {
		if (inputs.length != neuron.weights.length)
			throw new Error(`Invalid size of input array: expecting ${neuron.weights.length}, got ${inputs.length}`);
		let weightedSum = inputs.reduce(
			(accum, input, i) => accum + input * neuron.weights[i], 0);
		neuron.output = this.activationFunc(weightedSum + neuron.bias);
		return neuron.output;
	}

	forward(inputs: number[]): number[] {
		let hlValues: number[] = [];
		let outValues: number[] = [];
		this.hiddenLayer.forEach(neuron =>
			hlValues.push(this.runNeuron(neuron, inputs))
		);
		this.outputs.forEach(neuron =>
			outValues.push(this.runNeuron(neuron, hlValues))
		);
		return outValues;
	}
}


// -------------------- Activation functions and derivatives --------------------

function sigmoid(x: number): number {
	if (x < -45.0) return 0.0;
	else if (x > 45.0) return 1.0;
	else return 1.0 / (1.0 + Math.exp(-x));
}

function sigmoidPrime(x: number): number {
	if (x < -45.0 || x > 45.0) return 0.0;
	let exp_x = Math.exp(-x);
	return exp_x / (1.0 + (exp_x * exp_x));
}
