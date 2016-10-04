TerranQuest
====================

TerranQuest is an augmented reality mobile game, written using open web 
technologies.

It's compiled with Apache Cordova (or Phonegap if you're into that).

Check out the website at https://terranquest.net.

This repository is usually a little ahead of the current beta release.

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/392f0106a23e4b18be75ee1b27ea09a8)](https://www.codacy.com/app/netsyms/TerranQuest?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Netsyms/TerranQuest&amp;utm_campaign=Badge_Grade)

Build Notes
--------------------
To get this project ready for build, type `cordova prepare`.  This reads the 
config.xml, extracting platform and plugin info.  Required repositories are 
downloaded and installed automatically.

To compile, simply run `cordova build <platform>`.  Currently, Android works 
great, but iOS has some asset issues.

Server Code
--------------------
Get the server code at https://github.com/Netsyms/TerranQuest-GameServer.

License
--------------------
TerranQuest code (not the graphical assets, like the logos and stuff) is 
released under the Apache License 2.0.

If you're going to make your own game and share it, you'll need to put in the 
effort to make the graphics yourself, as they are 
copyright (c) 2016 Netsyms Technologies, all rights reserved.  It's not that hard.
We're just lazy and don't want to separate the pictures out from the code.  
If you're just tinkering with the code and aren't sharing binaries, that's fine 
though.
