import { NeuralNetwork, Example } from './neurons';

learnAdd1();

function simpleTest() {
	let nn = new NeuralNetwork(2, 3, 1);
	let outputs = nn.forward([1, 2]);
	console.log('Test outputs:', outputs);
}

function learnAdd1() {
	let examples: Example[] = [
		{ inputs: [0, 0, 0], outputs: [0, 0, 1] },
		{ inputs: [0, 0, 1], outputs: [0, 1, 0] },
		{ inputs: [0, 1, 0], outputs: [0, 1, 1] },
		{ inputs: [0, 1, 1], outputs: [1, 0, 0] },
		{ inputs: [1, 0, 0], outputs: [1, 0, 1] },
		{ inputs: [1, 0, 1], outputs: [1, 1, 0] },
		{ inputs: [1, 1, 0], outputs: [1, 1, 1] },
		{ inputs: [1, 1, 1], outputs: [0, 0, 0] }
	];
	let nn = new NeuralNetwork(3, 4, 3);
	nn.maxLearnIterations = 10;
	nn.learn(examples);
}
