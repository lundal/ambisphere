var state = {
    id: '@id',
    scenes: [],
    stack: [],
    editScene: null,
    editVisible: false,
};

// App

var App = React.createClass({
    propTypes: {
        state: React.PropTypes.object.isRequired,
    },
    sceneById: function(id) {
        var scenes = this.props.state.scenes;
		for (var i = 0; i < scenes.length; i++) {
			if (scenes[i].id == id) {
			    return scenes[i];
			}
		}
		return null;
    },
    stackScenes: function(id) {
        var scenes = this.props.state.scenes;
        var stack = this.props.state.stack;
		var stackScenes = [];
		for (var i = 0; i < stack.length; i++) {
		    stackScenes.push(this.sceneById(stack[i]));
		}
		return stackScenes;
    },
    render: function() {
        return (
            React.createElement('div', {},
                React.createElement(Scenes, {scenes: this.props.state.scenes}),
                React.createElement(Stack, {scenes: this.stackScenes()}),
                React.createElement(EditScene, {scene: this.sceneById(this.props.state.editScene), visible: this.props.state.editVisible})
            )
        )
    }
});

var Scenes = React.createClass({
    propTypes: {
        scenes: React.PropTypes.array.isRequired
    },
    newScene: function() {
        state.scenes.push({id: guid(), title: '', color: '', image: '', size: 'cover', embed: '', audio: '', volume: 100, loop: 'false', fadein: 0, fadeout: 0});
        stateUpdated();
    },
    render: function() {
        var self = this;
        return (
            React.createElement('div', {className: 'scenes'},
                this.props.scenes.map(function(scene) {
                    return React.createElement(SceneThumbnail, {key: scene.id, scene: scene})
                }),
                React.createElement('button', {className: 'scene card', onClick: this.newScene},
                    React.createElement('i', {className: 'fa fa-plus'})
                )
            )
        )
    }
});

var SceneThumbnail = React.createClass({
    propTypes: {
        scene: React.PropTypes.object.isRequired,
    },
    onSelect: function(e) {
        state.stack.pop();
		state.stack.push(this.props.scene.id);
        stateUpdated();
    },
    onEdit: function(e) {
        e.stopPropagation();
        state.editScene = this.props.scene.id;
        state.editVisible = true;
        stateUpdated();
    },
    onBottom: function(e) {
        e.stopPropagation();
        state.stack.remove(this.props.scene.id);
		state.stack.unshift(this.props.scene.id);
        stateUpdated();
    },
    onTop: function(e) {
        e.stopPropagation();
        state.stack.remove(this.props.scene.id);
		state.stack.push(this.props.scene.id);
        stateUpdated();
    },
    render: function() {
        var scene = this.props.scene;
        var imageStyle = {
            backgroundColor: scene.color,
            backgroundImage: 'url(' + scene.image + ')',
            backgroundSize: scene.size,
        };
        return (
            React.createElement('div', {className: 'scene card clickable', onClick: this.onSelect},
                React.createElement('div', {className: 'image fill', style: imageStyle}),
                scene.embed ? React.createElement('div', {className: 'embed fill'},
                    React.createElement('i', {className: 'fa fa-code'})
                ) : null,
                React.createElement('div', {className: 'title bottom'}, format(scene.title, 'Unnamed', 20)),
                React.createElement('button', {className: 'circle micro red topright', onClick: this.onEdit},
                    React.createElement('i', {className: 'fa fa-pencil' })
                ),
                React.createElement('button', {className: 'circle micro orange bottomleft', onClick: this.onBottom},
                    React.createElement('i', {className: 'fa fa-chevron-circle-left'})
                ),
                React.createElement('button', {className: 'circle micro orange bottomright', onClick: this.onTop},
                    React.createElement('i', {className: 'fa fa-chevron-circle-right'})
                )
            )
        )
    }
});

var Stack = React.createClass({
    propTypes: {
        scenes: React.PropTypes.array.isRequired
    },
    render: function() {
        var self = this;
        return (
            React.createElement('div', {className: 'stack'},
                this.props.scenes.map(function(scene) {
                    return React.createElement(StackThumbnail, {key: scene.id, scene: scene})
                })
            )
        )
    }
});

