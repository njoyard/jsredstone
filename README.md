[JSRedstone](http://github.com/k-o-x/jsredstone) - Javascript Redstone Simulator
================================================================================

Introduction
------------

JSRedstone is a web-based Minecraft Redstone simulator. You can use it to desing, simulate, analyze and debug redstone circuits. As it is built using (nearly) only Javascript, you don't need anything more than a recent web browser to run it.

Launching
---------

To launch JSRedstone, just download a copy of it on your computer and open `jsredstone.html` with your favorite browser. Of course you will need to have Javascript enabled.

Note: due to a [Chrome/Chromium bug](http://code.google.com/p/chromium/issues/detail?id=49001), this won't work when accessing it with the `file:` protocol. You'll have to host it on a web server for these browsers.

Using
-----

JSRedstone starts with an empty world. The world in JSRedstone is virtually infinite horizontally, and limited to 8 levels vertically. You can switch the current editing level with the mouse wheel (lower levels will then be darkened).

### Toolbar items

The toolbar on the bottom includes the following tools:
* New world (Alt-N): erases current world and resets viewport position
* Load world (Alt-O): opens the load dialog
* Save world (Alt-S): opens the save dialog
* Pan tool (P): enables panning by dragging the viewport with the mouse (note that you can always pan using the middle mouse button, no matter what tool is currently active)
* Shovel (E): remove existing bocks
* Solid (S): place solid blocks
* Wire (W): place redstone wire
* Torch (T): place redstone torches
* Repeater (R): place redstone repeaters
* Button (B): place buttons

### Placing blocks

When a block placing tool is selected, moving the mouse over the world shows where blocks can be added. Please note that blocks can only be added in the current editing level (change levels with the mouse wheel). Click to add a block.

Torches, buttons and repeaters are placed depending on the exact mouse position when clicked.

### Removing blocks

You can remove blocks using the shovel tool. When it is selected, moving the mouse over a removable block will make it turn red; click to actually remove it. Note that attached blocks (wire, torches, buttons) will be removed as well.

### Loading/Saving worlds

To save your world, click on the "save" toolbar button or press Alt-S; this will open the save dialog, displaying a "world code" string that you can copy and paste where you like. Alternatively you can use your browser Local Storage by choosing a world name and clicking "Save". A list of already saved worlds is also available, if you'd like to overwrite an existing saved world.

To load a saved world, click on the "load" toolbar button or press Alt+O; this will open the load dialog, which is very similar to the save dialog. From here, you can either load a world saved in your browser Local Storage, or paste a previously saved "world code" string. Please note that there are two "Load" buttons in this dialog: the top one loads from Local Storage, the bottom one from the world code text area.

### Undo

At any time, you can undo previous changes by pressing Alt-Z. The undo history is unlimited, however it is not saved with your world.

License
-------

JSRedstone is distributed under the GPL license version 3. See the file `LICENSE` for more information.

Copyright (c) 2011 Nicolas Joyard

