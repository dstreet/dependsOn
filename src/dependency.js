/**
 * Dependency
 * ---
 * Class which defines dependency qualifiers
 */

var $            = require('jquery')
var EventEmitter = require('events').EventEmitter

var Dependency = function(selector, qualifiers, trigger) {
	this.$ele = $(selector)
	this.qualifiers = qualifiers
	this.fieldState = getFieldState(this.$ele)
	this.methods = [
		'enabled',
		'checked',
		'values',
		'not',
		'match',
		'contains',
		'email',
		'url'
	]

	var qualified = this.doesQualify()

	this.$ele.on(trigger, handler.bind(this))
	this.trigger = handler.bind(this)

	function handler() {
		var prevState = this.qualified

		this.fieldState = getFieldState(this.$ele)
		this.qualified = this.doesQualify()

		if (this.qualified !== prevState) {
			this.emit('change', {
				selector: selector,
				qualfied: qualified
			})
		}
	}
}

module.exports = Dependency

Dependency.prototype = $.extend({}, EventEmitter.prototype)

/**
 * Qualifier method which checks for the `disabled` attribute.
 * ---
 * Returns false when dependency is disabled and `enabled`
 * qualifier is true *or* when dependency is not disabled and
 * `enabled` qualifier is false.
 * Returns true otherwise.
 *
 * @param {Boolean} enabledVal The value we are checking
 * @return {Boolean}
 */
Dependency.prototype.enabled = function(enabledVal) {
	if ((!this.fieldState.disabled && enabledVal) ||
		(this.fieldState.disabled && !enabledVal)) {
		return true
	}

	return false
}

/**
 * Qualifier method which checks for the `checked` attribute on
 * checkboxes and radio buttons.
 * ---
 * Dependency must be a checkbox for this qualifier.
 * Returns false if checkbox is not checked and the `checked` qualifier
 * is true *or* the checkbox is checked and the `checked` qualifier
 * is false.
 *
 * @param {Boolean} checkedVal The value we are checking.
 * @return {Boolean}
 */
Dependency.prototype.checked = function(checkedVal) {
	if (this.$ele.attr('type') === 'checkbox') {
		if ((!this.fieldState.checked && checkedVal) ||
			(this.fieldState.checked && !checkedVal)) {
			return false
		}
	}

	return true
}

/**
 * Qualifier method which checks the dependency input value against an
 * array of whitelisted values.
 * ---
 * For single value dependency, returns true if values match.
 * When dependency value is an array, returns true if array compares to
 * a single value in the whitlist.
 * This is helpful when dealing with a multiselect input, and comparing
 * against an array of value sets:
 * 		[ [1, 2, 3], [4, 5, 6], [7, 8] ]
 *
 * @param  {Array} whitelist The list of acceptable values
 * @return {Boolean}
 */
Dependency.prototype.values = function(whitelist) {
	for (var i = 0, len = whitelist.length; i < len; i++) {
		if (this.fieldState.value !== null && Array.isArray(this.fieldState.value)) {
			if ($(this.fieldState.value).not(whitelist[i]).length === 0) {
				return true
			}
		} else if (whitelist[i] === this.fieldState.value) {
			return true
		}
	}

	return false
}

/**
 * Qualifier method which checks the dependency input value against an
 * array of blacklisted values.
 * ---
 * Returns true when the dependency value is not in the blacklist.
 *
 * @param  {Array} blacklist The list of unacceptable values
 * @return {Boolean}
 */
Dependency.prototype.not = function(blacklist) {
	return !this.values(blacklist)
}

/**
 * Qualifier method which runs a RegEx pattern match on the dependency
 * input value.
 * ---
 * Returns true when the dependency value matches the regular expression.
 * If dependency value is an array, will only return true if _all_ values
 * match the regular expression.
 *
 * @param  {RegExp} regex Regular expression to test against
 * @return {Boolean}
 */
Dependency.prototype.match = function(regex) {
	var val = this.fieldState.value

	if (!Array.isArray(this.fieldState.value)) {
		val = [val]
	}

	for (var i = 0, len = val.length; i < len; i++) {
		if (!regex.test(val[i])) return false
	}

	return true
}

/**
 * Qualifier method which checks if a whitelisted value exists in an
 * array of dependency values.
 * ---
 * Useful for select inputs with the `multiple` attribute.
 * If dependency value is not an array, the method will fallback to the
 * `values` qualifier.
 *
 * @param  {Array} whitelist List of acceptable values
 * @return {Boolean}
 */
Dependency.prototype.contains = function(whitelist) {
	if (!Array.isArray(this.fieldState.value)) {
		return this.values(whitelist)
	}

	for (var i = 0, len = whitelist.length; i < len; i++) {
		if ($.inArray(whitelist[i], this.fieldState.value) !== -1) {
			return true
		}
	}

	return false
}

/**
 * Qualifier method which checks that the value is a valid email address
 * ---
 * Returns true when the value is an email address and `shouldMatch` is
 * true *or* when value is not an email address and `shouldMatch`
 * is false.
 *
 * @param  {Boolean} shouldMatch Should the value be valid
 * @return {Boolean}
 */
Dependency.prototype.email = function(shouldMatch) {
	var regex = /^[_a-zA-Z0-9\-\+]+(\.[_a-zA-Z0-9\-\+]+)*@[a-zA-Z0-9\-]+(\.[a-zA-Z0-9\-]+)*\.(([0-9]{1,3})|([a-zA-Z]{2,3})|(aero|coop|info|museum|name))$/

	return this.match(regex) === shouldMatch
}

/**
 * Qualifier method which checks that the value is a valid URL
 * ---
 * Returns true when the value is a URL and `shouldMatch` is true *or*
 * when value is not a URL and `shouldMatch` is false.
 *
 * @param  {Boolean} shouldMatch Should the value be valid
 * @return {Boolean}
 */
Dependency.prototype.url = function(shouldMatch) {
	var regex = /(((http|ftp|https):\/\/)|www\.)[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?\^=%&:\/~\+#!]*[\w\-\@?\^=%&\/~\+#])?/

	return this.match(regex) === shouldMatch
}

/**
 * Check the dependency value against all of its qualifiers. If
 * qualifiers contains an unknown qualifier, treat it as a custom
 * qualifier and execute the function.
 *
 * @return {Boolean}
 */
Dependency.prototype.doesQualify = function() {
	for (var q in this.qualifiers) {
		if (!this.qualifiers.hasOwnProperty(q)) continue

		if (this.methods.indexOf(q) && typeof this[q] === 'function') {
			if (!this[q](this.qualifiers[q])) {
				return false
			}
		} else if (typeof this.qualifiers[q] === 'function') {
			if (!this.qualifiers[q].call(this.qualifiers, this.$ele.val())) {
				return false
			}
		}
	}

	return true
}

/**
 * Get the current state of a field
 * @param  {jQuery} $ele The element
 * @return {Object}
 * @private
 */
function getFieldState($ele) {
	var val = $ele.val()

	// If dependency is a select field, then filter by `:selected`
	if ($ele.attr('type') === 'select') {
		val = $ele.children(':selected').val()
	}

	// If dependency is a radio group, then filter by `:checked`
	if ($ele.attr('type') === 'radio') {
		val = $ele.filter(':checked').val()
	}

	return {
		value: val,
		checked: $ele.is(':checked'),
		disabled: $ele.is(':disabled'),
		selected: $ele.is(':selected')
	}
}

// Array.isArray polyfill
if (!Array.isArray) {
	Array.isArray = function(arg) {
		return Object.prototype.toString.call(arg) === '[object Array]'
	}
}
