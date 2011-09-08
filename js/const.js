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

define([],
function() {
	return {
		maxCharge: 15,
		tickTime: 100,
		torchBurnout: {
			ticks: 100,
			count: 8
		},
		buttonTicks: 9,
		repeaterTicks: [1, 2, 3, 4],
		storage: {
			worldList: "rss.wl",
			worldPrefix: "rss.world."
		}
	};
});
