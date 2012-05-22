var Harness = Siesta.Harness.Browser.ExtJS;

Harness.configure({
    title       : 'Brain Test',

    preload     : [
        '../extjs/resources/css/ext-all.css',
        '../extjs/ext-all-debug.js',
        '../brain.js',
        '../engine.js'
    ]
});

Harness.start(
    '010_brain.t.js',
    '011_cortex.t.js',
    '012_engine.t.js'
);