import { NeuralNetwork } from './neurons';

let nn: NeuralNetwork;

$(function() {
	$('input,textarea').on('input', evt => {
		//TODO: validate and activate buttons
	});
	$('#butlearn').click(_ => {
		nn = new NeuralNetwork(3, 4, 3);
		//TODO: learn
	});
	$('#buttest').click(_ => {
		//TODO: test
	});
});
