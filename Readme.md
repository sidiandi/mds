# MDS - MarkDownServer

Minimal Wiki server using git as backend.

(c) 2017, [sidiandi](https://github.com/sidiandi).

## Installation
```bash
$ npm install mds
```

## Features
- Supported content store backends: git
- renders PlantUML graphics
- optimized for keyboard use

## Todo

* proper view if other files
* directory view: icons for directories and files
* drop images/files/urls onto text editor
* delete files
* recent changes
* commit message
* numstat diff in history
* fix textarea size on Chrome
* search in file names
* simple authentication

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

## Directory Handling

### Path ends with /
* The article area shows the Readme.md file of this directory or the directory content
* The nav area shows the directory content and the toc of the readme.md file

### Path does not end with /
* path is interpreted as a file
* article area shows the file contents or a 'file is empty' message
* the nav area shows the directory contents of the parent directory and the toc of the file 

### Path is `''`
* Handle like if path is `/`

## Navigation Bar


