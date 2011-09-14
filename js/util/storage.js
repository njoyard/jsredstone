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
		var block, b, sb, world,
			gworld = gui.world,
			vworld = {},
			X, Y, Z, saveBlock;
			
		world = {
			x: gworld.size.width,
			y: gworld.size.height,
			z: gworld.size.depth,
			b: []
		};
		
		saveBlock = function(x, y, z) {
			var block, b;
				
			if (vworld[z] && vworld[z][y] && vworld[z][y][x]) {
				// Block already saved
				return; 
			}
			
			block = gworld.get({x:x, y:y, z:z});
			if (typeof block !== 'undefined') {
				b = block.serialize();
				
				if (typeof b !== 'undefined') {
					// Remember we saved this block
					vworld[z] = vworld[z] || {};
					vworld[z][y] = vworld[z][y] || {};
					vworld[z][y][x] = true;
				
					// Save block dependency first
					if (typeof b.dep !== 'undefined') {
						saveBlock(b.dep.x, b.dep.y, b.dep.z);
					}
			
					// Save block
					world.b.push({
						t: block.type.substring(0, 2),
						p: block.coords,
						a: b.args
					});
				}
			}
		};
		
		for (Z = 0; Z < gworld.size.depth; Z++) {
			for (Y = 0; Y < gworld.size.height; Y++) {
				for (X = 0; X < gworld.size.width; X++) {
					saveBlock(X, Y, Z);
				}
			}
		}

		// Remove quotes
		return JSON.stringify(world).replace(/"/g, '');
	};
	
	storage.restoreWorld = function(gui, worldstring) {
		var ws, world;
		
		// Restore quotes
		ws = worldstring.replace(/([a-zA-Z_][a-zA-Z0-9_]*):/g, '"$1":').replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, ':"$1"');
		world = JSON.parse(ws).b
		
		// TODO restore world size
		gui.we.clearWorld();
		for (i = 0, len = world.length; i < len; i++) {
			gui.we.addBlock(
				undefined,
				world[i].p,
				blocks.abbr[world[i].t],
				world[i].a
			);
		}
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
