/*global process */
'use strict';
var path = require('path');
var fs = require('fs');
var path = require('path');
var chalk = require('chalk');

module.exports = {
	rewrite: rewrite,
	rewriteFile: rewriteFile,
	addLocalResource: addLocalResource
};

// This concept is borrowed from the generator-angular project.

/**
 * Method searching a certain string in a file and adding it just before the give hook string.
 *
 * @param  {Object} args.splicable: Content to be added if not present
 *                  args.haysteck:  Content string to be searched within
 *                  args.needle:    Hook string, before which the content is added
 */
function rewriteFile(args) {
	args.path = args.path || process.cwd();
	var fullPath = path.join(args.path, args.file);

	args.haystack = fs.readFileSync(fullPath, 'utf8');
	var body = rewrite(args);

	fs.writeFileSync(fullPath, body);
}



/**
 * Escaping function
 *
 * @param  {String} str Input
 *
 * @return {String}     Output
 */
function escapeRegExp(str) {
	return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}



/**
 * Method searching a certain string in a file and adding it just before the give hook string.
 *
 * @param  {Object} args.splicable: Content to be added if not present
 *                  args.haysteck:  Content string to be searched within
 *                  args.needle:    Hook string, before which the content is added
 *
 * @return {String} Modified content
 */
function rewrite(args) {
	// check if splicable is already in the body text
	var re = new RegExp(args.splicable.map(function(line) {
		return '\s*' + escapeRegExp(line);
	}).join('\n'));

	if (re.test(args.haystack)) {
		return args.haystack;
	}

	var lines = args.haystack.split('\n');

	var otherwiseLineIndex = 0;
	lines.forEach(function(line, i) {
		if (line.indexOf(args.needle) !== -1) {
			otherwiseLineIndex = i;
		}
	});

	var spaces = 0;
	while (lines[otherwiseLineIndex].charAt(spaces) === ' ') {
		spaces += 1;
	}

	var spaceStr = '';
	while ((spaces -= 1) >= 0) {
		spaceStr += ' ';
	}

	lines.splice(otherwiseLineIndex, 0, args.splicable.map(function(line) {
		return spaceStr + line;
	}).join('\n'));

	return lines.join('\n');
}



/**
 * Check if a sap.ui.localResources() entry exists for the first element of the
 * elemetPath in index.html. If not, it's added to index.html.
 *
 * @param {String} elementPath Path of the element to be checked
 */
function addLocalResource(elementPath) {
	var indexPath = path.join(process.cwd(), 'index.html');
	var localResourcesString = 'sap.ui.localResources("' + elementPath.split('.')[0] + '");';

	try {
		rewriteFile({
			file: 'index.html',
			needle: '/* endOfResources */',
			splicable: [localResourcesString]
		});
	} catch (e) {
		console.log(chalk.red('\nUnable to find ' + indexPath + '. ') + chalk.yellow(localResourcesString) + ' not added.\n');
	}
}