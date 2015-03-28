### Demo
http://viewthespace.github.io/angular-slider-directive

###Install:

```Javascript
bower install angular-slider-directive
```

###Options
```
min         : Maximum slider value.
max         : Minimum slider value.
step        : Slider values will be multiples of step. Handle snaps to these intervals.
label       : Text label
valuePrefix : Anything to be appended before the numeric value (e.g. $)
valueSuffix : Anything to be appended after the numeric value (e.g. %)
```

###Setup:

```HTML
  <div ovts-slider='' model='val' ovts-slider-options='{label: "Probability", valueSuffix: "%"}'></div>
```
