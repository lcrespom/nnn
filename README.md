# nnn: Neural Network in TypeScript
A simple neural network consisting of an input layer, a hidden layer and an output layer.
The number of neurons for each layer is adjustable.

The neural network implements the backpropagation algorithm in order to learn and adjust
its weights from sample input and output data. After the learning phase, the network
can be used to generate the output from new input data.

The network itself is implemented in file `neurons.ts`, and file `nnn-web.ts` controls a
[web-based user interface](http://lcrespom.github.io/nnn), which can be used to adjust
the network parameters and provide learn and test data.


## ToDo
- Web UI
	- Validation & error message reporting
	- Report time spent learning
	- 'Stop learning' button in learn section
	- 'Copy from learn' button in test section
	- Draw diagram of learning error curve
	- Load/save network data: architecture, learned weights, etc.