var StackThumbnail = React.createClass({
    propTypes: {
        scene: React.PropTypes.object.isRequired,
    },
    onRemove: function(e) {
        e.stopPropagation();
        state.stack.remove(this.props.scene.id);
        stateUpdated();
    },
    onLower: function(e) {
        e.stopPropagation();
        state.stack.pushDown(this.props.scene.id);
        stateUpdated();
    },
    onRaise: function(e) {
        e.stopPropagation();
        state.stack.pushUp(this.props.scene.id);
        stateUpdated();
    },
    render: function() {
        var scene = this.props.scene;
        var imageStyle = {
            backgroundColor: scene.color,
            backgroundImage: 'url(' + scene.image + ')',
            backgroundSize: scene.size,
        };
        return (
            React.createElement('div', {className: 'scene card clickable'},
                React.createElement('div', {className: 'image fill', style: imageStyle}),
                scene.embed ? React.createElement('div', {className: 'embed fill'},
                    React.createElement('i', {className: 'fa fa-code'})
                ) : null,
                React.createElement('div', {className: 'title bottom'}, format(scene.title, 'Unnamed', 20)),
                React.createElement('button', {className: 'circle micro red topright', onClick: this.onRemove},
                    React.createElement('i', {className: 'fa fa-times' })
                ),
                React.createElement('button', {className: 'circle micro orange bottomleft', onClick: this.onLower},
                    React.createElement('i', {className: 'fa fa-chevron-circle-left'})
                ),
                React.createElement('button', {className: 'circle micro orange bottomright', onClick: this.onRaise},
                    React.createElement('i', {className: 'fa fa-chevron-circle-right'})
                )
            )
        )
    }
});

