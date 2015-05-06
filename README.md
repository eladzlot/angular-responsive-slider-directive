
###Options
Propery     | Description
----------- | -----------
min         | Maximum slider value.
max         | Minimum slider value.
steps       | How many steps the slider should be divided into. These intervals are marked with pips and the handle snaps to them (Note that the minimum value is also considered a step, so you may want one more step than you'd expect).
labels
highlight   | Show highlight to left of handle.

###Setup:

```HTML
  <div pi-slider='' model='val' pi-slider-options='{step: 5}'></div>
```
