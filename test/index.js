var Harness = Siesta.Harness.Browser.ExtJS;

Harness.configure({
    title       : 'Brain Test',

    preload     : [
        '../extjs/resources/css/ext-all.css',
        '../extjs/ext-all-debug.js',
        '../all-classes.js'
    ]
});

Harness.start(
    '010_brain.t.js',
    '011_cortex.t.js',
    '012_engine.t.js',
    '013_world.t.js',
    '014_ant.t.js',
    '015_observable.t.js',
    '016_looper.t.js'
);