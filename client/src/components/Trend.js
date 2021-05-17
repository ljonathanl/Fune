import { h } from 'vue'

function int(value) {
  return parseInt(value, 10)
}

/**
 * https://en.wikipedia.org/wiki/Collinearity
 * x=(x1+x2)/2
 * y=(y1+y2)/2
 */
function checkCollinear(p0, p1, p2) {
  return (
    int(p0.x + p2.x) === int(2 * p1.x) && int(p0.y + p2.y) === int(2 * p1.y)
  )
}

function getDistance(p1, p2) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
}

function moveTo(to, from, radius) {
  var vector = { x: to.x - from.x, y: to.y - from.y };
  var length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  var unitVector = { x: vector.x / length, y: vector.y / length };

  return {
    x: from.x + unitVector.x * radius,
    y: from.y + unitVector.y * radius
  }
}

/**
 *  Calculate the coordinate
 * @param  {number[]|object[]}  arr
 * @param  {object}             boundary
 * @return {object[]}
 */
function genPoints(data, ref, ref$1) {
  var minX = ref.minX;
  var minY = ref.minY;
  var maxX = ref.maxX;
  var maxY = ref.maxY;
  var max = ref$1.max;
  var min = ref$1.min;

  var arr = data.map(function (item) { return (!isNaN(item) ? item : 0); });
  var minValue = Math.min.apply(Math, arr.concat([min])) - 0.001;
  var gridX = (maxX - minX) / (arr.length - 1);
  var gridY = (maxY - minY) / (Math.max.apply(Math, arr.concat([max])) + 0.001 - minValue);

  return arr.map(function (value, index) {
    return {
      x: index * gridX + minX,
      y:
        maxY -
        (value - minValue) * gridY +
        +(index === arr.length - 1) * 0.00001 -
        +(index === 0) * 0.00001
    }
  })
}

/**
 * From https://github.com/unsplash/react-trend/blob/master/src/helpers/DOM.helpers.js#L18
 */
function genPath(points, radius) {
  var start = points.shift();

  return (
    "M" + (start.x) + " " + (start.y) +
    points
      .map(function (point, index) {
        var next = points[index + 1];
        var prev = points[index - 1] || start;
        var isCollinear = next && checkCollinear(next, point, prev);

        if (!next || isCollinear) {
          return ("L" + (point.x) + " " + (point.y))
        }

        var threshold = Math.min(
          getDistance(prev, point),
          getDistance(next, point)
        );
        var isTooCloseForRadius = threshold / 2 < radius;
        var radiusForPoint = isTooCloseForRadius ? threshold / 2 : radius;

        var before = moveTo(prev, point, radiusForPoint);
        var after = moveTo(next, point, radiusForPoint);

        return ("L" + (before.x) + " " + (before.y) + "S" + (point.x) + " " + (point.y) + " " + (after.x) + " " + (after.y))
      })
      .join('')
  )
}

var Path = {
  props: ['smooth', 'data', 'boundary', 'radius', 'id', 'max', 'min', 'color', 'dash'],

  render: function render() {
    var ref = this;
    var data = ref.data;
    var smooth = ref.smooth;
    var boundary = ref.boundary;
    var radius = ref.radius;
    var id = ref.id;
    var max = ref.max;
    var min = ref.min;
    var dash = ref.dash
    var points = genPoints(data, boundary, { max: max, min: min });
    var d = genPath(points, smooth ? radius : 0);

    var strokeValue;
    if (this.color) {
      strokeValue = this.color;
    } else {
      strokeValue = "url(#" + id + ")";
    }

    return h('path', {
      d: d, fill: 'none', stroke: strokeValue, 'stroke-dasharray': dash
    })
  }
};

var Background = {
  props: ['boundary', 'max', 'min', 'xUnit', 'yUnit'],

  render: function render() {
    var boundary = this.boundary;

    return [
      h('text', {
        x: boundary.minX,
        y: boundary.minY - 3,
        fill: '#EEEEEEBB',
        'font-size': '0.6em'
      }, Math.round(this.max / 1000) + ' ' + this.yUnit),
      h('text', {
        x: boundary.minX,
        y: boundary.maxY - 2,
        fill: '#EEEEEEBB',
        'font-size': '0.6em'
      }, Math.round(this.min / 1000)),
      h('text', {
        x: boundary.maxX,
        y: boundary.maxY - 2,
        width: 100,
        fill: '#EEEEEEBB',
        style: {'text-anchor': 'end'},
        'font-size': '0.6em'
      }, this.xUnit),
      h('line', {
        x1: boundary.minX,
        y1: boundary.minY,
        x2: boundary.maxX,
        y2: boundary.minY,
        stroke: '#EEEEEEBB'
      }),
      h('line', {
        x1: boundary.minX,
        y1: boundary.maxY,
        x2: boundary.maxX,
        y2: boundary.maxY,
        stroke: '#EEEEEEBB'
      })
    ]
  }
};

