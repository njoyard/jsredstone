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
['world/blocks',
'gui/tools',
'gui/worldeditor',
'gui/loadsave',
'util/const'],
function(blocks, tools, worldeditor, loadsave, cst) {
	var Gui;

	/* Ctor */
	Gui = function (world) {
		this.world = world;
		this.world.gui = this;
		this.we = worldeditor(this);
	};
	
	Gui.prototype.keyPress = function(key) {
		var tid, tool;
		for (tid in tools) {
			if (tools.hasOwnProperty(tid)) {
				tool = tools[tid];
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
		
		/* One-shot tools */
		if (toolid === 'newtool') {
			return;
		} else if (toolid === 'loadtool') {
			loadsave.showload(this);
			return;
		} else if (toolid === 'savetool') {
			loadsave.showsave(this);
			return;
		} else if (typeof tools[toolid].editor !== 'undefined') {
			/* Deactivate previous tool */
			toolelem = document.getElementById(this.curTool);
			if (toolelem && toolelem.bg) {
				toolelem.bg.classList.remove('selected');
			}

			/* Activate new tool */
			toolelem = document.getElementById(toolid);
			if (toolelem && toolelem.bg) {
				toolelem.bg.classList.add('selected');
				this.curTool = toolid;
			}
			
			this.we.setTool(tools[toolid].editor);
		}
	};

	/* Render GUI */
	Gui.prototype.render = function() {
		var keyhandler;
		
		this.renderViewport();
		this.renderToolbar();
		
		keyhandler = (function(e) {
			var key = String.fromCharCode(e.keyCode).toUpperCase();
			this.keyPress(key);
		}).bind(this);
		document.addEventListener('keypress', function(e) { keyhandler(e); });
		
		this.startTicking();
	};

	/* Render toolbar elements */
	Gui.prototype.renderToolbar = function() {
		var tb, tool, toolchange, t, tdef, tbg, tlabel,
			ntools = 0;
		
		// Create toolbar and corners
		tb = document.createElement('div');
		tb.id = 'toolbar';
		
		t = document.createElement('div');
		t.id = 'toolbar_left';
		tb.appendChild(t);
		
		t = document.createElement('div');
		t.id = 'toolbar_right';
		tb.appendChild(t);
		
		// Create tools
		toolchange = (function(toolid) {
			this.setTool(toolid);
		}).bind(this);
		
		for (t in tools) {
			if (tools.hasOwnProperty(t)) {
				tdef = tools[t];
			
				tool = document.createElement('div');
				tool.id = t;
				tool.title = tdef.title;
				tool.classList.add('tool');
				tool.classList.add(t);
				tool.addEventListener('click', function() { toolchange(this.id); });
				
				tool.style.top = '6px';
				tool.style.left = (6 + 40*ntools) + 'px';
				
				if (typeof tdef.editor !== 'undefined') {
					tbg = document.createElement('div');
					tbg.classList.add('toolbg');
					tbg.style.top = '8px';
					tbg.style.left = (8 + 40*ntools) + 'px';
					
					tb.appendChild(tbg);
					tool.bg = tbg;
					
					if (tdef.editor.type === 'place') {
						tlabel = document.createElement('span');
						tlabel.classList.add('toollabel');
						tool.appendChild(tlabel);
						tdef.editor.placeClass.countLabel = tlabel;
					}
				}
				
				tb.appendChild(tool);
				ntools++;
			}
		}
		
		tb.style.width = (4 + 40*ntools) + 'px';
		tb.style.marginLeft = '-' + (2 + 20*ntools) + 'px';
		
		document.body.appendChild(tb);
	};

	/* Render viewport */
	Gui.prototype.renderViewport = function() {
		var vp = document.createElement('div'),
			version = document.createElement('span');

		vp.id = 'viewport';
		this.we.render(vp);
		document.body.appendChild(vp);
		
		version.id = 'version';
		version.innerText = cst.versionString;
		document.body.appendChild(version);
		
		this.status = document.createElement('span')
		this.status.id = 'status';
		document.body.appendChild(this.status);

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
