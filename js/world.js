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

define(['block/empty', 'block/solid'],
function (EmptyBlock, SolidBlock) {
	var World;

	/* World constructor : takes length, width and depth as parameters */
	World = function (size) {
		var x, y, z, b,
			row, level, world;

		/* Initialize empty world */
		world = [];
		for (z = 0; z < size.depth; z++) {
			level = [];
			for (y = 0; y < size.height; y++) {
				row = [];
				for (x = 0; x < size.width; x++) {
					// Push block placeholder, will be replaced by the Block ctor afterwards
					row.push(null);
				}
				level.push(row);
			}
			world.push(level);
		}

		this.size = size;
		this.blocks = world;

		this.creating = true;

		/* Create blocks */
		for (z = 0; z < size.depth; z++) {
			for (y = 0; y < size.height; y++) {
				for (x = 0; x < size.width; x++) {
					b = new EmptyBlock(this, {x:x, y:y, z:z});
				}
			}
		}

		this.creating = false;
		this.tickCount = 0;
		
	};
	
	World.enablePublish();

	/* Block setter */
	World.prototype.set = function (coords, block) {
		if (coords.z >= 0 && coords.z < this.blocks.length) {
			if (coords.y >= 0 && coords.y < this.blocks[coords.z].length) {
				if (coords.x >= 0 && coords.x < this.blocks[coords.z][coords.y].length) {
					this.blocks[coords.z][coords.y][coords.x] = block;
				}
			}
		}
	};

	/* Block getter */
	World.prototype.get = function (coords) {
		if (coords.z >= 0 && coords.z < this.blocks.length) {
			if (coords.y >= 0 && coords.y < this.blocks[coords.z].length) {
				if (coords.x >= 0 && coords.x < this.blocks[coords.z][coords.y].length) {
					return this.blocks[coords.z][coords.y][coords.x];
				}
			}
		}
	};

	/* Ticker */
	World.prototype.tick = function () {
		this.publish('tick', ++this.tickCount);
	};

	return World;
});