var Gradient = {
  props: ['gradient', 'gradientDirection', 'id'],

  render: function render() {
    var ref = this;
    var gradient = ref.gradient;
    var gradientDirection = ref.gradientDirection;
    var id = ref.id;
    var len = gradient.length - 1 || 1;
    var stops = gradient
      .slice()
      .reverse()
      .map(function (color, index) {
        return h('stop', {
          offset: index / len,
          'stop-color': color
        });
      }
      );

    return h('defs', [
      h(
        'linearGradient', {
        id: id,
        /*
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 1
        */
        x1: +(gradientDirection === 'left'),
        y1: +(gradientDirection === 'top'),
        x2: +(gradientDirection === 'right'),
        y2: +(gradientDirection === 'bottom')
      },
        stops
      )
    ])
  }
};

var Trend = {
  name: 'Trend',

  props: {
    data: {
      type: Array,
      required: true
    },
    autoDraw: Boolean,
    autoDrawDuration: {
      type: Number,
      default: 2000
    },
    autoDrawEasing: {
      type: String,
      default: 'ease'
    },
    gradient: {
      type: Array,
      default: function () { return ['#000']; }
    },
    gradientDirection: {
      type: String,
      default: 'top'
    },
    max: {
      type: Number,
      default: -Infinity
    },
    min: {
      type: Number,
      default: Infinity
    },
    height: Number,
    width: Number,
    padding: {
      type: Number,
      default: 8
    },
    radius: {
      type: Number,
      default: 10
    },
    smooth: Boolean,
    xUnit: {
      type: String,
      default: ''
    },
    yUnit: {
      type: String,
      default: ''
    }
  },

  watch: {
    data: {
      immediate: true,
      handler: function handler(val) {
        var this$1 = this;

        this.$nextTick(function () {
          if (this$1.$isServer || !this$1.$refs.path || !this$1.autoDraw) {
            return
          }

          var path = this$1.$refs.path.$el;
          var length = path.getTotalLength();

          path.style.transition = 'none';
          path.style.strokeDasharray = length + ' ' + length;
          path.style.strokeDashoffset = Math.abs(
            length - (this$1.lastLength || 0)
          );
          path.getBoundingClientRect();
          path.style.transition = "stroke-dashoffset " + (this$1.autoDrawDuration) + "ms " + (this$1.autoDrawEasing);
          path.style.strokeDashoffset = 0;
          this$1.lastLength = length;
        });
      }
    }
  },

  render: function render() {
    if (!this.data || this.data.length < 2) { return }
    var width = this.width;
    var height = this.height;
    var padding = this.padding;
    var viewWidth = width || 300;
    var viewHeight = height || 150;
    var boundary = {
      minX: padding,
      minY: padding,
      maxX: viewWidth - padding,
      maxY: viewHeight - padding
    };

    return h(
      'svg', {
      width: width || '100%',
      height: height || '25%',
      viewBox: ("0 0 " + viewWidth + " " + viewHeight)
    },
      [
        h(Gradient, {
          gradient: this.gradient,
          gradientDirection: this.gradientDirection,
          id: 'stats',
        }),
        h(Background, {
          boundary: boundary,
          max: Math.max.apply(Math, this.data.concat([this.max])),
          min: Math.min.apply(Math, this.data.concat([this.min])),
          xUnit: this.xUnit,
          yUnit: this.yUnit
        }),
        h(Path, {
          smooth: this.smooth,
          data: this.data,
          boundary: boundary,
          radius: this.radius,
          max: this.max,
          min: this.min,
          id: 'stats',
          ref: 'path',
          dash: '0'
        })
      ]
    )
  }
};

var Trends = {
  name: 'Trends',

  props: {
    data: {
      type: Array,
      required: true
    },
    colors: {
      type: Array,
      required: true
    },
    min: {
      type: Number,
      default: Infinity
    },
    height: Number,
    width: Number,
    padding: {
      type: Number,
      default: 8
    },
    radius: {
      type: Number,
      default: 10
    },
    smooth: Boolean,
    xUnit: {
      type: String,
      default: ''
    },
    yUnit: {
      type: String,
      default: ''
    }
  },

  render: function render() {
    if (!this.data) { return }
    var width = this.width;
    var height = this.height;
    var padding = this.padding;
    var viewWidth = width || 300;
    var viewHeight = height || 200;
    var boundary = {
      minX: padding,
      minY: padding,
      maxX: viewWidth - padding,
      maxY: viewHeight - padding
    };

    var max = 1000;
    for (let i = 0; i < this.data.length; i++) {
      const element = this.data[i];
      if (element && element.length > 1) {
        for (let j = 0; j < element.length; j++) {
          max = Math.max(max, element[j])
        }
      }
    }

    var paths = [];
    for (let index = 0; index < this.data.length; index++) {
      const element = this.data[index];
      if (element && element.length > 1) {
        paths.push(
          h(Path, {
            smooth: this.smooth,
            data: element,
            boundary: boundary,
            radius: this.radius,
            max: max,
            min: this.min,
            id: 'stats',
            ref: 'path' + index,
            color: this.colors[index],
            dash: index == this.data.length - 1 ? '2 2' : '0'
          })
        )
      }
    }

    if (paths.length == 0) {
      return
    }

    return h(
      'svg', {
      width: width || '100%',
      height: height || '25%',
      viewBox: ("0 0 " + viewWidth + " " + viewHeight)
    },
      [
        paths,
        h(Background, {
          boundary: boundary,
          max: max,
          min: this.min,
          xUnit: this.xUnit,
          yUnit: this.yUnit
        }),
      ]
    )
  }
};


export {
  Trend,
  Trends
}
