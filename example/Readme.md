# mds - Markdown Server

## Todo

* toggle edit mode
* hitting enter in the search field navigates to the first search result
* simple authentication
* recent changes
* drop images/files/urls onto text editor
* commit message
* numstat diff in history
* fix textarea size on Chrome
* search in file names

## Done

* auto-commit when leaving page
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

## Examples

[[Examples/PlantUML]]
[[Examples/Deployment Diagram]]
[[Examples/Long Text]]

[[Sandbox]]


