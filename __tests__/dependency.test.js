/* eslint-env jest, es6 */

jest
	.unmock('jquery')
	.unmock('../src/dependency')
	.unmock('events')

const Dependency = require('../src/dependency')

describe('Dependency()', () => {
	afterEach(() => {
		document.body.innerHTML = ''
	})

	it('should emit a `change` event when qualified status changes', () => {
		document.body.innerHTML =
			'<input id="text-field" type="text" value="fail">'

		const textField = document.getElementById('text-field')
		const mockHandler = jest.fn()
		const dep = new Dependency('#text-field', {
			values: ['pass']
		})

		dep.on('change', mockHandler)
		dep.runCheck()
		expect(mockHandler.mock.calls.length).toBe(0)

		textField.value = 'pass'
		dep.runCheck()
		expect(mockHandler.mock.calls.length).toBe(1)
		expect(mockHandler.mock.calls[0][0].qualified).toBe(true)

		textField.value = 'fail'
		dep.runCheck()
		expect(mockHandler.mock.calls.length).toBe(2)
		expect(mockHandler.mock.calls[1][0].qualified).toBe(false)

		textField.value = 'fail again'
		dep.runCheck()
		expect(mockHandler.mock.calls.length).toBe(2)
	})

	describe('enabled()', () => {
		afterEach(() => {
			document.body.innerHTML = ''
		})

		it('should return false when disabled and param do not match', () => {
			document.body.innerHTML =
				'<input id="is-disabled" type="text" disabled>' +
				'<input id="not-disabled" type="text">'

			const depDisabled = new Dependency('#is-disabled')
			const depNotDisabled = new Dependency('#not-disabled')

			expect(depDisabled.enabled(true)).toBeFalsy()
			expect(depNotDisabled.enabled(false)).toBeFalsy()
		})

		it('should return true when disabled and param match', () => {
			document.body.innerHTML =
				'<input id="is-disabled" type="text" disabled>' +
				'<input id="not-disabled" type="text">'

			const depDisabled = new Dependency('#is-disabled')
			const depNotDisabled = new Dependency('#not-disabled')

			expect(depDisabled.enabled(false)).toBeTruthy()
			expect(depNotDisabled.enabled(true)).toBeTruthy()
		})
	})

	describe('checked()', () => {
		afterEach(() => {
			document.body.innerHTML = ''
		})

		it('should return false when checked and param do not match', () => {
			document.body.innerHTML =
				'<input id="is-checked" type="checkbox" checked>' +
				'<input id="not-checked" type="checkbox">'

			const depChecked = new Dependency('#is-checked')
			const depNotChecked = new Dependency('#not-checked')

			expect(depChecked.checked(false)).toBeFalsy()
			expect(depNotChecked.checked(true)).toBeFalsy()
		})

		it('should return true when checked and param do match', () => {
			document.body.innerHTML =
				'<input id="is-checked" type="checkbox" checked>' +
				'<input id="not-checked" type="checkbox">'

			const depChecked = new Dependency('#is-checked')
			const depNotChecked = new Dependency('#not-checked')

			expect(depChecked.checked(true)).toBeTruthy()
			expect(depNotChecked.checked(false)).toBeTruthy()
		})
	})

	describe('values()', () => {
		afterEach(() => {
			document.body.innerHTML = ''
		})

		it('should return true for a single value field only when the value is\
			in the whitelist', () => {
			document.body.innerHTML =
				'<input id="text-field1" type="text" value="two">' +
				'<select id="select-field1">' +
					'<option value="four"></option>' +
					'<option value="two"></option>' +
					'<option value="three" selected></option>' +
				'</select>' +
				'<input id="text-field2" type="text" value="five">' +
				'<select id="select-field2">' +
					'<option value="four"></option>' +
					'<option value="two"></option>' +
					'<option value="three"></option>' +
				'</select>'

			const whitelist = ['one', 'two', 'three']

			expect((new Dependency('#text-field1')).values(whitelist)).toBeTruthy()
			expect((new Dependency('#select-field1')).values(whitelist)).toBeTruthy()
			expect((new Dependency('#text-field2')).values(whitelist)).toBeFalsy()
			expect((new Dependency('#select-field2')).values(whitelist)).toBeFalsy()
		})

		it('should return true for a multiselect only when its selected values\
			are in the whitelist', () => {
			document.body.innerHTML =
				'<select id="select-field1" multiple>' +
					'<option value="one"></option>' +
					'<option value="two" selected></option>' +
					'<option value="three"></option>' +
					'<option value="four"></option>' +
				'</select>' +
				'<select id="select-field2" multiple>' +
					'<option value="one" selected></option>' +
					'<option value="two"></option>' +
					'<option value="three" selected></option>' +
					'<option value="four"></option>' +
				'</select>' +
				'<select id="select-field3" multiple>' +
					'<option value="one"></option>' +
					'<option value="two" selected></option>' +
					'<option value="three" selected></option>' +
					'<option value="four"></option>' +
				'</select>'

			const whitelist = [['one', 'two'], ['two', 'three']]

			expect((new Dependency('#select-field1')).values(whitelist)).toBeFalsy()
			expect((new Dependency('#select-field2')).values(whitelist)).toBeFalsy()
			expect((new Dependency('#select-field3')).values(whitelist)).toBeTruthy()
		})

		it('should return true for a radio group only when its checked value is\
			in the whitelist', () => {
			document.body.innerHTML =
				'<input type="radio" name="radio-field1" value="one">' +
				'<input type="radio" name="radio-field1" value="two" checked>' +
				'<input type="radio" name="radio-field1" value="three">' +
				'<input type="radio" name="radio-field1" value="four">' +

				'<input type="radio" name="radio-field2" value="one">' +
				'<input type="radio" name="radio-field2" value="two">' +
				'<input type="radio" name="radio-field2" value="three">' +
				'<input type="radio" name="radio-field2" value="four" checked>'

			const whitelist = ['one', 'two', 'three']

			expect((new Dependency('[name="radio-field1"]')).values(whitelist)).toBeTruthy()
			expect((new Dependency('[name="radio-field2"]')).values(whitelist)).toBeFalsy()
		})
	})

	describe('not()', () => {
		afterEach(() => {
			document.body.innerHTML = ''
		})

		it('should return true for a single value field only when the value is\
			not in the blacklist', () => {
			document.body.innerHTML =
				'<input id="text-field1" type="text" value="two">' +
				'<select id="select-field1">' +
					'<option value="four"></option>' +
					'<option value="two"></option>' +
					'<option value="three" selected></option>' +
				'</select>' +
				'<input id="text-field2" type="text" value="five">' +
				'<select id="select-field2">' +
					'<option value="four"></option>' +
					'<option value="two"></option>' +
					'<option value="three"></option>' +
				'</select>'

			const blacklist = ['four', 'five', 'six']

			expect((new Dependency('#text-field1')).not(blacklist)).toBeTruthy()
			expect((new Dependency('#select-field1')).not(blacklist)).toBeTruthy()
			expect((new Dependency('#text-field2')).not(blacklist)).toBeFalsy()
			expect((new Dependency('#select-field2')).not(blacklist)).toBeFalsy()
		})

		it('should return true for a multiselect only when its selected values\
			are not in the blacklist', () => {
			document.body.innerHTML =
				'<select id="select-field1" multiple>' +
					'<option value="one"></option>' +
					'<option value="two" selected></option>' +
					'<option value="three" selected></option>' +
					'<option value="four"></option>' +
				'</select>' +
				'<select id="select-field2" multiple>' +
					'<option value="one"></option>' +
					'<option value="two" selected></option>' +
					'<option value="three"></option>' +
					'<option value="four" selected></option>' +
				'</select>'

			const blacklist = [['one', 'four'], ['two', 'four']]

			expect((new Dependency('#select-field1')).not(blacklist)).toBeTruthy()
			expect((new Dependency('#select-field2')).not(blacklist)).toBeFalsy()
		})

		it('should return true for a radio group only when its checked value is\
			not in the blacklist', () => {
			document.body.innerHTML =
				'<input type="radio" name="radio-field1" value="one">' +
				'<input type="radio" name="radio-field1" value="two" checked>' +
				'<input type="radio" name="radio-field1" value="three">' +
				'<input type="radio" name="radio-field1" value="four">' +

				'<input type="radio" name="radio-field2" value="one">' +
				'<input type="radio" name="radio-field2" value="two">' +
				'<input type="radio" name="radio-field2" value="three">' +
				'<input type="radio" name="radio-field2" value="four" checked>'

			const blacklist = ['four', 'five', 'six']

			expect((new Dependency('[name="radio-field1"]')).not(blacklist)).toBeTruthy()
			expect((new Dependency('[name="radio-field2"]')).not(blacklist)).toBeFalsy()
		})
	})

	describe('match()', () => {
		afterEach(() => {
			document.body.innerHTML = ''
		})

		it('should return true for a single value field only when the value\
			matches the regex', () => {
			document.body.innerHTML =
				'<input id="text-field1" type="text" value="should pass">' +
				'<input id="text-field2" type="text" value="should fail">'

			const re = /pass$/

			expect((new Dependency('#text-field1')).match(re)).toBeTruthy()
			expect((new Dependency('#text-field2')).match(re)).toBeFalsy()
		})

		it('should return true for multiple value fields only when all the\
			values match the regex', () => {
			document.body.innerHTML =
				'<select id="select-field1" multiple>' +
					'<option value="will fail"></option>' +
					'<option value="should pass" selected></option>' +
					'<option value="will pass" selected></option>' +
				'</select>' +
				'<select id="select-field2" multiple>' +
					'<option value="should pass" selected></option>' +
					'<option value="will fail" selected></option>' +
					'<option value="will pass"></option>' +
				'</select>'

			const re = /pass$/

			expect((new Dependency('#select-field1')).match(re)).toBeTruthy()
			expect((new Dependency('#select-field2')).match(re)).toBeFalsy()
		})
	})

	describe('contains()', () => {
		afterEach(() => {
			document.body.innerHTML = ''
		})

		it('should return true for multiple value fields only when at least one\
			value is in the whitelist', () => {
			document.body.innerHTML =
				'<select id="select-field1" multiple>' +
					'<option value="one"></option>' +
					'<option value="two" selected></option>' +
					'<option value="three" selected></option>' +
				'</select>' +
				'<select id="select-field2" multiple>' +
					'<option value="one"></option>' +
					'<option value="two" selected></option>' +
					'<option value="three"></option>' +
				'</select>' +
				'<select id="select-field2" multiple>' +
					'<option value="one"></option>' +
					'<option value="two"></option>' +
					'<option value="three"></option>' +
				'</select>'

			const whitelist = ['two', 'three']

			expect((new Dependency('#select-field1')).contains(whitelist)).toBeTruthy()
			expect((new Dependency('#select-field2')).contains(whitelist)).toBeTruthy()
			expect((new Dependency('#select-field3')).contains(whitelist)).toBeFalsy()
		})
	})

	describe('email()', () => {
		afterEach(() => {
			document.body.innerHTML = ''
		})

		it('should return true only when value is a valid email address given\
			param is true', () => {
			document.body.innerHTML =
				'<input id="text-field" type="text" value="">'

			const field = document.getElementById('text-field')
			const dep = new Dependency('#text-field')

			field.value = 'test@testing.com'
			dep.runCheck()
			expect(dep.email(true)).toBeTruthy()
			field.value = 'test@testing.net'
			dep.runCheck()
			expect(dep.email(true)).toBeTruthy()
			field.value = 'test@testing.info'
			dep.runCheck()
			expect(dep.email(true)).toBeTruthy()
			field.value = 'test@testing.io'
			dep.runCheck()
			expect(dep.email(true)).toBeTruthy()
			field.value = 'test+123@testing.com'
			dep.runCheck()
			expect(dep.email(true)).toBeTruthy()

			field.value = 'test-testing.com'
			dep.runCheck()
			expect(dep.email(true)).toBeFalsy()
			field.value = 'test@test@ing.com'
			dep.runCheck()
			expect(dep.email(true)).toBeFalsy()
			field.value = 'test@testing.foobar'
			dep.runCheck()
			expect(dep.email(true)).toBeFalsy()
		})

		it('should return true only when value is not a valid email address\
			given param is false', () => {
			document.body.innerHTML =
				'<input id="text-field" type="text" value="">'

			const field = document.getElementById('text-field')
			const dep = new Dependency('#text-field')

			field.value = 'test@testing.com'
			dep.runCheck()
			expect(dep.email(false)).toBeFalsy()
			field.value = 'test@testing.net'
			dep.runCheck()
			expect(dep.email(false)).toBeFalsy()
			field.value = 'test@testing.info'
			dep.runCheck()
			expect(dep.email(false)).toBeFalsy()
			field.value = 'test@testing.io'
			dep.runCheck()
			expect(dep.email(false)).toBeFalsy()
			field.value = 'test+123@testing.com'
			dep.runCheck()
			expect(dep.email(false)).toBeFalsy()

			field.value = 'test-testing.com'
			dep.runCheck()
			expect(dep.email(false)).toBeTruthy()
			field.value = 'test@test@ing.com'
			dep.runCheck()
			expect(dep.email(false)).toBeTruthy()
			field.value = 'test@testing.foobar'
			dep.runCheck()
			expect(dep.email(false)).toBeTruthy()
		})
	})

	describe('url()', () => {
		afterEach(() => {
			document.body.innerHTML = ''
		})

		it('should return true only when value is a valid url given param\
			is true', () => {
			document.body.innerHTML =
				'<input id="text-field" type="text" value="">'

			const field = document.getElementById('text-field')
			const dep = new Dependency('#text-field')

			field.value = 'http://www.test.com'
			dep.runCheck()
			expect(dep.url(true)).toBeTruthy()
			field.value = 'https://www.test.com'
			dep.runCheck()
			expect(dep.url(true)).toBeTruthy()
			field.value = 'www.test.com'
			dep.runCheck()
			expect(dep.url(true)).toBeTruthy()

			field.value = 'htp://testing.com'
			dep.runCheck()
			expect(dep.url(true)).toBeFalsy()
			field.value = '//test.com'
			dep.runCheck()
			expect(dep.url(true)).toBeFalsy()
			field.value = 'test.com'
			dep.runCheck()
			expect(dep.url(true)).toBeFalsy()
			field.value = 'https:///test.com'
			dep.runCheck()
			expect(dep.url(true)).toBeFalsy()
		})

		it('should return true only when value is a not valid url given param\
			is false', () => {
			document.body.innerHTML =
				'<input id="text-field" type="text" value="">'

			const field = document.getElementById('text-field')
			const dep = new Dependency('#text-field')

			field.value = 'http://www.test.com'
			dep.runCheck()
			expect(dep.url(false)).toBeFalsy()
			field.value = 'https://www.test.com'
			dep.runCheck()
			expect(dep.url(false)).toBeFalsy()
			field.value = 'www.test.com'
			dep.runCheck()
			expect(dep.url(false)).toBeFalsy()

			field.value = 'htp://testing.com'
			dep.runCheck()
			expect(dep.url(false)).toBeTruthy()
			field.value = '//test.com'
			dep.runCheck()
			expect(dep.url(false)).toBeTruthy()
			field.value = 'test.com'
			dep.runCheck()
			expect(dep.url(false)).toBeTruthy()
			field.value = 'https:///test.com'
			dep.runCheck()
			expect(dep.url(false)).toBeTruthy()
		})
	})

	describe('doesQualify()', () => {
		afterEach(() => {
			document.body.innerHTML = ''
		})

		it('should return true when all qualifiers pass', () => {
			document.body.innerHTML =
				'<input id="text-field" type="text" value="should pass">'

			const dep = new Dependency('#text-field', {
				enabled: true,
				values: ['should pass']
			})

			expect(dep.doesQualify()).toBeTruthy()
		})

		it('should return false when a single qualifier fails', () => {
			document.body.innerHTML =
				'<input id="text-field" type="text" value="should pass">'

			const dep = new Dependency('#text-field', {
				enabled: true,
				values: ['should fail']
			})

			expect(dep.doesQualify()).toBeFalsy()
		})

		it('should return true when a custom qualifier passes', () => {
			document.body.innerHTML =
				'<input id="text-field" type="text" value="should pass">'

			const dep = new Dependency('#text-field', {
				custom: () => { return true }
			})

			expect(dep.doesQualify()).toBeTruthy()
		})

		it('should return false when custom qualifier fails', () => {
			document.body.innerHTML =
				'<input id="text-field" type="text" value="should pass">'

			const dep = new Dependency('#text-field', {
				custom: () => { return false }
			})

			expect(dep.doesQualify()).toBeFalsy()
		})
	})
})
