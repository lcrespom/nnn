/* tslint:disable:no-unused-variable */
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
	nn.maxLearnIterations = +process.argv[2] || 10;
	let iterations = nn.learn(examples);
	if (iterations < nn.maxLearnIterations)
		console.log('Learning success');
	else
		console.log('Warning: error above acceptable value, reached maximum iterations');
	console.log('\n--- Testing learned neural network ---');
	console.log('Output of 100:', nn.forward([1, 0, 0]));
	console.log('Output of 101:', nn.forward([1, 0, 1]));
	console.log('Output of 010:', nn.forward([0, 1, 0]));
	console.log('Output of 001:', nn.forward([0, 0, 1]));
	console.log('Output of 000:', nn.forward([0, 0, 0]));
	console.log('Output of 111:', nn.forward([1, 1, 1]));
}
