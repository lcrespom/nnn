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
    // -------------------- Handle click on "Learn" button --------------------
    $('#butlearn').click(function (_) {
        $('#butlearn').text('Learning...');
        var formData = getFormData();
        var numLayers = parseNumbers(formData.numHidden);
        numLayers.push(+formData.numOutputs);
        nn = new neurons_1.NeuralNetwork(+formData.numInputs, numLayers);
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
            $('#buttest, #butdiagram').attr('disabled', false);
            new NeuralNetworkDiagram(nn, $('#nn-diagram').get(0)).draw();
        }, 10);
    });
    // -------------------- Handle click on "Test" button --------------------
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
    // -------------------- Handle click on "Test" button --------------------
    $('#butdiagram').click(function (_) {
        if (!nn)
            return;
        var $diagram = $('#nn-diagram');
        var hidden = ($diagram.css('display') == 'none');
        var title = hidden ? 'Hide diagram' : 'Show diagram';
        $('#butdiagram').text(title);
        if (hidden)
            new NeuralNetworkDiagram(nn, $diagram.get(0)).draw();
        $diagram.slideToggle();
    });
    // -------------------- Enable bootstrap-styled tooltips --------------------
    $('[data-toggle="tooltip"]').tooltip();
});
// ------------------------- User input parsing -------------------------
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
// ------------------------- Diagram drawing -------------------------
var NeuralNetworkDiagram = (function () {
    function NeuralNetworkDiagram(net, canvas) {
        this.net = net;
        this.canvas = canvas;
        var ctx = canvas.getContext('2d');
        if (ctx)
            this.ctx = ctx;
        this.numCols = this.net.layerSizes.length + 1;
        // Calculate radius
        var maxRows = net.numInputs;
        net.layers.forEach(function (layer) { return maxRows = Math.max(maxRows, layer.length); });
        var colH = this.canvas.height / maxRows;
        this.r = Math.min(20, colH / 3);
    }
    NeuralNetworkDiagram.prototype.draw = function () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawWeights();
        this.drawNodes();
    };
    NeuralNetworkDiagram.prototype.drawWeights = function () {
        var gco = this.ctx.globalCompositeOperation;
        this.ctx.globalCompositeOperation = 'darken';
        var minW = 0, maxW = 0;
        this.net.layers.forEach(function (l) { return l.forEach(function (n) { return n.weights.forEach(function (w) {
            if (w < minW)
                minW = w;
            if (w > maxW)
                maxW = w;
        }); }); });
        if (minW == 0)
            minW = 1;
        if (maxW == 0)
            maxW = 1;
        for (var i = 0; i < this.net.layers.length; i++)
            for (var j = 0; j < this.net.layers[i].length; j++)
                this.drawNodeWeights(i, j, minW, maxW);
        this.ctx.globalCompositeOperation = gco;
    };
    NeuralNetworkDiagram.prototype.drawNodeWeights = function (i, j, minW, maxW) {
        var neuron = this.net.layers[i][j];
        for (var w = 0; w < neuron.weights.length; w++) {
            var nw = neuron.weights[w];
            var div = nw < 0 ? minW : maxW;
            var hue = nw < 0 ? 0 : 120;
            nw = 100 - 66 * (nw / div);
            this.ctx.strokeStyle = "hsl(" + hue + ", 100%, " + nw + "%)";
            var _a = this.getCenter(i, w), x1 = _a[0], y1 = _a[1];
            var _b = this.getCenter(i + 1, j), x2 = _b[0], y2 = _b[1];
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
        }
    };
    NeuralNetworkDiagram.prototype.drawNodes = function () {
        for (var col = 0; col < this.numCols; col++) {
            this.drawCol(col);
        }
    };
    NeuralNetworkDiagram.prototype.drawCol = function (col) {
        var numRows = this.getNumRows(col);
        var isOutput = this.isOutput(col);
        for (var row = 0; row < numRows; row++) {
            var isInput = col == 0;
            var isBias = !isOutput && row == numRows - 1;
            var _a = this.getCenter(col, row), x = _a[0], y = _a[1];
            this.drawNode(x, y, this.r, isInput, isBias);
        }
    };
    NeuralNetworkDiagram.prototype.drawNode = function (x, y, r, isInput, isBias) {
        this.ctx.strokeStyle = 'black';
        if (isBias)
            this.ctx.fillStyle = '#2DD';
        else
            this.ctx.fillStyle = '#337AB7';
        if (isInput || isBias) {
            var x1 = x - r;
            var y1 = y - r;
            var dxy = r * 2;
            this.ctx.fillRect(x1, y1, dxy, dxy);
            this.ctx.strokeRect(x1, y1, dxy, dxy);
        }
        else {
            this.ctx.beginPath();
            this.ctx.arc(x, y, r, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.arc(x, y, r, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    };
    NeuralNetworkDiagram.prototype.getCenter = function (col, row) {
        var numRows = this.getNumRows(col);
        var colW = this.canvas.width / this.numCols;
        var rowH = this.canvas.height / numRows;
        var x = col * colW + colW / 2;
        var y = row * rowH + rowH / 2;
        return [x, y];
    };
    NeuralNetworkDiagram.prototype.getNumRows = function (col) {
        var numRows = col == 0 ? nn.numInputs : this.net.layerSizes[col - 1];
        if (!this.isOutput(col))
            numRows++;
        return numRows;
    };
    NeuralNetworkDiagram.prototype.isOutput = function (col) {
        return col == this.net.layerSizes.length;
    };
    return NeuralNetworkDiagram;
}());

},{"./neurons":1}]},{},[2])
//# sourceMappingURL=bundle.js.map
