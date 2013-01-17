import os.path as path
import lxml.html as html
import shutil.copytree as copy

templatePath = None
germanPath = None
englishPath = None

print "--------- checking paths ---------"
if path.exists("template"):
	templatePath = "template"
else:
	print "templatePath not found, exiting"
	exit()

if path.exists("en"):
	print "please remove english directory, exiting"
	exit()
else:
	englishPath = "en"
	copy(templatePath, englishPath)

if path.exists("de"):
	print "please remove english directory, exiting"
	exit()
else:
	germanPath = "de"
	copy(templatePath, germanPath)

print "templatePath => " + templatePath
print "Path for german folder => " + germanPath
print "Path for english folder => " + englishPath
