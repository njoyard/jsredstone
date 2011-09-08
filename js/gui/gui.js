/*
This file is part of JSRedstone - A Javascript Minecraft Redstone simulator
Copyright (c) 2011 Nicolas Joyard

JSRedstone is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

JSRedstone is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with JSRedstone.  If not, see <http://www.gnu.org/licenses/>.
*/

define(
['blocks',
'gui/worldeditor',
'util/storage',
'const',
'lang/lang'],
function(blocks, WorldEditor, storage, cst, _) {
	var Gui;

	/* Ctor */
	Gui = function (world) {
		this.world = world;
		this.world.gui = this;
		this.we = new WorldEditor(this);
		this.st = storage(this);
	};

	Gui.prototype.tools = {
		newtool: { title: _.tools.clear },
		loadtool: { ttle: _.tools.store },
		shovel: { title: _.tools.erase, key: 'E' },
		br: { br: '' },
		solidtool: { title: _.tools.solid, placeClass: blocks.Solid, key: 'S' },
		rstool: { title: _.tools.wire, placeClass: blocks.Wire, key: 'W' },
		torchtool: { title: _.tools.torch, placeClass: blocks.Torch, key: 'T' },
		reptool: { title: _.tools.repeater, placeClass: blocks.Repeater, key: 'R' },
		buttontool: { title: _.tools.button, placeClass: blocks.Button, key: 'B' }
	};
	
	Gui.prototype.keyPress = function(key) {
		var tid, tool;
		for (tid in this.tools) {
			if (this.tools.hasOwnProperty(tid)) {
				tool = this.tools[tid];
				if (key === tool.key) {
					this.setTool(tid);
					return;
				}
			}
		}
	}

	/* Set current tool to toolid */
	Gui.prototype.setTool = function(toolid) {
		var toolelem;

		if (toolid === this.curTool) {
			return;
		}

		/* Deactivate previous tool */
		toolelem = document.getElementById(this.curTool);
		if (toolelem) {
			toolelem.classList.remove('selected');
		}

		/* Activate new tool */
		toolelem = document.getElementById(toolid);
		if (toolelem) {
			toolelem.classList.add('selected');
			this.curTool = toolid;
		}
	};

	/* Render GUI */
	Gui.prototype.render = function() {
		var keyhandler;
		
		this.renderToolbar();
		this.renderViewport();
		
		keyhandler = (function(e) {
			var key = String.fromCharCode(e.keyCode).toUpperCase();
			this.keyPress(key);
		}).bind(this);
		document.addEventListener('keypress', function(e) { keyhandler(e); });
		
		this.startTicking();
	};

	/* Render toolbar elements */
	Gui.prototype.renderToolbar = function() {
		var tb, tool, toolchange, t, lvl, lvlchange, sw, swhandler, lw, lwhandler;

		tb = document.createElement('div');
		tb.id = 'toolbar';

		toolchange = (function(toolid) {
			this.setTool(toolid);
		}).bind(this);

		for (t in this.tools) {
			if (this.tools.hasOwnProperty(t)) {
				if (typeof this.tools[t].br !== 'undefined') {
					tool = document.createElement('br');
					tb.appendChild(tool);
				} else {
					tool = document.createElement('div');
					tool.id = t;
					tool.title = this.tools[t].title;
					tool.classList.add('tool');
					tool.classList.add(t);
					tool.addEventListener('click', function() { toolchange(this.id); });
					tb.appendChild(tool);
				}
			}
		}

		lvl = document.createElement('input');
		lvl.type = 'range';
		lvl.min = 0; lvl.max = 7; lvl.step = 1; lvl.value = 0

		lvlchange = (function(val) {
			this.we.setLevel(val);
		}).bind(this);
		lvl.addEventListener('change', function() { lvlchange(this.value); });

		this.levelInput = lvl;
		tb.appendChild(lvl);
		
		swhandler = (function() {
			var n = window.prompt("Nom de la sauvegarde");
			
			if (!n) {
				return;
			}
			
			this.st.saveWorld(n);
		}).bind(this);
		sw = document.createElement('span');
		sw.innerHTML = "save";
		sw.addEventListener('click', function() { swhandler(); });
		tb.appendChild(sw);
		
		lwhandler = (function() {
			var n = window.prompt("Nom de la sauvegarde");
			
			if (!n) {
				return;
			}
			
			this.st.loadWorld(n);
		}).bind(this);
		lw = document.createElement('span');
		lw.innerHTML = "load";
		lw.addEventListener('click', function() { lwhandler(); });
		tb.appendChild(lw);

		document.body.appendChild(tb);
	};

	Gui.prototype.setLevelInput = function(lvl) {
		this.levelInput.value = lvl;
	};

	/* Render viewport */
	Gui.prototype.renderViewport = function() {
		var vp = document.createElement('div');

		vp.id = 'viewport';
		this.we.render(vp);
		document.body.appendChild(vp);

		this.we.setLevel(0);
		this.setTool('solidtool');
	};
	
	Gui.prototype.startTicking = function() {
		if (typeof this.tickInterval === 'undefined') {
			this.tickInterval = window.setInterval(this.world.tick.bind(this.world), cst.tickTime);
		}
	};

	return Gui;
});
