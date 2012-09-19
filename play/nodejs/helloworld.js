var b = require('./moduleclass');
var Core = require('../../core');
var a = new b('ok');
console.log(a.get());
console.log(Core);
var i = Core.World.create({iid: 20});
console.log(i.iid);
console.log(Core.Utils.isEmpty);