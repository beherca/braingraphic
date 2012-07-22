var A = function(a){
  this.a = a;
};
A.prototype = {
  get : function(){
    return this.a;
  }
};

module.exports = A;