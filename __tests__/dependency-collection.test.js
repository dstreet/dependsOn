/* eslint-env jest, es6 */

jest
	.unmock('jquery')
	.unmock('../src/dependency')
	.unmock('../src/dependency-set')
	.unmock('../src/dependency-collection')

const DependencyCollection = require('../src/dependency-collection')
const DependencySet        = require('../src/dependency-set')

describe('DependencyCollection', () => {
	afterEach(() => {
		document.body.innerHTML = ''
	})

	it('should emit a `change` event when the collection has a single set\
		and that set becomes qualified', () => {

		document.body.innerHTML =
			'<input id="text-field" type="text">' +
			'<input id="check-field" type="checkbox">'

		const textField = document.getElementById('text-field')
		const checkField = document.getElementById('check-field')
		const mockHandler = jest.fn()
		const collection = new DependencyCollection()
		const set = new DependencySet({
			'#text-field': { values: ['pass'] },
			'#check-field': { checked: true }
		})

		collection.on('change', mockHandler)
		collection.addSet(set)

		expect(collection.qualified).toBe(false)
		collection.runCheck()
		expect(mockHandler.mock.calls.length).toBe(0)

		textField.value = 'pass'
		checkField.setAttribute('checked', true)
		collection.runCheck()

		expect(mockHandler.mock.calls.length).toBe(1)
	})

	it('should emit a `change` event when the collection has a single set\
		and that set becomes unqualified', () => {

		document.body.innerHTML =
			'<input id="text-field" type="text" value="pass">' +
			'<input id="check-field" type="checkbox" checked>'

		const textField = document.getElementById('text-field')
		const mockHandler = jest.fn()
		const collection = new DependencyCollection()
		const set = new DependencySet({
			'#text-field': { values: ['pass'] },
			'#check-field': { checked: true }
		})

		collection.on('change', mockHandler)
		collection.addSet(set)

		expect(collection.qualified).toBe(true)
		collection.runCheck()
		expect(mockHandler.mock.calls.length).toBe(0)

		textField.value = 'fail'
		collection.runCheck()

		expect(collection.qualified).toBe(false)
		expect(mockHandler.mock.calls.length).toBe(1)
	})

	it('should emit a `change` event when the collection has multiple sets\
		and any set becomes qualified', () => {

		document.body.innerHTML =
			'<input id="text-field" type="text">' +
			'<input id="check-field" type="checkbox">' +
			'<select id="select-field">'+
			'	<option value="one" selected></option>'+
			'	<option value="two"></option>'+
			'</select>'

		const selectField = document.getElementById('select-field')
		const mockHandler = jest.fn()
		const collection = new DependencyCollection()
		const set1 = new DependencySet({
			'#text-field': { values: ['pass'] },
			'#check-field': { checked: true }
		})
		const set2 = new DependencySet({
			'#select-field': { not: ['one'] }
		})

		collection.on('change', mockHandler)
		collection.addSet(set1)
		collection.addSet(set2)

		expect(collection.qualified).toBe(false)
		collection.runCheck()
		expect(mockHandler.mock.calls.length).toBe(0)

		selectField.value = 'two'
		collection.runCheck()

		expect(collection.qualified).toBe(true)
		expect(mockHandler.mock.calls.length).toBe(1)
	})

	it('should emit a `change` event when the collection has multiple sets\
		and any set becomes unqualified', () => {

		document.body.innerHTML =
			'<input id="text-field" type="text">' +
			'<input id="check-field" type="checkbox">' +
			'<input id="override-field" type="checkbox" checked>'

		const overrideField = document.getElementById('override-field')
		const mockHandler = jest.fn()
		const collection = new DependencyCollection()
		const set1 = new DependencySet({
			'#text-field': { values: ['pass'] },
			'#check-field': { checked: true }
		})
		const set2 = new DependencySet({
			'#override-field': { checked: true }
		})

		collection.on('change', mockHandler)
		collection.addSet(set1)
		collection.addSet(set2)

		expect(collection.qualified).toBe(true)
		collection.runCheck()
		expect(mockHandler.mock.calls.length).toBe(0)

		overrideField.removeAttribute('checked')
		collection.runCheck()

		expect(collection.qualified).toBe(false)
		expect(mockHandler.mock.calls.length).toBe(1)
	})
})
