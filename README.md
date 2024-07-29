# Paruu
Tracker for video game decompilation projects.

## About
Paruu is structured into games, sections, and entries.

* A game is a decompilation project.
    * TODO: Add game versions (i.e. NTSC, PAL, etc)
* A section is a code section, associated with a game. This can be a code unit, a portion of the code written for a specific purpose or by a specific developer, or SDK functions.
* An entry is a code function associated with a game and section. An entry can be marked as decompiled and implemented, which is how progress is tracked for a decompilation project.

Check the `tools/cabbiter.py` script and the GitHub action in the [Klonoa 2 Decompilation](https://github.com/entriphy/kl2_lv_decomp) for an example of a general workflow using Paruu.

## API
TODO: Document API endpoints