from os import path, walk
from lxml import html
from shutil import copytree


templatePath = None
# germanPath = None
websiteFolder = None
workFolder = "work"

print "--------- checking paths ---------"
if path.exists("template"):
	templatePath = "template"
else:
	print "templatePath not found, exiting"
	exit()

# if path.exists("website"):
# 	print "please remove website directory, exiting"
# 	exit()
# else:
websiteFolder = "website"
	# copytree(templatePath, websiteFolder)

# if path.exists("de"):
# 	print "please remove english directory, exiting"
# 	exit()
# else:
# 	germanPath = "de"
# 	copy(templatePath, germanPath)

print "templatePath => " + templatePath
# print "Path for german folder => " + germanPath
print "Path for website folder => " + websiteFolder

for path, directories, files in walk(workFolder):
    print 'ls %r' % path
    for directory in directories:
        print '    d%r' % directory
    for filename in files:
        print '    -%r' % filename