var isEmpty = function(obj) {
  return obj == null || typeof (obj) == "undefined";
};

var round = function(value, accuracy){
  var e = Math.pow(10, accuracy);
  var v = (parseInt (value * e))/e;
  if((v > 0 && v < 1/e) || (v < 0 && v > -1/e)){
    v = 0;
  }
  return v;
};

/**
 * Internal Id for neuron and Synapse
 */
IID = {
  iid : 0,

  get : function() {
    return this.iid++;
  },
  // set offset
  set : function(offset) {
    offset++;
    this.iid = (this.iid < offset) ? offset : this.iid;
  },

  // reset to
  reset : function() {
    this.iid = 0;
  }
};
var Iid = function(){};
Iid.prototype = {
    iid : 0,

    get : function() {
      return this.iid++;
    },
    // set offset
    set : function(offset) {
      offset++;
      this.iid = (this.iid < offset) ? offset : this.iid;
    },

    // reset to
    reset : function() {
      this.iid = 0;
    }
}
/**
 * Origin Point
 */
OP = {
  x : 0,
  y : 0,
  add : function(x, y) {
    return {
      x : x,
      y : y
    };
  }
};

Utils = {
    apply : function(target, from){
      for(var key in from){
        target[key] = from[key];
      }
      return target;
    },
    /**
     * To get the curve path
     * 
     * @test Utils.getCurvePath({x : 0, y :0}, {x : 100, y :0}, 20, 40) "M 0 0 C 0
     *       20 30 20 50 20 S 100 20 100 0" Utils.getCurvePath({x : 0, y :0}, {x :
     *       100, y :0}, 20, 50) "M 0 0 C 0 20 25 20 50 20 S 100 20 100 0"
     *       Utils.getCurvePath({x : 0, y :0}, {x : 100, y :0}, 20, 60) "M 0 0 C 0
     *       20 20 20 50 20 S 100 20 100 0" Utils.getCurvePath({x : 0, y :0}, {x :
     *       100, y :0}, 20, 20) "M 0 0 C 0 20 40 20 50 20 S 100 20 100 0"
     *       Utils.getCurvePath({x : 0, y :0}, {x : 100, y :100}, 20, 20) "M 0 0 C
     *       0 20 40 70 50 70 S 100 70 100 100"
     * @param startP
     * @param endP
     * @param curveHeight
     * @param curveWidth
     * @returns
     */
    getCurvePath : function(startP, endP, curveHeight, curveWidth) {
      var me = this;
      var angle = me.getAngle(startP, endP, Math.PI);
      var disXY = me.getDisXY(startP, endP);
      var midPoint = {
        x : disXY / 2,
        y : curveHeight
      };
      var oringPoints = [/* P0 */OP, /* P1 */{
        x : 0,
        y : curveHeight
      },
      /* P2 */{
        x : midPoint.x - curveWidth / 2,
        y : midPoint.y
      },
      /* P3 */{
        x : midPoint.x,
        y : midPoint.y
      },
      /* P4 */{
        x : disXY,
        y : curveHeight
      }, /* P5 */OP.add(disXY, 0) ];
      var points = [];
      Ext.each(oringPoints, function(point) {
        points.push(me.rotate(point, angle, OP, startP));
      });
      var path = [ "M", points[0].x, points[0].y, "C", points[1].x, points[1].y,
          points[2].x, points[2].y, points[3].x, points[3].y, "S", points[4].x,
          points[4].y, points[5].x, points[5].y ].join(' ');
      var pathObj = {
        path : path,
        points : points
      };
      // console.log('Synapse path:'+ path);
      return pathObj;
    },

    rotate : function(point, angle, originPoint, offset) {
      offset = offset ? offset : OP;
      originPoint = originPoint ? originPoint : OP;
      var relativeX = point.x - originPoint.x;
      var relativeY = point.y - originPoint.y;
      return {
        x : relativeX * Math.cos(angle) + relativeY * Math.sin(angle) + offset.x,
        y : relativeY * Math.cos(angle) - relativeX * Math.sin(angle) + offset.y
      };
    },

    getAngle : function(startP, endP, offset) {
      var disX = this.getDisX(startP, endP);
      var disY = this.getDisY(startP, endP);
      var angle = 0;
      angle = Math.atan2(disY, -disX) + (offset > 0 ? offset : 0);
      // console.log(angle*180/3.14);
      return angle;
    },

    getDisX : function(startP, endP) {
      return endP.x - startP.x;
    },

    getDisY : function(startP, endP) {
      return endP.y - startP.y;
    },

    getDisXY : function(startP, endP) {
      var disX = this.getDisX(startP, endP);
      var disY = this.getDisY(startP, endP);
      return Math.sqrt(disX * disX + disY * disY);
    },

    /**
     * Desc : this is the util to generate triagle path
     * 
     * @param startP
     *          of angle
     * @param endP
     *          of angel
     * @param sideLength
     *          is the side length of triagle
     */
    getTriPath : function(startP, endP, sideLength) {
      var me = this;
      var pi = Math.PI;
      var angle = this.getAngle(startP, endP, pi * 0.5);// anti-clockwise 90
      // degree as offset;
      // triangle has 3 points, 1 is p0 which is origin point, p1, p2 is the rest
      var cosLengh = Math.cos(pi / 6);
      var p1 = {
        x : sideLength * 0.5,
        y : sideLength * cosLengh
      };
      var p2 = {
        x : -sideLength * 0.5,
        y : sideLength * cosLengh
      };
      var origPoints = [ OP, OP.add(p1.x, p1.y), OP.add(p2.x, p2.y) ];
      var points = [];
      Ext.each(origPoints, function(point) {
        points.push(me.rotate(point, angle, OP, startP));
      });
      var path = [ 'M', points[0].x, points[0].y, 'L', points[1].x, points[1].y,
          'L', points[2].x, points[2].y, 'z' ].join(' ');
      var pathObj = {
        path : path,
        points : points
      };
      // console.log('tri path' + path);
      return pathObj;
    }
  };