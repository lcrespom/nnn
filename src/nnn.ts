import { NeuralNetwork } from './neurons';

main();

function main() {
	let nn = new NeuralNetwork(2, 3, 1);
	let outputs = nn.forward([1, 2]);
	console.log('Test outputs:', outputs);
}
