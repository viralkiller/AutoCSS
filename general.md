DEMO: https://autocss.pythonanywhere.com

The |deMeza AutoCSS system| is a new way to design websites that removes the usual headache of maintaining separate desktop and mobile layouts.

You follow a small set of rules, and the desktop and mobile versions emerge automatically.

There are three main templates, and together they cover almost every project: Classic, Workspace, and Game.

Although the templates differ in purpose, they all share the same core tile logic.

With the exception of the top two menu bars, everything on the page is a 'tile'.
On mobile, tiles stack vertically. On desktop, tiles flow horizontally. In practice, you don’t design separate layouts at all — you just add tiles.

Desktop centering is handled in a simple, reliable way. You are only ever allowed a maximum of three tiles per horizontal row.

This limitation is deliberate: it keeps layouts fast to build and hard to break.

To center an element on desktop, you place a ghost tile before it and another ghost tile after it.
Ghost tiles appear on desktop as blank spacers, but disappear entirely on mobile.
The result is a centered desktop layout that collapses cleanly into a sensible mobile stack.

Normal tiles automatically center and arrange their contents in a pleasing way depending on how many UI items they contain.
A set of ready-made normal tiles is provided for common needs such as mailing list signup, sliders, file upload, text areas, and other standard inputs.

The stretch tile is used when you want something to span the full row on desktop.
On mobile it behaves like a normal square tile, but on desktop it expands to occupy the width of three tiles.
This makes it ideal for banner areas, hero content, or wide information panels.

The workspace tile is a special case.
It ignores any tiles that come after it and expands to fill the available screen space, similar to a Figma or Photoshop canvas.
This workspace area is then ready to receive your custom UI elements, nodes, and interactive components.

Finally, the game tile is similar to the workspace tile, but optimized for play. On desktop it behaves like a normal full workspace.
On mobile, instead of trying to squeeze the experience into portrait, the user is prompted to rotate the device.
This ensures that the game runs in a landscape layout that matches the desktop feel.

These three templates all use the same core tile logic and should cover 99% of your design needs.

Coming soon: a live page editor that lets you add, remove, and reorder tiles in real time,
plus a “Generate Final Code” button that outputs a clean, single-page HTML/CSS/JS build of your layout, ready to deploy immediately.

ADDITIONAL NOTES:

The website is in essence a sort of demo and 'editor', and is therefore allowed separate JS and CSS files (usually we prefer HTML/CSS/JS all on the same page).
However the final 'baked' design that the user exports should have the HTML/CSS/JS code all in one file i.e. index.html
This is to make life easy, they just upload the file to their server and point to it, without having to setup dir trees and such.

[Tile Item Alignment Rules]

Every div item within a tile is considered 1 element within that tile.
If there is only a single item, align it perfectly centered within the tile, i.e. place it on top of the center of that square, centered
in both horizontal and vertical directions.

If there are two items within the tile, imagine it consisting of 7 even rows. The items will go on rows 3 and 5. So 1,2,[3],4,[5],6,7. Everything centered horizontally.

If there are three items within the tile, same as above but 1,[2],3,[4],5,[6],7, they will occupy 2,4,6 slots.

More than three items, we ignore the 7 rows and just spread them evenly across the vertical axis.







