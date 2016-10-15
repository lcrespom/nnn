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
	testValue(nn, [0, 0, 0]);
	testValue(nn, [0, 0, 1]);
	testValue(nn, [0, 1, 0]);
	testValue(nn, [0, 1, 1]);
	testValue(nn, [1, 0, 0]);
	testValue(nn, [1, 0, 1]);
	testValue(nn, [1, 1, 0]);
	testValue(nn, [1, 1, 1]);
}

function testValue(nn: NeuralNetwork, inputs: number[]) {
	let outputs = nn.forward(inputs);
	let sIn = numArrayToBits(inputs);
	let sOut = numArrayToBits(outputs);
	let sValues = fmtNum(outputs[0]) +
		', ' + fmtNum(outputs[1]) + ', ' + fmtNum(outputs[2]);
	console.log(`Output of ${sIn}: ${sOut} (${sValues})`);
}

function numArrayToBits(a: number[]): string {
	return a.reduce((s, n) => n < 0.5 ? s + '0' : s + '1', '');
}

function fmtNum(n: number, len = 5): string {
	return n.toString().substr(0, len);
}