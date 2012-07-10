var d1 = new Date();
var ttl = 0;
for(var i=0;i < 1000000000; i++){
  ttl += Math.sqrt(5);
}
var d2 = new Date();
console.log(d2 - d1);
console.log(ttl);//1152 - a thousand times better than browser 
