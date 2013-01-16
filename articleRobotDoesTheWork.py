import os
import os.path as path
import lxml.html as html

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
	os.mkdir("en")
	englishPath = "en"

if path.exists("de"):
	print "please remove english directory, exiting"
	exit()
else:
	os.mkdir("de")
	germanPath = "de"

print "templatePath => " + templatePath
print "Path for german folder => " + germanPath
print "Path for english folder => " + englishPath


