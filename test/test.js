describe('Initialize', function() {

	var depCollection;

	before(function() {
		$(document.body).append('\
			<form id="test-form">\
				<input type="text" id="subject">\
				<input type="text" id="dependency">\
				<input type="submit" id="submit" value="submit">\
			</form>\
		');

		depCollection = $('#subject').dependsOn({
			'#test-form': {
				enabled: true
			}
		});
	});

	after(function() {
		$('#test-form').remove();
	});

	it('should return a dependency collection', function() {
		expect(depCollection).to.be.an.instanceof(DependencyCollection);
	});

});

describe('Dependency', function() {
	describe('initialize', function() {
		var dep;

		before(function() {
			$(document.body).append('<input type="text" id="dependency">')
			dep = new Dependency('#dependency', {
				'enabled': true	
			});
		});

		after(function() {
			$('#dependency').remove();
		});

		it('should have a selector', function() {
			expect(dep).to.haveOwnProperty('selector');
			expect(dep.selector).to.equal('#dependency');
		});

		it('should have a dependency jquery object', function() {
			expect(dep).to.haveOwnProperty('$dependencyObj');
			expect(dep.$dependencyObj.attr('id')).to.equal('dependency');
		});

		it('should have qualifiers', function() {
			expect(dep).to.haveOwnProperty('qualifiers');
			expect(dep.qualifiers).to.be.an.instanceof(Object)
		});
	});

	describe('enabled(param)', function() {
		var dep;

		before(function() {
			$(document.body).append('<input type="text" id="dependency">')
			dep = new Dependency('#dependency', {
				'enabled': true	
			});
		});

		after(function() {
			$('#dependency').remove();
		});

		it('should return true if param is true and the field is enabled', function() {
			dep.$dependencyObj.prop('disabled', false);
			expect(dep.enabled(true)).to.be.true;
		});

		it('should return false if param is true the field is disabled', function() {
			dep.$dependencyObj.prop('disabled', true);
			expect(dep.enabled(true)).to.be.false;
		});

		it('should return true if param is false and the field is disabled', function() {
			dep.$dependencyObj.prop('disabled', true);
			expect(dep.enabled(false)).to.be.true;
		});

		it('should return false if param is false the field is enabled', function() {
			dep.$dependencyObj.prop('disabled', false);
			expect(dep.enabled(false)).to.be.false;
		});

		it('should qualify when enabled', function() {
			dep.$dependencyObj.prop('disabled', false);
			expect(dep.doesQualify()).to.be.true;
		});

		it('should not qualify when disabled', function() {
			dep.$dependencyObj.prop('disabled', true);
			expect(dep.doesQualify()).to.be.false;
		});
	});

	describe('checked(param)', function() {
		var dep;

		before(function() {
			$(document.body).append('<input type="checkbox" id="dependency">')
			dep = new Dependency('#dependency', {
				'checked': true	
			});
		});

		after(function() {
			$('#dependency').remove();
		});

		it('should return true if param is true and the field is checked', function() {
			dep.$dependencyObj.prop('checked', true);
			expect(dep.checked(true)).to.be.true;
		});

		it('should return false if param is true and the field is not checked', function() {
			dep.$dependencyObj.prop('checked', false);
			expect(dep.checked(true)).to.be.false;
		});

		it('should return true if param is false and the field is not checked', function() {
			dep.$dependencyObj.prop('checked', false);
			expect(dep.checked(false)).to.be.true;
		});

		it('should return false if param is false and the field is checked', function() {
			dep.$dependencyObj.prop('checked', true);
			expect(dep.checked(false)).to.be.false;
		});

		it('should qualify when checked', function() {
			dep.$dependencyObj.prop('checked', true);
			expect(dep.doesQualify()).to.be.true;
		});

		it('should not qualify when not checked', function() {
			dep.$dependencyObj.prop('checked', false);
			expect(dep.doesQualify()).to.be.false;
		});
	});

	describe('values(whitelist) with text field', function() {
		var dep;

		before(function() {
			$(document.body).append('<input type="text" id="dependency">')
			dep = new Dependency('#dependency', {
				'values': ['test', 'field', 'text']	
			});
		});

		after(function() {
			$('#dependency').remove();
		});

		it('should return true if the field value is in the array of whitelisted values', function() {
			var values = ['test', 'field', 'text'];
			dep.$dependencyObj.val('test');
			expect(dep.values(values)).to.be.true;
			dep.$dependencyObj.val('field');
			expect(dep.values(values)).to.be.true;
			dep.$dependencyObj.val('text');
			expect(dep.values(values)).to.be.true;
		});

		it('should return false if the field value is not in the array of whitelisted values', function() {
			var values = ['test', 'field', 'text'];
			dep.$dependencyObj.val('foobar');
			expect(dep.values(values)).to.be.false;
		});

		it('should qualify if field value is in the array of whitelisted values', function() {
			dep.$dependencyObj.val('text');
			expect(dep.doesQualify()).to.be.true;
		});

		it('should not qualify if field value is in the array of whitelisted values', function() {
			dep.$dependencyObj.val('foobar');
			expect(dep.doesQualify()).to.be.false;
		});
	});

	describe('values(whitelist) with radio group', function() {
		var dep;

		before(function() {
			$(document.body).append('\
				<input type="radio" name="dependency" class="r1" value="test">\
				<input type="radio" name="dependency" class="r2" value="foobar">\
			');
			dep = new Dependency('[name="dependency"]', {
				'values': ['test', 'field', 'text']	
			});
		});

		after(function() {
			$('[name="dependency"]').remove();
		});

		it('should return true if the selected radio button\'s value is in the array of whitelisted values', function() {
			var values = ['test', 'field', 'text'];
			dep.$dependencyObj.filter('.r1').prop('checked', true);
			expect(dep.values(values)).to.be.true;
		});

		it('should return false if the selected radio button\'s value is not in the array of whitelisted values', function() {
			var values = ['test', 'field', 'text'];
			dep.$dependencyObj.filter('.r2').prop('checked', true);
			expect(dep.values(values)).to.be.false;
		});

		it('should qualify if the selected radio button\'s value is in the array of whitelisted values', function() {
			dep.$dependencyObj.filter('.r1').prop('checked', true);
			expect(dep.doesQualify()).to.be.true;
		});

		it('should not qualify if the selected radio button\'s value is not in the array of whitelisted values', function() {
			dep.$dependencyObj.filter('.r2').prop('checked', true);
			expect(dep.doesQualify()).to.be.false;
		});
	});

	describe('not(param)', function() {
		var dep;

		before(function() {
			$(document.body).append('<input type="text" id="dependency">');
			$(document.body).append('\
				<input type="radio" name="radio-dependency" class="r1" value="radio-val1">\
				<input type="radio" name="radio-dependency" class="r2" value="radio-val2">\
			');
			dep = new Dependency('#dependency', {
				'not': ['test', 'field', 'text']
			});
			radioDep = new Dependency('[name="radio-dependency"]', {
				'not': ['radio-val2']
			});
		});

		after(function() {
			$('#dependency').remove();
			$('[name="radio-dependency"]').remove();
		});

		afterEach(function() {
			$('[name="radio-dependency"]').prop('checked', false);
		});

		it('should return true if the field value is not in the array of blacklisted values', function() {
			var values = ['test', 'field', 'text'];
			dep.$dependencyObj.val('foobar');
			radioDep.$dependencyObj.filter('.r1').prop('checked', true);
			expect(dep.not(values)).to.be.true;
			expect(radioDep.not(['radio-val2'])).to.be.true;
		});

		it('should return false if the field value is in the array of blacklisted values', function() {
			var values = ['test', 'field', 'text'];
			dep.$dependencyObj.val('test');
			radioDep.$dependencyObj.filter('.r2').prop('checked', true);
			expect(dep.not(values)).to.be.false;
			expect(radioDep.not(['radio-val2'])).to.be.false;
		});

		it('should qualify if the field value is not in the array of blacklisted values', function() {
			dep.$dependencyObj.val('foobar');
			radioDep.$dependencyObj.filter('.r1').prop('checked', true);
			expect(dep.doesQualify()).to.be.true;
			expect(radioDep.doesQualify()).to.be.true;
		});

		it('should not qualify if the field value is in the array of blacklisted values', function() {
			dep.$dependencyObj.val('test');
			radioDep.$dependencyObj.filter('.r2').prop('checked', true);
			expect(dep.doesQualify()).to.be.false;
			expect(radioDep.doesQualify()).to.be.false;
		});
	});

	describe('match(regex)', function() {
		var dep;

		before(function() {
			$(document.body).append('<input type="text" id="dependency">')
			dep = new Dependency('#dependency', {
				'match': /test/
			});
		});

		after(function() {
			$('#dependency').remove();
		});

		it('should return true if the field values matches the regular expression', function() {
			dep.$dependencyObj.val('test');
			expect(dep.match(/test/)).to.be.true;
		});

		it('should return false if the field values does not match the regular expression', function() {
			dep.$dependencyObj.val('foobar');
			expect(dep.match(/test/)).to.be.false;
		});

		it('should qualify if the field values matches the regular expression', function() {
			dep.$dependencyObj.val('test');
			expect(dep.doesQualify()).to.be.true;
		});

		it('should not qualify if the field values does not match the regular expression', function() {
			dep.$dependencyObj.val('foobar');
			expect(dep.doesQualify()).to.be.false;
		});
	});

	describe('contains(whitelist) with text field', function() {
		var dep;

		before(function() {
			$(document.body).append('<input type="text" id="dependency">')
			dep = new Dependency('#dependency', {
				'contains': ['test']
			});
		});

		after(function() {
			$('#dependency').remove();
		});

		it('should return true if the field value is in the array of whitelisted values', function() {
			var val = ['test'];
			dep.$dependencyObj.val('test');
			expect(dep.contains(val)).to.be.true;
		});

		it('should return false if the field value is not in the array of whitelisted values', function() {
			var val = ['test'];
			dep.$dependencyObj.val('foobar');
			expect(dep.contains(val)).to.be.false;
		});

		it('should qualify if the field value is in the array of whitelisted values', function() {
			dep.$dependencyObj.val('test');
			expect(dep.doesQualify()).to.be.true;
		});

		it('should not qualify if the field value is not in the array of whitelisted values', function() {
			dep.$dependencyObj.val('foobar');
			expect(dep.doesQualify()).to.be.false;
		});
	});

	describe('contains(whitelist) with multiple select field', function() {
		var dep;

		before(function() {
			$(document.body).append('\
				<select id="dependency" multiple>\
					<option value="test">test</option>\
					<option value="field">field</option>\
					<option value="text">text</option>\
					<option value="foobar">foobar</option>\
				</select>\
			');
			dep = new Dependency('#dependency', {
				'contains': ['test', 'text', 'field']
			});
		});

		after(function() {
			$('#dependency').remove();
		});

		it('should return true if the field has a single value that is in the whitelisted array', function() {
			var val = ['test', 'text', 'field'];
			dep.$dependencyObj.val('test');
			expect(dep.contains(val)).to.be.true;
		});

		it('should return true if the field has multiple values that are all in the whitelisted array', function() {
			var val = ['test', 'text', 'field'];
			dep.$dependencyObj.val(['test', 'field']);
			expect(dep.contains(val)).to.be.true;
		});

		it('should return true if the field has multiple values with one value in the whitelisted array', function() {
			var val = ['test', 'text', 'field'];
			dep.$dependencyObj.val(['test', 'foobar']);
			expect(dep.contains(val)).to.be.true;
		});

		it('should return false if the field has a single value that is not in the whitelisted array', function() {
			var val = ['test', 'text', 'field'];
			dep.$dependencyObj.val('foobar');
			expect(dep.contains(val)).to.be.false;
		});

		it('should qualify if the field has multiple values with one value in the whitelisted array', function() {
			dep.$dependencyObj.val(['test', 'foobar']);
			expect(dep.doesQualify()).to.be.true;
		});

		it('should not qualify if the field has a single value that is not in the whitelisted array', function() {
			dep.$dependencyObj.val('foobar');
			expect(dep.doesQualify()).to.be.false;
		});
	});

	describe('email(param)', function() {
		var dep;

		before(function() {
			$(document.body).append('<input type="text" id="dependency">')
			dep = new Dependency('#dependency', {
				'email': true
			});
		});

		after(function() {
			$('#dependency').remove();
		});

		it('should return true if the field value is a valid email address', function() {
			dep.$dependencyObj.val('test@testing.com');
			expect(dep.email(true)).to.be.true;
			dep.$dependencyObj.val('test@testing.net');
			expect(dep.email(true)).to.be.true;
			dep.$dependencyObj.val('test@testing.info');
			expect(dep.email(true)).to.be.true;
			dep.$dependencyObj.val('test@testing.io');
			expect(dep.email(true)).to.be.true;
			dep.$dependencyObj.val('test+123@testing.com');
			expect(dep.email(true)).to.be.true;
		});

		it('should return false if the field value is not a valid email address', function() {
			dep.$dependencyObj.val('test-testing.com');
			expect(dep.email(true)).to.be.false;
			dep.$dependencyObj.val('test@test@ing.com');
			expect(dep.email(true)).to.be.false;
			dep.$dependencyObj.val('test@testing.foobar');
			expect(dep.email(true)).to.be.false
		});

		it('should qualify if the field value is a valid email address', function() {
			dep.$dependencyObj.val('test@testing.com');
			expect(dep.doesQualify()).to.be.true;
		});

		it('should not qualify if the field value is not a valid email address', function() {
			dep.$dependencyObj.val('test-testing.com');
			expect(dep.doesQualify()).to.be.false;
		});
	});

	describe('url(param)', function() {
		var dep;

		before(function() {
			$(document.body).append('<input type="text" id="dependency">')
			dep = new Dependency('#dependency', {
				'url': true
			});
		});

		after(function() {
			$('#dependency').remove();
		});

		it('should return true if the field value is a valid url', function() {
			dep.$dependencyObj.val('http://www.test.com');
			expect(dep.url(true)).to.be.true;
			dep.$dependencyObj.val('https://www.test.com');
			expect(dep.url(true)).to.be.true;
			dep.$dependencyObj.val('www.test.com');
			expect(dep.url(true)).to.be.true;
		});

		it('should return false if the field value is not a valid url', function() {
			dep.$dependencyObj.val('htp://testing.com');
			expect(dep.url(true)).to.be.false;
			dep.$dependencyObj.val('//test.com');
			expect(dep.url(true)).to.be.false;
			dep.$dependencyObj.val('test.com');
			expect(dep.url(true)).to.be.false;
			dep.$dependencyObj.val('https:///test.com');
			expect(dep.url(true)).to.be.false;
		});

		it('should qualify if the field value is a valid url', function() {
			dep.$dependencyObj.val('http://www.test.com');
			expect(dep.url(true)).to.be.true;
		});

		it('should not qualify if the field value is not a valid url', function() {
			dep.$dependencyObj.val('htp://testing.com');
			expect(dep.url(true)).to.be.false;
		});
	});
});

