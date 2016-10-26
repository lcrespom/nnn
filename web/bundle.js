(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var BORDER_COLOR = 'black';
var NEURON_COLOR = '#337AB7';
var INPUT_COLOR = NEURON_COLOR;
var BIAS_COLOR = '#2DD';
var NEGATIVE_WEIGHT_HUE = 0;
var POSITIVE_WEIGHT_HUE = 240;
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
            var hue = nw < 0 ? NEGATIVE_WEIGHT_HUE : POSITIVE_WEIGHT_HUE;
            var lightness = 100 - 66 * (nw / div);
            this.ctx.strokeStyle = "hsl(" + hue + ", 100%, " + lightness + "%)";
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
        this.ctx.strokeStyle = BORDER_COLOR;
        if (isBias)
            this.ctx.fillStyle = BIAS_COLOR;
        else if (isInput)
            this.ctx.fillStyle = INPUT_COLOR;
        else
            this.ctx.fillStyle = NEURON_COLOR;
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
        var numRows = col == 0 ? this.net.numInputs : this.net.layerSizes[col - 1];
        if (!this.isOutput(col))
            numRows++;
        return numRows;
    };
    NeuralNetworkDiagram.prototype.isOutput = function (col) {
        return col == this.net.layerSizes.length;
    };
    return NeuralNetworkDiagram;
}());
exports.NeuralNetworkDiagram = NeuralNetworkDiagram;

},{}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
"use strict";
var neurons_1 = require('./neurons');
var diagram_1 = require('./diagram');
var text_utils_1 = require('./text-utils');
var nn;
$(function () {
    // $('input,textarea').on('input', evt => {
    // 	let formData = getFormData();
    // 	//TODO: validate and activate buttons
    // });
    // -------------------- Handle click on "Learn" button --------------------
    $('#butlearn').click(doLearn);
    // -------------------- Handle click on "Test" button --------------------
    $('#buttest').click(function (_) {
        var formData = getFormData();
        var tests = text_utils_1.default.parseLearnLines(formData.testLines, nn.numInputs);
        var testResults = [];
        tests.forEach(function (test) { return testResults.push(nn.forward(test.inputs)); });
        var ranges = getRanges(tests.map(function (test) { return test.outputs; }));
        var strResult = neurons_1.map2(testResults, tests, function (result, test) { return formatNums(result) +
            compareResult(result, test.outputs, ranges); }).join('\n');
        $('#tout').text(strResult);
    });
    // -------------------- Handle click on diagram button --------------------
    $('#butdiagram').click(function (_) {
        if (!nn)
            return;
        var $diagram = $('#nn-diagram');
        var hidden = ($diagram.css('display') == 'none');
        var title = hidden ? 'Hide diagram' : 'Show diagram';
        $('#butdiagram').text(title);
        if (hidden)
            new diagram_1.NeuralNetworkDiagram(nn, $diagram.get(0)).draw();
        $diagram.slideToggle();
    });
    // -------------------- Handle click on learn formula --------------------
    $('#samples').on('input', function (evt) {
        var numSamples = +evt.target.value;
        var numInputs = +getFormData().numInputs;
        $('#tsamples').val(Math.pow(numSamples, numInputs).toLocaleString('es'));
    });
    $('#butformula').click(function (_) {
        var code = _js_editor.getModel().getValue();
        var fun;
        // tslint:disable-next-line - Disables all rules for the following line
        eval('fun = ' + code);
        var learnData = generateLearnData(getFormData(), fun);
        var learnText = learnData.map(function (example) {
            return formatNums(example.inputs) + '  /  ' + formatNums(example.outputs);
        }).join('\n');
        $('#ldata').text(learnText);
    });
    // -------------------- Enable bootstrap-styled tooltips --------------------
    $('[data-toggle="tooltip"]').tooltip();
});
// ------------------------- Learning -------------------------
function doLearn() {
    $('#butlearn').text('Learning...').attr('disabled', 'disabled');
    var formData = getFormData();
    var worker = new Worker('worker.js');
    worker.postMessage({ command: 'start', params: formData });
    worker.onmessage = function (msg) {
        switch (msg.data.command) {
            case 'nn-progress': return nnProgress(msg.data.params);
            case 'nn-learned': return nnLearned(msg.data.params);
            default: throw Error('Unknown command: ' + msg.data.command);
        }
    };
}
function nnProgress(params) {
    $('#liters').val(params.iteration);
    $('#lerror').val(fmtNum(params.totalError, 7));
}
function nnLearned(nnJSON) {
    nn = neurons_1.NeuralNetwork.fromJSON(nnJSON);
    $('#butlearn').text('Learn').removeAttr('disabled');
    $('#liters').val(nn.learnIteration);
    $('#lerror').val(fmtNum(nn.learnError, 7));
    $('#buttest, #butdiagram').removeAttr('disabled');
    new diagram_1.NeuralNetworkDiagram(nn, $('#nn-diagram').get(0)).draw();
}
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
        testLines: $('#tdata').val(),
        formulaSamples: $('#samples').val()
    };
}
// -------------------- Learn data formula --------------------
function generateLearnData(formData, func) {
    var numInputs = +formData.numInputs;
    var samplesPerInput = +formData.formulaSamples;
    var totalInputs = Math.pow(samplesPerInput, numInputs);
    var examples = [];
    for (var i = 0; i < totalInputs; i++)
        examples.push({ inputs: [], outputs: [] });
    generateInputs(numInputs, samplesPerInput, examples);
    for (var _i = 0, examples_1 = examples; _i < examples_1.length; _i++) {
        var example = examples_1[_i];
        example.outputs = func.apply(null, example.inputs);
    }
    return examples;
}
function generateInputs(numInputs, samplesPerInput, samples, startAt) {
    if (startAt === void 0) { startAt = 0; }
    var inc = 1 / (samplesPerInput - 1);
    var x = 0;
    var totalInputs = Math.pow(samplesPerInput, numInputs);
    var inputsPerStep = totalInputs / samplesPerInput;
    for (var i = 0; i < totalInputs; i++) {
        samples[i + startAt].inputs.push(x);
        if ((i + 1) % inputsPerStep == 0) {
            x += inc;
            if (numInputs > 1)
                generateInputs(numInputs - 1, samplesPerInput, samples, startAt + i + 1 - inputsPerStep);
        }
    }
}
// -------------------- Misc --------------------
function getRanges(nums) {
    if (nums.length == 0)
        return [];
    var MAX_START = nums[0].map(function (x) { return Number.MAX_VALUE; });
    var MIN_START = MAX_START.map(function (x) { return -x; });
    var mins = nums.reduce(function (prevs, currs) {
        return neurons_1.map2(prevs, currs, function (p, c) { return Math.min(p, c); });
    }, MAX_START);
    var maxs = nums.reduce(function (prevs, currs) {
        return neurons_1.map2(prevs, currs, function (p, c) { return Math.max(p, c); });
    }, MIN_START);
    var ranges = neurons_1.map2(mins, maxs, function (min, max) { return max - min; });
    if (ranges.filter(function (x) { return isNaN(x); }).length > 0)
        ranges = [];
    return ranges;
}
function compareResult(actual, expected, ranges) {
    if (ranges.length == 0 || expected.length == 0)
        return '';
    return '  /  (' +
        actual.map(function (act, i) { return numError(act, expected[i], ranges[i]).toLocaleString('en-US', {
            style: 'percent',
            maximumFractionDigits: 3
        }); }).join('  ') + ')';
}
function numError(actual, expected, range) {
    return Math.abs((actual - expected) / range);
}
function formatNums(nums, len) {
    if (len === void 0) { len = 6; }
    return nums.map(function (x) { return fmtNum(x, len); }).join('  ');
}
function fmtNum(n, len) {
    if (len === void 0) { len = 5; }
    return n.toLocaleString('en-US', {
        minimumFractionDigits: len,
        maximumFractionDigits: len,
        useGrouping: false
    });
}

},{"./diagram":1,"./neurons":2,"./text-utils":4}],4:[function(require,module,exports){
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

},{}]},{},[3])
//# sourceMappingURL=bundle.js.map
