/* eslint-env jest, jasmine, es6 */

jest
	.unmock('jquery')
	.unmock('../src/dependency')
	.unmock('../src/dependency-set')
	.unmock('../src/dependency-collection')
	.unmock('../src/subject-controller')

const $                 = require('jquery')
const SubjectController = require('../src/subject-controller')

describe('SubjectController', () => {
	describe('or()', () => {
		it('should return the SubjectController instance', () => {
			document.body.innerHTML =
				'<input id="subject" type="text">' +
				'<input id="text-field" type="text">' +
				'<input id="check-field" type="checkbox">'

			const set1 = { '#text-field': { values: ['pass'] } }
			const set2 = { '#check-field': { checked: true } }
			const controller = new SubjectController($('#subject'), set1)

			const retVal = controller.or(set2)
			expect(retVal).toBe(controller)
		})

		it('should add a set to the collection', () => {
			document.body.innerHTML =
				'<input id="subject" type="text">' +
				'<input id="text-field" type="text">' +
				'<input id="check-field" type="checkbox">'

			const set1 = { '#text-field': { values: ['pass'] } }
			const set2 = { '#check-field': { checked: true } }
			const controller = new SubjectController($('#subject'), set1)

			expect(controller.collection.sets.length).toBe(1)
			controller.or(set2)
			expect(controller.collection.sets.length).toBe(2)
		})
	})

	describe('_enable()', () => {
		it('should remove `disabled` attr from subject when allowed', () => {
			document.body.innerHTML =
				'<input id="subject" type="text">' +
				'<input id="text-field" type="text">'

			const set = { '#text-field': { values: ['pass'] } }
			const controller = new SubjectController($('#subject'), set, {
				disable: true
			})

			expect($('#subject').is(':disabled')).toBeTruthy()
			controller._enable()
			expect($('#subject').is(':disabled')).toBeFalsy()
		})

		it('should remove `readonly` attr from subject when allowed', () => {
			document.body.innerHTML =
				'<input id="subject" type="text">' +
				'<input id="text-field" type="text">'

			const set = { '#text-field': { values: ['pass'] } }
			const controller = new SubjectController($('#subject'), set, {
				readonly: true
			})

			expect($('#subject').is('[readonly]')).toBeTruthy()
			controller._enable()
			expect($('#subject').is('[readonly]')).toBeFalsy()
		})

		it('should set value of subject when allowed', () => {
			document.body.innerHTML =
				'<input id="subject" type="text">' +
				'<input id="text-field" type="text">'

			const set = { '#text-field': { values: ['pass'] } }
			const controller = new SubjectController($('#subject'), set, {
				valueOnEnable: 'enabled'
			})

			expect($('#subject').val()).toBe('')
			controller._enable()
			expect($('#subject').val()).toBe('enabled')
		})

		it('should add `checked` attr to subject when allowed and true', () => {
			document.body.innerHTML =
				'<input id="subject" type="checkbox">' +
				'<input id="text-field" type="text">'

			const set = { '#text-field': { values: ['pass'] } }
			const controller = new SubjectController($('#subject'), set, {
				checkOnEnable: true
			})

			expect($('#subject').is(':checked')).toBeFalsy()
			controller._enable()
			expect($('#subject').is(':checked')).toBeTruthy()
		})

		it('should remove `checked` attr of subject when allowed and false', () => {
			document.body.innerHTML =
				'<input id="subject" type="checkbox" checked>' +
				'<input id="text-field" type="text">'

			const set = { '#text-field': { values: ['pass'] } }
			const controller = new SubjectController($('#subject'), set, {
				checkOnEnable: false
			})

			expect($('#subject').is(':checked')).toBeTruthy()
			controller._enable()
			expect($('#subject').is(':checked')).toBeFalsy()
		})

		it('should add a class to subject when allowed', () => {
			document.body.innerHTML =
				'<input id="subject" type="text">' +
				'<input id="text-field" type="text">'

			const set = { '#text-field': { values: ['pass'] } }
			const controller = new SubjectController($('#subject'), set, {
				toggleClass: 'enabled'
			})

			expect($('#subject').is('.enabled')).toBeFalsy()
			controller._enable()
			expect($('#subject').is('.enabled')).toBeTruthy()
		})

		it('should call the `onEnable` callback', () => {
			document.body.innerHTML =
				'<input id="subject" type="text">' +
				'<input id="text-field" type="text">'

			const set = { '#text-field': { values: ['pass'] } }
			const mockCb = jest.fn()
			const controller = new SubjectController($('#subject'), set, {
				onEnable: mockCb
			})

			controller._enable(controller.collection.sets[0].dependencies[0], new Event('change'))
			expect(mockCb.mock.calls.length).toBe(1)
			expect(mockCb.mock.calls[0][0]).toEqual(jasmine.any(Event))
		})

		it('should show the subject, if allowed, when hidden', () => {
			document.body.innerHTML =
				'<input id="subject" type="text">' +
				'<input id="text-field" type="text">'

			const set = { '#text-field': { values: ['pass'] } }
			const controller = new SubjectController($('#subject'), set, {
				hide: true
			})

			$('#subject').hide()
			expect($('#subject').is(':visible')).toBeFalsy()
			controller._enable()
			expect($('#subject').is(':visible')).toBeTruthy()
		})
	})

	describe('_disable()', () => {
		it('should add `disabled` attr to subject when allowed', () => {
			document.body.innerHTML =
				'<input id="subject" type="text">' +
				'<input id="text-field" type="text" value="pass">'

			const set = { '#text-field': { values: ['pass'] } }
			const controller = new SubjectController($('#subject'), set, {
				disable: true
			})

			expect($('#subject').is(':disabled')).toBeFalsy()
			controller._disable()
			expect($('#subject').is(':disabled')).toBeTruthy()
		})

		it('should add `readonly` attr to subject when allowed', () => {
			document.body.innerHTML =
				'<input id="subject" type="text">' +
				'<input id="text-field" type="text" value="pass">'

			const set = { '#text-field': { values: ['pass'] } }
			const controller = new SubjectController($('#subject'), set, {
				readonly: true
			})

			expect($('#subject').is('[readonly]')).toBeFalsy()
			controller._disable()
			expect($('#subject').is('[readonly]')).toBeTruthy()
		})

		it('should set value of subject when allowed', () => {
			document.body.innerHTML =
				'<input id="subject" type="text">' +
				'<input id="text-field" type="text" value="pass">'

			const set = { '#text-field': { values: ['pass'] } }
			const controller = new SubjectController($('#subject'), set, {
				valueOnDisable: 'disabled'
			})

			expect($('#subject').val()).toBe('')
			controller._disable()
			expect($('#subject').val()).toBe('disabled')
		})

		it('should add `checked` attr to subject when allowed and true', () => {
			document.body.innerHTML =
				'<input id="subject" type="checkbox">' +
				'<input id="text-field" type="text" value="pass">'

			const set = { '#text-field': { values: ['pass'] } }
			const controller = new SubjectController($('#subject'), set, {
				checkOnDisable: true
			})

			expect($('#subject').is(':checked')).toBeFalsy()
			controller._disable()
			expect($('#subject').is(':checked')).toBeTruthy()
		})

		it('should remove `checked` attr of subject when allowed and false', () => {
			document.body.innerHTML =
				'<input id="subject" type="checkbox" checked>' +
				'<input id="text-field" type="text" value="pass">'

			const set = { '#text-field': { values: ['pass'] } }
			const controller = new SubjectController($('#subject'), set, {
				checkOnDisable: false
			})

			expect($('#subject').is(':checked')).toBeTruthy()
			controller._disable()
			expect($('#subject').is(':checked')).toBeFalsy()
		})

		it('should remove a class from subject when allowed', () => {
			document.body.innerHTML =
				'<input id="subject" type="text">' +
				'<input id="text-field" type="text" value="pass">'

			const set = { '#text-field': { values: ['pass'] } }
			const controller = new SubjectController($('#subject'), set, {
				toggleClass: 'enabled'
			})

			expect($('#subject').is('.enabled')).toBeTruthy()
			controller._disable()
			expect($('#subject').is('.enabled')).toBeFalsy()
		})

		it('should call the `onDisable` callback', () => {
			document.body.innerHTML =
				'<input id="subject" type="text">' +
				'<input id="text-field" type="text" value="pass">'

			const set = { '#text-field': { values: ['pass'] } }
			const mockCb = jest.fn()
			const controller = new SubjectController($('#subject'), set, {
				onDisable: mockCb
			})

			controller._disable(controller.collection.sets[0].dependencies[0], new Event('change'))
			expect(mockCb.mock.calls.length).toBe(1)
			expect(mockCb.mock.calls[0][0]).toEqual(jasmine.any(Event))
		})

		it('should hide the subject, if allowed, when visible', () => {
			document.body.innerHTML =
				'<input id="subject" type="text">' +
				'<input id="text-field" type="text" value="pass">'

			const set = { '#text-field': { values: ['pass'] } }
			const controller = new SubjectController($('#subject'), set, {
				hide: true,
				duration: 0
			})

			expect($('#subject').is(':visible')).toBeTruthy()
			controller._disable()
			expect($('#subject').is(':visible')).toBeFalsy()
		})
	})

	describe('subject change event', () => {
		it('should fire a change event when the subject value changes', () => {
			document.body.innerHTML =
				'<input id="subject" type="text">' +
				'<input id="text-field" type="text">'

			const set = { '#text-field': { values: ['pass'] } }
			const $subject = $('#subject')
			const $textField = $('#text-field')
			const controller = new SubjectController($subject, set, {
				valueOnEnable: 'enable',
				valueOnDisable: 'disable'
			})
			const mockCb = jest.fn()

			$subject.on('change', mockCb)

			$textField.val('pass').change()
			expect(mockCb.mock.calls.length).toBe(1)
			$textField.val('fail').change()
			expect(mockCb.mock.calls.length).toBe(2)
		})

		it('should fire a change event when the subject becomes checked or unchecked', () => {
			document.body.innerHTML =
				'<input id="subject" type="checkbox">' +
				'<input id="text-field" type="text">'

			const set = { '#text-field': { values: ['pass'] } }
			const $subject = $('#subject')
			const $textField = $('#text-field')
			const controller = new SubjectController($subject, set, {
				checkOnEnable: true
			})
			const mockCb = jest.fn()

			$subject.on('change', mockCb)

			$textField.val('pass').change()
			expect(mockCb.mock.calls.length).toBe(1)
		})
	})
})
