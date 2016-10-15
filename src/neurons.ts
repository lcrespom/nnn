const DEFAULT_ACTIVATION_FUNCTION = sigmoid;

type ActivationFunction = (number) => number;


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
	hiddenLayer: Neuron[];
	outputLayer: Neuron[];
	// Tunable parameters
	activationFunc: ActivationFunction;
	epsilon: number;
	acceptableError: number;
	maxLearnIterations: number;

	constructor(private numInputs: number, private numHidden: number, private numOutputs: number) {
		// Initialize default params
		this.activationFunc = DEFAULT_ACTIVATION_FUNCTION;
		this.epsilon = 0.5;
		this.acceptableError = 0.001;
		this.maxLearnIterations = 1000;
		// Initialize layers
		this.hiddenLayer = [];
		for (let i = 0; i < numHidden; i++)
			this.hiddenLayer.push(new Neuron(this.numInputs + 1));
		this.outputLayer = [];
		for (let i = 0; i < numOutputs; i++)
			this.outputLayer.push(new Neuron(this.numHidden + 1));
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
		let hlValues: number[] = [];
		let outValues: number[] = [];
		this.hiddenLayer.forEach(neuron =>
			hlValues.push(this.forwardNeuron(neuron, this.addBias(inputs)))
		);
		hlValues.push(1);		// Add bias
		this.outputLayer.forEach(neuron =>
			outValues.push(this.forwardNeuron(neuron, hlValues))
		);
		return outValues;
	}

	// -------------------- Back propagation --------------------

	backPropagate(inputs: number[], targets: number[]): void {
		// Adjust weights for output layer
		let hiddenOuts = this.hiddenLayer.map(neuron => neuron.output);
		let errors: number[] = [];
		for (let i = 0; i < this.outputLayer.length; i++)
			errors[i] = this.backPropagateOutNeuron(
				this.outputLayer[i], targets[i], hiddenOuts);
		// Adjust weights for hidden layer
		for (let i = 0; i < this.hiddenLayer.length; i++)
			this.backPropagateHiddenNeuron(
				this.hiddenLayer[i], errors[i], this.addBias(inputs));
	}

	backPropagateOutNeuron(neuron: Neuron, target: number, prevLayerOuts: number[]): number {
		let delta = (target - neuron.output) * neuron.output * (1 - neuron.output);
		let error = 0;
		for (let j = 0; j < neuron.weights.length; j++) {
			error += delta * neuron.weights[j];
			neuron.weights[j] += this.epsilon * delta * prevLayerOuts[j];
		}
		return error;
		// delta := (D[j] - Y[j]) * Y[j] * (1 - Y[j]);
		// per ogni unità k del livello H (compreso bias)
		//    ErrH[k] := ErrH[k] + (delta * W2[k,j]);
		//    W2[k,j] := W2[k,j] + (epsilon * delta * H[k]);
	}

	backPropagateHiddenNeuron(neuron: Neuron, error: number, inputs: number[]): void {
		let delta = error * neuron.output * (1 - neuron.output);
		for (let j = 0; j < neuron.weights.length; j++)
			neuron.weights[j] += this.epsilon * delta * inputs[j];
		// delta := ErrH[k] * H[k] * (1 - H[k]);
		// per ogni unità i del livello X (compreso bias)
		//    Wl[i,k] := Wl[i,k] + (epsilon * delta * X[i]);
	}

	// -------------------- Iterative learning --------------------

	learn(examples: Example[]) {
		//TODO test
		let iteration = 0;
		let totalError = 0;
		do {
			for (let i = 0; i < examples.length; i++) {
				let actualOuts = this.forward(examples[i].inputs);
				let expectedOuts = examples[i].outputs;
				this.backPropagate(examples[i].inputs, expectedOuts);
				totalError = this.totalError(actualOuts, expectedOuts);
			}
			iteration++;
		} while (iteration < this.maxLearnIterations && totalError > this.acceptableError);
		// ripeti (* epoche *)
		// 	 per ogni esempio {X,D}
		// 		esegui la rete con X e trova Y;
		// 		backpropagate;
		// 	 fine;
		// 	 calcola errore dell'intera epoca;
		// finché errore dell'epoca inferiore ad errore ammesso
	}

	totalError(actualOuts: number[], expectedOuts: number[]): number {
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
}


// -------------------- Activation functions --------------------

function sigmoid(x: number): number {
	if (x < -45.0) return 0.0;
	else if (x > 45.0) return 1.0;
	else return 1.0 / (1.0 + Math.exp(-x));
}
