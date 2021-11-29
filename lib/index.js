'use strict';
const chToPath = require('./ch-to-path');
const randomizePath = require('./randomize-path');
const random = require('./random');
const optionMngr = require('./option-manager');

const opts = optionMngr.options;

function shuffleArray(array) {
 let count = array.length,
     randomnumber,
     temp;
 while( count ){
  randomnumber = Math.random() * count-- | 0;
  temp = array[count];
  array[count] = array[randomnumber];
  array[randomnumber] = temp
 }
}

function mergePaths(paths) {
	if (!paths.length) {
		return [];
	}
	const out = paths[0];
	for (let i = 1; i < paths.length; i += 1) {
		out.commands = out.commands.concat(
      paths[i].commands,
    );
	}
	return out;
}

const getTextPath = function (text, width, height, options) {
	const len = text.length;
	const spacing = (width - 2) / (len + 1);
	let i = -1;
	const out = [];

	while (++i < len) {
		const x = spacing * (i + 1);
		const y = height / 2;
		const charPath = chToPath(text[i], Object.assign({x, y}, options));
		out.push(charPath);
	}

	return out;
};

const createCaptcha = function (text, options) {
	const width = options.width;
	const height = options.height;
	const bg = options.background;
  const style = options.style;
	const bgRect = bg ?
		`<rect width="100%" height="100%" fill="${bg}"/>` : '';

  /* Create character paths and order them randomly */
	let path = [].concat(getTextPath(text, width, height, options));
  shuffleArray(path);
  /* Join paths together to one */
	path = mergePaths(path);
  /* Randomize nodes and randomly split them */
	path = randomizePath(path, options);
  /* Join characters with random lines */
	path = randomizePath.removeGaps(path, options);

  /* Create xml */
	const start = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0,0,${width},${height}">`;
	path = `<path fill="${options.fill}" stroke="${options.stroke}" ${(style) ? `style="${style}"` : ''} d="${path.toPathData()}"/>`;
	const xml = `${start}${bgRect}${path}</svg>`;

	return xml;
};

const create = function (options) {
	options = Object.assign({}, opts, options);

	const text = random.captchaText(options);
	const data = createCaptcha(text, options);
	return {text, data};
};

const createMathExpr = function (options) {
	options = Object.assign({}, opts, options);

	const expr = random.mathExpr(options.mathMin, options.mathMax, options.mathOperator);
	const text = expr.text;
	const data = createCaptcha(expr.equation, options);
	return {text, data};
};

module.exports.create = create;
module.exports.createMathExpr = createMathExpr;
module.exports.createCaptcha = function (text, options) {
	options = Object.assign({}, opts, options);
	return createCaptcha(text, options);
}
module.exports.options = opts;
module.exports.loadFont = optionMngr.loadFont;
