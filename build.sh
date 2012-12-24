echo 'Start Building Project'
sencha build -p app.jsb3 -d ./
bms='../brainmapstorage/public/'
ndcp='../ndcp/node_modules/world.core'
bg='./'
cp -f index_production.html $bms/index.html
cp -f app-all.js $bms
#cp -f core/core.js $ndcp
#cp -f core/index.js $ndcp
cp -f core/core.js $bms
cp -f core/core.js $bg
cp -rf app $bms
cp -rf images $bms 
cp -rf stylesheets $bms
echo 'Copy project to ../brainmapstorage/public/ Done'