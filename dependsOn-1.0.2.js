/*!
 * dependsOn v1.0.2
 * a jQuery plugin to facilitate the handling of form field dependencies.
 *
 * Copyright (c) 2015 David Street
 * @license the MIT license.
 */

(function ($) {

	/**
	 * Creates a new Dependency
	 *
	 * @class Dependency
	 * @param {String} selector The jQuery selector.
	 * @param {Object} qualifiers An object representing the qualifiers for the Dependency.
	 */
	var Dependency = function ( selector, qualifiers ) {
		this.selector = selector;
		this.$dependencyObj = $(selector);
		this.qualifiers = qualifiers;
	};


	/**
	 * Qualifier method which checks for the `disabled` attribute.
	 * 
	 * @function enabled
	 * @param checkAgainst The value we are checking.
	 * @returns {Boolean}
	 */
	Dependency.prototype.enabled = function ( checkAgainst ) {
		if ( $(this.selector + '[disabled]').length > 0 ) {

			// Dependency is disabled and `enabled` qualifier is set to true
			if ( checkAgainst ) {
				return false;
			}
		} else {

			// Dependency is not disabled and `enabled` qualifier is set to false
			if ( !checkAgainst ) {
				return false;
			}
		}

		return true;
	};


	/**
	 * Qualifier method which checks for the `checked` attribute on checkboxes and radio buttons.
	 * 
	 * @function checked
	 * @param checkAgainst The value we are checking.
	 * @returns {Boolean}
	 */
	Dependency.prototype.checked = function ( checkAgainst ) {

		// Dependency must be a checkbox for this qualifier
		if ( this.$dependencyObj.attr('type') === 'checkbox') {

			// Checkbox is not checked and the `checked` qualifier is set to true
			// or the checkbox is checked and the `checked` qualifier is set to false
			if ( (!this.$dependencyObj.is(':checked') && checkAgainst) ||
				(this.$dependencyObj.is(':checked') && !checkAgainst ) ) {

				return false;
			}
		}

		return true;
	};

	
	/**
	 * Qualifier method which checks the dependency input value against an array of
	 * whitelisted values.
	 * 
	 * @function values
	 * @param checkAgainst The value we are checking.
	 * @returns {Boolean}
	 */
	Dependency.prototype.values = function ( checkAgainst ) {
		var dependencyValue = this.$dependencyObj.val()
			, length = checkAgainst.length
			, i = 0
			, match = false;

		// If dependency is a radio group, then filter by `:checked`
		if ( this.$dependencyObj.attr('type') === 'radio' ) {
			dependencyValue = this.$dependencyObj.filter(':checked').val();
		}

		// Loop through list of accepted values. Break when we find a match.
		for ( i; i < length; i += 1 ) {
			if ( typeof(dependencyValue) === 'array' || typeof(dependencyValue) === 'object' ) {

				// If `dependencyValue` is an array then check to see if arrays match
				if ( $(this.$dependencyObj.val()).not($(checkAgainst[i])).length === 0 &&
					$(checkAgainst[i]).not($(this.$dependencyObj.val())).length === 0 ) {
					match = true;
					break;
				}
			} else {
				if ( checkAgainst[i] === dependencyValue ) {
					match = true;
					break;
				}
			}	
		}

		return match;
	};


	/**
	 * Qualifier method which the dependency input value against an array of
	 * blacklisted values.
	 * 
	 * @function not
	 * @param checkAgainst The value we are checking.
	 * @returns {Boolean}
	 */
	Dependency.prototype.not = function ( checkAgainst ) {
		var dependencyValue = this.$dependencyObj.val()
			, length = checkAgainst.length
			, i = 0;

		if ( this.$dependencyObj.attr('type') === 'radio' ) {
			dependencyValue = this.$dependencyObj.filter(':checked').val();
		}
		// Loop through list of blacklisted values. Break when we find a match.
		for ( i; i < length; i += 1 ) {
			if ( checkAgainst[i] === dependencyValue ) {
				return false;
			}
		}

		return true;
	};

	
	/**
	 * Qualifier method which runs a RegEx pattern match on the dependency input value.
	 * 
	 * @function match
	 * @param checkAgainst The value we are checking.
	 * @returns {Boolean}
	 */
	Dependency.prototype.match = function ( checkAgainst ) {
		var dependencyValue = this.$dependencyObj.val()
			, pattern = checkAgainst;

		return pattern.test( dependencyValue );
	};


	/**
	 * Qualifier method which checks if a whitelisted value exists in an array of dependencyValues.
	 * Used for select inputs with the `multiple` attribute.
	 * If `dependencyValue` is not an array or object, then method will fallback
	 * to the `values` method.
	 * 
	 * @function contains
	 * @param checkAgainst The value we are checking.
	 * @returns {Boolean}
	 */
	Dependency.prototype.contains = function ( checkAgainst ) {
		var dependencyValue = this.$dependencyObj.val()
			, i = 0;

		// Dependency value must be an array or object
		if ( typeof(dependencyValue) === 'array' || typeof(dependencyValue) === 'object' ) {
			for ( i in checkAgainst ) {
				if ( $.inArray(checkAgainst[i], dependencyValue) !== -1 ) {
					return true;
				}

			}
		} else {
			return this.values( checkAgainst );
		}

		return false;
	};


	/**
	 * Qualifier method which is a shortcut qualifier uses `match` method to check if value is an 
	 * email address.
	 * 
	 * @function email
	 * @param checkAgainst The value we are checking.
	 * @returns {Boolean}
	 */
	Dependency.prototype.email = function ( checkAgainst ) {
		var emailPattern = /^[_a-zA-Z0-9\-]+(\.[_a-zA-Z0-9\-]+)*@[a-zA-Z0-9\-]+(\.[a-zA-Z0-9\-]+)*\.(([0-9]{1,3})|([a-zA-Z]{2,3})|(aero|coop|info|museum|name))$/;

		return ( this.match(emailPattern) === checkAgainst );
	};


	/**
	 * Qualifier method which is a shortcut qualifier uses `match` method to check if value is a 
	 * URL.
	 * 
	 * @function url
	 * @param checkAgainst The value we are checking.
	 * @returns {Boolean}
	 */
	Dependency.prototype.url = function ( checkAgainst ) {
		var urlPattern = /(((http|ftp|https):\/\/)|www\.)[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?\^=%&:\/~\+#!]*[\w\-\@?\^=%&\/~\+#])?/g;

		return ( this.match(urlPattern) === checkAgainst );
	};

	/**
	 * Checks the Dependency against all of it's qualifiers.
	 * 
	 * @function doesQualify
	 * @returns {Boolean}
	 */
	Dependency.prototype.doesQualify = function () {
		var q = 0;

		// Loop through qualifiers
		for ( q in this.qualifiers ) {

			// Check if qualifier is a method of the Dependency object; if so,
			// execute it.
			if ( Dependency.prototype.hasOwnProperty( q ) &&
				typeof(Dependency.prototype[q]) === 'function' ) {

				if ( !this[q](this.qualifiers[q]) ) {
					return false;
				}
			}  else {

				// Custom qualifier method
				if ( typeof(this.qualifiers[q] === 'function') ) {
					return this.qualifiers[q]( this.$dependencyObj.val() );
				}
			}
		}

		return true;
	};


	/**
	 * Creates a new DependencySet
	 *
	 * @class DependencySet
	 * @param {Object} dependencies An object containing key-value pairs of selectors and qualifiers.
	 */
	var DependencySet = function ( dependencies ) {
		var d = 0;

		this.dependencies = [];
		
		for ( d in dependencies ) {
			this.dependencies.push( new Dependency(d, dependencies[d]) );
		}
	};


	/**
	 * Checks if each Dependency in the set qualifies.
	 *
	 * @function doesQualify
	 * @returns {Boolean}
	 */
	DependencySet.prototype.doesQualify = function () {
		var length = this.dependencies.length
			, d = 0
			, qualifies = true;

		// Execute `doesQualify` method on each dependency
		for ( d; d < length; d += 1 ) {
			if ( !this.dependencies[d].doesQualify() ) {
				qualifies = false;
				break;
			}
		}

		return qualifies;
	};

	
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

		this.enableCallback = function() {};
		this.disableCallback = function() {};

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

			// Register change event
			dependency.$dependencyObj.on('change', function(e) {
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
	 * Enable the subject.
	 *
	 * @function enable
	 * @param {Boolean} noFade Whether or not to fade the subject or immediately show it.
	 */
	DependencyCollection.prototype.enable = function ( noFade ) {
		var valueSubject = this.$subject
			, subjectId = this.$subject.attr( 'id' )
			, $hideObject;

		// If the value target has been specified by the user
		if ( this.settings.hasOwnProperty('valueTarget') && this.settings.valueTarget !== undefined) {
			valueSubject = $( this.settings.valueTarget );

		// If the subject is not a form field, then look for one within the subject
		} else if ( this.$subject[0].nodeName.toLowerCase() !== 'input' && 
			this.$subject[0].nodeName.toLowerCase() !== 'textarea' &&
			this.$subject[0].nodeName.toLowerCase() !== 'select') {

			valueSubject = this.$subject.find( 'input, textarea, select' );
		}

		// Remove the disabled attribute from the subject if allowed by the settings
		if ( this.settings.disable ) {
			this.$subject.removeAttr( 'disabled' );
		}

		// Show the subject if allowed by the settings
		if ( this.settings.hide ) {

			// If the subject's parent is a label
			if ( this.$subject.parent()[0].nodeName.toLowerCase() === 'label' ) {
				$hideObject = this.$subject.parent();
			} else {
				$hideObject = this.$subject.add( 'label[for="' + subjectId + '"]' )
			}

			if ( $hideObject.css('display') === 'none' ) {
				if ( noFade ) {

					// Show the input and it's label (if exists)
					$hideObject.show();
				} else {

					// Fade in the input and it's label (if exists)
					$hideObject.fadeIn( this.settings.duration );
				}
			}
		}

		// Set the value of the subject if allowed by the settings
		if ( this.settings.hasOwnProperty('valueOnEnable') && this.settings.valueOnEnable !== undefined ) {
			valueSubject.val( this.settings.valueOnEnable );
		}

		// Add/remove the checked attribute of the subject if allowed by the settings
		if ( this.settings.hasOwnProperty('checkOnEnable') ) {
			if ( this.settings.checkOnEnable ) {
				valueSubject.attr( 'checked', 'checked' );
			} else {
				valueSubject.removeAttr( 'checked' );
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
		var valueSubject = this.$subject
			, subjectId = this.$subject.attr( 'id' )
			, $hideObject;

		// If the value target has been specified by the user
		if ( this.settings.hasOwnProperty('valueTarget') && this.settings.valueTarget !== undefined) {
			valueSubject = $( this.settings.valueTarget );

		// If the subject is not a form field, then look for one within the subject
		} else if ( this.$subject[0].nodeName.toLowerCase() !== 'input' &&
			this.$subject[0].nodeName.toLowerCase() !== 'textarea' &&
			this.$subject[0].nodeName.toLowerCase() !== 'select') {

			valueSubject = this.$subject.find( 'input, textarea, select' );
		}

		// Add the disabled attribute from the subject if allowed by the settings
		if ( this.settings.disable ) {
			this.$subject.attr( 'disabled', 'disabled' );
		}

		// Hide the subject if allowed by the settings
		if ( this.settings.hide ) {

			// If the subject's parent is a label
			if ( this.$subject.parent()[0].nodeName.toLowerCase() === 'label' ) {
				$hideObject = this.$subject.parent();
			} else {
				$hideObject = this.$subject.add( 'label[for="' + subjectId + '"]' )
			}

			if ( noFade ) {

				// Hide the input and it's label (if exists)
				$hideObject.css({ 'display': 'none' });
			} else {

				// Fade out the input and it's label (if exists)
				$hideObject.fadeOut( this.settings.duration );
			}
		}

		// Set the value of the subject if allowed by the settings
		if ( this.settings.hasOwnProperty('valueOnDisable') && this.settings.valueOnDisable !== undefined ) {
			valueSubject.val( this.settings.valueOnDisable );
		}

		// Add/remove the checked attribute of the subject if allowed by the settings
		if ( this.settings.hasOwnProperty('checkOnDisable') ) {
			if ( this.settings.checkOnDisable ) {
				valueSubject.attr( 'checked', 'checked' );
			} else {
				valueSubject.removeAttr( 'checked' );
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

})( jQuery );
