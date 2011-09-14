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
function (Block, cst) {
	var TorchBlock, sourcecoords, affectedcoords;

	sourcecoords = {
		n: 'n',
		s: 's',
		e: 'e',
		w: 'w',
		c: 'd'
	};

	/* Affected block coordinates depending on torch direction
		**WARNING** block above (NB.u) must stay at index 0 */
	affectedcoords = {
		n: ['u', 's', 'e', 'w'],
		s: ['u', 'n', 'e', 'w'],
		e: ['u', 'n', 's', 'w'],
		w: ['u', 'n', 's', 'e'],
		c: ['u', 'n', 's', 'e', 'w']
	};

	/* Torch ctor
		Direction can be 'n', 's', 'e', 'w' (attached to corresponding block)
		or 'c' (attached to block below) */
	TorchBlock = function(world, coords, args) {
		TorchBlock.baseCtor.call(this, world, coords);
		this.setDirection(args.dir);
		
		this.sourceCharge = 0;
		this.tickBinding = world.ticked.add(this.onTick.bind(this), this);
	};
	TorchBlock.inherit(Block);

	TorchBlock.type = 'torch';

	TorchBlock.tryPlace = function(nbhood, mouse) {
		var dir, block, retval;

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
				return { css: 'torchon_'+ dir, args: { dir: dir } };
			}
		}

		block = nbhood.d;
		if (nbhood.coords.z === 0 || (typeof block !== 'undefined' && block.type === 'solid')) {
			return { css: 'torchon_c', args: { dir: 'c' } };
		}
	};

	TorchBlock.prototype.updateClass = function() {
		this.setClass('torch' + (this.charge > 0 ? 'on' : 'off') + '_' + this.dir);
	};

	TorchBlock.prototype.setCharge = function(charge) {
		var i, len, b, ac;

		/* Update affected blocks */
		for (i = 0, len = affectedcoords[this.dir].length; i < len; i++) {
			ac = affectedcoords[this.dir][i];
			b = this.get(nb[ac]);
			if (typeof b !== 'undefined' && ((b.type === 'solid' && i === 0) || b.type === 'wire')) {
				b.setChargeFrom('torch', nb.revkey(ac), charge);
			}
		}

		/* Update class */
		this.charge = charge;
		this.updateClass();
	};
	
	TorchBlock.prototype.getChargeFrom = function(dir) {
		return this.charge;
	};

	TorchBlock.prototype.setDirection = function(dir) {
		this.dir = dir;
		this.setCharge(cst.maxCharge);
	};

	TorchBlock.prototype.onWorldChanged = function(coords) {
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

	TorchBlock.prototype.onRemove = function() {
		this.setCharge(0);
		this.tickBinding.detach();
	};
		
	TorchBlock.prototype.onTick = function(tickcount) {
		var b;

		/* Invert charge measured on previous tick */
		this.setCharge(this.sourceCharge > 0 ? 0 : cst.maxCharge);

		/* Measure charge of source block and store it for next tick */
		b = this.get(sourcecoords[this.dir]);
		if (typeof b !== 'undefined') {
			this.sourceCharge = b.getChargeFrom(this.coords);
		} else {
			this.sourceCharge = 0;
		}
	};
	
	TorchBlock.prototype.serialize = function() {
		return {
			args: { dir: this.dir },
			dep: nb.add(this.coords, sourcecoords[this.dir])
		}
	};

	return TorchBlock;
});
