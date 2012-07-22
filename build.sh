echo 'Start Building Project'
sencha build -p app.jsb3 -d ./
bms='../brainmapstorage/public/'
ndcp='../ndcp/lib/'
cp -f index_production.html $bms/index.html
cp -f app-all.js $bms
cp -f core.js $bms
cp -f core.js $ndcp
cp -rf app $bms
cp -rf images $bms
cp -rf stylesheets $bms
echo 'Copy project to ../brainmapstorage/public/ Done'
