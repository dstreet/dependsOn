/**
 * DependencyCollection
 * ---
 * Class which defines a collection of dependency sets.
 * Each set defines a logical OR, so the collection is considered qualified
 * when _any_ of the sets are qualified.
 */

var $             = require('jquery')
var EventEmitter  = require('events').EventEmitter

var DependencyCollection = function() {
	this.sets = []

	// Keep track of how many sets are qualified.
	// Qualified sets will add 1, unqualified sets will subtract 1 unless the
	// sum is 0. The sum must not fall below zero.
	this._qualSum = 0
	this.qualified = null
}

module.exports = DependencyCollection

DependencyCollection.prototype = $.extend({}, EventEmitter.prototype)

/**
 * Add a dependency set to the collection
 * @param  {DependencySet} set
 */
DependencyCollection.prototype.addSet = function(set) {
	this.sets.push(set)
	this._addToSum(set.qualified)
	this.qualified = this._qualSum > 0
	set.on('change', this._setChangeHandler.bind(this))
}

/**
 * Check to see if the collection can qualify by checking each set
 */
DependencyCollection.prototype.runCheck = function() {
	for (var i = 0, len = this.sets.length; i < len; i++) {
		this.sets[i].runCheck()
	}
}

/**
 * Add a qualified status to the sum
 * @param  {Boolean} q
 * @private
 */
DependencyCollection.prototype._addToSum = function(q) {
	this._qualSum += q ? 1 : this._qualSum === 0 ? 0 : -1
}

/**
 * Handler for a set's `change` event
 * Emit a `change` event when the qualfied status of the collection changes
 * @param  {Object} state
 * @private
 */
DependencyCollection.prototype._setChangeHandler = function(state) {
	var prevState = this.qualified
	this._qualSum += state.qualified ? 1 : this._qualSum === 0 ? 0 : -1
	this.qualified = this._qualSum > 0

	if (this.qualified !== prevState) {
		this.emit('change', {
			triggerBy: state.triggerBy,
			e: state.e,
			qualified: this.qualified
		})
	}
}
