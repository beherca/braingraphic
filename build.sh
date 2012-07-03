echo 'Start Building Project'
sencha build -p app.jsb3 -d ./
target='../brainmapstorage/public'
cp -f index_production.html $target/index.html
cp -f app-all.js $target
cp -f core.js $target
cp -rf app $target
cp -rf images $target
cp -rf stylesheets $target
echo 'Copy project to ../brainmapstorage/public/ Done'
