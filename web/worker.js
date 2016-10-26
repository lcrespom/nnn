(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var DEFAULT_ACTIVATION_FUNCTION = sigmoid;
var Neuron = (function () {
    function Neuron(numWeights) {
        this.output = NaN;
        this.weights = [];
        for (var i = 0; i < numWeights; i++)
            this.weights.push(Math.random());
    }
    return Neuron;
}());
exports.Neuron = Neuron;
var NeuralNetwork = (function () {
    function NeuralNetwork(numInputs, layerSizes) {
        this.numInputs = numInputs;
        this.layerSizes = layerSizes;
        // Initialize default params
        this.activationFunc = DEFAULT_ACTIVATION_FUNCTION;
        this.epsilon = 0.5;
        this.acceptableError = 0.01;
        this.maxLearnIterations = 1000;
        // Initialize layers
        this.layers = [];
        for (var i = 0; i < layerSizes.length; i++) {
            var numWeights = (i == 0 ? numInputs : layerSizes[i - 1]) + 1;
            this.layers.push(this.createLayer(layerSizes[i], numWeights));
        }
    }
    NeuralNetwork.prototype.createLayer = function (size, weights) {
        var layer = [];
        for (var i = 0; i < size; i++)
            layer.push(new Neuron(weights));
        return layer;
    };
    // -------------------- Forward propagation --------------------
    NeuralNetwork.prototype.forwardNeuron = function (neuron, inputs) {
        var weightedSum = inputs.reduce(function (accum, input, i) { return accum + input * neuron.weights[i]; }, 0);
        neuron.output = this.activationFunc(weightedSum);
        return neuron.output;
    };
    NeuralNetwork.prototype.forward = function (inputs) {
        var _this = this;
        var layerOut = [];
        var prevLayerOut = this.addBias(inputs);
        this.layers.forEach(function (layer) {
            layerOut = [];
            layer.forEach(function (neuron) {
                return layerOut.push(_this.forwardNeuron(neuron, prevLayerOut));
            });
            prevLayerOut = _this.addBias(layerOut);
        });
        return layerOut;
    };
    // -------------------- Back propagation --------------------
    NeuralNetwork.prototype.backPropagateNeuron = function (neuron, error, prevLayerOuts, prevLayerErrors) {
        var delta = error * neuron.output * (1 - neuron.output);
        for (var j = 0; j < neuron.weights.length; j++) {
            prevLayerErrors[j] += delta * neuron.weights[j];
            neuron.weights[j] += this.epsilon * delta * prevLayerOuts[j];
        }
    };
    NeuralNetwork.prototype.backPropagate = function (inputs, targets) {
        var outputLayer = this.layers[this.layers.length - 1];
        var errors = map2(outputLayer, targets, function (neuron, target) { return target - neuron.output; });
        for (var l = this.layers.length - 1; l >= 0; l--) {
            var layer = this.layers[l];
            var prevLayerOuts = this.addBias(l > 0 ?
                this.layers[l - 1].map(function (neuron) { return neuron.output; }) : inputs);
            var prevLayerErrors = fillArray(prevLayerOuts.length, 0);
            for (var i = 0; i < layer.length; i++) {
                this.backPropagateNeuron(layer[i], errors[i], prevLayerOuts, prevLayerErrors);
            }
            errors = prevLayerErrors;
        }
    };
    // -------------------- Iterative learning --------------------
    NeuralNetwork.prototype.learn = function (examples) {
        this.learnIteration = 0;
        do {
            this.learnError = 0;
            for (var i = 0; i < examples.length; i++) {
                var actualOuts = this.forward(examples[i].inputs);
                var expectedOuts = examples[i].outputs;
                this.backPropagate(examples[i].inputs, expectedOuts);
                this.learnError += this.sampleError(actualOuts, expectedOuts);
            }
            this.learnIteration++;
            this.learnError = this.learnError / examples.length;
            this.reportLearn(this.learnIteration, this.learnError);
        } while (this.learnIteration < this.maxLearnIterations
            && this.learnError > this.acceptableError);
        return this.learnError <= this.acceptableError;
    };
    NeuralNetwork.prototype.sampleError = function (actualOuts, expectedOuts) {
        var square = function (x) { return x * x; };
        var sum = actualOuts.reduce(function (accum, actualOut, i) { return accum + square(actualOut - expectedOuts[i]); }, 0);
        return sum / 2;
    };
    // -------------------- Misc --------------------
    NeuralNetwork.prototype.addBias = function (values) {
        var biasedValues = values.slice();
        biasedValues.push(1);
        return biasedValues;
    };
    NeuralNetwork.prototype.reportLearn = function (iteration, totalError) {
        if (iteration % 100 == 0)
            console.log("Learn iteration " + iteration + " - error: " + totalError);
    };
    // -------------------- Import / export --------------------
    NeuralNetwork.prototype.toJSON = function () {
        return {
            numInputs: this.numInputs,
            layerSizes: this.layerSizes,
            epsilon: this.epsilon,
            acceptableError: this.acceptableError,
            maxLearnIterations: this.maxLearnIterations,
            layers: this.layers,
            learnIteration: this.learnIteration,
            learnError: this.learnError
        };
    };
    /* tslint:disable:member-ordering */
    NeuralNetwork.fromJSON = function (json) {
        var nn = new NeuralNetwork(json.numInputs, json.layerSizes);
        nn.epsilon = json.epsilon;
        nn.acceptableError = json.acceptableError;
        nn.maxLearnIterations = json.maxLearnIterations;
        nn.layers = json.layers;
        nn.learnIteration = json.learnIteration;
        nn.learnError = json.learnError;
        return nn;
    };
    return NeuralNetwork;
}());
exports.NeuralNetwork = NeuralNetwork;
// -------------------- Activation functions --------------------
function sigmoid(x) {
    if (x < -45.0)
        return 0.0;
    else if (x > 45.0)
        return 1.0;
    else
        return 1.0 / (1.0 + Math.exp(-x));
}
// -------------------- Utility functions --------------------
function fillArray(len, v) {
    var a = new Array(len);
    for (var i = 0; i < a.length; i++)
        a[i] = v;
    return a;
}
exports.fillArray = fillArray;
function map2(array1, array2, cb) {
    if (array1.length >= array2.length)
        return array1.map(function (e1, i) { return cb(e1, array2[i]); });
    else
        return array2.map(function (e2, i) { return cb(array1[i], e2); });
}
exports.map2 = map2;

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    parseLearnLines: parseLearnLines,
    parseExample: parseExample,
    parseDataLines: parseDataLines,
    parseNumbers: parseNumbers
};
function parseLearnLines(allLines, numInputs, numOutputs) {
    var examples = [];
    var lines = parseDataLines(allLines);
    lines.forEach(function (line, i) {
        var example = parseExample(line);
        //TODO validate line by checking:
        //	- if example.outputs is [], then the / is missing (that is OK for tests, not OK for learning)
        //	- if the number of inputs or outputs is invalid, then some values are missing or exceeding
        //	- if some value is NaN, then there are invalid numbers
        if (example)
            examples.push(example);
    });
    return examples;
}
function parseExample(line) {
    var inout = line.split('/');
    var inputs = parseNumbers(inout[0]);
    var outputs = inout.length < 2 ? [] : parseNumbers(inout[1]);
    return { inputs: inputs, outputs: outputs };
}
function parseDataLines(allLines) {
    return allLines.split('\n').filter(function (line) {
        line = line.trim();
        return line.length > 0 && line[0] != '#';
    }).map(function (line) { return line.replace(/\t/g, ' '); });
}
function parseNumbers(line) {
    return line.split(' ').filter(function (s) { return s.length > 0; }).map(function (s) { return parseFloat(s); });
}

},{}],3:[function(require,module,exports){
"use strict";
var neurons_1 = require('./neurons');
var text_utils_1 = require('./text-utils');
var nn;
var lastReport = Date.now();
self.onmessage = function (msg) {
    switch (msg.data.command) {
        case 'start': return doStart(msg.data.params);
        default: throw Error('Unknown command: ' + msg.data.command);
    }
};
function doStart(formData) {
    var numLayers = text_utils_1.default.parseNumbers(formData.numHidden);
    numLayers.push(+formData.numOutputs);
    nn = new neurons_1.NeuralNetwork(+formData.numInputs, numLayers);
    nn.reportLearn = wwReportLearn;
    nn.acceptableError = +formData.maxError;
    nn.maxLearnIterations = +formData.maxIterations;
    nn.epsilon = +formData.epsilon;
    var examples = text_utils_1.default.parseLearnLines(formData.learnLines, +formData.numInputs, +formData.numOutputs);
    nn.learn(examples);
    console.log("*** Learned in " + nn.learnIteration + " iterations, with an error of " + nn.learnError);
    postMessage({ command: 'nn-learned', params: nn.toJSON() });
    self.close();
}
function wwReportLearn(iteration, totalError) {
    var now = Date.now();
    if (now - lastReport > 500) {
        lastReport = now;
        postMessage({ command: 'nn-progress', params: { iteration: iteration, totalError: totalError } });
    }
}

},{"./neurons":1,"./text-utils":2}]},{},[3])
//# sourceMappingURL=worker.js.map