var EditScene = React.createClass({
    propTypes: {
        scene: React.PropTypes.object,
        visible: React.PropTypes.bool.isRequired,
    },
    ignore: function(e) {
        e.stopPropagation();
    },
    close: function() {
        state.editVisible = false;
        stateUpdated();
    },
    modifySceneProp: function(property) {
        var self = this;
        return function(value) {
            self.props.scene[property] = value;
            stateUpdated();
        }
    },
    deleteScene: function() {
        state.scenes.remove(this.props.scene);
        state.stack.remove(this.props.scene.id);
        state.editScene = null;
        state.editVisible = false;
        stateUpdated();
    },
    sizeOptions: [
        {value: 'cover', desc: 'Cover'},
        {value: 'contain', desc: 'Contain'},
    ],
    loopOptions: [
        {value: 'true', desc: 'Yes'},
        {value: 'false', desc: 'No'},
    ],
    render: function() {
        var scene = this.props.scene;
        var visibility = this.props.visible ? 'visible' : '';
        if (scene) {
		    return (
		        React.createElement('div', {className: 'modal ' + visibility, onClick: this.close},
		            React.createElement('div', {className: 'card edit', onClick: this.ignore},
		                React.createElement('h2', {}, 'Edit Scene'),
		                React.createElement('label', {}, 'Title', React.createElement(TextBox, {length: 50, value: scene.title, onChange: this.modifySceneProp('title'), placeholder: 'Unnamed'})),
		                React.createElement('label', {}, 'Image', React.createElement(TextBox, {length: 300, value: scene.image, onChange: this.modifySceneProp('image'), placeholder: 'URL'})),
		                React.createElement('label', {className: 'half'}, 'Background', React.createElement(TextBox, {length: 50, value: scene.color, onChange: this.modifySceneProp('color'), placeholder: 'Name / HEX / RGBA / HSLA'})),
		                React.createElement('label', {className: 'half'}, 'Size', React.createElement(SelectBox, {options: this.sizeOptions, value: scene.size, onChange: this.modifySceneProp('size')})),
		                React.createElement('label', {}, 'Embed', React.createElement(TextBox, {length: 300, value: scene.embed, onChange: this.modifySceneProp('embed'), placeholder: 'URL'})),
		                React.createElement('label', {}, 'Audio', React.createElement(TextBox, {length: 300, value: scene.audio, onChange: this.modifySceneProp('audio'), placeholder: 'URL'})),
		                React.createElement('label', {className: 'half'}, 'Volume', React.createElement(NumberBox, {max: 100, value: scene.volume, onChange: this.modifySceneProp('volume'), placeholder: '%'})),
		                React.createElement('label', {className: 'half'}, 'Repeat', React.createElement(SelectBox, {options: this.loopOptions, value: scene.loop, onChange: this.modifySceneProp('loop')})),
		                React.createElement('label', {className: 'half'}, 'Fade In', React.createElement(NumberBox, {max: 10000, value: scene.fadein, onChange: this.modifySceneProp('fadein'), placeholder: 'Milliseconds'})),
		                React.createElement('label', {className: 'half'}, 'Fade Out', React.createElement(NumberBox, {max: 10000, value: scene.fadeout, onChange: this.modifySceneProp('fadeout'), placeholder: 'Milliseconds'})),
		                React.createElement('button', {className: 'danger', onClick: this.deleteScene}, 'delete'),
		                React.createElement('button', {className: 'primary', onClick: this.close}, 'close')
		            )
		        )
		    )
        } else {
		    return (
		        React.createElement('div', {className: 'modal ' + visibility, onClick: this.close},
		            React.createElement('div', {className: 'card edit', onClick: this.ignore},
		                React.createElement('h2', {}, 'Edit Scene'),
		                React.createElement('label', {}, 'Title', React.createElement(TextBox, {length: 50, value: '', onChange: this.ignore, placeholder: 'Unnamed'})),
		                React.createElement('label', {}, 'Image', React.createElement(TextBox, {length: 300, value: '', onChange: this.ignore, placeholder: 'URL'})),
		                React.createElement('label', {className: 'half'}, 'Background', React.createElement(TextBox, {length: 50, value: '', onChange: this.ignore, placeholder: 'Name / HEX / RGBA / HSLA'})),
		                React.createElement('label', {className: 'half'}, 'Size', React.createElement(SelectBox, {options: this.sizeOptions, value: '', onChange: this.ignore})),
		                React.createElement('label', {}, 'Embed', React.createElement(TextBox, {length: 300, value: '', onChange: this.ignore, placeholder: 'URL'})),
		                React.createElement('label', {}, 'Audio', React.createElement(TextBox, {length: 300, value: '', onChange: this.ignore, placeholder: 'URL'})),
		                React.createElement('label', {className: 'half'}, 'Volume', React.createElement(NumberBox, {max: 100, value: 0, onChange: this.ignore, placeholder: '%'})),
		                React.createElement('label', {className: 'half'}, 'Repeat', React.createElement(SelectBox, {options: this.loopOptions, value: 'false', onChange: this.ignore})),
		                React.createElement('label', {className: 'half'}, 'Fade In', React.createElement(NumberBox, {max: 10000, value: 0, onChange: this.ignore, placeholder: 'Milliseconds'})),
		                React.createElement('label', {className: 'half'}, 'Fade Out', React.createElement(NumberBox, {max: 10000, value: 0, onChange: this.ignore, placeholder: 'Milliseconds'})),
		                React.createElement('button', {className: 'danger', onClick: this.ignore}, 'delete'),
		                React.createElement('button', {className: 'primary', onClick: this.close}, 'close')
		            )
		        )
		    )
        }
    }
});

// Base components

var TextBox = React.createClass({
    propTypes: {
        length: React.PropTypes.number.isRequired,
        value: React.PropTypes.string.isRequired,
        onChange: React.PropTypes.func.isRequired,
        placeholder: React.PropTypes.string,
        className: React.PropTypes.string
    },
    shouldComponentUpdate: function(nextProps, nextState) {
        return this.props.value != nextProps.value;
    },
    onChange: function(e) {
        var oldValue = this.props.value;
        var newValue = e.target.value;
        if (newValue.length > this.props.length) {
            this.props.onChange(oldValue);
            return;
        }
        this.props.onChange(newValue);
    },
    render: function() {
        return (
            React.createElement('input', {type: 'text', className: 'textbox ' + this.props.className, value: this.props.value, onChange: this.onChange, placeholder: this.props.placeholder})
        )
    }
});

