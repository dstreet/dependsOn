/*!
 * dependsOn v1.1.2
 * a jQuery plugin to facilitate the handling of form field dependencies.
 *
 * Copyright 2016 David Street
 * Licensed under the MIT license.
 */

// Future Implementation:
// $('#foo').will(doSomething).when('#bar').in(['bar', 'baz']).and('#blah').not('')

var Dependency            = require('./dependency')
var DependencySet         = require('./dependency-set')
// var DependencyCollections = require('./dependency-collection')

(function ($) {


	/**
	 * Creates a new DependencyCollection
	 *
	 * @class DependencyCollection
	 * @param {Object} subject A jQuery object which is the subject of the dependency.
	 * @param {Object} initialSet An object of key-value pairs of selectors and qualifiers
	 * representing the inital DependencySet.
	 * @param {Object} options An object for key-value pairs of options.
	 */
	var DependencyCollection = function ( $subject, initalSet, options ) {
		this.dependencySets = [];
		this.$subject = $subject;

 		// Extend default settings with the provided options
		this.settings = $.extend({
				disable: true,
				hide: true,
				duration: 200,
				trigger: 'change',
				onEnable: function() {},
				onDisable: function() {}
			}, options);

			/**
			 * Misc. settings not enabled by default
			 * -------------------------------------
			 * valueOnEnable: string
			 * valueOnDisable: string
			 * checkOnDisable: boolean
			 * checkOnEnable: boolean
			 * valueTarget: selector (string)
			 * toggleClass: string
			 */

		// Namespace the trigger event
		this.settings.trigger += (this.settings.trigger.search('.dependsOn') > -1) ? '' :  '.dependsOn';

		this.init( initalSet );
	};


	/**
	 * Initaialize the collection by adding the intial dependencySet
	 * and running the first check.
	 *
	 * @function init
	 * @param {Object} dependencies An object of key-value pairs of selectors and qualifiers.
	 */
	DependencyCollection.prototype.init = function ( dependencies ) {
		this.addSet( dependencies );
		this.check( true );
	};


	/**
	 * Add a new DependencySet and register the `change` event for each
	 * Dependency in that set.
	 *
	 * @function addSet
	 * @param {Object} set An object of key-value pairs of selectors and qualifiers.
	 */
	DependencyCollection.prototype.addSet = function ( set ) {
		var self = this
			, thisSet = 0
			, numDependencies = 0
			, d = 0
			, dependency;

		// Create a new DependencySet and add it to the stack
		this.dependencySets.push( new DependencySet(set) );

		thisSet = this.dependencySets.length - 1;
		numDependencies = this.dependencySets[thisSet].dependencies.length;

		// Loop through each of the Dependencies in the newly added DependencySet
		for ( d; d < numDependencies; d += 1 ) {
			dependency = this.dependencySets[thisSet].dependencies[d];

			// Register event trigger
			dependency.$dependencyObj.on(this.settings.trigger, function(e) {
				self.triggeredEvent = e;
				self.triggeredDependency = this;
				self.check();
			});

			// Handle on enter key event (fix for IE which doesn't register a change event when user
			// hits the enter key for text fields)
			if ( dependency.$dependencyObj.attr('type') === 'text' ) {
				dependency.$dependencyObj.on('keypress', function(e) {
					if ( e.which && dependency.$dependencyObj.is(':focus') ) {
						if ( self.check() ) {
							self.triggeredEvent = e;
							self.triggeredDependency = this;
							self.check();
						}
					}
				});
			}
		}
	};


	/**
	 * Public method to add a new DependencySet to the stack.
	 *
	 * @function or
	 * @param {Object} dependencies An object of key-value pairs of selectors and qualifiers.
	 * @returns {DependencyCollection} Returns this DependencyCollection in order to maintain
	 * chainability.
	 */
	DependencyCollection.prototype.or = function ( dependencies ) {
		this.addSet( dependencies );
		this.check( false );

		return this;
	};


	/**
	 * Get the element to be used when modifying the value on enable or disable
	 *
	 * @function getValueTarget
	 * @returns {Object} jQuery object
	 */
	DependencyCollection.prototype.getValueTarget = function() {
		var $valueTarget = this.$subject;

		if ( this.settings.hasOwnProperty('valueTarget') && this.settings.valueTarget != undefined) {
			$valueTarget = $(this.settings.valueTarget);

		// If the subject is not a form field, then look for one within the subject
		} else if ( this.$subject[0].nodeName.toLowerCase() !== 'input' &&
			this.$subject[0].nodeName.toLowerCase() !== 'textarea' &&
			this.$subject[0].nodeName.toLowerCase() !== 'select') {

			$valueTarget = this.$subject.find( 'input, textarea, select' );
		}

		return $valueTarget;
	};


	/**
	 * Toggle the display on enable or disable
	 *
	 * @function toggleSubjectDisplay
	 */
	DependencyCollection.prototype.toggleSubjectDisplay = function(show, noFade) {
		// TODO: Need to look for name as well.
		var subjectId = this.$subject.attr( 'id' )
			, $hideObject;

		// If the subject's parent is a label
		if ( this.$subject.parent()[0].nodeName.toLowerCase() === 'label' ) {
			$hideObject = this.$subject.parent();
		} else {
			$hideObject = this.$subject.add( 'label[for="' + subjectId + '"]' )
		}

		if (show && $hideObject.css('display') === 'none' ) {
			if (noFade) {
				// Show the input and it's label (if exists)
				$hideObject.show();
			} else {
				// Fade in the input and it's label (if exists)
				$hideObject.fadeIn( this.settings.duration );
			}
		} else if (!show) {
			if (noFade) {
				// Hide the input and it's label (if exists)
				$hideObject.css({ 'display': 'none' });
			} else {
				// Fade out the input and it's label (if exists)
				$hideObject.fadeOut( this.settings.duration );
			}
		}
	};


	/**
	 * Enable the subject.
	 *
	 * @function enable
	 * @param {Boolean} noFade Whether or not to fade the subject or immediately show it.
	 */
	DependencyCollection.prototype.enable = function ( noFade ) {
		var $valueTarget = this.getValueTarget()
			, subjectId = this.$subject.attr( 'id' )
			, $hideObject;

		// Remove the disabled attribute from the subject if allowed by the settings
		if ( this.settings.disable ) {
			this.$subject.removeAttr( 'disabled' );
		}

		// Show the subject if allowed by the settings
		if ( this.settings.hide ) {
			this.toggleSubjectDisplay(true, noFade);
		}

		// Set the value of the subject if allowed by the settings
		if ( this.settings.hasOwnProperty('valueOnEnable') && this.settings.valueOnEnable !== undefined ) {
			$valueTarget.val( this.settings.valueOnEnable );
		}

		// Add/remove the checked attribute of the subject if allowed by the settings
		if ( this.settings.hasOwnProperty('checkOnEnable') ) {
			if ( this.settings.checkOnEnable ) {
				$valueTarget.attr( 'checked', 'checked' );
			} else {
				$valueTarget.removeAttr( 'checked' );
			}
		}

		// Add a class to the subject if allowed by the settings
		if ( this.settings.hasOwnProperty('toggleClass') && this.settings.toggleClass !== undefined ) {
			this.$subject.addClass( this.settings.toggleClass );
		}

		// User callback
		this.settings.onEnable.call(this.triggeredDependency, this.triggeredEvent);
	};

	/**
	 * Disable the subject.
	 *
	 * @function disable
	 * @param {Boolean} noFade Whether or not to fade the subject or immediately hide it.
	 */
	DependencyCollection.prototype.disable = function ( noFade ) {
		var $valueTarget = this.getValueTarget()
			, subjectId = this.$subject.attr( 'id' )
			, $hideObject;

		// Add the disabled attribute from the subject if allowed by the settings
		if ( this.settings.disable ) {
			this.$subject.attr( 'disabled', 'disabled' );
		}

		// Hide the subject if allowed by the settings
		if ( this.settings.hide ) {
			this.toggleSubjectDisplay(false, noFade);
		}

		// Set the value of the subject if allowed by the settings
		if ( this.settings.hasOwnProperty('valueOnDisable') && this.settings.valueOnDisable !== undefined ) {
			$valueTarget.val( this.settings.valueOnDisable );
		}

		// Add/remove the checked attribute of the subject if allowed by the settings
		if ( this.settings.hasOwnProperty('checkOnDisable') ) {
			if ( this.settings.checkOnDisable ) {
				$valueTarget.attr( 'checked', 'checked' );
			} else {
				$valueTarget.removeAttr( 'checked' );
			}
		}

		// Remove a class of the subject if allowed by the settings
		if ( this.settings.hasOwnProperty('toggleClass') && this.settings.toggleClass !== undefined ) {
			this.$subject.removeClass( this.settings.toggleClass );
		}

		// User callback
		this.settings.onDisable.call(this.triggeredDependency, this.triggeredEvent);
	};


	/**
	 * Check each DependencySet's `doesQualify` method. If any of the sets qualify then enable
	 * the input, othewise disable it.
	 *
	 * @function check
	 * @param {Boolean} firstRun Whether or not this is the initial check.
	 * @returns {Boolean} Whether or not the event qualifies.
	 */
	DependencyCollection.prototype.check = function ( firstRun ) {
		var length = this.dependencySets.length
			, i = 0
			, qualifies = false;

		// Loop through each DependencySet
		for ( i; i < length; i += 1 ) {
			if ( this.dependencySets[i].doesQualify() ) {
				qualifies = true;
				break;
			}
		}

		if (qualifies) {
			this.enable( firstRun );
			return true;
		} else {
			this.disable( firstRun );
			return false;
		}
	};


	/**
	 * Plugin access point.
	 *
	 * @function dependsOn
	 * @param {Object} initialSet An object of key-value pairs of selectors and qualifiers
	 * representing the inital DependencySet.
	 * @param {Object} options An object for key-value pairs of options.
	 * @returns {DependencyCollection} The DependencyCollection object.
	 */
	$.fn.dependsOn = function ( dependencies, options ) {
		var dependencyCollection = new DependencyCollection( this, dependencies, options );

		return dependencyCollection;

	};

	window.DependencyCollection = DependencyCollection;
	window.DependencySet = DependencySet;
	window.Dependency = Dependency;

})( jQuery );
