var state = {
    id: '@id',
    selected: '',
    presentation: {
        scenes: [],
        stack: [],
    }
};

var App = React.createClass({
    propTypes: {
        id: React.PropTypes.string.isRequired,
        selected: React.PropTypes.string.isRequired,
        presentation: React.PropTypes.object.isRequired,
    },
    navToEditor: function() {
        state.selected = this.props.presentation.scenes[0].id;
        stateChanged();
    },
    navToPresenter: function() {
        state.selected = '';
        stateChanged();
    },
    presentationChanged: function() {
        stateChanged();
    },
    selectionChanged: function(scene) {
        state.selected = scene.id;
        stateChanged();
    },
    sceneDeleted: function(scene) {
        var i = state.presentation.scenes.indexOf(scene.id);
        state.presentation.scenes.splice(i, 1);
        if (state.presentation.scenes.length < 1) {
            state.presentation.scenes.push(newScene());
        }
        stateChanged();
    },
    sceneAdded: function(scene) {
        state.presentation.scenes.push(scene);
        state.selected = scene.id;
        stateChanged();
    },
    sceneSwapped: function(scene) {
        var scenes = this.props.presentation.scenes;
        var i = scenes.indexOf(scene);
        if (i == 0) return;
        scenes[i] = scenes[i-1];
        scenes[i-1] = scene;
        stateChanged();
    },
    render: function() {
        return (
            React.createElement('div', {},
                React.createElement('nav', {},
                    React.createElement('button', {onClick: this.navToPresenter}, 'Presenter'),
                    React.createElement('button', {onClick: this.navToEditor}, 'Editor')
                ),
                (this.props.selected === '')
                    ? React.createElement(Presenter, { presentation: this.props.presentation, stackChanged: this.presentationChanged })
                    : React.createElement(Editor, { scenes: this.props.presentation.scenes, selected: this.props.selected, sceneChanged: this.presentationChanged, sceneDeleted: this.sceneDeleted, sceneAdded: this.sceneAdded, sceneSwapped: this.sceneSwapped, selectionChanged: this.selectionChanged })
            )
        )
    }
});

var Editor = React.createClass({
    propTypes: {
        scenes: React.PropTypes.array.isRequired,
        selected: React.PropTypes.string.isRequired,
        sceneChanged: React.PropTypes.func.isRequired,
        sceneDeleted: React.PropTypes.func.isRequired,
        sceneAdded: React.PropTypes.func.isRequired,
        sceneSwapped: React.PropTypes.func.isRequired,
        selectionChanged: React.PropTypes.func.isRequired,
    },
    render: function() {
        var scene = findScene(this.props.scenes, this.props.selected);
        return (
            React.createElement('div', {className: 'editor'},
                React.createElement(EditorScenes, { scenes: this.props.scenes, sceneSelected: this.props.selectionChanged, sceneDeleted: this.props.sceneDeleted, sceneAdded: this.props.sceneAdded, sceneSwapped: this.props.sceneSwapped}),
                React.createElement(EditScene, { scene: scene, sceneChanged: this.props.sceneChanged })
            )
        )
    }
});

var EditorScenes = React.createClass({
    propTypes: {
        scenes: React.PropTypes.array.isRequired,
        sceneSelected: React.PropTypes.func.isRequired,
        sceneDeleted: React.PropTypes.func.isRequired,
        sceneAdded: React.PropTypes.func.isRequired,
    },
    clickedMain: function(scene) {
        this.props.sceneSelected(scene);
    },
    clickedSwap: function(scene, e) {
        e.stopPropagation();
        this.props.sceneSwapped(scene);
    },
    clickedRemove: function(scene, e) {
        e.stopPropagation();
        this.props.sceneDeleted(scene);
    },
    createScene: function() {
        this.props.sceneAdded(newScene());
    },
    render: function() {
        var self = this;
        return (
            React.createElement('div', {className: 'scenes'},
                this.props.scenes.map(function(scene) {
                    return React.createElement(StackThumbnail, { key: scene.id, scene: scene, onClick: self.clickedMain, onClickSwap: self.clickedSwap, onClickRemove: self.clickedRemove })
                }),
                React.createElement('button', { className: 'overlay', onClick: self.createScene }, '+')
            )
        )
    }
});