describe('DependencySet', function() {
	describe('Initialize', function() {
		var depSet;

		before(function() {
			$(document.body).append('\
				<div id="testing">\
					<input type="text" id="dep1">\
					<input type="checkbox" id="dep2">\
					<select id="dep3">\
						<option>opt</option>\
					</select>\
				</div>\
			');
			depSet = new DependencySet({
				'#dep1': {
					enabled: true
				},
				'#dep2': {
					checked: true
				},
				'#dep3': {
					values: ['test', 'field']
				}
			});
		});

		after(function() {
			$('#testing').remove();
		});

		it('should have an array of Dendency objects', function() {
			expect(depSet).to.haveOwnProperty('dependencies');
			expect(depSet.dependencies).to.have.length(3);
			expect(depSet.dependencies[0]).to.be.instanceof(Dependency);
		});

		it('should respond to doesQualify', function() {
			expect(depSet).to.respondTo('doesQualify');
		});
	});

	describe('doesQualify()', function() {
		var depSet;

		before(function() {
			$(document.body).append('\
				<div id="testing">\
					<input type="text" id="dep1">\
					<input type="checkbox" id="dep2">\
					<select id="dep3">\
						<option>opt</option>\
					</select>\
				</div>\
			');
			depSet = new DependencySet({
				'#dep1': {
					enabled: true
				},
				'#dep2': {
					checked: true
				},
				'#dep3': {
					values: ['test', 'field']
				}
			});
		});

		after(function() {
			$('#testing').remove();
		});

		it('should return true if all the depenencies qualify', function() {
			$('#dep1').prop('disabled', false);
			$('#dep2').prop('checked', true);
			$('#dep3').val('test');
			expect(depSet.doesQualify()).to.be.true;
		});

		it('should return false if one of the dependencies does not qualify', function() {
			$('#dep2').prop('checked', false);
			expect(depSet.doesQualify()).to.be.false;
		});
	});
});

