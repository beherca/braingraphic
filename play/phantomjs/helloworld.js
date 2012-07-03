var d1 = new Date();
var ttl = 0;
for(var i=0;i < 10000000; i++){
  ttl += Math.sqrt(5);
}
var d2 = new Date();
console.log(d2 - d1);
console.log(ttl);
