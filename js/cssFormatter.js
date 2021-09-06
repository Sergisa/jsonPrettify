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

function pop() {
    indent = indent.substr(0, indent.length - indent_str.length);
}

function emit_line(a, b) {
    json += (b ? ' ' : (json ? '\n' : '') + indent) + a;
}

function emit_comma() {
    json += ',';
}

function emit_colon() {
    json += ':';
}

function emit_jso(a, b, c) {
    if (c >= collapse_depth) emit_line(JSON.stringify(a), b);
    else if (_.isArray(a)) {
        if (a.length == 0) return emit_line('[]', b);
        emit_line('[', egyptian && b);
        push();
        for (var d = 0; d < a.length; ++d) {
            d && emit_comma();
            emit_jso(a[d], false, c + 1);
        }
        pop();
        emit_line(']', false);
    } else if (_.isObject(a)) {
        if (_.isEmpty(a)) return emit_line('{}', b);
        emit_line('{', egyptian && b);
        push();
        var d = 0;
        for (key in a) {
            if (!a.hasOwnProperty(key)) continue;
            d && emit_comma();
            emit_line(JSON.stringify(key), false);
            emit_colon();
            emit_jso(a[key], true, c + 1);
            d++;
        }
        pop();
        emit_line('}', false);
    } else emit_line(JSON.stringify(a), b);
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


function format_json(a) {
    try {
        indent = json = '';
        emit_jso(a, false, 0);
        return json;
    } catch (b) {
        console && console.log && console.log(b.toString());
    }
}

function parse_json(a) {
    return eval('(' + a + ')');
}

function makePretty() {
    field.value = minify(field.value);
    valid();
}

function makeMin() {
    field.value = beautify(field.value);
    valid();
}

function minify(css) {
    var txt0;
    try {
        //txt0.value = vkbeautify.cssmin(txt0.value, true);
        txt0 = vkbeautify.cssmin(css);
    } catch (e) {

    }
    return txt0;
}

function beautify(css, spaces) {
    var txt0;
    try {
        txt0 = vkbeautify.css(css, 1);
        //txt0 = vkbeautify.css(vkbeautify.cssmin(css, true), spaces);
    } catch (e) {
    }
    return txt0;
}

function format_field() {
    try {
        valid();
        field.value = format_json(parse_json(field.value));
    } catch (a) {
        invalid();
        console.log(a.toString());
    }
}

function max_depth() {
    if ((0 | slider.get()) === 0) format_field();
    else //slider.set(0);
    return false;
}

function min_depth() {
    if ((0 | slider.get()) === slider_max) format_field();
    else //slider.set(slider_max);
    return false;
}

function add_depth(a) {
    collapse_depth += a;
    format_field();
    return false;
}

function brace_changed() {
    egyptian = switch_brace.checked;
    format_field();
}

function slider_changed() {
    var a = 1 - _.clamp(slider.get() / slider_max, 0, 1);
    a = 0 | Math.round(a * maximum_depth);
    a = _.clamp(a, 0, maximum_depth);
    if (collapse_depth != a) {
        collapse_depth = a;
        format_field();
    }
}

function save_json() {
    var a = new Blob([field.value], {
        type: 'text/plain;charset=utf-8'
    });
    saveAs(a, 'pretty.json');
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
        valid();
        update_maximim_depth(a);
    } catch (b) {
        invalid();
    }
}

function pasted() {
    if (field.value.length === 0) setTimeout(function () {
        //slider.set(0);
        //format_field();
        //field.value = beautify(field.value);
        //valid();
    }, 0);
}

function keydown(a) {
    if ((a.keyCode || a.which) !== 9) return;
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
var placeholder = format_json({
    'json-prettify': {
        'instructions': [
            'Click anywhere and Paste some JSON...'
        ]
    }
});
var field = document.getElementById('json_field');
field.value = placeholder;
changed();
