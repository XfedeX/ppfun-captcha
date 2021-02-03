'use strict';
const chToPath = require('./ch-to-path');
const randomizePath = require('./randomize-path');
const random = require('./random');
const optionMngr = require('./option-manager');

const opts = optionMngr.options;

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

const createCaptcha = function (text, options) {
	text = text || random.captchaText();
	options = Object.assign({}, opts, options);
	const width = options.width;
	const height = options.height;
	const bg = options.background;
	const bgRect = bg ?
		`<rect width="100%" height="100%" fill="${bg}"/>` : '';

  /* Create character paths and order them randomly */
	let path =
		[].concat(getTextPath(text, width, height, options))
			.sort(() => Math.random() - 0.5);
  /* Join paths together to one */
	path = mergePaths(path);
  /* Randomize nodes and randomly split them */
	path = randomizePath(path, options);
  /* Join characters with random lines */
	path = randomizePath.removeGaps(path);

  /* Create xml */
	const start = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0,0,${width},${height}">`;
	path = `<path fill="${options.fill}" stroke="${options.stroke}" d="${path.toPathData()}"/>`;
	const xml = `${start}${bgRect}${path}</svg>`;

	return xml;
};

const create = function (options) {
	const text = random.captchaText(options);
	const data = createCaptcha(text, options);

	return {text, data};
};

const createMathExpr = function (options) {
	const expr = random.mathExpr(options.mathMin, options.mathMax, options.mathOperator);
	const text = expr.text;
	const data = createCaptcha(expr.equation, options);

	return {text, data};
};

module.exports = createCaptcha;
module.exports.randomText = random.captchaText;
module.exports.create = create;

module.exports.createMathExpr = createMathExpr;
module.exports.options = opts;
module.exports.loadFont = optionMngr.loadFont;
