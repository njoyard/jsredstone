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

define(["blocks", "const"],
function(blocks, cst) {
	return function(gui) {
		var storage = {};
		
		storage.getWorldString = function() {
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
							t: block.type,
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

			return JSON.stringify(world);
		};
		
		storage.restoreWorld = function(worldstring) {
			var world = JSON.parse(worldstring).b;
			
			// TODO restore world size
			gui.we.clearWorld();
			for (i = 0, len = world.length; i < len; i++) {
				// Upper case first char of type
				typ = world[i].t[0].toUpperCase() + world[i].t.substr(1);
				gui.we.addBlock(
					undefined,
					world[i].p,
					blocks[typ],
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
		
		storage.saveWorld = function(name) {
			var wlist = this.getSavedWorlds();
			
			// Save world
			localStorage.setItem(this.getWorldString());
				
			// Add to world list
			if (wlist.indexOf(name) === -1) {
				wlist.push(name);
				localStorage.setItem(cst.storage.worldList, JSON.stringify(wlist));
			}
		};
		
		storage.loadWorld = function(name) {
			var wlist = this.getWorldList(),
				world, i, len, typ;
			
			if (wlist.indexOf(name) === -1) {
				return;
			}
			this.restoreWorld(localStorage.getItem(cst.storage.worldPrefix + name));
		};
		
		return storage;
	};
});
