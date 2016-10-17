const DEFAULT_ACTIVATION_FUNCTION = sigmoid;

type ActivationFunction = (number) => number;
type NeuronLayer = Neuron[];


export interface Example {
	inputs: number[];
	outputs: number[];
}


export class Neuron {
	weights: number[];
	output: number;

	constructor(numWeights: number) {
		this.output = NaN;
		this.weights = [];
		for (let i = 0; i < numWeights; i++)
			this.weights.push(Math.random());
	}
}


export class NeuralNetwork {
	layers: NeuronLayer[];
	// Tunable parameters
	activationFunc: ActivationFunction;
	epsilon: number;
	acceptableError: number;
	maxLearnIterations: number;
	// Learn tracking
	learnIteration: number;
	learnError: number;

	constructor(public numInputs: number, public layerSizes: number[]) {
		// Initialize default params
		this.activationFunc = DEFAULT_ACTIVATION_FUNCTION;
		this.epsilon = 0.5;
		this.acceptableError = 0.01;
		this.maxLearnIterations = 1000;
		// Initialize layers
		this.layers = [];
		for (let i = 0; i < layerSizes.length; i++) {
			let numWeights = (i == 0 ? numInputs : layerSizes[i - 1]) + 1;
			this.layers.push(this.createLayer(layerSizes[i], numWeights));
		}
	}

	createLayer(size: number, weights: number): NeuronLayer {
		let layer: NeuronLayer = [];
		for (let i = 0; i < size; i++)
			layer.push(new Neuron(weights));
		return layer;
	}

	// -------------------- Forward propagation --------------------

	forwardNeuron(neuron: Neuron, inputs: number[]): number {
		if (inputs.length != neuron.weights.length)
			throw new Error(`Invalid size of input array: expecting ${neuron.weights.length}, got ${inputs.length}`);
		let weightedSum = inputs.reduce(
			(accum, input, i) => accum + input * neuron.weights[i], 0);
		neuron.output = this.activationFunc(weightedSum);
		return neuron.output;
	}

	forward(inputs: number[]): number[] {
		let layerOut: number[] = [];
		let prevLayerOut = this.addBias(inputs);
		this.layers.forEach(layer => {
			layerOut = [];
			layer.forEach(neuron =>
				layerOut.push(this.forwardNeuron(neuron, prevLayerOut))
			);
			prevLayerOut = this.addBias(layerOut);
		});
		return layerOut;
	}

	// -------------------- Back propagation --------------------

	backPropagate(inputs: number[], targets: number[]): void {
		// Adjust weights for output layer
		for (let l = this.layers.length - 1; l >= 0; l++) {
			let layer = this.layers[l];
			let prevLayerOuts = this.addBias(l > 0 ?
				this.layers[l - 1].map(neuron => neuron.output) : inputs);
			let prevLayerErrors: number[] = [];
			prevLayerOuts.forEach(_ => prevLayerErrors.push(0));
			for (let i = 0; i < layer.length; i++) {
				this.backPropagateNeuron(layer[i], error, prevLayerOuts, prevLayerErrors);
			}
		}

		let hiddenErrors: number[] = [];
		for (let i = 0; i < this.hiddenLayer.length; i++) hiddenErrors.push(0);
		for (let i = 0; i < this.outputLayer.length; i++)
			this.backPropagateOutNeuron(
				this.outputLayer[i], targets[i], this.addBias(hiddenOuts), hiddenErrors);
		// Adjust weights for hidden layer
		for (let i = 0; i < this.hiddenLayer.length; i++)
			this.backPropagateHiddenNeuron(
				this.hiddenLayer[i], hiddenErrors[i], this.addBias(inputs));
	}

	backPropagateOutNeuron(neuron: Neuron, target: number,
		prevLayerOuts: number[], prevLayerErrors: number[]): void {
		let delta = (target - neuron.output) * neuron.output * (1 - neuron.output);
		for (let j = 0; j < neuron.weights.length; j++) {
			prevLayerErrors[j] += delta * neuron.weights[j];
			neuron.weights[j] += this.epsilon * delta * prevLayerOuts[j];
		}
	}

	backPropagateHiddenNeuron(neuron: Neuron, error: number, inputs: number[]): void {
		let delta = error * neuron.output * (1 - neuron.output);
		for (let j = 0; j < neuron.weights.length; j++)
			neuron.weights[j] += this.epsilon * delta * inputs[j];
	}

	// -------------------- Iterative learning --------------------

	learn(examples: Example[]): boolean {
		this.learnIteration = 0;
		do {
			this.learnError = 0;
			for (let i = 0; i < examples.length; i++) {
				let actualOuts = this.forward(examples[i].inputs);
				let expectedOuts = examples[i].outputs;
				this.backPropagate(examples[i].inputs, expectedOuts);
				this.learnError += this.sampleError(actualOuts, expectedOuts);
			}
			this.learnIteration++;
			this.learnError = this.learnError / examples.length;
			this.reportLearn(this.learnIteration, this.learnError);
		} while (this.learnIteration < this.maxLearnIterations
			&& this.learnError > this.acceptableError);
		return this.learnError <= this.acceptableError;
	}

	sampleError(actualOuts: number[], expectedOuts: number[]): number {
		const square = x => x * x;
		let sum = actualOuts.reduce(
			(accum, actualOut, i) => accum + square(actualOut - expectedOuts[i]), 0);
		return sum / 2;
	}

	// -------------------- Misc --------------------

	addBias(values: number[]): number[] {
		let biasedValues = values.slice();
		biasedValues.push(1);
		return biasedValues;
	}

	reportLearn(iteration, totalError) {
		if (iteration % 100 == 0)
			console.log(`Learn iteration ${iteration} - error: ${totalError}`);
	}

}


// -------------------- Activation functions --------------------

function sigmoid(x: number): number {
	if (x < -45.0) return 0.0;
	else if (x > 45.0) return 1.0;
	else return 1.0 / (1.0 + Math.exp(-x));
}
