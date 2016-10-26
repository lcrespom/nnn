import { NeuralNetwork } from './neurons';
import txtutils from './text-utils';


let nn: NeuralNetwork;

declare var postMessage: (data: any) => void;


self.onmessage = msg => {
	console.log('*** Worker got message:', msg);
	switch (msg.data.command) {
		case 'start': return doStart(msg.data.params);
		default: throw Error('Unknown command: ' + msg.data.command);
	}
};


function doStart(formData) {
	let numLayers = txtutils.parseNumbers(formData.numHidden);
	numLayers.push(+formData.numOutputs);
	nn = new NeuralNetwork(+formData.numInputs, numLayers);
	nn.acceptableError = +formData.maxError;
	nn.maxLearnIterations = +formData.maxIterations;
	nn.epsilon = +formData.epsilon;
	let examples = txtutils.parseLearnLines(formData.learnLines, +formData.numInputs, +formData.numOutputs);
	nn.learn(examples);
	console.log(`*** Learned in ${nn.learnIteration} iterations, with an error of ${nn.learnError}`);
	postMessage({ command: 'nn-learned', params: nn.toJSON() });
}