var EditScene = React.createClass({
    propTypes: {
        scene: React.PropTypes.object.isRequired,
        sceneChanged: React.PropTypes.func.isRequired,
    },
    nameChanged: function(value) {
        this.props.scene.name = value;
        this.props.sceneChanged();
    },
    colorChanged: function(value) {
        this.props.scene.color = value;
        this.props.sceneChanged();
    },
    imageChanged: function(value) {
        this.props.scene.image = value;
        this.props.sceneChanged();
    },
    sizeChanged: function(value) {
        this.props.scene.size = value;
        this.props.sceneChanged();
    },
    fadeInChanged: function(value) {
        this.props.scene.fadeInChangedn = value;
        this.props.sceneChanged();
    },
    fadeOutChanged: function(value) {
        this.props.scene.fadeout = value;
        this.props.sceneChanged();
    },
    audioChanged: function(value) {
        this.props.scene.audio = value;
        this.props.sceneChanged();
    },
    embedChanged: function(value) {
        this.props.scene.embed = value;
        this.props.sceneChanged();
    },
    volumeChanged: function(value) {
        this.props.scene.volume = value;
        this.props.sceneChanged();
    },
    loopChanged: function(value) {
        this.props.scene.loop = (value === 'true');
        this.props.sceneChanged();
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
        return (
            React.createElement('div', {className: 'edit'},
                React.createElement('table', {},
                    React.createElement('tbody', {},
                        React.createElement('tr', {},
                            React.createElement('th', {}, 'Name'),
                            React.createElement('td', {colSpan: 3}, React.createElement(TextBox, {length: 30, value: scene.name, onChange: this.nameChanged}))
                        ),
                        React.createElement('tr', {},
                            React.createElement('th', {}, 'Image URL'),
                            React.createElement('td', {colSpan: 3}, React.createElement(TextBox, {length: 300, value: scene.image, onChange: this.imageChanged}))
                        ),
                        React.createElement('tr', {},
                            React.createElement('th', {}, 'Image Size'),
                            React.createElement('td', {}, React.createElement(SelectBox, {options: this.sizeOptions, value: scene.size, onChange: this.sizeChanged})),
                            React.createElement('th', {}, 'Background Color'),
                            React.createElement('td', {}, React.createElement(TextBox, {length: 30, value: scene.color, onChange: this.colorChanged}))
                        ),
                        React.createElement('tr', {},
                            React.createElement('th', {}, 'Embed URL'),
                            React.createElement('td', {colSpan: 3}, React.createElement(TextBox, {length: 300, value: scene.embed, onChange: this.embedChanged}))
                        ),
                        React.createElement('tr', {},
                            React.createElement('th', {}, 'Audio URL'),
                            React.createElement('td', {colSpan: 3}, React.createElement(TextBox, {length: 300, value: scene.audio, onChange: this.audioChanged}))
                        ),
                        React.createElement('tr', {},
                            React.createElement('th', {}, 'Volume (%)'),
                            React.createElement('td', {}, React.createElement(NumberBox2, {max: 100, value: scene.volume, onChange: this.volumeChanged})),
                            React.createElement('th', {}, 'Loop'),
                            React.createElement('td', {}, React.createElement(SelectBox, {options: this.loopOptions, value: ''+scene.loop, onChange: this.loopChanged}))
                        ),
                        React.createElement('tr', {},
                            React.createElement('th', {}, 'Fade In (ms)'),
                            React.createElement('td', {}, React.createElement(NumberBox2, {max: 10000, value: scene.fadein, onChange: this.fadeInChanged})),
                            React.createElement('th', {}, 'Fade Out (ms)'),
                            React.createElement('td', {}, React.createElement(NumberBox2, {max: 10000, positiveOnly: true, value: scene.fadeout, onChange: this.fadeOutChanged}))
                        )
                    )
                )
            )
        )
    }
});

var Presenter = React.createClass({
    propTypes: {
        presentation: React.PropTypes.object.isRequired,
        stackChanged: React.PropTypes.func.isRequired,
    },
    sceneSelected: function(scene, position) {
        //console.log(scene.id);
        var stack = this.props.presentation.stack;
        if (stack.indexOf(scene.id) !== -1) {
            return;
        }
        //console.log(stack)
        if (position === 'first') {
            //console.log('first')
            stack.unshift(scene.id);
        } else if (position === 'last') {
            //console.log('last')
            stack.push(scene.id);
        } else {
            //console.log('top')
            stack.pop();
            stack.push(scene.id);
        }
        //console.log(stack)
        this.props.stackChanged();
    },
    swapInStack: function(scene) {
        var stack = this.props.presentation.stack;
        var i = stack.indexOf(scene.id);
        if (i == 0) return;
        stack[i] = stack[i-1];
        stack[i-1] = scene.id;
        this.props.stackChanged();
    },
    removeFromStack: function(scene) {
        var stack = this.props.presentation.stack;
        var i = stack.indexOf(scene.id);
        stack.splice(i, 1);
        this.props.stackChanged();
    },
    render: function() {
        return (
            React.createElement('div', {className: 'presenter'},
                React.createElement(Scenes, { scenes: this.props.presentation.scenes, sceneSelected: this.sceneSelected }),
                React.createElement(Stack, { scenes: buildSceneStack(this.props.presentation.scenes, this.props.presentation.stack), swapInStack: this.swapInStack, removeFromStack: this.removeFromStack })
            )
        )
    }
});

