import { Example } from './neurons';

export default {
	parseLearnLines,
	parseExample,
	parseDataLines,
	parseNumbers
};

function parseLearnLines(allLines: string, numInputs: number, numOutputs?: number): Example[] {
	let examples: Example[] = [];
	let lines = parseDataLines(allLines);
	lines.forEach((line, i) => {
		let example = parseExample(line);
		//TODO validate line by checking:
		//	- if example.outputs is [], then the / is missing (that is OK for tests, not OK for learning)
		//	- if the number of inputs or outputs is invalid, then some values are missing or exceeding
		//	- if some value is NaN, then there are invalid numbers
		if (example) examples.push(example);
	});
	return examples;
}

function parseExample(line: string): Example | null {
	let inout = line.split('/');
	let inputs = parseNumbers(inout[0]);
	let outputs = inout.length < 2 ? [] : parseNumbers(inout[1]);
	return { inputs, outputs };
}

function parseDataLines(allLines: string): string[] {
	return allLines.split('\n').filter(line => {
		line = line.trim();
		return line.length > 0 && line[0] != '#';
	}).map(line => line.replace(/\t/g, ' '));
}

function parseNumbers(line: string): number[] {
	return line.split(' ').filter(s => s.length > 0).map(s => parseFloat(s));
}