describe('DependencyCollection', function() {
	describe('Initialize', function() {
		var depColl;

		before(function() {
			$(document.body).append('\
				<div id="testing">\
					<input type="text" id="dep1">\
					<input type="checkbox" id="dep2">\
					<select id="dep3">\
						<option>opt</option>\
					</select>\
					<input type="submit" id="test-submit">\
				</div>\
			');
			depColl = new DependencyCollection($('#test-submit'), {
				'#dep1': {
					enabled: true
				},
				'#dep2': {
					checked: true
				},
				'#dep3': {
					values: ['test', 'field']
				}
			}, { hide: false });
		});

		after(function() {
			$('#testing').remove();
		});

		it('should have an array of DepenencySet objects', function() {
			expect(depColl).to.haveOwnProperty('dependencySets');
			expect(depColl.dependencySets).to.have.length(1);
			expect(depColl.dependencySets[0]).to.be.instanceof(DependencySet);
		});

		it('should set a $subject jQuery object', function() {
			expect(depColl).to.haveOwnProperty('$subject');
			expect(depColl.$subject).to.have.length.above(0);
		});

		it('should extend it\'s settings', function() {
			expect(depColl).to.haveOwnProperty('settings');
			expect(depColl.settings.hide).to.be.false;
		});

		it('should namespace the event trigger', function() {
			expect(depColl.settings.trigger).to.contain('.dependsOn');
		})
	});

	describe('addSet(set)', function() {
		var depColl;

		before(function() {
			$(document.body).append('\
				<div id="testing">\
					<input type="text" id="dep1">\
					<input type="checkbox" id="dep2">\
					<select id="dep3">\
						<option>opt</option>\
					</select>\
					<input type="submit" id="test-submit">\
				</div>\
			');
			depColl = new DependencyCollection($('#test-submit'), {
				'#dep1': {
					enabled: true
				},
				'#dep2': {
					checked: true
				}
			});
		});

		after(function() {
			$('#testing').remove();
		});

		it('should add the set the array of DependencySets', function() {
			depColl.addSet({
				'#dep3': {
					values: ['test', 'field']
				}
			});

			expect(depColl.dependencySets).to.have.length(2);
			expect(depColl.dependencySets[1]).to.be.instanceof(DependencySet);
		});

		it('should register an event handler for each dependency', function() {
			expect($._data($('#dep3')[0]).events.change[0].namespace).to.equal('dependsOn');
		});
	});

	describe('or(deps)', function() {
		var depColl;

		before(function() {
			$(document.body).append('\
				<div id="testing">\
					<input type="text" id="dep1">\
					<input type="checkbox" id="dep2">\
					<select id="dep3">\
						<option>opt</option>\
					</select>\
					<select id="dep4">\
						<option>opt</option>\
					</select>\
					<input type="submit" id="test-submit">\
				</div>\
			');
			depColl = new DependencyCollection($('#test-submit'), {
				'#dep1': {
					enabled: true
				},
				'#dep2': {
					checked: true
				}
			});
		});

		after(function() {
			$('#testing').remove();
		});

		it('should add the set to the array of DependencySets', function() {
			depColl.or({
				'#dep3': {
					values: ['test', 'field']
				}
			});

			expect(depColl.dependencySets).to.have.length(2);
			expect(depColl.dependencySets[1]).to.be.instanceof(DependencySet);
		});

		it('should return this instance of DependencyCollection', function() {
			var coll = depColl.or({
				'#dep4': {
					values: ['test', 'field']
				}
			});

			expect(coll).to.be.instanceof(DependencyCollection);
		});
	});

	describe('enable()', function() {
		var depColl;

		beforeEach(function() {
			$(document.body).append('\
				<div id="testing">\
					<input type="text" id="dep1">\
					<input type="text" id="test-input">\
					<input type="checkbox" id="test-check">\
					<input type="submit" disabled="disabled" id="test-submit">\
				</div>\
			');
		});

		afterEach(function() {
			$('#testing').remove();
		});

		it('should call the onEnable callback', function(done) {
			depColl = new DependencyCollection($('#test-submit'), {
				'#dep1': {
					values: ['test']
				}
			}, {
				onEnable: function() { done(); }
			});

			depColl.enable();
		});

		it('should show the subject if enabled by settings', function(done) {
			depColl = new DependencyCollection($('#test-submit'), {
				'#dep1': {
					values: ['test']
				}
			}, {
				hide: true
			});

			depColl.enable(true);
			setTimeout(function() {
				expect($('#test-submit').is(':visible')).to.be.true;
				done();
			}, 1);
		});

		it('should remove the disabled attribute from the subject if enabled by settings', function(done) {
			depColl = new DependencyCollection($('#test-submit'), {
				'#dep1': {
					values: ['test']
				}
			}, {
				disable: true
			});

			depColl.enable();
			setTimeout(function() {
				expect($('#test-submit').is('[disabled]')).to.be.false;
				done();
			}, 1);
		});

		it('should upate the value of the subject if enabled by settings', function(done) {
			depColl = new DependencyCollection($('#test-input'), {
				'#dep1': {
					values: ['test']
				}
			}, {
				valueOnEnable: 'testing'
			});
			
			depColl.enable();
			setTimeout(function() {
				expect($('#test-input').val()).to.equal('testing');
				done();
			}, 1);
		});

		it('should add the checked attribute to the subject if enabled by settings', function(done) {
			depColl = new DependencyCollection($('#test-check'), {
				'#dep1': {
					values: ['test']
				}
			}, {
				checkOnEnable: true
			});
			
			depColl.enable();
			setTimeout(function() {
				expect($('#test-check').is('[checked]')).to.be.true;
				done();
			}, 1);
		});

		it('should add a class to the subject if enabled by settings', function(done) {
			depColl = new DependencyCollection($('#test-submit'), {
				'#dep1': {
					values: ['test']
				}
			}, {
				toggleClass: 'enabled'
			});
			
			depColl.enable();
			setTimeout(function() {
				expect($('#test-submit').hasClass('enabled')).to.be.true;
				done();
			}, 1);
		});
	});

	describe('disable()', function() {
		var depColl;

		beforeEach(function() {
			$(document.body).append('\
				<div id="testing">\
					<input type="text" id="dep1" value="test">\
					<input type="text" id="test-input">\
					<input type="checkbox" id="test-check" checked="checked">\
					<input type="submit" class="enabled" id="test-submit">\
				</div>\
			');
		});

		afterEach(function() {
			$('#testing').remove();
		});

		it('should call the onDisable callback', function(done) {
			depColl = new DependencyCollection($('#test-submit'), {
				'#dep1': {
					values: ['test']
				}
			}, {
				onDisable: function() { done(); }
			});

			depColl.disable();
		});

		it('should add the disabled attribute from the subject if enabled by settings', function(done) {
			depColl = new DependencyCollection($('#test-submit'), {
				'#dep1': {
					values: ['test']
				}
			}, {
				disable: true
			});

			depColl.disable();
			setTimeout(function() {
				expect($('#test-submit').is('[disabled]')).to.be.true;
				done();
			}, 1);
		});

		it('should hide the subject if enabled by settings', function(done) {
			depColl = new DependencyCollection($('#test-submit'), {
				'#dep1': {
					values: ['test']
				}
			}, {
				hide: true
			});

			depColl.disable(true);
			setTimeout(function() {
				expect($('#test-submit').is(':visible')).to.be.false;
				done();
			}, 1);
		});

		it('should upate the value of the subject if enabled by settings', function(done) {
			depColl = new DependencyCollection($('#test-input'), {
				'#dep1': {
					values: ['test']
				}
			}, {
				valueOnDisable: 'testing'
			});
			
			depColl.disable();
			setTimeout(function() {
				expect($('#test-input').val()).to.equal('testing');
				done();
			}, 1);
		});

		it('should remove the checked attribute to the subject if enabled by settings', function(done) {
			depColl = new DependencyCollection($('#test-check'), {
				'#dep1': {
					values: ['test']
				}
			}, {
				checkOnDisable: false
			});
			
			depColl.disable();
			setTimeout(function() {
				expect($('#test-check').is('[checked]')).to.be.false;
				done();
			}, 1);
		});

		it('should add a class to the subject if enabled by settings', function(done) {
			depColl = new DependencyCollection($('#test-submit'), {
				'#dep1': {
					values: ['test']
				}
			}, {
				toggleClass: 'enabled'
			});
			
			depColl.disable();
			setTimeout(function() {
				expect($('#test-submit').hasClass('enabled')).to.be.false;
				done();
			}, 1);
		});
	});

});