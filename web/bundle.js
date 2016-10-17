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
        if (inputs.length != neuron.weights.length)
            throw new Error("Invalid size of input array: expecting " + neuron.weights.length + ", got " + inputs.length);
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
    NeuralNetwork.prototype.backPropagate = function (inputs, targets) {
        var outputLayer = this.layers[this.layers.length - 1];
        var errors = outputLayer.map(function (neuron, i) { return targets[i] - neuron.output; });
        for (var l = this.layers.length - 1; l >= 0; l--) {
            var layer = this.layers[l];
            var prevLayerOuts = this.addBias(l > 0 ?
                this.layers[l - 1].map(function (neuron) { return neuron.output; }) : inputs);
            var prevLayerErrors = this.fillArray(prevLayerOuts.length, 0);
            for (var i = 0; i < layer.length; i++) {
                this.backPropagateNeuron(layer[i], errors[i], prevLayerOuts, prevLayerErrors);
            }
            errors = prevLayerErrors;
        }
    };
    NeuralNetwork.prototype.backPropagateNeuron = function (neuron, error, prevLayerOuts, prevLayerErrors) {
        var delta = error * neuron.output * (1 - neuron.output);
        for (var j = 0; j < neuron.weights.length; j++) {
            prevLayerErrors[j] += delta * neuron.weights[j];
            neuron.weights[j] += this.epsilon * delta * prevLayerOuts[j];
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
    NeuralNetwork.prototype.fillArray = function (len, v) {
        var a = new Array(len);
        for (var i = 0; i < a.length; i++)
            a[i] = v;
        return a;
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

},{}],2:[function(require,module,exports){
"use strict";
var neurons_1 = require('./neurons');
var nn;
$(function () {
    // $('input,textarea').on('input', evt => {
    // 	let formData = getFormData();
    // 	//TODO: validate and activate buttons
    // });
    $('#butlearn').click(function (_) {
        $('#butlearn').text('Learning...');
        var formData = getFormData();
        nn = new neurons_1.NeuralNetwork(+formData.numInputs, [+formData.numHidden, +formData.numOutputs]);
        nn.acceptableError = +formData.maxError;
        nn.maxLearnIterations = +formData.maxIterations;
        nn.epsilon = +formData.epsilon;
        var examples = parseLearnLines(formData.learnLines, +formData.numInputs, +formData.numOutputs);
        setTimeout(function () {
            nn.learn(examples);
            console.log("*** Learned in " + nn.learnIteration + " iterations, with an error of " + nn.learnError);
            $('#butlearn').text('Learn');
            $('#liters').val(nn.learnIteration);
            $('#lerror').val(fmtNum(nn.learnError, 9));
            $('#buttest').attr('disabled', false);
        }, 10);
    });
    $('#buttest').click(function (_) {
        var formData = getFormData();
        var tests = parseTestLines(formData.testLines, nn.numInputs);
        var testResults = [];
        tests.forEach(function (test) { return testResults.push(nn.forward(test)); });
        var strResult = testResults
            .map(function (result) { return result.map(function (x) { return fmtNum(x, 6); }).join('  '); })
            .join('\n');
        $('#tout').text(strResult);
    });
});
function getFormData() {
    return {
        numInputs: $('#nimputs').val(),
        numOutputs: $('#noutputs').val(),
        numHidden: $('#nhidden').val(),
        maxError: $('#maxerror').val(),
        maxIterations: $('#maxiters').val(),
        epsilon: $('#epsilon').val(),
        learnLines: $('#ldata').val(),
        testLines: $('#tdata').val()
    };
}
function parseLearnLines(allLines, numInputs, numOutputs) {
    var examples = [];
    var lines = parseDataLines(allLines);
    lines.forEach(function (line, i) {
        var example = parseExample(line);
        //TODO validate line by checking:
        //	- if example is null, then the / is missing
        //	- if the number of inputs or outputs is invalid, then some values are missing or exceeding
        //	- if some value is NaN, then there are invalid numbers
        if (example)
            examples.push(example);
    });
    return examples;
}
function parseExample(line) {
    var inout = line.split('/');
    if (inout.length < 2)
        return null;
    var inputs = parseNumbers(inout[0]);
    var outputs = parseNumbers(inout[1]);
    return { inputs: inputs, outputs: outputs };
}
function parseTestLines(allLines, numInputs) {
    var tests;
    tests = [];
    var lines = parseDataLines(allLines);
    lines.forEach(function (line, i) {
        var inputs = parseNumbers(line);
        //TODO validate line by checking:
        //	- if the number of inputs is invalid, then some values are missing or exceeding
        //	- if some value is NaN, then there are invalid numbers
        tests.push(inputs);
    });
    return tests;
}
function parseDataLines(allLines) {
    return allLines.split('\n').filter(function (line) {
        line = line.trim();
        return line.length > 0 && line[0] != '#';
    });
}
function parseNumbers(line) {
    return line.split(' ').filter(function (s) { return s.length > 0; }).map(function (s) { return parseFloat(s); });
}
function fmtNum(n, len) {
    if (len === void 0) { len = 5; }
    return n.toString().substr(0, len);
}

},{"./neurons":1}]},{},[2])
//# sourceMappingURL=bundle.js.map
