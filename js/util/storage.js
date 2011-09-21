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

define(["world/blocks", "util/const"],
function(blocks, cst) {
	var storage = {};
	
	storage.getWorldString = function(gui) {
		var state = gui.we.saveState();
		return JSON.stringify(state).replace(/"/g, '');
	};
	
	storage.restoreWorld = function(gui, statestring) {
		var state;
		
		// Restore quotes
		ss = statestring.
			replace(/([a-zA-Z_][a-zA-Z0-9_]*):/g, '"$1":').
			replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, ':"$1"').
			replace(/,([a-zA-Z_][a-zA-Z0-9_]*)/g, ',"$1"');;
		gui.we.restoreState(JSON.parse(ss));
	};
	
	storage.getSavedWorlds = function() {
		var wl = localStorage.getItem(cst.storage.worldList);
		
		if (typeof wl === 'undefined' || wl === null) {
			return [];
		} else {
			return JSON.parse(wl);
		}
	};
	
	storage.saveWorld = function(gui, name) {
		var wlist = this.getSavedWorlds();
		
		// Save world
		localStorage.setItem(cst.storage.worldPrefix + name, this.getWorldString(gui));
			
		// Add to world list
		if (wlist.indexOf(name) === -1) {
			wlist.push(name);
			localStorage.setItem(cst.storage.worldList, JSON.stringify(wlist));
		}
	};
	
	storage.loadWorld = function(gui, name) {
		var wlist = this.getSavedWorlds(),
			world, i, len, typ;
		
		if (wlist.indexOf(name) === -1) {
			return;
		}
		this.restoreWorld(gui, localStorage.getItem(cst.storage.worldPrefix + name));
	};
	
	storage.deleteWorld = function(name) {
		var wlist = this.getSavedWorlds(),
			idx = wlist.indexOf(name);
		
		if (idx !== -1) {
			localStorage.removeItem(cst.storage.worldPrefix + name);
			wlist.splice(idx, 1);
			localStorage.setItem(cst.storage.worldList, JSON.stringify(wlist));
		}
	};
	
	return storage;
});
