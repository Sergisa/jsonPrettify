var indent_str = '    ';
var indent = '';
var json = '';
var slider_max = 20;
var maximum_depth = 20;
var collapse_depth = slider_max;
var egyptian = false;
var touched = false;

function push() {
    indent += indent_str;
}


function find_depth(a, b) {
    b = (b || 0) + 1;
    if (_.isObject(a)) a = _.values(a);
    if (_.isArray(a) && a.length > 0) return _.max(_.map(a, function (a) {
        return find_depth(a, b);
    }));
    return b;
}

function update_maximim_depth(a) {
    maximum_depth = Math.max(1, find_depth(a) - 1);
    collapse_depth = _.clamp(collapse_depth, 0, maximum_depth);
    if (slider_max === maximum_depth) return;
    slider_max = maximum_depth;
    //slider.destroy();
    //createSlider();
}


function parse_json(a) {
    return eval('(' + a + ')');
}

function makePretty() {
    field.value = beautify(field.value);
    valid();
}

function makeMin() {
    field.value = minify(field.value);
    valid();
}

function minify(css) {
    try {
        return vkbeautify.cssmin(css.trim(), true);
    } catch (e) {
    }
}

function beautify(css, spaces) {
    try {
        return vkbeautify.css(css.trim(), 4);
    } catch (e) {
    }
}


function brace_changed() {
    egyptian = switch_brace.checked;
    if (switch_brace.checked) {
        field.value = field.value.replaceAll("{", "\r\n{");
    } else {
        field.value = field.value.replaceAll("\n{", "{");
    }
    //format_field();
}

function save_json() {
    var a = new Blob([field.value], {
        type: 'text/plain;charset=utf-8'
    });
    saveAs(a, 'style.css');
    return false;
}

function valid() {
    field.style.color = null;
}

function invalid() {
    field.style.color = '#FCC';
}

function focused() {
    if (!touched) {
        touched = true;
        field.value = '';
        valid();
        collapse_depth = slider_max;
    }
}

var cached_value = '';

function changed() {
    if (field.value === cached_value) return;
    cached_value = field.value;
    try {
        var a = parse_json(cached_value);
        //valid();
        update_maximim_depth(a);
    } catch (b) {
        //invalid();
    }
}

function pasted() {
    if (field.value.length === 0) setTimeout(function () {
        //slider.set(0);
        //format_field();
        //field.value = beautify(field.value);
        valid();
    }, 0);
}

function keydown(a) {
    if ((a.keyCode || a.button) !== 9) return;
    var b = field.selectionStart;
    var c = field.selectionEnd;
    field.value = field.value.substring(0, b) + indent_str + field.value.substring(c);
    field.selectionStart = field.selectionEnd = b + indent_str.length;
    a.preventDefault ? a.preventDefault() : a.returnValue = false;
}

//var slider_elem = document.getElementById('slider');
//var slider;
// createSlider();
var switch_brace = document.getElementById('switch_brace');
var switchery = new Switchery(switch_brace, {
    color: '#5DDBEA'
});
var field = document.getElementById('json_field');
//field.value = placeholder;
changed();
//valid()
