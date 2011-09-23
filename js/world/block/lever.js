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
	var LeverBlock, sourceKeys;

	sourceKeys = {
		n: 'n',
		s: 's',
		e: 'e',
		w: 'w',
		c: 'd'
	};
	
	LeverBlock = function(world, coords, args) {
		LeverBlock.baseCtor.call(this, world, coords);
		this.setDirection(args.dir);
		this.setCharge(args.on ? cst.maxCharge : 0);
		
		this.nbhood.added.add(this.onNeighbourAdded, this);
		this.nbhood.removed.add(this.onNeighbourRemoved, this);
		this.clicked.add(this.onClicked, this);
	};
	LeverBlock.inherit(Block);
	
	LeverBlock.prototype.type = 'lever';
	
	LeverBlock.tryPlace = function(nbhood, mouse) {
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
				return { css: 'levon_'+ dir, args: { dir: dir } };
			}
		}

		block = nbhood.d;
		if (nbhood.coords.z === 0 || (typeof block !== 'undefined' && block.type === 'solid')) {
			return { css: 'levon_c', args: { dir: 'c' } };
		}
	};
	
	LeverBlock.prototype.updateClass = function() {
		this.setClass('lev' + (this.charge > 0 ? 'on' : 'off') + '_' + this.dir);
	};
	
	LeverBlock.prototype.setDirection = function(dir) {
		this.dir = dir;
		this.updateClass();
	};
	
	LeverBlock.prototype.setCharge = function(charge) {
		var b, dirs = ['n', 's', 'e', 'w', 'd'],
			i;
		
		if (charge === this.charge) {
			return;
		}
		
		this.charge = charge;
		
		/* Propagate charge to adjacent wires and support block */
		for (i = 0; i < 4; i++) {
			b = this.nbhood[dirs[i]];
			if (typeof b !== 'undefined' && (b.type === 'wire' || (b.type === 'solid' && dirs[i] === sourceKeys[this.dir]))) {
				b.setChargeFrom('lever', this.nbhood.reverse(dirs[i]), charge);
			}
		}
		
		this.updateClass();
	};
	
	LeverBlock.prototype.getChargeFrom = function(dir) {
		return this.charge;
	};
	
	LeverBlock.prototype.onNeighbourAdded = function(key, block) {
		var dirs = ['n', 's', 'e', 'w'];
		
		/* Propagate to new block */
		if (dirs.indexOf(key) !== -1) {
			if (block.type === 'wire' || (block.type === 'solid' && key === this.dir)) {
				block.setChargeFrom('lever', this.nbhood.reverse(key), this.charge);
			}
		}
	};
	
	LeverBlock.prototype.onNeighbourRemoved = function(key) {
		if (key === sourceKeys[this.dir]) {
			// Lost supporting block
			this.requestedRemoval.dispatch();
		}
	};
	
	LeverBlock.prototype.onClicked = function() {
		/* Invert state */
		this.setCharge(cst.maxCharge - this.charge);
	};
	
	LeverBlock.prototype.serialize = function() {
		return {
			args: { dir: this.dir, on: this.charge > 0 },
			dep: sourceKeys[this.dir]
		}
	};
	
	return LeverBlock;
});
