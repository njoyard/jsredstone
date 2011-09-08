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

define(['block/block', 'const'], 
function(Block, cst) {
	var ButtonBlock, sourcecoords,
		nb = Block.NB;
		
	sourcecoords = {
		n: nb.n,
		s: nb.s,
		e: nb.e,
		w: nb.w,
		c: nb.d
	};
	
	ButtonBlock = function (world, coords, args) {
		ButtonBlock.baseCtor.call(this, world, coords);
		
		this.remaining = 0;
		this.setDirection(args.dir);
		this.setCharge(0);
		
		this.tickBinding = world.ticked.add(this.onTick.bind(this));
	};
	ButtonBlock.inherit(Block);
	ButtonBlock.type = 'button';
	
	ButtonBlock.tryPlace = function(world, coords, mouse) {
		var dir, block;

		if (mouse.indexOf('n') !== -1) {
			dir = 'n';
		} else if (mouse.indexOf('s') !== -1) {
			dir = 's';
		} else if (mouse.indexOf('e') !== -1) {
			dir = 'e';
		} else if (mouse.indexOf('w') !== -1) {
			dir = 'w';
		}

		if (typeof dir !== 'undefined') {
			block = world.get(nb.add(coords, nb[dir]));
			if (typeof block !== 'undefined' && block.type === 'solid') {
				return { css: 'butoff_'+ dir, args: { dir: dir } };
			}
		}
	};
	
	ButtonBlock.prototype.setDirection = function(dir) {
		this.dir = dir;
		this.updateClass();
	};

	ButtonBlock.prototype.updateClass = function() {
		this.setClass('but' + (this.charge > 0 ? 'on' : 'off') + '_' + this.dir);
	};
	
	ButtonBlock.prototype.setCharge = function(charge) {
		var b, dirs = ['n', 's', 'e', 'w'],
			i;
		
		if (charge === this.charge) {
			return;
		}
		
		this.charge = charge;
		
		/* Propagate charge to adjacent wires and support block */
		for (i = 0; i < 4; i++) {
			b = this.get(dirs[i]);
			if (typeof b !== 'undefined' && (b.type === 'wire' || (b.type === 'solid' && dirs[i] === this.dir))) {
				b.setChargeFrom('button', nb.revkey(dirs[i]), charge);
			}
		}
		
		this.updateClass();
	};
	
	ButtonBlock.prototype.getChargeFrom = function(dir) {
		return this.charge;
	};
	
	ButtonBlock.prototype.onWorldChanged = function(coords) {
		var block;

		/* Request removal if the block we're attached to was removed */
		if (nb.equals(coords, nb.add(this.coords, sourcecoords[this.dir]))) {
			block = this.world.get(coords);
			if (typeof block !== 'undefined' && block.type !== 'solid') {
				return true;
			}
		}
		
		/* Set current charge again to propagate to new elements */
		this.setCharge(this.charge);

		return false;
	};

	ButtonBlock.prototype.onRemove = function() {
		this.setCharge(0);
		this.tickBinding.detach();
	};
	
	ButtonBlock.prototype.onClick = function() {
		this.remaining = cst.buttonTicks;
		this.setCharge(cst.maxCharge);
	};
		
	ButtonBlock.prototype.onTick = function(tickcount) {
		if (this.remaining > 0) {
			this.setCharge(cst.maxCharge);
		} else {
			this.setCharge(0);
		}
		
		this.remaining--;
	};
	
	ButtonBlock.prototype.serialize = function () {
		return {
			args: {dir: this.dir},
			dep: nb.add(this.coords, sourcecoords[this.dir])
		};
	}
	
	return ButtonBlock;
});
