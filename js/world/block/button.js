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

define(['world/block/block', 'util/const'], 
function(Block, cst) {
	var ButtonBlock;
	
	ButtonBlock = function (world, coords, args) {
		ButtonBlock.baseCtor.call(this, world, coords);
		
		this.remaining = 0;
		this.setDirection(args.dir);
		this.setCharge(0);
		
		this.nbhood.added.add(this.onNeighbourAdded, this);
		this.nbhood.removed.add(this.onNeighbourRemoved, this);
		this.clicked.add(this.onClicked, this);
		this.removed.add(this.onRemoved, this);
	};
	ButtonBlock.inherit(Block);
	ButtonBlock.prototype.type = 'button';
	
	ButtonBlock.tryPlace = function(nbhood, mouse) {
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
			block = nbhood[dir];
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
			b = this.nbhood[dirs[i]];
			if (typeof b !== 'undefined' && (b.type === 'wire' || (b.type === 'solid' && dirs[i] === this.dir))) {
				b.setChargeFrom('button', this.nbhood.reverse(dirs[i]), charge);
			}
		}
		
		this.updateClass();
	};
	
	ButtonBlock.prototype.getChargeFrom = function(dir) {
		return this.charge;
	};
	
	ButtonBlock.prototype.onNeighbourAdded = function(key, block) {
		var dirs = ['n', 's', 'e', 'w'];
		
		/* Propagate to new block */
		if (dirs.indexOf(key) !== -1) {
			if (block.type === 'wire' || (block.type === 'solid' && key === this.dir)) {
				block.setChargeFrom('button', this.nbhood.reverse(key), this.charge);
			}
		}
	};
	
	ButtonBlock.prototype.onNeighbourRemoved = function(key) {
		if (key === this.dir) {
			// Lost supporting block
			this.requestedRemoval.dispatch();
		}
	};

	ButtonBlock.prototype.onRemoved = function() {
		if (typeof this.tickBinding !== 'undefined') {
			this.tickBinding.detach();
		}
	};
	
	ButtonBlock.prototype.onClicked = function() {
		this.remaining = cst.buttonTicks;
		this.setCharge(cst.maxCharge);
		
		if (typeof this.tickBinding === 'undefined') {
			this.tickBinding = this.world.ticked.add(this.onTick.bind(this));
		}d
	};
		
	ButtonBlock.prototype.onTick = function(tickcount) {
		if (this.remaining > 0) {
			this.setCharge(cst.maxCharge);
			this.remaining--;
		} else {
			this.setCharge(0);
			this.tickBinding.detach();
			delete this.tickBinding;
		}
	};
	
	ButtonBlock.prototype.serialize = function () {
		return {
			args: {dir: this.dir},
			dep: this.dir
		};
	}
	
	return ButtonBlock;
});
