/**
 * DependencySet
 * ---
 * Class which defines a set of dependencies
 */

var $            = require('jquery')
var EventEmitter = require('events').EventEmitter
var Dependency   = require('./dependency')

var DependencySet = function(dependencies) {
	this.dependencies = []
	this.qualified = null

	// Keep track of how many dependencies are qualified.
	// Qualified dependencies will add 1, unqualified dependencies will
	// subtract 1 unless the sum is 0. The sum must not fall below zero.
	var qualSum = 0

	for (var d in dependencies) {
		if (!dependencies.hasOwnProperty(d)) continue

		var newDep = new Dependency(d, dependencies[d])
		this.dependencies.push(newDep)
		qualSum += newDep.qualified ? 1 : 0

		newDep.on('change', getDepChangeHandler(newDep).bind(this))
	}

	function getDepChangeHandler(dep) {
		return function(state) {
			var prevState = this.qualified
			qualSum += state.qualified ? 1 : qualSum === 0 ? 0 : -1
			this.qualified = this.doesQualify()

			if (this.qualified !== prevState) {
				this.emit('change', {
					triggerBy: dep,
					qualified: this.doesQualify()
				})
			}
		}
	}

	this.doesQualify = function() {
		return qualSum === this.dependencies.length
	}
}

module.exports = DependencySet

DependencySet.prototype = $.extend({}, EventEmitter.prototype)

/**
 * Run a qualification check of all dependencies
 */
DependencySet.prototype.runCheck = function() {
	for (var i = 0, len = this.dependencies.length; i < len; i++) {
		this.dependencies[i].runCheck()
	}
}
