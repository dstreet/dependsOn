# dependsOn
[![Support](https://supporterhq.com/api/b/43xsfofk4c2xlijz6mvrx5yga/dependsOn)](https://supporterhq.com/support/43xsfofk4c2xlijz6mvrx5yga/dependsOn)

A jQuery plugin to facilitate the handling of form field dependencies.

$( subject ).dependsOn( dependencySet, [options] );

## Examples

[Demo](http://dstreet.github.com/dependsOn)

## Installation

### with npm

```
npm install --save jquery-depends-on
```

### with Bower
```
bower install --save jquery-depends-on
```

### Download directly

[Latest Release](https://github.com/dstreet/dependsOn/releases/latest)

### Build from source
```
git clone https://github.com/dstreet/dependsOn.git
cd dependsOn
npm install
gulp

# --> dist/dependsOn.min.js
```

## Usage

**Include jQuery (requires v1.7 or higher)**

```<script type="text/javascript" src="jquery/jquery-1.7.2.min.js"></script>```


**Include dependsOn**

```<script type="text/javascript" src="dependsOn.min.js"></script>```

**Add form components**

```html
<form id="myForm">
	<label for="myCheck">Check Me</label>
	<input type="checkbox" id="myCheck">

	<label for="myText">Input</label>
	<input type="text" id="myText" value="">
</form>
```

**Activate plugin**

```js
$('#myText').dependsOn({
	// The selector for the depenency
	'#myCheck': {
		// The dependency qualifiers
		enabled: true,
		checked: true
	}
});
```

## Qualifiers

* `enabled`: (Boolean) If true, then dependency must not have the "disabled" attribute.
* `checked`: (Boolean) If true, then dependency must not have the "checked" attribute. Used for checkboxes only.
* `values`: (Array) Dependency value must equal one of the provided values.
* `not`: (Array) Dependency value must not equal any of the provided values.
* `match`: (RegEx) Dependency value must match the regular expression.
* `notMatch`: (RegEx) Dependency value must not match the regular expression.
* `contains`: (Array) One of the provided values must be contained in an array of dependency values. Used for select fields with the "multiple" attribute.
* `email`: (Boolean) If true, dependency value must match an email address.
* `url`: (Boolean) If true, Dependency value must match an URL.
* `range`: (Array) Dependency value must be within the given range.
* `Custom`: (Function) Custom function which return true or false.

## Options

* `disable`: (Boolean) Add "disabled" attribute to the subject's form field. **Default**: true
* `readonly`: (Boolean) Add "readonly" attribute to the subject's form field. **Default**: false
* `hide`: (Boolean) Hide the subject on disable and reveal the subject on enable. **Default**: true
* `duration`: (Number) The time in milliseconds for the fade transition. Used only if `hide` is set to true. **Default**: 200
* `trigger`: (String) The event used to check dependencies. **Default**: 'change'
* `onEnable`: (Function) The callback function to execute when the subject has been enabled. **Default**: Empty Function
* `onDisable`: (Function) The callback function to execute when the subject has been disabled. **Default**: Empty Function
* `valueOnEnable`: (String) The value to set the subject to when enabled.
* `valueOnDisable`: (String) The value to set the subject to when disabled.
* `checkOnEnable`: (Boolean) If true, "checked" attribute will be added to subject when enabled. If false, "checked" attribute will be removed from subject when enabled. For checkboxes and radio buttons.
* `checkOnDisable`: (Boolean) If true, "checked" attribute will be added to subject when disabled. If false, "checked" attribute will be removed from subject when disabled. For checkboxes and radio buttons.
* `valueTarget`: (String) jQuery selector for the object to you want to target for editing the value. Use if you want to alter the value of something other than the subject.
* `toggleClass`: (String) The class you wish to be appended to the subject when enabled. The class will be removed when the subject is disabled.

## Callbacks

When the `onEnable` and `onDisable` callbacks are called, `this` is set to the last triggered dependency, and the function is passed two arguments:
* `e`: The triggering event object
* `$subject`: The jQuery object of the subject

## Other Libraries

* [rails_depends_on](https://github.com/francescob/rails_depends_on) - Rails Gem for dependsOn
