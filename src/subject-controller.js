/**
 * SubjectController
 * ---
 * Class which controls the state of the subject by responding its
 * dependency collection state.
 */

var DependencyCollection = require('./dependency-collection')
var DependencySet        = require('./dependency-set')

var SubjectController = function($subject, initialSet, options) {
	this.$subject = $subject
	this.collection = new DependencyCollection()
	this.options = $.extend({}, {
		onEnable: function() {},
		onDisable: function() {},
		trigger: 'change'
	}, options)
	this.collection.addSet(new DependencySet(initialSet, this.options.trigger))

	this.$valueTarget = this._getValueTarget()
	this.isInitialState = true

	if (this.collection.qualified) {
		this._enable()
	} else {
		this._disable()
	}

	this.collection.on('change', this._changeHandler.bind(this))
}

/**
 * Change handler for the collection
 * @param  {Object} state
 * @private
 */
SubjectController.prototype._changeHandler = function(state) {
	if (state.qualified) {
		this._enable(state.triggerBy.$ele, state.e)
	} else {
		this._disable(state.triggerBy.$ele, state.e)
	}

	this.isInitialState = false
}

/**
 * Get the target element when setting a value
 * @return {jQuery}
 * @private
 */
SubjectController.prototype._getValueTarget = function() {
	var $valueTarget = this.$subject

	if (this.options.hasOwnProperty('valueTarget') && typeof this.options.valueTarget !== undefined) {
		$valueTarget = $(this.options.valueTarget)

	// If the subject is not a form field, then look for one within the subject
	} else if ( this.$subject[0].nodeName.toLowerCase() !== 'input' &&
		this.$subject[0].nodeName.toLowerCase() !== 'textarea' &&
		this.$subject[0].nodeName.toLowerCase() !== 'select') {

		$valueTarget = this.$subject.find('input, textarea, select')
	}

	return $valueTarget
}

/**
 * Add a set to the dependency collection
 * @param  {[type]} set DependencySet
 * @return {SubjectController}
 */
SubjectController.prototype.or = function(set) {
	this.collection.addSet(new DependencySet(set, this.options.trigger))

	if (this.collection.qualified) {
		this._enable()
	} else {
		this._disable()
	}

	return this
}

/**
 * Run a check of the collection
 */
SubjectController.prototype.check = function() {
	this.collection.runCheck()
}

/**
 * Enable the subject
 * @param  {Dependency} dependency The triggering dependency
 * @param  {Event}      e The triggering DOM event
 * @private
 */
SubjectController.prototype._enable = function(dependency, e) {
	if (this.options.disable) {
		this.$subject.attr('disabled', false)
	}

	if (this.options.hide) {
		this._toggleDisplay(true, this.isInitialState)
	}

	if (this.options.hasOwnProperty('valueOnEnable') && typeof this.options.valueOnEnable !== undefined) {
		this.$valueTarget.val(this.options.valueOnEnable)
	}

	if (this.options.hasOwnProperty('checkOnEnable')) {
		this.$valueTarget.prop('checked', this.options.checkOnEnable)
	}

	if (this.options.hasOwnProperty('toggleClass') && typeof this.options.toggleClass !== undefined) {
		this.$subject.addClass(this.options.toggleClass)
	}

	this.options.onEnable.call(dependency, e)
}

/**
 * Disable the subject
 * @param  {Dependency} dependency The triggering dependency
 * @param  {Event}      e The triggering DOM event
 * @private
 */
SubjectController.prototype._disable = function(dependency, e) {
	if (this.options.disable) {
		this.$subject.attr('disabled', true)
	}

	if (this.options.hide) {
		this._toggleDisplay(false, this.isInitialState)
	}

	if (this.options.hasOwnProperty('valueOnDisable') && typeof this.options.valueOnDisable !== undefined) {
		this.$valueTarget.val(this.options.valueOnDisable)
	}

	if (this.options.hasOwnProperty('checkOnDisable')) {
		this.$valueTarget.prop('checked', this.options.checkOnDisable)
	}

	if (this.options.hasOwnProperty('toggleClass') && typeof this.options.toggleClass !== undefined) {
		this.$subject.removeClass(this.options.toggleClass)
	}

	this.options.onDisable.call(dependency, e)
}

/**
 * Show or hide the subject
 * @param  {Boolean} show   Whether or not to show the element
 * @param  {[type]}  noFade Whether or not to fade the element
 * @private
 */
SubjectController.prototype._toggleDisplay = function(show, noFade) {
	var id = this.$subject.attr('id')
	var $hideEle

	if (this.$subject.parent()[0].nodeName.toLowerCase() === 'label') {
		$hideEle = this.$subject.parent()
	} else {
		$hideEle = this.$subject.add('label[for="' + id + '"]')
	}

	if (show && !$hideEle.is(':visible')) {
		if (noFade) {
			$hideEle.show()
		} else {
			$hideEle.fadeIn(this.options.duration)
		}
	} else if (!show) {
		if (noFade) {
			$hideEle.hide()
		} else {
			$hideEle.fadeOut(this.options.duration)
		}
	}
}

module.exports = SubjectController