var Scenes = React.createClass({
    propTypes: {
        scenes: React.PropTypes.array.isRequired,
        sceneSelected: React.PropTypes.func.isRequired,
    },
    clickedMain: function(scene) {
        this.props.sceneSelected(scene, 'top');
    },
    clickedLeft: function(scene, e) {
        e.stopPropagation();
        this.props.sceneSelected(scene, 'first');
    },
    clickedRight: function(scene, e) {
        e.stopPropagation();
        this.props.sceneSelected(scene, 'last');
    },
    render: function() {
        var self = this;
        return (
            React.createElement('div', {className: 'scenes'},
                this.props.scenes.map(function(scene) {
                    return React.createElement(SceneThumbnail, { key: scene.id, scene: scene, onClick: self.clickedMain, onClickLeft: self.clickedLeft, onClickRight: self.clickedRight })
                })
            )
        )
    }
});

var SceneThumbnail = React.createClass({
    propTypes: {
        scene: React.PropTypes.object.isRequired,
        onClick: React.PropTypes.func.isRequired,
        onClickLeft: React.PropTypes.func.isRequired,
        onClickRight: React.PropTypes.func.isRequired,
    },
    render: function() {
        var scene = this.props.scene;
        var thumbstyle = {
            backgroundColor: scene.color,
            backgroundImage: 'url(' + scene.image + ')',
            backgroundSize: scene.size
        };
        return (
            React.createElement('figure', {onClick: this.props.onClick.bind(null, scene)},
                React.createElement('div', {className: 'thumbnail', style: thumbstyle},
                    React.createElement('button', {className: 'overlay topleft', onClick: this.props.onClickLeft.bind(null, scene)}, '⇤'),
                    React.createElement('button', {className: 'overlay topright', onClick: this.props.onClickRight.bind(null, scene)}, '⇥'),
                    React.createElement('div', {className: 'overlay bottomleft' + (scene.audio ? '' : ' hidden')}, '♬'),
                    React.createElement('div', {className: 'overlay bottomright' + (scene.embed ? '' : ' hidden')}, '⚀')
                ),
                React.createElement('figcaption', {}, scene.name ? scene.name : '<unnamed>')
            )
        )
    }
});

var Stack = React.createClass({
    propTypes: {
        scenes: React.PropTypes.array.isRequired,
        swapInStack: React.PropTypes.func.isRequired,
        removeFromStack: React.PropTypes.func.isRequired,
    },
    clickedSwap: function(scene, e) {
        e.stopPropagation();
        this.props.swapInStack(scene);
    },
    clickedRemove: function(scene, e) {
        e.stopPropagation();
        this.props.removeFromStack(scene);
    },
    render: function() {
        var self = this;
        return (
            React.createElement('div', {className: 'stack'},
                this.props.scenes.map(function(scene) {
                    return React.createElement(StackThumbnail, { key: scene.id, scene: scene, onClick: function() {}, onClickSwap: self.clickedSwap, onClickRemove: self.clickedRemove })
                })
            )
        )
    }
});

var StackThumbnail = React.createClass({
    propTypes: {
        scene: React.PropTypes.object.isRequired,
        onClick: React.PropTypes.func.isRequired,
        onClickSwap: React.PropTypes.func.isRequired,
        onClickRemove: React.PropTypes.func.isRequired,
    },
    render: function() {
        var scene = this.props.scene;
        var thumbstyle = {
            backgroundColor: scene.color,
            backgroundImage: 'url(' + scene.image + ')',
            backgroundSize: scene.size
        };
        return (
            React.createElement('figure', {onClick: this.props.onClick.bind(null, scene)},
                React.createElement('div', {className: 'thumbnail', style: thumbstyle},
                    React.createElement('button', {className: 'overlay topleft', onClick: this.props.onClickSwap.bind(null, scene)}, '⇆'),
                    React.createElement('button', {className: 'overlay topright', onClick: this.props.onClickRemove.bind(null, scene)}, '✕'),
                    React.createElement('div', {className: 'overlay bottomleft' + (scene.audio ? '' : ' hidden')}, '♬'),
                    React.createElement('div', {className: 'overlay bottomright' + (scene.embed ? '' : ' hidden')}, '⚀')
                ),
                React.createElement('figcaption', {}, scene.name ? scene.name : '<unnamed>')
            )
        )
    }
});