var NumberBox = React.createClass({
    propTypes: {
        min: React.PropTypes.number,
        max: React.PropTypes.number,
        value: React.PropTypes.number.isRequired,
        onChange: React.PropTypes.func.isRequired,
        placeholder: React.PropTypes.string,
        className: React.PropTypes.string
    },
    getDefaultProps: function() {
        return {
            min: 0,
            max: 100,
        }
    },
    shouldComponentUpdate: function(nextProps, nextState) {
        return this.props.value != nextProps.value;
    },
    onChange: function(e) {
        var min = this.props.min;
        var max = this.props.max;
        var oldValue = this.props.value;
        var string = e.target.value;
        var value = oldValue;
        if (string === '') {
            value = Number.NaN;
        } else if (/^[0-9]+$/.test(string)) {
            value = Number.parseInt(string);
        } else if (min < 0) {
            if (string === '-') {
                value = -0;
            } else if (/^(-[1-9][0-9]*)$/.test(string)) {
                value = Number.parseInt(string);
            }
        }
        if (value > max) value = max;
        if (value < min) value = min;
        this.props.onChange(value);
    },
    stringValue: function() {
        var number = this.props.value;
        if (Number.isNaN(number)) {
            return '';
        }
        if (number == 0 && 1/number == Number.NEGATIVE_INFINITY) {
            return '-';
        }
        return '' + number;
    },
    render: function() {
        return (
            React.createElement('input', {type: 'text', className: 'numberbox ' + this.props.className, value: this.stringValue(), onChange: this.onChange, placeholder: this.props.placeholder})
        )
    }
});

var SelectBox = React.createClass({
    propTypes: {
        options: React.PropTypes.array.isRequired,
        value: React.PropTypes.string.isRequired,
        onChange: React.PropTypes.func.isRequired,
        className: React.PropTypes.string
    },
    shouldComponentUpdate: function(nextProps, nextState) {
        return this.props.value != nextProps.value;
    },
    onChange: function(e) {
        this.props.onChange(e.target.value);
    },
    render: function() {
        return (
            React.createElement('select', {className: 'selectbox ' + this.props.className, value: this.props.value, onChange: this.onChange},
                this.props.options.map(function(option, i) {
                    return React.createElement('option', {key: i, value: option.value}, option.desc);
                })
            )
        )
    }
});

// Array extensions

Array.prototype.remove = function(item) {
    var index = this.indexOf(item);
    if (index >= 0) {
        this.splice(index, 1);
    }
}

Array.prototype.pushDown = function(item) {
    var index = this.indexOf(item);
    if (index > 0) {
        var below = this[index-1];
        this[index-1] = item;
        this[index] = below;
    }
}

Array.prototype.pushUp = function(item) {
    var index = this.indexOf(item);
    if (index < this.length - 1) {
        var above = this[index+1];
        this[index+1] = item;
        this[index] = above;
    }
}

// Utility functions

function guid() {
    function r4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return r4() + r4() + '-' + r4() + r4() + '-' + r4() + r4() + '-' + r4() + r4();
}

function format(value, placeholder, length) {
    if (!value) {
        return placeholder;
    }
    if (value.length > length) {
        return value.substring(0, length-1) + '...';
    }
    return value;
}

// Interaction

function saveState() {
    aja()
        .method('put')
        .url('../api/state/' + state.id)
        .type('json')
        .body({scenes: state.scenes, stack: state.stack})
        .go();
}

function loadState() {
    aja()
        .url('../api/state/' + state.id)
        .type('json')
        .on('success', function(data) {
            state.scenes = data.scenes;
            state.stack = data.stack;
            stateUpdated();
        })
        .on('error', function(data) {
            console.log('failed');
        })
        .go();
}

function stateUpdated() {
    render();
    saveState();
}

function render() {
    ReactDOM.render(React.createElement(App, {state: state}), document.getElementById('app'));
}

document.addEventListener('DOMContentLoaded', loadState, false);

