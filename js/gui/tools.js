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

define(['lib/i18n!nls/lang'],
function(lang) {
	return {
		newtool:	{ title: lang.tools.clear },
		loadtool:	{ title: lang.tools.load },
		savetool:	{ title: lang.tools.save },
		shovel:		{ title: lang.tools.erase, key: 'E', editor: { type: 'erase' } },
		solidtool:	{ title: lang.tools.solid, key: 'S', editor: { type: 'place', placeClass: blocks.Solid } },
		rstool:		{ title: lang.tools.wire, key: 'W', editor: { type: 'place', placeClass: blocks.Wire } },
		torchtool:	{ title: lang.tools.torch, key: 'T', editor: { type: 'place', placeClass: blocks.Torch } },
		reptool:	{ title: lang.tools.repeater, key: 'R', editor: { type: 'place', placeClass: blocks.Repeater } },
		buttontool:	{ title: lang.tools.button, key: 'B', editor: { type: 'place', placeClass: blocks.Button } }
	};
});
