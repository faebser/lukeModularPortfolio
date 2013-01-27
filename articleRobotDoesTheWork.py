from os import path, walk, remove
from BeautifulSoup import BeautifulSoup as soup
from shutil import copytree


templatePath = None
# germanPath = None
websiteFolder = None
workFolder = "work"
targetFile = None
boxesFolder = "specialBoxes"

print "--------- checking paths ---------"
if path.exists("template"):
	templatePath = "template"
else:
	print "templatePath not found, exiting"
	exit()

if path.exists("website"):
	print "please remove website directory, exiting"
	exit()
else:
	websiteFolder = "website"
	copytree(templatePath, websiteFolder)
	remove(path.join(websiteFolder, "index.html"))

print "templatePath => " + templatePath
print "Path for website folder => " + websiteFolder

templateFile = open(path.join(templatePath, "index.html"), "r")
targetHtml = soup(templateFile)
articleTag = targetHtml.find("div", id = "articleContent")
boxesTag = targetHtml.find("div", id = "specialBoxes")


for pathName, directories, files in walk(workFolder):
    for filename in files:
        articleToAdd = soup(open(path.join(pathName, filename)))
        articleTag.append(articleToAdd)

for pathName, directories, files in walk(boxesFolder):
	for filename in files:
		boxesToAdd = soup(open(path.join(pathName, filename)))
		boxesTag.append(boxesToAdd)


targetFile = open(path.join(websiteFolder, "index.html"), "w")
targetFile.write(str(targetHtml))
targetFile.close()
templateFile.close()