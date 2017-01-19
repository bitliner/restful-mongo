module.exports = {
	"extends": "google",
	"rules": {
		"max-len": ["error", {
			"ignoreStrings": true
		}],
		"eol-last": ["error", "never"],
		"require-jsdoc": ["error", {
			"require": {
				"FunctionDeclaration": false,
				"MethodDefinition": false,
				"ClassDeclaration": true,
				"ArrowFunctionExpression": false
			}
		}]
	},
};