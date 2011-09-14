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

define(['world/neighbours', 'lib/signals'],
function (Neighbours, signals) {
	var Block;

	Block = function (coords) {
		this.coords = coords;
		
		/* Neighbours helper */
		this.neighbours = new Neighbours(this);
		
		/* Dispatched when the block is removed from the world */
		this.removed = new signals.Signal();
		
		/* Dispatched when the HTML element representing this block is ready */
		this.createdElement = new signals.Signal();
		
		/* Dispatched when the element is clicked */
		this.clicked = new signals.Signal();
		
		this.element = undefined;
		this.class = undefined;
	};

	Block.prototype.type = 'block';

	/* Get this block charge as seen from the block at cardinal position relkey */
	Block.prototype.getChargeFrom = function (relkey) {
		return 0;
	};

	/* Transmit charge to this block
		type: source block type
		relkey: source block cardinal position
		charge: amount of charge to transmit */
	Block.prototype.setChargeFrom = function (type, relkey, charge) {
	};

	/* Set block class. Call with cls=undefined to set initial class */
	Block.prototype.setClass = function(cls) {
		var i, len, cl;

		if (typeof this.element === 'undefined') {
			this.class = cls;
		} else {
			cl = this.element.classList;
			if (typeof cls === 'undefined' && typeof this.class !== undefined) {
				cl.remove('B_empty');
				cl.add('B_' + this.class);
			} else {
				cl.remove('B_' + this.class);
				cl.add('B_' + cls)
				this.class = cls;
			}
		}
	};
	
	Block.prototype.onClick = function() { };
	
	Block.prototype.onHover = function() { };
	
	/* World save block serialization
		Return undefined if the block is empty or otherwise not serializable
		Else return an object with the following keys (all optional) :
		- args: an object to pass as a constructor argument
		- dep: a coordinates object pointing to a block that must be restored (thus saved) before this one */
	Block.prototype.serialize = function() {
		return undefined;
	};

	return Block;
});