// General components

var TextBox = React.createClass({
    propTypes: {
        length: React.PropTypes.number.isRequired,
        value: React.PropTypes.string.isRequired,
        onChange: React.PropTypes.func.isRequired,
        className: React.PropTypes.string
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
        var css = this.props.className ? ' ' + this.props.className : '';
        return (
            React.createElement('input', {type: 'text', className: 'input textbox' + css, value: this.props.value, onChange: this.onChange})
        )
    }
});

var NumberBox = React.createClass({
    propTypes: {
        length: React.PropTypes.number.isRequired,
        value: React.PropTypes.number.isRequired,
        onChange: React.PropTypes.func.isRequired,
        positiveOnly: React.PropTypes.bool,
        className: React.PropTypes.string
    },
    onChange: function(e) {
        var oldValue = this.props.value;
        var string = e.target.value;
        if (string === '') {
            this.props.onChange(Number.NaN);
            return;
        }
        if (string.length > this.props.length) {
            this.props.onChange(oldValue);
            return;
        }
        if (this.props.positiveOnly) {
            if(/^[0-9]+$/.test(string)) {
                this.props.onChange(Number.parseInt(string));
                return;
            }
        } else {
            if (string === '-') {
                this.props.onChange(-0);
                return;
            }
            if(/^([0-9]+|-[1-9][0-9]*)$/.test(string)) {
                this.props.onChange(Number.parseInt(string));
                return;
            }
        }
        this.props.onChange(oldValue);
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
        var css = this.props.className ? ' ' + this.props.className : '';
        return (
            React.createElement('input', {type: 'text', className: 'input numberbox' + css, value: this.stringValue(), onChange: this.onChange})
        )
    }
});

var NumberBox2 = React.createClass({
    propTypes: {
        min: React.PropTypes.number,
        max: React.PropTypes.number,
        value: React.PropTypes.number.isRequired,
        onChange: React.PropTypes.func.isRequired,
        className: React.PropTypes.string
    },
    getDefaultProps: function() {
        return {
            min: 0,
            max: 100,
        }
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
        var css = this.props.className ? ' ' + this.props.className : '';
        return (
            React.createElement('input', {type: 'text', className: 'input numberbox' + css, value: this.stringValue(), onChange: this.onChange})
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
        var css = this.props.className ? ' ' + this.props.className : '';
        return (
            React.createElement('select', {className: 'input selectbox' + css, value: this.props.value, onChange: this.onChange},
                this.props.options.map(function(option, i) {
                    return React.createElement('option', {key: i, value: option.value}, option.desc);
                })
            )
        )
    }
});

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + s4() + '-' + s4() + s4() + '-' + s4() + s4();
}

// Functions

function newScene() {
    return {
        id: guid(),
        name: '',
        image: '',
        size: 'cover',
        color: '#000000',
        embed: '',
        audio: '',
        volume: 1,
        loop: true,
        fadein: 1000,
        fadeout: 1000,
    };
}

function buildSceneStack(scenes, stack) {
    var sceneStack = [];
    for (var i = 0; i < stack.length; i++) {
        sceneStack.push(findScene(scenes, stack[i]));
    }
    return sceneStack;
}

function findScene(scenes, id) {
    for (var i = 0; i < scenes.length; i++) {
        if (scenes[i].id == id) {
            return scenes[i];
        }
    }
    return null;
}

function stateChanged() {
    renderApp();
    aja()
        .method('put')
        .url('../api/state/' + state.id)
        .type('json')
        .body(state.presentation)
        .go();
}

function startApp() {
    aja()
        .url('../api/state/' + state.id)
        .type('json')
        .on('success', function(data) {
            state.presentation = data;
            if (state.presentation.scenes.length < 1) {
                state.presentation.scenes.push(newScene());
            }
            renderApp();
        })
        .on('error', function(data) {
            console.log('failed');
            renderApp();
        })
        .go();
}

function renderApp() {
    ReactDOM.render(React.createElement(App, state), document.getElementById('app'));
}

document.addEventListener('DOMContentLoaded', startApp, false);
