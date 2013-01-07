var Harness = Siesta.Harness.Browser.ExtJS;

Harness.configure({
    title       : 'Brain Test',

    preload     : [
        '../extjs/resources/css/ext-all.css',
        '../extjs/ext-all-debug.js',
        '../core.js',
        '../all-classes.js'
    ]
});

Harness.start(
    '000_blank.t.js',
    '010_brain.t.js',
    '011_cortex.t.js',
    '012_engine.t.js',
    '013_world.t.js',
    '014_ant.t.js',
    '015_observable.t.js',
    '016_looper.t.js',
    '017_class_mixin.t.js',
    '018_class_getter_setter.t.js',
    '019_utils_iider.t.js',
    '020_utils_buildq.t.js',
    '021_utils_include_exclude_apply.t.js',
    '022_utils_apply.t.js',
    '023_utils.t.js',
    '024_utils_tj.t.js',
    '025_utils_type.t.js',
    '026_utils_deepcopy.t.js'
);