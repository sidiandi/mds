# MDS - MarkDownServer

Minimal Wiki server using git as backend.

(c) 2017, [sidiandi](https://github.com/sidiandi).

## Installation
```bash
$ npm install mds
```

## Features
- Supported content store backends: git
- renders [PlantUML](http://plantuml.com) graphics
- optimized for keyboard use

See the [[Example/]] section for feature demos.

## Todo

* Directory editing (delete files, rename files)
* directory view: icons for directories and files
* drop images/files/urls onto text editor
* recent changes
* commit message
* numstat diff in history
* fix textarea size on Chrome
* search in file names
* simple authentication
* Angular
* use https://www.golden-layout.com/ ?

## Done

* keyboard shortcut for commit (Ctrl+Enter)
* status message
* empty commit message 
* navigation bar shows headings
* navigation bar shows parent directory entries
* CSS style for navbar
* set HTML title correctly
* automatically send mail to email adresses and `@name` mentions when page is committed.
* search field in header
* search in text
* toggle edit mode
* hitting enter in the search field navigates to the first search result
* configuration over json file
* auto-commit when leaving page
* edit: undo button
* directory view: leave .extensions on non-markdown files
* commit when leaving page: give status messages
* search in whole file, not line-by-line
* editMode variable
* fix crlf warning when committing to git
* sluggish editing: preview is updated only every 1000ms now. That's sufficient.
* proper display of files with other extension than .md
* Navbar behaviour
* support the display of more file types: images
* support the display of more file types: binary files (hex dump)
* use bower
* TOC of readme.md is not displayed if directory is shown
* fix scrolling when clicking on TOC entries.

## Directory Handling

### Path ends with /
* The article area shows the Readme.md file of this directory
* The nav area shows the directory content and the table of contents of the Readme.md file.

### Path does not end with /
* path is interpreted as a file
* article area shows the file contents or a 'file is empty' message.
* the nav area shows the directory contents of the parent directory and the table of contents of the file.

### Path is `''`
* Handle like if path is `/`
