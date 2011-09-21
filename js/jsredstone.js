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

var JSR = {
	/* If true, show block details in console when clicked */
	blockDebug: true
};

if (typeof Function.prototype.inherit === 'undefined') {
	Function.prototype.inherit =  (function () {
		var F = function () {};
		return function(P) {
			F.prototype = P.prototype;
			this.prototype = new F();
			this.baseCtor = P;
			this.base = P.prototype;
			this.prototype.constructor = this;
		};
	})();
}

define(['gui/gui', 'world/world'],
function (Gui, World) {
	require.ready(function () {
		var world = new World(),
			gui = new Gui(world);

		gui.render();
		
		JSR.world = world;
		JSR.gui = gui;
	});
});

